// ── Known schedules for ALL venues — shown instantly, free, no API call ───────
// Featured venues + well-known nearby West Chester venues
// Recurring patterns only — never specific dates or performer names
const ALL_KNOWN_SCHEDULES = {
  // Featured venues
  "Pietro's Prime": {
    days: "Wednesdays through Saturdays",
    events: [
      { day: "Wednesday", event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — click Find Performers for who's playing" },
      { day: "Thursday",  event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — click Find Performers for who's playing" },
      { day: "Friday",    event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — click Find Performers for who's playing" },
      { day: "Saturday",  event: "Live Music", time: "8:00 PM – 11:00 PM", notes: "Weekly — click Find Performers for who's playing" },
    ],
  },
  "Station 142": {
    days: "Tuesdays through Sundays",
    events: [
      { day: "Tuesday",  event: "Karaoke Night",          time: "10:00 PM", notes: "Weekly with DJ — $50 gift card to best performer" },
      { day: "Thursday", event: "Open Mic Night",         time: "8:00 PM",  notes: "All musicians welcome, live band backing & full PA" },
      { day: "Friday",   event: "Live Music",             time: "8:00 PM",  notes: "Weekly — click Find Performers for who's playing" },
      { day: "Saturday", event: "Live Music",             time: "8:00 PM",  notes: "Weekly — click Find Performers for who's playing" },
      { day: "Sunday",   event: "Sunday Funday Game Night", time: "8:00 PM", notes: "Weekly with DJ Kyle B" },
    ],
  },
  "Brickette Lounge": {
    days: "every night",
    events: [
      { day: "Monday",    event: "Beginner Line Dancing",         time: "Evening", notes: "Weekly — no experience needed" },
      { day: "Tuesday",   event: "Line Dancing with Grace",       time: "Evening", notes: "Weekly" },
      { day: "Wednesday", event: "Line Dancing with DJ Bill",     time: "Evening", notes: "Weekly — request your favorites" },
      { day: "Thursday",  event: "Line Dancing with DJ Bill",     time: "Evening", notes: "Weekly" },
      { day: "Friday",    event: "Live Country & Western Music",  time: "9:00 PM", notes: "Weekly — click Find Performers for lineup" },
      { day: "Saturday",  event: "Live Music & BBQ",             time: "9:00 PM", notes: "Weekly — 21+ after 5pm. Click Find Performers for lineup" },
    ],
  },
  "Slow Hand Food & Drink": {
    days: "Fridays and Saturdays",
    events: [
      { day: "Friday",   event: "Live Music", time: "7:00 PM", notes: "Weekly — click Find Performers for who's playing" },
      { day: "Saturday", event: "Live Music", time: "7:00 PM", notes: "Weekly — click Find Performers for who's playing" },
    ],
  },
  "Square Bar": {
    days: "Fridays and Saturdays",
    events: [
      { day: "Friday",   event: "Live Music", time: "9:00 PM", notes: "Weekly" },
      { day: "Saturday", event: "Live Music", time: "9:00 PM", notes: "Weekly" },
    ],
  },
  "Saloon 151": {
    days: "Tuesdays, Wednesdays and Fridays",
    events: [
      { day: "Tuesday",   event: "Quizzo Trivia Night", time: "7:00 PM", notes: "Weekly — half-price nachos & $5 cocktails" },
      { day: "Wednesday", event: "Music Bingo",         time: "8:00 PM", notes: "5 rounds, gift card prizes" },
      { day: "Friday",    event: "Karaoke Night",       time: "9:00 PM", notes: "Weekly" },
    ],
  },
  "Murph's Hideaway": {
    days: "Fridays and Saturdays",
    events: [
      { day: "Friday",   event: "Live Music", time: "8:00 PM", notes: "Weekly — click Find Performers for current lineup" },
      { day: "Saturday", event: "Live Music", time: "8:00 PM", notes: "Weekly — click Find Performers for current lineup" },
    ],
  },
  // Well-known nearby West Chester venues
  "Stone Tavern": {
    days: "Sundays, Wednesdays, Thursdays and Saturdays",
    events: [
      { day: "Sunday",    event: "Bingo",        time: "6:00 PM", notes: "Weekly" },
      { day: "Wednesday", event: "Quizzo",       time: "7:00 PM", notes: "Weekly pub trivia" },
      { day: "Thursday",  event: "Music Trivia", time: "7:00 PM", notes: "Weekly" },
      { day: "Saturday",  event: "Live Music",   time: "7:00 PM", notes: "Weekly — click Find Performers for who's playing" },
    ],
  },
  "Barnaby's": {
    days: "Tuesdays and Wednesdays",
    events: [
      { day: "Tuesday",   event: "Karaoke Night", time: "10:00 PM", notes: "Weekly" },
      { day: "Wednesday", event: "Quizzo",        time: "7:30 PM",  notes: "Weekly — 2 rounds, $25/$50 gift card prizes" },
    ],
  },
  "Kildare's": {
    days: "Tuesdays",
    events: [
      { day: "Tuesday", event: "Karaoke & Drag Show", time: "9:00 PM", notes: "Weekly with Roxanne Rohls & Ophelia Bawdy" },
    ],
  },
  "Ryan's Pub": {
    days: "Wednesdays",
    events: [
      { day: "Wednesday", event: "Karaoke Night", time: "10:00 PM", notes: "Weekly" },
    ],
  },
  "Santino's": {
    days: "Wednesdays",
    events: [
      { day: "Wednesday", event: "Video Trivia with H6 Trivia", time: "8:30 PM", notes: "Weekly" },
    ],
  },
};

// In-memory cache — persists within a single serverless instance
// Vercel KV is used when available for cross-instance persistence
const memoryCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const getCached = async (key) => {
  // Try Vercel KV first if available
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      const val = await kv.get(key);
      if (val) return val;
    }
  } catch {}
  // Fall back to memory cache
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.ts < CACHE_TTL) return mem.data;
  return null;
};

const setCached = async (key, data) => {
  // Try Vercel KV first
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      await kv.set(key, data, { ex: 86400 }); // 24hr expiry
      return;
    }
  } catch {}
  // Fall back to memory cache
  memoryCache.set(key, { data, ts: Date.now() });
};

const findKnown = (venueName) => {
  const key = Object.keys(ALL_KNOWN_SCHEDULES).find(k =>
    venueName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(venueName.toLowerCase())
  );
  return key ? ALL_KNOWN_SCHEDULES[key] : null;
};

const extractJSON = (data) => {
  if (!data?.content) return null;
  const text = data.content.filter(b => b.type === "text").map(b => b.text || "").join("\n");
  if (!text) return null;
  const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const matches = clean.match(/\[[\s\S]*?\]/g) || [];
  for (const m of matches) {
    try { const p = JSON.parse(m); if (Array.isArray(p) && p.length > 0) return p; } catch {}
  }
  try { const p = JSON.parse(clean); if (Array.isArray(p) && p.length > 0) return p; } catch {}
  return null;
};

// Known event page URLs — Claude fetches these directly for real performer names
const EVENT_PAGES = {
  "Pietro's Prime":         "https://www.pietrosprime.com/event-list",
  "Station 142":            "https://station142.com/live-music/",
  "Brickette Lounge":       "https://www.brickettelounge.com/music-events",
  "Slow Hand Food & Drink": "https://www.slowhand-wc.com/events",
  "Saloon 151":             "https://www.saloon151.com/events-catering-1",
  "Stone Tavern":           "https://www.thestonetavern1867.com/events",
  "The Stone Tavern":       "https://www.thestonetavern1867.com/events",
};

export async function POST(req) {
  try {
    const { venueName, venueAddress, venueWebsite, findPerformers } = await req.json();
    if (!venueName) return Response.json({ schedule: [], source: "none" });

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const city = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";

    // ── KNOWN SCHEDULE (free, instant) ────────────────────────────────────────
    // Return immediately unless the user explicitly clicked "Find Performers"
    const known = findKnown(venueName);
    if (!findPerformers) {
      if (known) {
        return Response.json({ schedule: known.events, source: "known", days: known.days });
      }
      return Response.json({ schedule: [], source: "none" });
    }

    // ── FIND PERFORMERS (user clicked the button) ─────────────────────────────
    // Check cache first — free if already fetched today
    const cacheKey = `schedule:${venueName.toLowerCase().replace(/\s+/g, "-")}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return Response.json({ ...cached, fromCache: true });
    }

    // Find known event page for this venue
    const eventPageKey = Object.keys(EVENT_PAGES).find(k =>
      venueName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(venueName.toLowerCase())
    );
    const eventPageUrl = eventPageKey ? EVENT_PAGES[eventPageKey] : null;

    // ── PLAN A: Web search for real current performers ────────────────────────
    try {
      const fetchInstruction = eventPageUrl
        ? `Start by fetching this URL which lists their current upcoming events with real performer names: ${eventPageUrl}
Then also search Google, Facebook, Instagram, and Bandsintown for additional upcoming events.`
        : `Search Google, Facebook events, Instagram, Bandsintown, and local event sites for their current schedule and upcoming performers.`;

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
          system: `You are a live music researcher. Find the CURRENT entertainment schedule for ${month} for a specific venue — real band names, performer names, and specific upcoming dates. Return ONLY a valid JSON array, no other text: [{"day":"Friday May 16","event":"Band Name","time":"9:00 PM","notes":"detail"}]. For recurring events with no specific date found, use just the day name. Include all types: live music, line dancing, trivia, karaoke, open mic, bingo, DJ nights. Return [] only if you find absolutely nothing.`,
          messages: [{
            role: "user",
            content: `${fetchInstruction}\n\nFind the ${month} entertainment schedule for "${venueName}"${city ? ` in ${city}` : ""}${venueWebsite ? `. Website: ${venueWebsite}` : ""}.`
          }],
        }),
        signal: AbortSignal.timeout(28000),
      });

      if (res.ok) {
        const data = await res.json();
        const schedule = extractJSON(data);
        if (schedule && schedule.length > 0) {
          const result = { schedule, source: "web_search" };
          await setCached(cacheKey, result);
          return Response.json(result);
        }
      }
    } catch (e) {
      console.error("Web search failed:", e.message);
    }

    // ── PLAN B: Direct website scrape (HTML/WordPress only) ───────────────────
    if (venueWebsite) {
      try {
        const base = venueWebsite.replace(/\/$/, "");
        const paths = ["/event-list", "/events", "/entertainment", "/live-music", "/music", "/calendar", "/schedule", "/shows", ""];
        const keywords = ["band", "live", "music", "event", "trivia", "karaoke", "dj", "open mic", "pm", "upcoming", "bingo", "line dancing", "perform"];
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
            const text = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            if (text.length < 300) continue; // skip JS-only shells
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
              system: `Extract entertainment schedule from venue website. Include specific performer names, all event types. Return ONLY a raw JSON array: [{"day":"Friday","event":"Band Name","time":"9pm","notes":""}]. Return null if nothing found.`,
              messages: [{ role: "user", content: `Extract schedule for "${venueName}":\n\n${best.text}` }],
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (res.ok) {
            const data = await res.json();
            const schedule = extractJSON(data);
            if (schedule && schedule.length > 0) {
              const result = { schedule, source: "website" };
              await setCached(cacheKey, result);
              return Response.json(result);
            }
          }
        }
      } catch (e) { console.error("Scrape failed:", e.message); }
    }

    // ── PLAN C: Fall back to known schedule if performer search found nothing ──
    if (known) {
      return Response.json({ schedule: known.events, source: "known", days: known.days });
    }

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}