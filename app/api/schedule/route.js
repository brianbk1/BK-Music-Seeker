// Baseline schedules — only used if ALL live lookups return empty
// Describes recurring patterns, not specific performers or dates
const KNOWN_SCHEDULES = {
  "Pietro's Prime": [
    { day: "Wednesday", event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Thursday", event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Friday", event: "Live Music", time: "7:00 PM – 10:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
    { day: "Saturday", event: "Live Music", time: "8:00 PM – 11:00 PM", notes: "Weekly — check pietrosprime.com/event-list for current performer" },
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
    { day: "Friday", event: "Live Country & Western Music", time: "9:00 PM", notes: "Weekly — live bands and DJs. Check Instagram @brickettelounge for lineup" },
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

// Direct event page URLs — Claude fetches these via web search for real performer names
const DIRECT_EVENT_PAGES = {
  "Pietro's Prime": "https://www.pietrosprime.com/event-list",
  "Station 142": "https://station142.com/live-music/",
  "Brickette Lounge": "https://www.brickettelounge.com/music-events",
  "Slow Hand Food & Drink": "https://www.slowhand-wc.com/events",
  "Saloon 151": "https://www.saloon151.com/events-catering-1",
};

// ── Site type detector ────────────────────────────────────────────────────────
const detectSiteType = async (websiteUrl) => {
  try {
    const res = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });
    if (!res.ok) return { type: "unknown", text: "", canScrape: false };
    const html = await res.text();
    const lower = html.toLowerCase();
    let type = "html";
    if (lower.includes("wix.com") || lower.includes("wixsite") || lower.includes("_wix") || lower.includes("wix-thunderbolt")) type = "wix";
    else if (lower.includes("squarespace") || lower.includes("sqsp")) type = "squarespace";
    else if (lower.includes("webflow")) type = "webflow";
    else if (lower.includes("wordpress") || lower.includes("wp-content")) type = "wordpress";
    else if (lower.includes("godaddy") || lower.includes("godaddysites")) type = "godaddy";
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const canScrape = text.length > 300 && !["wix","squarespace","webflow","godaddy"].includes(type);
    return { type, text: text.slice(0, 6000), canScrape };
  } catch {
    return { type: "unknown", text: "", canScrape: false };
  }
};

export async function POST(req) {
  try {
    const { venueName, venueAddress, venueWebsite } = await req.json();
    if (!venueName) return Response.json({ schedule: [], source: "none" });

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
        signal: AbortSignal.timeout(28000),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    };

    const extractJSON = (data) => {
      if (!data?.content) return null;
      const allText = data.content.filter(b => b.type === "text").map(b => b.text || "").join("\n");
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

    const directPageKey = Object.keys(DIRECT_EVENT_PAGES).find(k =>
      venueName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(venueName.toLowerCase())
    );
    const directEventUrl = directPageKey ? DIRECT_EVENT_PAGES[directPageKey] : null;

    const cityState = venueAddress ? venueAddress.split(",").slice(0, 2).join(",") : "";
    const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    // ── PLAN A: Claude + Web Search ───────────────────────────────────────────
    // For venues with known event pages (including Wix sites like Pietro's),
    // Claude fetches the page directly via web search — bypassing the Wix JS block
    // that prevents server-side fetch(). Google also indexes these pages.
    try {
      const directInstruction = directEventUrl
        ? `IMPORTANT: Start by fetching this exact URL to get their current event list: ${directEventUrl}
This page lists upcoming performers with specific dates and times. Extract all events from it.`
        : `Search for their events page, Facebook events, Instagram, Bandsintown, and local event sites.`;

      const siteInfo = venueWebsite ? await detectSiteType(venueWebsite) : { type: "unknown" };
      const wixNote = siteInfo.type === "wix"
        ? `Their website is built on Wix. The events page URL above should be fetched directly — it renders content even though server-side scraping is blocked.`
        : "";

      const data = await callClaude(
        `You are a live music researcher. Find the CURRENT entertainment schedule for ${currentMonth} for a specific venue.

${directInstruction}
${wixNote}

Also search for:
- Specific upcoming band/artist names with dates
- Weekly recurring entertainment (line dancing, trivia, karaoke, bingo, open mic, DJ nights, poker, themed nights)
- Facebook events page
- Instagram posts about upcoming shows
- Bandsintown venue page
- Band websites listing this venue on their tour schedule

Return ONLY a raw JSON array, no other text:
[{"day":"Wednesday May 13","event":"John Grecia (Piano)","time":"7:00 PM – 10:00 PM","notes":"Weekly recurring"}]

Use real performer names. For recurring weekly events without specific dates use the day name. Return [] only if you find absolutely nothing.`,
        `Find the ${currentMonth} entertainment schedule for "${venueName}"${cityState ? ` in ${cityState}` : ""}${venueWebsite ? `. Website: ${venueWebsite}` : ""}.`,
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      const schedule = extractJSON(data);
      if (schedule && schedule.length > 0) {
        return Response.json({ schedule, source: "web_search" });
      }
    } catch (e) {
      console.error("Plan A failed:", e.message);
    }

    // ── PLAN B: Direct website scrape (scrapable HTML/WordPress sites only) ───
    if (venueWebsite) {
      try {
        const siteInfo = await detectSiteType(venueWebsite);
        if (siteInfo.canScrape) {
          const baseUrl = venueWebsite.replace(/\/$/, "");
          const eventPaths = ["/event-list", "/events", "/entertainment", "/live-music", "/music", "/calendar", "/shows", "/schedule", "/whats-on", ""];
          const KEYWORDS = ["band", "live", "music", "show", "perform", "schedule", "event", "trivia", "karaoke", "dj", "open mic", "pm", "upcoming", "bingo", "quizzo", "line dancing", "poker"];

          let bestText = siteInfo.text;
          let bestScore = KEYWORDS.filter(kw => bestText.toLowerCase().includes(kw)).length;

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
                .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
              if (text.length < 200) continue;
              const score = KEYWORDS.filter(kw => text.toLowerCase().includes(kw)).length;
              if (score > bestScore) { bestScore = score; bestText = text.slice(0, 6000); if (score >= 5) break; }
            } catch { continue; }
          }

          if (bestText && bestScore >= 3) {
            const data = await callClaude(
              `Extract the entertainment schedule from this venue website. Include specific band/artist names, dates, times, and ALL event types including line dancing, trivia, karaoke, poker, open mic, bingo, etc. Return ONLY a raw JSON array: [{"day":"Friday","event":"Live Band","time":"9pm","notes":""}]. Return null if no events found.`,
              `Extract schedule for "${venueName}":\n\n${bestText}`
            );
            const schedule = extractJSON(data);
            if (schedule && schedule.length > 0) return Response.json({ schedule, source: "website" });
          }
        }
      } catch (e) { console.error("Plan B failed:", e.message); }
    }

    // ── PLAN C: Known schedule baseline for featured venues ───────────────────
    if (knownKey) {
      return Response.json({ schedule: KNOWN_SCHEDULES[knownKey], source: "ai_knowledge" });
    }

    // ── PLAN D: Claude general knowledge ─────────────────────────────────────
    try {
      const data = await callClaude(
        `You are a local entertainment expert. Return what you know about this venue's recurring entertainment — live music, line dancing, trivia, karaoke, open mic, bingo, poker, themed nights, etc. Return ONLY a raw JSON array: [{"day":"Friday","event":"Live Music","time":"9pm","notes":"Weekly"}]. Return null if you have no knowledge of this venue.`,
        `Recurring entertainment schedule for "${venueName}"${venueAddress ? ` at ${venueAddress}` : ""}.`
      );
      const schedule = extractJSON(data);
      if (schedule && schedule.length > 0) return Response.json({ schedule, source: "ai_knowledge" });
    } catch (e) { console.error("Plan D failed:", e.message); }

    return Response.json({ schedule: [], source: "none" });

  } catch (err) {
    return Response.json({ error: err.message, schedule: [], source: "none" }, { status: 500 });
  }
}