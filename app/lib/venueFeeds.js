// ─────────────────────────────────────────────────────────────────────────────
// Venue event feeds — real, first-party event data pulled at build/revalidate
// time and rendered into crawler-visible HTML.
//
// TO ADD A VENUE: add one line to VENUE_FEEDS below.
//
//   type: "squarespace"  → site.com/events?format=json  (clean JSON feed)
//   type: "html"         → any other site. Tries, in order:
//                            1. schema.org Event JSON-LD
//                            2. Google Calendar "add to calendar" links
//                            3. Wix event-details links + nearby date text
//                          Most event plugins emit at least one of these.
//
// Every fetcher returns [] on failure rather than throwing, so one broken
// venue never takes down the section.
// ─────────────────────────────────────────────────────────────────────────────

export const VENUE_FEEDS = [
  {
    name: "LoCali Wine Lounge",
    city: "West Chester, PA",
    type: "squarespace",
    url: "https://www.enjoylocali.com/events?format=json",
    link: "https://www.enjoylocali.com/events",
  },
  {
    name: "Station 142",
    city: "West Chester, PA",
    type: "html",
    url: "https://station142.com/live-music/",
    link: "https://station142.com/live-music/",
    // Their calendar plugin writes LOCAL times but tags them "Z". Without this
    // a 9:00 PM show renders as 5:00 PM. Only set this if you verify the same
    // mismatch on another venue.
    timeMode: "wallclock",
  },
  {
    name: "Pietro's Prime",
    city: "West Chester, PA",
    type: "html",
    url: "https://www.pietrosprime.com/entertainment",
    link: "https://www.pietrosprime.com/entertainment",
  },
];

const TZ = "America/New_York";
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

// Treat Y/M/D H:M as wall-clock time in `tz` and return the true instant.
// DST-accurate, and independent of what timezone the server runs in.
const zonedToUtc = (y, mo, d, h, mi, tz = TZ) => {
  const guess = Date.UTC(y, mo, d, h, mi);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(guess)).map((p) => [p.type, p.value])
  );
  const asTz = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
  return new Date(guess - (asTz - guess));
};

// ── text helpers ─────────────────────────────────────────────────────────────

const decodeEntities = (s) =>
  String(s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));

const clean = (s) =>
  decodeEntities(String(s || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// Build our standard event shape from a JS Date
const makeEvent = (feed, { title, date, description = "", url = "", timeKnown = true }) => {
  if (!title || !date || isNaN(date)) return null;
  return {
    venue: feed.name,
    city: feed.city,
    title: clean(title).slice(0, 120),
    ts: date.getTime(),
    dayKey:    date.toLocaleDateString("en-CA", { timeZone: TZ }), // YYYY-MM-DD
    dayLabel:  date.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" }),
    shortDate: date.toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric" }),
    timeLabel: timeKnown
      ? date.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })
      : "Evening",
    timeKnown,
    description: clean(description).slice(0, 200),
    url: url || feed.link,
    venueLink: feed.link,
  };
};

const getHTML = async (url) => {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(12000),
    next: { revalidate: 43200 },
  });
  if (!res.ok) return "";
  return await res.text();
};

// ── 1. Squarespace JSON ──────────────────────────────────────────────────────

const fetchSquarespace = async (feed) => {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 43200 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const items = Array.isArray(data.upcoming) ? data.upcoming
              : Array.isArray(data.items)    ? data.items
              : [];
  const host = feed.url.split("/")[2] || "";
  return items
    .filter((it) => it && it.startDate)
    .map((it) => makeEvent(feed, {
      title: it.title || "Live Music",
      date: new Date(it.startDate),
      description: it.excerpt || it.body,
      url: it.fullUrl ? `https://${host}${it.fullUrl}` : feed.link,
    }))
    .filter(Boolean);
};

// ── 2a. schema.org Event JSON-LD ─────────────────────────────────────────────

const parseJsonLd = (html, feed) => {
  const out = [];
  const blocks = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];

  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    const type = node["@type"];
    const isEvent = typeof type === "string"
      ? /Event/i.test(type)
      : Array.isArray(type) && type.some((t) => /Event/i.test(String(t)));
    if (isEvent && node.startDate) {
      const e = makeEvent(feed, {
        title: node.name,
        date: new Date(node.startDate),
        description: node.description,
        url: typeof node.url === "string" ? node.url : feed.link,
      });
      if (e) out.push(e);
    }
    Object.values(node).forEach((v) => { if (v && typeof v === "object") walk(v); });
  };

  for (const b of blocks) {
    const json = b.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try { walk(JSON.parse(json)); } catch { /* malformed block, skip */ }
  }
  return out;
};

// ── 2b. Google Calendar "add to calendar" links ──────────────────────────────
// Pattern: google.com/calendar/event?action=TEMPLATE&text=Band+Name&dates=20260724T210000Z/...
// Reliable across most WordPress event plugins.

const parseGCalLinks = (html, feed) => {
  const out = [];
  const src = html.replace(/&amp;/g, "&");
  const re = /calendar\/event\?action=TEMPLATE[^"'\s>]*/gi;
  const seen = new Set();

  for (const raw of src.match(re) || []) {
    const text = /[?&]text=([^&"'\s]*)/i.exec(raw)?.[1];
    const dates = /[?&]dates=([^&"'\s]*)/i.exec(raw)?.[1];
    if (!text || !dates) continue;

    const start = dates.split("/")[0];
    let date = null;
    let timeKnown = true;
    if (/^\d{8}T\d{6}Z?$/.test(start)) {
      const [y, mo, d, h, mi] = [+start.slice(0,4), +start.slice(4,6) - 1, +start.slice(6,8), +start.slice(9,11), +start.slice(11,13)];
      date = feed.timeMode === "wallclock"
        ? zonedToUtc(y, mo, d, h, mi)
        : new Date(Date.UTC(y, mo, d, h, mi));
    } else if (/^\d{8}$/.test(start)) {
      // All-day entry — no published time, anchor to the evening
      date = zonedToUtc(+start.slice(0,4), +start.slice(4,6) - 1, +start.slice(6,8), 19, 0);
      timeKnown = false;
    }
    if (!date || isNaN(date)) continue;

    let title;
    try { title = decodeURIComponent(text.replace(/\+/g, " ")); } catch { title = text.replace(/\+/g, " "); }
    title = clean(title);
    if (!title) continue;

    const key = `${title.toLowerCase()}|${date.getTime()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const e = makeEvent(feed, { title, date, url: feed.link, timeKnown });
    if (e) out.push(e);
  }
  return out;
};

// ── 2c. Wix events fallback ──────────────────────────────────────────────────
// Wix event lists render "Fri, Jul 24" style dates near an /event-details/ link.
// No time is published on the list page, so we anchor to 7pm local.

const MONTHS = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };

const parseWixEvents = (html, feed) => {
  const out = [];
  const text = decodeEntities(html.replace(/<[^>]+>/g, "\n")).replace(/[ \t]+/g, " ");
  const now = new Date();
  const re = /([A-Za-z][A-Za-z'’&.\- ]{2,60}?)\s*\n+\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*([A-Za-z]{3})\s+(\d{1,2})/g;
  const seen = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    const title = clean(m[1]);
    const mon = MONTHS[m[2].toLowerCase()];
    const day = Number(m[3]);
    if (!title || mon === undefined || !day) continue;
    if (title.length < 3 || /^(share|check out|view|book|menu)/i.test(title)) continue;

    // Choose the year that puts the date in the near future
    let year = now.getFullYear();
    let date = zonedToUtc(year, mon, day, 19, 0);
    if (date.getTime() < now.getTime() - 7 * 864e5) date = zonedToUtc(++year, mon, day, 19, 0);

    const key = `${title.toLowerCase()}|${date.getTime()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Wix list pages publish a date but no time
    const e = makeEvent(feed, { title, date, url: feed.link, timeKnown: false });
    if (e) out.push(e);
  }
  return out;
};

// ── generic HTML fetcher: try each strategy in order ─────────────────────────

const fetchHTMLFeed = async (feed) => {
  const html = await getHTML(feed.url);
  if (!html) return [];
  for (const parse of [parseJsonLd, parseGCalLinks, parseWixEvents]) {
    try {
      const events = parse(html, feed);
      if (events.length) return events;
    } catch { /* try next strategy */ }
  }
  return [];
};

const FETCHERS = { squarespace: fetchSquarespace, html: fetchHTMLFeed };

// ── public API ───────────────────────────────────────────────────────────────

/**
 * Upcoming events across all configured feeds, soonest first.
 * windowDays limits how far ahead to look — keeps "This Week" honest.
 */
export async function getUpcomingEvents({ limit = 40, windowDays = 14 } = {}) {
  const settled = await Promise.allSettled(
    VENUE_FEEDS.map(async (feed) => {
      const fn = FETCHERS[feed.type];
      if (!fn) return [];
      try { return await fn(feed); } catch { return []; }
    })
  );

  const from = Date.now() - 12 * 60 * 60 * 1000;      // still show tonight
  const to   = Date.now() + windowDays * 24 * 60 * 60 * 1000;

  const seen = new Set();
  return settled
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((e) => e && e.ts >= from && e.ts <= to)
    .filter((e) => {
      const k = `${e.venue}|${e.title.toLowerCase()}|${e.dayKey}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => a.ts - b.ts)
    .slice(0, limit);
}

/**
 * Group a flat event list into days: [{ dayKey, dayLabel, events: [...] }]
 */
export function groupByDay(events = []) {
  const days = new Map();
  for (const e of events) {
    if (!days.has(e.dayKey)) days.set(e.dayKey, { dayKey: e.dayKey, dayLabel: e.dayLabel, events: [] });
    days.get(e.dayKey).events.push(e);
  }
  return [...days.values()].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

export function feedTimestamp() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: TZ, month: "long", day: "numeric", year: "numeric",
  });
}

/**
 * Static fallback so the section is never empty if every feed is down.
 * Recurring weekly patterns, not dated events, so they don't go stale.
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
