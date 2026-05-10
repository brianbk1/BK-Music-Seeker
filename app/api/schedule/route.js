export async function POST(req) {
  try {
    const { venueName, venueAddress, venueWebsite } = await req.json();

    if (!venueName) {
      return Response.json({ schedule: [], source: "none" });
    }

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

    // ── Helper: call Claude ───────────────────────────────────────────────────
    const callClaude = async (system, userMsg, tools = null) => {
      const body = {
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system,
        messages: [{ role: "user", content: userMsg }],
      };
      if (tools) body.tools = tools;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });
      return res.json();
    };

    // ── Helper: fetch and clean a page ────────────────────────────────────────
    const fetchPage = async (url) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; LiveLocalMusic/1.0)" },
          signal: AbortSignal.timeout(7000),
          redirect: "follow",
        });
        if (!res.ok) return null;
        const html = await res.text();
        return html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 8000);
      } catch { return null; }
    };

    // ── Helper: search Google for venue schedule ──────────────────────────────
    const searchSchedule = async () => {
      try {
        const query = encodeURIComponent(
          `"${venueName}" ${venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : ""} entertainment schedule events`
        );
        // Use Claude with web search tool
        const data = await callClaude(
          `You are a live music event researcher. Search for the entertainment schedule, upcoming shows, and weekly events for the given venue. Return a JSON array of events found: [{ day, event, time, notes }]. Be specific with band names, times, and recurring events. ONLY valid JSON array, nothing else.`,
          `Find the entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}. Look for their weekly recurring events, upcoming shows, trivia nights, karaoke, live music, open mic, DJ nights, etc. List specific band names when known.`,
          [{
            type: "web_search_20250305",
            name: "web_search",
          }]
        );

        // Extract text from response (may include tool use blocks)
        const textBlock = data.content?.find(b => b.type === "text");
        if (textBlock) {
          const match = textBlock.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
          if (match) return { schedule: JSON.parse(match[0]), source: "web_search" };
        }
        return null;
      } catch { return null; }
    };

    // ── Helper: scrape venue website for schedule ─────────────────────────────
    const scrapeWebsite = async () => {
      if (!venueWebsite) return null;

      // Common event page paths to try
      const paths = [
        "", "/events", "/events/", "/live-music", "/live-music/",
        "/entertainment", "/entertainment/", "/music", "/music/",
        "/calendar", "/calendar/", "/shows", "/shows/",
        "/schedule", "/schedule/", "/specials", "/specials.html",
        "/whats-on", "/happenings", "/weekly",
        "/trivia", "/karaoke", "/open-mic",
      ];

      const CONTENT_KEYWORDS = [
        "band", "live music", "entertainment", "show", "perform", "schedule",
        "event", "pm", "trivia", "karaoke", "bingo", "open mic", "dj",
        "tonight", "upcoming", "lineup", "poker", "piano", "dancing",
      ];

      const scoreText = (text) => {
        const lower = text.toLowerCase();
        return CONTENT_KEYWORDS.filter(kw => lower.includes(kw)).length;
      };

      const baseUrl = venueWebsite.replace(/\/$/, "");
      let bestText = null;
      let bestScore = 0;

      for (const path of paths) {
        try {
          const text = await fetchPage(baseUrl + path);
          if (!text) continue;
          const score = scoreText(text);
          if (score > bestScore) {
            bestScore = score;
            bestText = text;
            if (score >= 6) break; // Good enough
          }
        } catch { continue; }
      }

      if (!bestText || bestScore < 3) return null;

      // Extract events from the scraped text
      const data = await callClaude(
        `You are a live music event extractor. Given text from a venue's website, extract their entertainment schedule. Be specific with band names, times, and event types. Return ONLY a JSON array: [{ day, event, time, notes }]. Return [] if nothing found. ONLY valid JSON.`,
        `Extract the entertainment schedule from this venue website text. Include all recurring events, upcoming shows, specific band names, and any entertainment like trivia, karaoke, open mic, DJ nights, etc:\n\n${bestText}`
      );

      const textBlock = data.content?.find(b => b.type === "text");
      if (textBlock) {
        const match = textBlock.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
        if (match) {
          const schedule = JSON.parse(match[0]);
          if (schedule.length > 0) return { schedule, source: "website" };
        }
      }
      return null;
    };

    // ── Step 1: Try scraping their website first (most accurate) ─────────────
    const websiteResult = await scrapeWebsite();
    if (websiteResult && websiteResult.schedule.length > 0) {
      return Response.json(websiteResult);
    }

    // ── Step 2: Fall back to web search with Claude ───────────────────────────
    const searchResult = await searchSchedule();
    if (searchResult && searchResult.schedule.length > 0) {
      return Response.json(searchResult);
    }

    // ── Step 3: Last resort — Claude general knowledge ────────────────────────
    const data = await callClaude(
      `You are a local entertainment expert. Return the KNOWN weekly entertainment schedule for the given venue based on your training data. Be specific with band names and event types — do NOT use generic terms like "Live Band". If you know specific acts, name them. Include trivia, karaoke, open mic, DJs, poker, line dancing, dueling pianos, etc. Return ONLY a JSON array: [{ day, event, time, notes }]. Return [] if you truly have no knowledge of this venue. ONLY valid JSON.`,
      `Entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}. List specific act names when known.`
    );

    const textBlock = data.content?.find(b => b.type === "text");
    if (textBlock) {
      const match = textBlock.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
      if (match) {
        const schedule = JSON.parse(match[0]);
        return Response.json({ schedule, source: "ai_knowledge" });
      }
    }

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}