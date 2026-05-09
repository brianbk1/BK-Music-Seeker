export async function POST(req) {
  try {
    const { url } = await req.json();

    // Common event page paths — tried in priority order, with AND without trailing slash
    const EVENT_PATHS = [
      "/live-music/", "/live-music",
      "/music-events/", "/music-events",
      "/entertainment/", "/entertainment",
      "/events/", "/events",
      "/music/", "/music",
      "/calendar/", "/calendar",
      "/shows/", "/shows",
      "/whats-on/", "/whats-on",
      "/schedule/", "/schedule",
      "/band-schedule/", "/band-schedule",
      "/performances/", "/performances",
      "/live/", "/live",
      "/gigs/", "/gigs",
      "/concerts/", "/concerts",
    ];

    const fetchAndClean = async (fetchUrl) => {
      try {
        const res = await fetch(fetchUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; BBKMusicSeeker/1.0)" },
          signal: AbortSignal.timeout(7000),
        });
        if (!res.ok) return null;
        const html = await res.text();
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return { html, text };
      } catch {
        return null;
      }
    };

    const scoreEventContent = (text) => {
      const lower = text.toLowerCase();
      return [
        "band", "live music", "entertainment", "show", "perform",
        "schedule", "event", "tonight", "this weekend", "pm",
        "doors open", "tickets", "admission", "cover charge",
        "dj", "acoustic", "karaoke", "open mic",
      ].filter(kw => lower.includes(kw)).length;
    };

    const baseUrl = new URL(url).origin;
    let bestText = null;
    let bestScore = 0;
    let foundEventPage = false;

    // Step 1: Try all common event paths FIRST (highest priority, most reliable)
    for (const path of EVENT_PATHS) {
      const candidateUrl = baseUrl + path;
      if (candidateUrl === url) continue;
      try {
        const result = await fetchAndClean(candidateUrl);
        if (!result) continue;
        const score = scoreEventContent(result.text);
        if (score >= 3 && score > bestScore) {
          bestText = result.text.slice(0, 12000);
          bestScore = score;
          foundEventPage = true;
          if (score >= 6) break; // Good enough, stop searching
        }
      } catch { continue; }
    }

    // Step 2: Fetch the provided URL (homepage) and scan for event links
    const initial = await fetchAndClean(url);
    if (!initial && !bestText) {
      return Response.json({ error: { message: "Could not fetch page" } });
    }

    // If we already found a great event page, skip link scanning
    if (!foundEventPage && initial) {
      // If the URL itself looks like an event page, score it
      const urlScore = scoreEventContent(initial.text);
      if (urlScore >= 3) {
        bestText = initial.text.slice(0, 12000);
        bestScore = urlScore;
        foundEventPage = true;
      }

      if (!foundEventPage) {
        // Scan homepage HTML for event/music page links
        const linkPattern = /href=["']([^"']*(?:music|event|entertainment|calendar|shows?|schedule|live|band|gig|concert|perform)[^"']*)["']/gi;
        const discoveredLinks = new Set();
        let match;

        while ((match = linkPattern.exec(initial.html)) !== null) {
          let href = match[1];
          if (href.startsWith("/")) href = baseUrl + href;
          else if (!href.startsWith("http")) continue;
          if (new URL(href).origin === baseUrl) {
            discoveredLinks.add(href);
          }
        }

        for (const candidateUrl of discoveredLinks) {
          if (candidateUrl === url) continue;
          try {
            const result = await fetchAndClean(candidateUrl);
            if (!result) continue;
            const score = scoreEventContent(result.text);
            if (score >= 3 && score > bestScore) {
              bestText = result.text.slice(0, 12000);
              bestScore = score;
              foundEventPage = true;
              if (score >= 6) break;
            }
          } catch { continue; }
        }
      }
    }

    // Step 3: Fall back to homepage text if nothing better found
    if (!bestText && initial) {
      bestText = initial.text.slice(0, 12000);
    }

    if (!bestText) {
      return Response.json({ events: [], foundEventPage: false });
    }

    // Step 4: Send to Claude to extract events
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: `You are a live music event extractor. Given text scraped from a venue's website, extract all upcoming live music or entertainment events. Return ONLY a JSON array (no markdown, no preamble). Each event should have:
- band: artist or band name (required)
- date: day and date as written on the page (required)
- time: start time if available, otherwise ""
- genre: music genre if mentioned, otherwise ""
- notes: any extra details (cover charge, age restriction, special event, etc.)
- tickets: ticket URL or "Check venue website" or "Free"

If no events are found, return an empty array []. Return ONLY valid JSON, nothing else.`,
        messages: [{ role: "user", content: `Extract upcoming live music events from this venue website text:\n\n${bestText}` }],
      }),
    });

    const data = await claudeRes.json();
    if (data.error) return Response.json({ error: data.error });

    const textBlock = data.content?.find(b => b.type === "text");
    const raw = textBlock?.text?.trim().replace(/```json|```/g, "").trim() || "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const events = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return Response.json({ events, foundEventPage });
  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}