const KNOWN_SCHEDULES = {
  "Pietro's Prime": [
    { day: "Wednesday", event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — visit pietrosprime.com/event-list for current performer" },
    { day: "Thursday", event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — visit pietrosprime.com/event-list for current performer" },
    { day: "Friday", event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — visit pietrosprime.com/event-list for current performer" },
    { day: "Saturday", event: "Live Music", time: "8:00 PM – 11:00 PM", notes: "Weekly — visit pietrosprime.com/event-list for current performer" },
  ],
  "Station 142": [
    { day: "Tuesday", event: "Karaoke Night", time: "10:00 PM", notes: "Weekly with DJ — $50 gift card to best performer" },
    { day: "Thursday", event: "Open Mic Night", time: "8:00 PM", notes: "All musicians welcome, live band backing & full PA, sign up required" },
    { day: "Friday", event: "Live Music", time: "8:00 PM", notes: "Weekly — local & regional acts" },
    { day: "Saturday", event: "Live Music", time: "8:00 PM", notes: "Weekly — local & regional acts" },
    { day: "Sunday", event: "Sunday Funday Game Night", time: "8:00 PM", notes: "Weekly with DJ Kyle B" },
  ],
  "Brickette Lounge": [
    { day: "Monday", event: "Beginner Line Dancing", time: "Evening", notes: "Weekly — no experience needed, all welcome" },
    { day: "Tuesday", event: "Line Dancing with Grace", time: "Evening", notes: "Weekly" },
    { day: "Wednesday", event: "Line Dancing with DJ Bill", time: "Evening", notes: "Weekly — request your favorite songs" },
    { day: "Thursday", event: "Line Dancing with DJ Bill", time: "Evening", notes: "Weekly" },
    { day: "Friday", event: "Live Country & Western Music", time: "9:00 PM", notes: "Weekly — check Instagram @brickettelounge for current lineup" },
    { day: "Saturday", event: "Live Music & BBQ", time: "9:00 PM", notes: "Weekly — 21+ after 5pm. Check Instagram @brickettelounge for lineup" },
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

// Known event page URLs — Claude fetches these directly for real performer names
const EVENT_PAGES = {
  "Pietro's Prime":        "https://www.pietrosprime.com/event-list",
  "Station 142":           "https://station142.com/live-music/",
  "Brickette Lounge":      "https://www.brickettelounge.com/music-events",
  "Slow Hand Food & Drink":"https://www.slowhand-wc.com/events",
  "Saloon 151":            "https://www.saloon151.com/events-catering-1",
  "Stone Tavern":          "https://www.thestonetavern1867.com/events",
  "The Stone Tavern":      "https://www.thestonetavern1867.com/events",
};

const extractJSON = (data) => {
  if (!data?.content) return null;
  const text = data.content.filter(b => b.type === "text").map(b => b.text || "").join("\n");
  if (!text) return null;
  const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  // Try all array matches, return first non-empty one
  const matches = clean.match(/\[[\s\S]*?\]/g) || [];
  for (const m of matches) {
    try { const p = JSON.parse(m); if (Array.isArray(p) && p.length > 0) return p; } catch {}
  }
  try { const p = JSON.parse(clean); if (Array.isArray(p) && p.length > 0) return p; } catch {}
  return null;
};

export async function POST(req) {
  try {
    const { venueName, venueAddress, venueWebsite } = await req.json();
    if (!venueName) return Response.json({ schedule: [], source: "none" });

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const city = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";

    // Find known event page and schedule for this venue
    const eventPageKey = Object.keys(EVENT_PAGES).find(k =>
      venueName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(venueName.toLowerCase())
    );
    const eventPageUrl = eventPageKey ? EVENT_PAGES[eventPageKey] : null;

    const knownKey = Object.keys(KNOWN_SCHEDULES).find(k =>
      venueName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(venueName.toLowerCase())
    );

    // ── Step 1: Web search — finds real current performers ────────────────────
    // This is the primary method. For venues with known event pages (including
    // Wix sites like Pietro's and Stone Tavern), Claude fetches those pages
    // directly via its web search tool, bypassing server-side blocking.
    try {
      const fetchInstruction = eventPageUrl
        ? `First, fetch this URL which lists their current upcoming events: ${eventPageUrl}
Then also search Google, Facebook, Instagram, and Bandsintown for additional events.`
        : `Search Google, Facebook events, Instagram, Bandsintown, and local event sites for their schedule.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `You are a live music and entertainment researcher. Find the current schedule for a specific venue for ${month}. Return ONLY a valid JSON array — no other text before or after it. Format: [{"day":"Friday May 16","event":"Band Name Here","time":"9:00 PM","notes":"optional detail"}]. For recurring weekly events with no specific upcoming date, use the day name only. Include ALL entertainment types: live music with real band names, line dancing, trivia, karaoke, open mic, bingo, poker, themed nights, DJ events. Return [] only if you truly find nothing.`,
          messages: [{
            role: "user",
            content: `${fetchInstruction}

Find the ${month} entertainment schedule for "${venueName}"${city ? ` in ${city}` : ""}${venueWebsite ? `. Their website: ${venueWebsite}` : ""}.`
          }],
        }),
        signal: AbortSignal.timeout(28000),
      });

      if (res.ok) {
        const data = await res.json();
        const schedule = extractJSON(data);
        if (schedule && schedule.length > 0) {
          return Response.json({ schedule, source: "web_search" });
        }
      }
    } catch (e) {
      console.error("Web search failed:", e.message);
    }

    // ── Step 2: Scrape venue website directly (HTML/WordPress only) ───────────
    if (venueWebsite) {
      try {
        const base = venueWebsite.replace(/\/$/, "");
        const paths = ["/event-list", "/events", "/entertainment", "/live-music", "/music", "/calendar", "/schedule", "/shows", "/whats-on", ""];
        const keywords = ["band", "live", "music", "event", "trivia", "karaoke", "dj", "open mic", "pm", "upcoming", "bingo", "line dancing", "poker", "perform"];

        let best = { text: "", score: 0 };

        for (const path of paths) {
          try {
            const r = await fetch(base + path, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
              signal: AbortSignal.timeout(5000),
              redirect: "follow",
            });
            if (!r.ok) continue;
            const html = await r.text();
            // Skip JS-heavy shells (Wix, Squarespace etc.)
            const text = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            if (text.length < 300) continue;
            const score = keywords.filter(kw => text.toLowerCase().includes(kw)).length;
            if (score > best.score) { best = { text: text.slice(0, 6000), score }; if (score >= 5) break; }
          } catch { continue; }
        }

        if (best.score >= 3) {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1000,
              system: `Extract entertainment schedule from venue website text. Include specific band/artist names, all event types (line dancing, trivia, karaoke, poker, open mic, bingo, live music). Return ONLY a raw JSON array: [{"day":"Friday","event":"Band Name","time":"9pm","notes":""}]. Return null if no events found.`,
              messages: [{ role: "user", content: `Extract schedule for "${venueName}":\n\n${best.text}` }],
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (res.ok) {
            const data = await res.json();
            const schedule = extractJSON(data);
            if (schedule && schedule.length > 0) return Response.json({ schedule, source: "website" });
          }
        }
      } catch (e) { console.error("Scrape failed:", e.message); }
    }

    // ── Step 3: Known schedule for featured venues ────────────────────────────
    if (knownKey) {
      return Response.json({ schedule: KNOWN_SCHEDULES[knownKey], source: "ai_knowledge" });
    }

    // ── Step 4: Claude general knowledge ─────────────────────────────────────
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: `Return what you know about this venue's recurring entertainment schedule. Include all types: live music, line dancing, trivia, karaoke, open mic, bingo, poker. Return ONLY a raw JSON array: [{"day":"Friday","event":"Live Music","time":"9pm","notes":"Weekly"}]. Return null if you have no knowledge of this venue.`,
          messages: [{ role: "user", content: `Recurring entertainment at "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}.` }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        const schedule = extractJSON(data);
        if (schedule && schedule.length > 0) return Response.json({ schedule, source: "ai_knowledge" });
      }
    } catch (e) { console.error("Knowledge fallback failed:", e.message); }

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}
