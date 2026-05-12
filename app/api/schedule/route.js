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
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
          signal: AbortSignal.timeout(8000),
          redirect: "follow",
        });
        if (!res.ok) return null;
        const html = await res.text();
        // Check if it's a JS-only shell (Wix, Squarespace, etc.)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        // If very little text content, site is JS-heavy and can't be scraped
        if (textContent.length < 200) return null;
        return textContent.slice(0, 8000);
      } catch { return null; }
    };

    // ── Helper: extract schedule from text using Claude ───────────────────────
    const extractFromText = async (text, context) => {
      const data = await callClaude(
        `You are a live music and entertainment schedule extractor. Given text from a venue's website, extract their complete entertainment schedule. Include ALL types of entertainment: live bands, solo artists, karaoke, trivia/quizzo, open mic, DJ nights, bingo, comedy, dancing, themed nights, recurring weekly events, and upcoming shows. Be specific with artist/band names, days, times. Return ONLY a JSON array: [{ day, event, time, notes }]. Return [] only if there is truly no entertainment content. ONLY valid JSON.`,
        `Extract the full entertainment schedule from this venue website content for "${context}":\n\n${text}`
      );
      const textBlock = data.content?.find(b => b.type === "text");
      if (textBlock) {
        const match = textBlock.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
        if (match) {
          const schedule = JSON.parse(match[0]);
          if (schedule.length > 0) return schedule;
        }
      }
      return null;
    };

    // ── Step 1: Web search FIRST (most reliable for JS-heavy sites) ──────────
    const searchSchedule = async () => {
      try {
        const cityState = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";
        const data = await callClaude(
          `You are a live music event researcher. Use web search to find the current entertainment schedule for the given venue. Look for: weekly recurring events, upcoming live music shows, trivia nights, karaoke, open mic, DJ nights, bingo, comedy shows, and any other entertainment. Be specific with band/artist names, days of week, and times. Return ONLY a JSON array: [{ day, event, time, notes }]. If you find recurring weekly events, list each day separately. Return [] only if you find absolutely nothing. ONLY valid JSON array, nothing else.`,
          `Search for the current entertainment schedule and upcoming events for "${venueName}"${cityState ? ` in ${cityState}` : ""}. Check their website, Facebook, Instagram, and any event listings. Include all entertainment types - live music, trivia, karaoke, open mic, DJ nights, etc.`,
          [{
            type: "web_search_20250305",
            name: "web_search",
          }]
        );

        const textBlock = data.content?.find(b => b.type === "text");
        if (textBlock) {
          const match = textBlock.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
          if (match) {
            const schedule = JSON.parse(match[0]);
            if (schedule.length > 0) return { schedule, source: "web_search" };
          }
        }
        return null;
      } catch { return null; }
    };

    // ── Step 2: Try scraping venue website ───────────────────────────────────
    const scrapeWebsite = async () => {
      if (!venueWebsite) return null;

      const CONTENT_KEYWORDS = [
        "band", "live music", "entertainment", "show", "perform", "schedule",
        "event", "pm", "am", "trivia", "karaoke", "bingo", "open mic", "dj",
        "tonight", "upcoming", "lineup", "poker", "piano", "dancing", "quizzo",
        "comedy", "acoustic", "cover", "tuesday", "wednesday", "thursday", "friday", "saturday",
      ];

      const scoreText = (text) => {
        const lower = text.toLowerCase();
        return CONTENT_KEYWORDS.filter(kw => lower.includes(kw)).length;
      };

      const paths = [
        "", "/events", "/events/", "/live-music", "/live-music/",
        "/entertainment", "/entertainment/", "/music", "/music/",
        "/calendar", "/calendar/", "/shows", "/shows/",
        "/schedule", "/schedule/", "/specials", "/specials.html",
        "/whats-on", "/happenings", "/weekly", "/nightlife",
        "/trivia", "/karaoke", "/open-mic", "/what-s-on",
      ];

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
            if (score >= 5) break;
          }
        } catch { continue; }
      }

      if (!bestText || bestScore < 2) return null;

      const schedule = await extractFromText(bestText, venueName);
      if (schedule && schedule.length > 0) return { schedule, source: "website" };
      return null;
    };

    // ── Step 3: Claude general knowledge ─────────────────────────────────────
    const knowledgeFallback = async () => {
      const data = await callClaude(
        `You are a local entertainment expert with knowledge of bars, restaurants, and venues. For the given venue, provide their known entertainment schedule based on your training data. Include ALL types: live music (with specific band/artist names if known), weekly trivia, karaoke, open mic, DJ nights, bingo, comedy, themed nights, etc. If you know this is a venue that has live music on certain nights, list those nights even without specific band names. Return ONLY a JSON array: [{ day, event, time, notes }]. Return [] only if you have absolutely no knowledge of this venue having any entertainment. ONLY valid JSON.`,
        `What is the entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}? List all known recurring events and entertainment types.`
      );

      const textBlock = data.content?.find(b => b.type === "text");
      if (textBlock) {
        const match = textBlock.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
        if (match) {
          const schedule = JSON.parse(match[0]);
          if (schedule.length > 0) return { schedule, source: "ai_knowledge" };
        }
      }
      return null;
    };

    // ── Run all three in parallel for speed, use best result ─────────────────
    const [searchResult, scrapeResult] = await Promise.all([
      searchSchedule(),
      scrapeWebsite(),
    ]);

    // Prefer website scrape (most accurate), then web search, then AI knowledge
    if (scrapeResult && scrapeResult.schedule.length > 0) {
      return Response.json(scrapeResult);
    }

    if (searchResult && searchResult.schedule.length > 0) {
      return Response.json(searchResult);
    }

    // Last resort: Claude's general knowledge
    const knowledgeResult = await knowledgeFallback();
    if (knowledgeResult && knowledgeResult.schedule.length > 0) {
      return Response.json(knowledgeResult);
    }

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}