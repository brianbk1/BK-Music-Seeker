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
        max_tokens: 1500,
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
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    };

    // Robust JSON array extractor — handles prose, fences, nested text
    const extractJSON = (data) => {
      if (!data?.content) return null;
      const allText = data.content
        .filter(b => b.type === "text")
        .map(b => b.text || "")
        .join("\n");
      if (!allText) return null;

      // Strip code fences
      const cleaned = allText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      // Try finding any JSON array
      const matches = cleaned.match(/\[[\s\S]*?\]/g);
      if (matches) {
        for (const m of matches) {
          try {
            const parsed = JSON.parse(m);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch {}
        }
      }

      // Try parsing the whole cleaned string
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) return parsed;
      } catch {}

      return null;
    };

    const SYSTEM_WEB = `You are a live music and entertainment schedule finder. Use web search to find the current schedule for the given venue. You MUST return ONLY a raw JSON array — no explanation, no markdown, no prose before or after. Format:
[{"day":"Friday","event":"Live Band","time":"9pm","notes":"Weekly"}]
Include: live music, trivia, karaoke, open mic, DJ nights, bingo, comedy. Use real band/artist names when found. Return [] only if absolutely nothing found.`;

    const SYSTEM_EXTRACT = `You are an entertainment schedule extractor. Extract all events from the venue text. Return ONLY a raw JSON array with no other text:
[{"day":"Friday","event":"Live Band","time":"9pm","notes":""}]
Return [] if nothing found.`;

    const SYSTEM_KNOWLEDGE = `You are a local entertainment expert. Return what you know about this venue's entertainment schedule. Return ONLY a raw JSON array with no other text:
[{"day":"Wednesday","event":"Live Music","time":"7pm","notes":"Weekly"}]
For well-known venues include specific recurring events. Return [] only if you have no knowledge.`;

    // ── Step 1: Web search (most current info) ────────────────────────────────
    try {
      const cityState = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";
      const data = await callClaude(
        SYSTEM_WEB,
        `Find the entertainment schedule for "${venueName}"${cityState ? ` in ${cityState}` : ""}. Check their website, event listings, Facebook, and any other sources.`,
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      const schedule = extractJSON(data);
      if (schedule && schedule.length > 0) {
        return Response.json({ schedule, source: "web_search" });
      }
    } catch (e) {
      console.error("Web search failed:", e.message);
    }

    // ── Step 2: Scrape their website directly ────────────────────────────────
    if (venueWebsite) {
      try {
        const baseUrl = venueWebsite.replace(/\/$/, "");
        const eventPaths = ["/event-list", "/events", "/entertainment", "/live-music", "/music", "/calendar", "/shows", "/schedule", "/whats-on", ""];
        const KEYWORDS = ["band", "live", "music", "show", "perform", "schedule", "event", "trivia", "karaoke", "dj", "open mic", "pm", "upcoming"];

        let bestText = null;
        let bestScore = 0;

        for (const path of eventPaths) {
          try {
            const res = await fetch(baseUrl + path, {
              headers: { "User-Agent": "Mozilla/5.0 (compatible; LiveLocalMusic/1.0)" },
              signal: AbortSignal.timeout(6000),
              redirect: "follow",
            });
            if (!res.ok) continue;
            const html = await res.text();
            const text = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            if (text.length < 100) continue;
            const score = KEYWORDS.filter(kw => text.toLowerCase().includes(kw)).length;
            if (score > bestScore) {
              bestScore = score;
              bestText = text.slice(0, 6000);
              if (score >= 5) break;
            }
          } catch { continue; }
        }

        if (bestText && bestScore >= 2) {
          const data = await callClaude(SYSTEM_EXTRACT, `Extract entertainment schedule for "${venueName}" from this website text:\n\n${bestText}`);
          const schedule = extractJSON(data);
          if (schedule && schedule.length > 0) {
            return Response.json({ schedule, source: "website" });
          }
        }
      } catch (e) {
        console.error("Website scrape failed:", e.message);
      }
    }

    // ── Step 3: Claude general knowledge (always returns something useful) ────
    try {
      const data = await callClaude(
        SYSTEM_KNOWLEDGE,
        `What is the entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}? Include all known recurring events, live music nights, trivia, karaoke, etc.`
      );
      const schedule = extractJSON(data);
      if (schedule && schedule.length > 0) {
        return Response.json({ schedule, source: "ai_knowledge" });
      }
    } catch (e) {
      console.error("Knowledge fallback failed:", e.message);
    }

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}