// Baseline schedules for featured venues — recurring patterns only, not specific dates
const KNOWN_SCHEDULES = {
  "Pietro's Prime": [
    { day: "Wednesday", event: "Live Music", time: "7:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Thursday", event: "Live Music", time: "7:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Friday", event: "Live Music", time: "7:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Saturday", event: "Live Music", time: "8:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
  ],
  "Station 142": [
    { day: "Tuesday", event: "Karaoke Night", time: "10:00 PM", notes: "Weekly with DJ" },
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
    { day: "Tuesday", event: "Quizzo Trivia Night", time: "7:00 PM", notes: "Weekly" },
    { day: "Wednesday", event: "Music Bingo", time: "8:00 PM", notes: "5 rounds, gift card prizes" },
    { day: "Friday", event: "Karaoke Night", time: "9:00 PM", notes: "Weekly" },
  ],
  "Murph's Hideaway": [
    { day: "Friday", event: "Live Music", time: "8:00 PM", notes: "Check murphshideaway.com for current lineup" },
    { day: "Saturday", event: "Live Music", time: "8:00 PM", notes: "Check murphshideaway.com for current lineup" },
  ],
};

// ── Site type detector ────────────────────────────────────────────────────────
// Fetches the homepage and identifies what platform the site runs on.
// Returns: { type, html, text, canScrape }
const detectSiteType = async (websiteUrl) => {
  try {
    const res = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });
    if (!res.ok) return { type: "unknown", html: "", text: "", canScrape: false };

    const html = await res.text();
    const lowerHtml = html.toLowerCase();

    // Detect platform from HTML fingerprints
    let type = "html"; // default — plain scrapable HTML

    if (lowerHtml.includes("wix.com") || lowerHtml.includes("wixsite") || lowerHtml.includes("_wix") || lowerHtml.includes("wix-thunderbolt")) {
      type = "wix";
    } else if (lowerHtml.includes("squarespace") || lowerHtml.includes("sqsp") || lowerHtml.includes("static.squarespace")) {
      type = "squarespace";
    } else if (lowerHtml.includes("webflow") || lowerHtml.includes("webflow.io")) {
      type = "webflow";
    } else if (lowerHtml.includes("wordpress") || lowerHtml.includes("wp-content") || lowerHtml.includes("wp-json")) {
      type = "wordpress";
    } else if (lowerHtml.includes("godaddy") || lowerHtml.includes("godaddysites") || lowerHtml.includes("secureserver.net")) {
      type = "godaddy";
    } else if (lowerHtml.includes("shopify")) {
      type = "shopify";
    }

    // Check if the page has meaningful text content
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // JS-heavy sites render almost no text server-side
    const canScrape = text.length > 300 && type !== "wix" && type !== "squarespace" && type !== "webflow" && type !== "godaddy";

    return { type, html, text: text.slice(0, 6000), canScrape };
  } catch {
    return { type: "unknown", html: "", text: "", canScrape: false };
  }
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
      return null;
    };

    const knownKey = Object.keys(KNOWN_SCHEDULES).find(k =>
      venueName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(venueName.toLowerCase())
    );

    const cityState = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";
    const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    // ── Detect site type first ────────────────────────────────────────────────
    let siteInfo = { type: "unknown", canScrape: false, text: "" };
    if (venueWebsite) {
      siteInfo = await detectSiteType(venueWebsite);
    }

    // Build a platform-specific note for the web search prompt
    const platformHints = {
      wix:        "Their site is built on Wix — the calendar is JS-rendered so search Google for their events instead of scraping. Search site:thestonetavern1867.com events or search their venue name + events + current month.",
      squarespace:"Their site is on Squarespace — events may not be scrapable. Search Google, Facebook events, and Instagram for their schedule.",
      webflow:    "Their site is on Webflow — JS-rendered. Search Google, Facebook, and Instagram for their entertainment schedule.",
      godaddy:    "Their site is on GoDaddy — may be JS-rendered. Search Google and Facebook events for their schedule.",
      wordpress:  "Their site runs WordPress — likely scrapable but also check Google and Facebook for the most current events.",
      html:       "Their site is plain HTML — check their events page directly and also search Google for the most current performers.",
      unknown:    "Search Google, Facebook, Instagram, and local event sites for their entertainment schedule.",
    };
    const platformHint = platformHints[siteInfo.type] || platformHints.unknown;

    // ── PLAN A: Claude + Web Search (works for ALL site types) ───────────────
    // For JS-rendered sites (Wix, Squarespace) this is the primary strategy
    // since Google indexes their events even when we can't scrape them.
    try {
      const data = await callClaude(
        `You are a live music researcher finding CURRENT entertainment at a specific venue for ${currentMonth}.

${platformHint}

Search for:
- Specific upcoming band/artist names with dates
- Weekly recurring entertainment (trivia, karaoke, bingo, open mic, DJ nights)
- Their Facebook events page
- Instagram posts about upcoming events  
- Local event sites (downtownwestchester.com, allevents.in, eventbrite, bandsintown)
- Band/artist websites that list this venue on their tour page

Return ONLY a raw JSON array, no other text:
[{"day":"Sunday","event":"Bingo","time":"6:00 PM","notes":"Weekly"},{"day":"Wednesday","event":"Quizzo","time":"7:00 PM","notes":"Weekly"}]

Use real event names and performer names when found. For recurring weekly events use the day name. Only return [] if you find absolutely nothing.`,
        `Find the current ${currentMonth} entertainment schedule for "${venueName}"${cityState ? ` in ${cityState}` : ""}${venueWebsite ? `. Website: ${venueWebsite}` : ""}.`,
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      const schedule = extractJSON(data);
      if (schedule && schedule.length > 0) {
        return Response.json({ schedule, source: "web_search" });
      }
    } catch (e) {
      console.error("Plan A failed:", e.message);
    }

    // ── PLAN B: Direct scrape (only for scrapable sites) ─────────────────────
    // Skipped automatically for Wix, Squarespace, Webflow, GoDaddy.
    if (venueWebsite && siteInfo.canScrape) {
      try {
        const baseUrl = venueWebsite.replace(/\/$/, "");
        const eventPaths = ["/event-list", "/events", "/entertainment", "/live-music", "/music", "/calendar", "/shows", "/schedule", "/whats-on", ""];
        const KEYWORDS = ["band", "live", "music", "show", "perform", "schedule", "event", "trivia", "karaoke", "dj", "open mic", "pm", "upcoming", "bingo", "quizzo"];

        let bestText = siteInfo.text; // already have homepage text
        let bestScore = KEYWORDS.filter(kw => bestText.toLowerCase().includes(kw)).length;

        // Try event-specific subpages
        for (const path of eventPaths.slice(0, -1)) { // skip "" since we have homepage
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
            if (text.length < 200) continue;
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
            `Extract the entertainment schedule from this venue website text. Include specific band/artist names, days, times, event types. Return ONLY a raw JSON array: [{"day":"Friday","event":"Live Band","time":"9pm","notes":""}]. Return null if no events found.`,
            `Extract schedule for "${venueName}" (${siteInfo.type} site):\n\n${bestText}`
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

    // ── PLAN D: Claude general knowledge ─────────────────────────────────────
    try {
      const data = await callClaude(
        `You are a local entertainment expert. Return what you know about this venue's recurring entertainment schedule. Return ONLY a raw JSON array: [{"day":"Friday","event":"Live Music","time":"9pm","notes":"Weekly"}]. Return null if you have no knowledge.`,
        `Recurring entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}.`
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