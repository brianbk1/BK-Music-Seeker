// ─────────────────────────────────────────────────────────────────────────────
// Venue event feeds — real, first-party event data pulled at build/revalidate
// time and rendered into crawler-visible HTML.
//
// TO ADD A VENUE: add one line to VENUE_FEEDS below. Nothing else to change.
// Squarespace sites expose their event collection at /events?format=json.
// ─────────────────────────────────────────────────────────────────────────────

export const VENUE_FEEDS = [
  {
    name: "LoCali Wine Lounge",
    city: "West Chester, PA",
    type: "squarespace",
    url: "https://www.enjoylocali.com/events?format=json",
    link: "https://www.enjoylocali.com/events",
  },
  // Example — uncomment and edit when you add another Squarespace venue:
  // { name: "Slow Hand Food & Drink", city: "West Chester, PA", type: "squarespace",
  //   url: "https://www.slowhand-wc.com/events?format=json", link: "https://www.slowhand-wc.com/events" },
];

const TZ = "America/New_York";

const clean = (s) =>
  String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const fetchSquarespace = async (feed) => {
  const res = await fetch(feed.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 43200 }, // cache the upstream fetch for 12h
  });
  if (!res.ok) return [];
  const data = await res.json();
  const items = Array.isArray(data.upcoming) ? data.upcoming
              : Array.isArray(data.items)    ? data.items
              : [];

  const cutoff = Date.now() - 12 * 60 * 60 * 1000; // keep today's events

  return items
    .filter((it) => it && it.startDate && it.startDate >= cutoff)
    .map((it) => {
      const d = new Date(it.startDate);
      return {
        venue: feed.name,
        city: feed.city,
        title: clean(it.title) || "Live Music",
        ts: it.startDate,
        dateLabel: d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" }),
        shortDate: d.toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric" }),
        timeLabel: d.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }),
        description: clean(it.excerpt || it.body).slice(0, 240),
        url: it.fullUrl ? `https://${(feed.url.split("/")[2] || "")}${it.fullUrl}` : feed.link,
        venueLink: feed.link,
      };
    });
};

const FETCHERS = { squarespace: fetchSquarespace };

/**
 * Returns upcoming events across all configured venue feeds, soonest first.
 * Never throws — a dead feed just contributes nothing.
 */
export async function getUpcomingEvents({ limit = 24 } = {}) {
  const settled = await Promise.allSettled(
    VENUE_FEEDS.map(async (feed) => {
      const fn = FETCHERS[feed.type];
      if (!fn) return [];
      try { return await fn(feed); } catch { return []; }
    })
  );

  const events = settled
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  events.sort((a, b) => a.ts - b.ts);
  return events.slice(0, limit);
}

/**
 * Human-readable "last checked" stamp for the page.
 */
export function feedTimestamp() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: TZ, month: "long", day: "numeric", year: "numeric",
  });
}

/**
 * Static fallback so the tab is never empty if every feed is down.
 * These are recurring weekly patterns, not dated events, so they don't go stale.
 */
export const WEEKLY_RHYTHM = [
  { day: "Monday",    entries: ["Brickette Lounge — beginner line dancing, evening"] },
  { day: "Tuesday",   entries: ["Station 142 — karaoke with DJ, 10pm", "Saloon 151 — Quizzo trivia, 7pm", "Barnaby's — karaoke, 10pm", "Kildare's — karaoke & drag show, 9pm"] },
  { day: "Wednesday", entries: ["LoCali — songwriter circles & open mics, 7–9pm", "Pietro's Prime — live music, 7–10pm", "Saloon 151 — music bingo, 8pm", "Stone Tavern — Quizzo, 7pm"] },
  { day: "Thursday",  entries: ["LoCali — bring your own vinyl night, 6–9pm", "Station 142 — open mic with live band backing, 8pm", "Pietro's Prime — live music, 7–10pm", "Stone Tavern — music trivia, 7pm"] },
  { day: "Friday",    entries: ["LoCali — Flight Night 6–9pm, Friday Hang live acoustic 8–10pm", "Station 142 — live music, 8pm", "Pietro's Prime — live music, 7–10pm", "Slow Hand — live music, 7pm", "Square Bar — live music, 9pm", "Brickette Lounge — live country & western, 9pm", "Saloon 151 — karaoke, 9pm"] },
  { day: "Saturday",  entries: ["LoCali — LoCali Live acoustic showcase, 6–8pm", "Station 142 — live music, 8pm", "Pietro's Prime — live music, 8–11pm", "Slow Hand — live music, 7pm", "Square Bar — live music, 9pm", "Brickette Lounge — live music & BBQ, 9pm", "Stone Tavern — live music, 7pm"] },
  { day: "Sunday",    entries: ["LoCali — Sunday Songs acoustic session, 4–6pm", "Station 142 — Sunday Funday game night with DJ, 8pm", "Stone Tavern — bingo, 6pm"] },
];
