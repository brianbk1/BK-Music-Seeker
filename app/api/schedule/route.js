// Reliable baseline schedules for featured venues
// Used when live lookups return empty results
const KNOWN_SCHEDULES = {
  "Pietro's Prime": [
    { day: "Wednesday", event: "John Grecia (Live Piano)", time: "7:00 PM – 11:00 PM", notes: "Weekly recurring — confirmed performer" },
    { day: "Thursday", event: "Live Music", time: "7:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Friday", event: "Live Music", time: "7:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Saturday", event: "Yesterday's News Band & others", time: "8:00 PM", notes: "Weekly — recurring Saturday appearances" },
  ],
  "Station 142": [
    { day: "Tuesday", event: "Karaoke Night", time: "10:00 PM", notes: "Weekly with DJ — starts at 10pm" },
    { day: "Thursday", event: "Open Mic Night", time: "8:00 PM", notes: "All musicians welcome, live band backing & full PA" },
    { day: "Friday", event: "Live Music", time: "8:00 PM", notes: "Weekly — local & regional acts" },
    { day: "Saturday", event: "Live Music", time: "8:00 PM", notes: "Weekly — local & regional acts" },
    { day: "Sunday", event: "Sunday Funday Game Night", time: "8:00 PM", notes: "Weekly with DJ Kyle B" },
  ],
  "Brickette Lounge": [
    { day: "Friday", event: "Live Music", time: "9:00 PM", notes: "Weekly — check Instagram @brickettelounge for lineup" },
    { day: "Saturday", event: "Live Music & BBQ", time: "9:00 PM", notes: "Weekly — 21+ after 5pm" },
  ],
  "Slow Hand Food & Drink": [
    { day: "Friday", event: "Live Music", time: "7:00 PM", notes: "Local bands and solo artists — check slowhand-wc.com/events for lineup" },
    { day: "Saturday", event: "Live Music", time: "7:00 PM", notes: "Local bands and solo artists — check slowhand-wc.com/events for lineup" },
  ],
  "Square Bar": [
    { day: "Friday", event: "Live Music", time: "9:00 PM", notes: "Weekly" },
    { day: "Saturday", event: "Live Music", time: "9:00 PM", notes: "Weekly" },
  ],
  "Saloon 151": [
    { day: "Tuesday", event: "Quizzo Trivia Night", time: "7:00 PM", notes: "Weekly — half-price nachos & $5 cocktails" },
    { day: "Wednesday", event: "Music Bingo", time: "8:00 PM", notes: "5 rounds, gift card prizes" },
    { day: "Friday", event: "Karaoke Night", time: "9:00 PM", notes: "Weekly" },
  ],
  "Murph's Hideaway": [
    { day: "Friday", event: "Live Music", time: "8:00 PM", notes: "Check murphshideaway.com for current lineup" },
    { day: "Saturday", event: "Live Music", time: "8:00 PM", notes: "Check murphshideaway.com for current lineup" },
  ],
};

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

    const extractJSON = (data) => {
      if (!data?.content) return null;
      const allText = data.content
        .filter(b => b.type === "text")
        .map(b => b.text || "")
        .join("\n");
      if (!allText) return null;
      const cleaned = allText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      // Try each array match individually
      const matches = cleaned.match(/\[[\s\S]*?\]/g);
      if (matches) {
        for (const m of matches) {
          try {
            const parsed = JSON.parse(m);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch {}
        }
      }
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
      return null; // null means nothing found — don't treat empty array as success
    };

    // Check if this is a known featured venue
    const knownKey = Object.keys(KNOWN_SCHEDULES).find(k =>
      venueName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(venueName.toLowerCase())
    );

    const cityState = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";

    // ── PLAN A: Claude + Web Search for real current bands ───────────────────
    try {
      const data = await callClaude(
        `You are a live music researcher finding CURRENT entertainment at a specific venue.

Search their website events page, Facebook, Instagram, Bandsintown, Songkick, and local event sites. Find:
- Specific upcoming band/artist names with dates
- Weekly recurring entertainment (trivia, karaoke, open mic, DJ nights, bingo)
- Any special events

Return ONLY a raw JSON array, no other text:
[{"day":"Friday May 16","event":"The Midnight Riders","time":"9pm","notes":"Tickets $10"}]

Use real performer names when found. For recurring events use the day name. 
IMPORTANT: Only return [] if you genuinely found nothing after searching. If you find ANY entertainment info, include it.`,
        `Search for current entertainment and upcoming performers at "${venueName}"${cityState ? ` in ${cityState}` : ""}${venueWebsite ? `. Website: ${venueWebsite}` : ""}. Find specific band names and event details.`,
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      const schedule = extractJSON(data);
      if (schedule && schedule.length > 0) {
        return Response.json({ schedule, source: "web_search" });
      }
      // If web search returned empty, fall through immediately
    } catch (e) {
      console.error("Plan A failed:", e.message);
    }

    // ── PLAN B: Direct website scrape ────────────────────────────────────────
    if (venueWebsite) {
      try {
        const baseUrl = venueWebsite.replace(/\/$/, "");
        const eventPaths = ["/event-list", "/events", "/entertainment", "/live-music", "/music", "/calendar", "/shows", "/schedule", "/whats-on", ""];
        const KEYWORDS = ["band", "live", "music", "show", "perform", "schedule", "event", "trivia", "karaoke", "dj", "open mic", "pm", "upcoming", "tonight"];

        let bestText = null;
        let bestScore = 0;

        for (const path of eventPaths) {
          try {
            const res = await fetch(baseUrl + path, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
              signal: AbortSignal.timeout(5000),
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

        if (bestText && bestScore >= 3) {
          const data = await callClaude(
            `Extract entertainment schedule from this venue website text. Include specific band/artist names, days, times, and event types. Return ONLY a raw JSON array: [{"day":"Friday","event":"Live Band Name","time":"9pm","notes":""}]. Return null if no events found (do not return empty array).`,
            `Extract schedule for "${venueName}":\n\n${bestText}`
          );
          const schedule = extractJSON(data);
          if (schedule && schedule.length > 0) {
            return Response.json({ schedule, source: "website" });
          }
        }
      } catch (e) {
        console.error("Plan B failed:", e.message);
      }
    }

    // ── PLAN C: Known schedule for featured venues ────────────────────────────
    if (knownKey) {
      return Response.json({ schedule: KNOWN_SCHEDULES[knownKey], source: "ai_knowledge" });
    }

    // ── PLAN D: Claude general knowledge for any other venue ─────────────────
    try {
      const data = await callClaude(
        `You are a local entertainment expert. Return what you know about this venue's entertainment schedule — recurring events, live music nights, trivia, karaoke, open mic, etc. Return ONLY a raw JSON array: [{"day":"Friday","event":"Live Music","time":"9pm","notes":"Weekly"}]. Return null if you have no knowledge of this venue (do not return empty array).`,
        `Entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}.`
      );
      const schedule = extractJSON(data);
      if (schedule && schedule.length > 0) {
        return Response.json({ schedule, source: "ai_knowledge" });
      }
    } catch (e) {
      console.error("Plan D failed:", e.message);
    }

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}