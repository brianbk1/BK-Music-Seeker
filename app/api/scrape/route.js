export async function POST(req) {
  try {
    const { url } = await req.json();

    // Common event page path patterns to try
    const EVENT_PATHS = [
      "/music-events", "/music_events",
      "/entertainment", "/events", "/live-music",
      "/music", "/calendar", "/shows", "/whats-on",
      "/schedule", "/band-schedule", "/performances",
      "/live", "/gigs", "/concerts",
    ];

    const fetchAndClean = async (fetchUrl) => {
      const res = await fetch(fetchUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BBKMusicSeeker/1.0)" },
        signal: AbortSignal.timeout(6000),
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
    };

    // Step 1: Fetch the URL the user provided (homepage or specific page)
    const initial = await fetchAndClean(url);
    if (!initial) {
      return Response.json({ error: { message: `Could not fetch page` } });
    }

    // Step 2: Look for event/music page links in the HTML
    // Search for hrefs containing event-related keywords
    const linkPattern = /href=["']([^"']*(?:music|event|entertainment|calendar|shows?|schedule|live|band|gig|concert|perform)[^"']*)["']/gi;
    const baseUrl = new URL(url).origin;
    const foundLinks = new Set();
    let match;

    while ((match = linkPattern.exec(initial.html)) !== null) {
      let href = match[1];
      // Make absolute URL
      if (href.startsWith("/")) href = baseUrl + href;
      else if (!href.startsWith("http")) continue;
      // Only follow same-domain links
      if (href.startsWith(baseUrl) || href.startsWith(url)) {
        foundLinks.add(href);
      }
    }

    // Step 3: Also try common event paths on the base domain
    for (const path of EVENT_PATHS) {
      foundLinks.add(baseUrl + path);
    }

    // Step 4: Try each candidate page and collect text
    // Start with any discovered links, then fall back to the homepage text
    let bestText = initial.text.slice(0, 8000);
    let foundEventPage = false;

    for (const candidateUrl of foundLinks) {
      if (candidateUrl === url) continue; // already have homepage
      try {
        const result = await fetchAndClean(candidateUrl);
        if (!result) continue;

        // Check if this page looks like it has event content
        const lower = result.text.toLowerCase();
        const eventScore = [
          "band", "live music", "entertainment", "show", "perform",
          "schedule", "event", "tonight", "this weekend", "pm",
        ].filter(kw => lower.includes(kw)).length;

        if (eventScore >= 2) {
          bestText = result.text.slice(0, 8000);
          foundEventPage = true;
          break; // use first good match
        }
      } catch { continue; }
    }

    // Step 5: Send best text to Claude to extract events
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
- notes: any extra details (cover charge, age restriction, etc.)
- tickets: ticket URL or "Check venue website" or "Free"

If no events are found, return an empty array []. Return ONLY valid JSON, nothing else.`,
        messages: [{ role: "user", content: `Extract upcoming live music events from this venue website text:\n\n${bestText}` }],
      }),
    });

    const data = await claudeRes.json();
    if (data.error) return Response.json({ error: data.error });

    const textBlock = data.content?.find(b => b.type === "text");
    const raw = textBlock?.text?.trim().replace(/```json|```/g, "").trim() || "[]";

    // Robust JSON extraction
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const events = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return Response.json({ events, foundEventPage });
  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}