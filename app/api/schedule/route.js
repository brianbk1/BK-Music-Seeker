export async function POST(req) {
  try {
    const { venueName, venueAddress, venueWebsite } = await req.json();

    if (!venueName) {
      return Response.json({ schedule: [], source: "none" });
    }

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

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

    // Extract JSON array from any text — handles prose wrapping, code fences, etc.
    const extractJSON = (text) => {
      if (!text) return null;
      const cleaned = text.replace(/```json|```/g, "").trim();
      // Try direct parse first
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      // Find array in text
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return null;
    };

    const fetchPage = async (url) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; LiveLocalMusic/1.0)" },
          signal: AbortSignal.timeout(7000),
          redirect: "follow",
        });
        if (!res.ok) return null;
        const html = await res.text();
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (text.length < 150) return null; // JS-only shell
        return text.slice(0, 8000);
      } catch { return null; }
    };

    // ── Step 1: Web search using Claude with web_search tool ─────────────────
    const searchSchedule = async () => {
      try {
        const cityState = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";
        const data = await callClaude(
          `You are a live music event researcher. Search for the entertainment schedule for the given venue. Return ONLY a valid JSON array in this exact format, with no other text before or after it:
[{ "day": "Tuesday", "event": "Karaoke Night", "time": "10pm", "notes": "Weekly recurring" }]

Include all entertainment: live music, trivia, karaoke, open mic, DJ nights, bingo, comedy, themed nights. Be specific with band/artist names and times. If nothing found return [].`,
          `Search for the entertainment schedule for "${venueName}"${cityState ? ` in ${cityState}` : ""}. Find weekly recurring events and upcoming shows.`,
          [{ type: "web_search_20250305", name: "web_search" }]
        );

        // Look through ALL content blocks for text with JSON
        const allText = (data.content || [])
          .filter(b => b.type === "text")
          .map(b => b.text)
          .join("\n");

        const schedule = extractJSON(allText);
        if (schedule && schedule.length > 0) return { schedule, source: "web_search" };
        return null;
      } catch { return null; }
    };

    // ── Step 2: Scrape venue website ─────────────────────────────────────────
    const scrapeWebsite = async () => {
      if (!venueWebsite) return null;

      const paths = [
        "", "/events", "/events/", "/live-music", "/live-music/",
        "/entertainment", "/entertainment/", "/music", "/music/",
        "/calendar", "/calendar/", "/shows", "/shows/",
        "/schedule", "/schedule/", "/specials", "/specials.html",
        "/whats-on", "/happenings", "/weekly",
        "/trivia", "/karaoke", "/open-mic",
      ];

      const KEYWORDS = [
        "band", "live music", "entertainment", "show", "perform", "schedule",
        "event", "pm", "trivia", "karaoke", "bingo", "open mic", "dj",
        "tonight", "upcoming", "lineup", "poker", "piano", "dancing",
      ];

      const score = (text) => KEYWORDS.filter(kw => text.toLowerCase().includes(kw)).length;

      const baseUrl = venueWebsite.replace(/\/$/, "");
      let bestText = null;
      let bestScore = 0;

      for (const path of paths) {
        try {
          const text = await fetchPage(baseUrl + path);
          if (!text) continue;
          const s = score(text);
          if (s > bestScore) { bestScore = s; bestText = text; if (s >= 6) break; }
        } catch { continue; }
      }

      if (!bestText || bestScore < 3) return null;

      const data = await callClaude(
        `You are a live music event extractor. Extract entertainment schedule from venue website text. Return ONLY a valid JSON array with no other text:
[{ "day": "Friday", "event": "Live Band", "time": "9pm", "notes": "" }]
Return [] if nothing found.`,
        `Extract the entertainment schedule from this venue website text for "${venueName}":\n\n${bestText}`
      );

      const allText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      const schedule = extractJSON(allText);
      if (schedule && schedule.length > 0) return { schedule, source: "website" };
      return null;
    };

    // ── Step 3: Claude general knowledge fallback ─────────────────────────────
    const knowledgeFallback = async () => {
      const data = await callClaude(
        `You are a local entertainment expert. Return known entertainment schedule for the given venue. Return ONLY a valid JSON array with no other text:
[{ "day": "Friday", "event": "Live Music", "time": "9pm", "notes": "Weekly" }]
If you know specific band names use them. Include all entertainment types. Return [] only if you truly have no knowledge.`,
        `Entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}.`
      );

      const allText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      const schedule = extractJSON(allText);
      if (schedule && schedule.length > 0) return { schedule, source: "ai_knowledge" };
      return null;
    };

    // Run website scrape and web search in parallel
    const [websiteResult, searchResult] = await Promise.all([
      scrapeWebsite(),
      searchSchedule(),
    ]);

    // Prefer website (most accurate), then web search, then AI knowledge
    if (websiteResult && websiteResult.schedule.length > 0) return Response.json(websiteResult);
    if (searchResult && searchResult.schedule.length > 0) return Response.json(searchResult);

    const knowledgeResult = await knowledgeFallback();
    if (knowledgeResult && knowledgeResult.schedule.length > 0) return Response.json(knowledgeResult);

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}