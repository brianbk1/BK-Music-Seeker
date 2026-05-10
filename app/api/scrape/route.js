export async function POST(req) {
  try {
    const { url, venueName, venueAddress } = await req.json();

    // ── Known venue event page URLs ───────────────────────────────────────────
    const KNOWN_EVENT_URLS = {
      "station142.com":      "https://station142.com/live-music/",
      "brickettelounge.com": "https://www.brickettelounge.com/music-events",
      "pietrosprime.com":    "https://www.pietrosprime.com/entertainment",
      "slowhand-wc.com":     "https://www.slowhand-wc.com/events",
      "saloon151.com":       "https://www.saloon151.com/weekly-specials",
      "kildareswc.com":      "https://www.kildareswc.com/events",
      "barnabysrestaurants.com": "https://www.barnabysrestaurants.com/events",
      "vkbrewing.com":           "https://www.vkbrewing.com/specials.html",
    };

    // ── Venues that ALWAYS need screenshot (JS-rendered calendars) ────────────
    // Any Wix/Squarespace site or site where text scraping returns empty events
    const ALWAYS_SCREENSHOT = [
      "station142.com",
      "brickettelounge.com",
      "saloon151.com",
      "kildareswc.com",
    ];
    const alwaysScreenshot = ALWAYS_SCREENSHOT.some(d => hostname.includes(d));

    // ── Common event paths to probe ───────────────────────────────────────────
    const EVENT_PATHS = [
      "/live-music/", "/live-music", "/events/", "/events",
      "/music-events/", "/music-events", "/entertainment/", "/entertainment",
      "/music/", "/music", "/calendar/", "/calendar",
      "/shows/", "/shows", "/schedule/", "/schedule",
      "/whats-on/", "/whats-on", "/live/", "/live",
      "/band-schedule/", "/upcoming/", "/upcoming",
      "/specials/", "/specials", "/specials.html",
      "/happenings/", "/happenings", "/weekly/", "/weekly",
      "/whats-happening/", "/whats-happening",
      "/fun/", "/activities/", "/activities",
      "/tonight/", "/agenda/", "/agenda",
      "/trivia/", "/karaoke/", "/bingo/",
      "/open-mic/", "/open-mic", "/openmic/", "/openmic",
      "/line-dancing/", "/line-dancing", "/dancing/", "/dancing",
      "/poker/", "/poker", "/poker-night/",
      "/piano/", "/piano-bar/", "/dueling-pianos/",
    ];

    const CONTENT_KEYWORDS = [
      "band", "live music", "entertainment", "show", "perform",
      "schedule", "event", "pm", "doors open", "tickets", "admission",
      "cover charge", "dj", "acoustic", "karaoke", "open mic",
      "tonight", "this weekend", "upcoming", "lineup",
      "trivia", "music bingo", "bingo", "quizzo", "quiz",
      "happy hour", "weekly", "every tuesday", "every wednesday",
      "every thursday", "every friday", "every saturday", "every sunday",
      "monday night", "tuesday night", "wednesday night", "thursday night",
      "friday night", "saturday night", "sunday night",
      "open mic", "open-mic", "line dancing", "line-dancing",
      "poker", "poker night", "dueling piano", "dueling pianos",
      "piano bar", "piano night", "country night", "dance night",
      "two-step", "two step",
    ];

    const URL_KEYWORDS = [
      "music", "event", "entertainment", "calendar", "show", "schedule",
      "live", "band", "gig", "concert", "perform", "whats-on",
      "lineup", "upcoming", "ticket", "special", "happenings",
      "weekly", "tonight", "agenda", "what-on", "activities",
      "fun", "night", "trivia", "karaoke", "bingo", "open-mic",
      "open-mic", "line-dancing", "poker", "piano", "dancing",
    ];

    const APIFLASH_KEY = process.env.APIFLASH_KEY;

    const baseUrl  = new URL(url).origin;
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    // Build fallback search links
    const searchQuery = encodeURIComponent(
      `${venueName || ""} ${venueAddress || ""} live music events`.trim()
    );
    const fallbackLinks = {
      google:      `https://www.google.com/search?q=${searchQuery}`,
      facebook:    `https://www.facebook.com/search/pages/?q=${encodeURIComponent(venueName || "")}`,
      bandsintown: `https://www.bandsintown.com/search?query=${encodeURIComponent(venueName || "")}`,
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    const fetchPage = async (fetchUrl) => {
      try {
        const res = await fetch(fetchUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; BBKMusicSeeker/1.0)" },
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
        return { html, text };
      } catch { return null; }
    };

    const scoreContent = (text) => {
      const lower = text.toLowerCase();
      return CONTENT_KEYWORDS.filter(kw => lower.includes(kw)).length;
    };

    const scoreUrl = (href, anchor = "") => {
      const combined = (href + " " + anchor).toLowerCase();
      const baseScore = URL_KEYWORDS.filter(kw => combined.includes(kw)).length;
      // Bonus score for anchor text that clearly signals events/entertainment
      const anchorLower = anchor.toLowerCase();
      const anchorBonus = [
        "specials", "happenings", "what's on", "weekly events",
        "trivia", "karaoke", "bingo", "live music", "entertainment",
        "events", "schedule", "calendar", "shows", "tonight",
        "open mic", "line dancing", "poker", "poker night",
        "dueling piano", "piano bar", "country night", "dance night",
      ].some(kw => anchorLower.includes(kw)) ? 2 : 0;
      return baseScore + anchorBonus;
    };

    const isJsHeavy = (html) =>
      /wixsite|wix\.com|squarespace|webflow|framer\.com|godaddysites/i.test(html) ||
      html.includes("__wix") ||
      html.includes("window.__ss_") ||
      (html.length > 5000 && html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().length < 300);

    // Use ApiFlash to screenshot a URL, returns base64 jpeg string or null
    const screenshotPage = async (screenshotUrl) => {
      if (!APIFLASH_KEY) return null;
      try {
        // Full-page screenshot, wait for JS to render, return as jpeg
        const params = new URLSearchParams({
          access_key: APIFLASH_KEY,
          url: screenshotUrl,
          format: "jpeg",
          quality: "85",
          full_page: "true",
          wait_until: "page_loaded",
          delay: "2",       // wait 2s for JS calendars to render
          width: "1280",
          scroll_page: "true",
        });
        const apiRes = await fetch(
          `https://api.apiflash.com/v1/urltoimage?${params}`,
          { signal: AbortSignal.timeout(30000) }
        );
        if (!apiRes.ok) return null;
        const buffer = await apiRes.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      } catch { return null; }
    };

    // Send text to Claude for event extraction
    const extractFromText = async (text) => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: `You are a live music event extractor. Extract all upcoming live music or entertainment events from venue website text. Return ONLY a JSON array. Each event: { band (required), date (required), time, genre, notes, tickets }. Return [] if none found. Return ONLY valid JSON.`,
          messages: [{ role: "user", content: `Extract events:\n\n${text}` }],
        }),
      });
      const data = await res.json();
      if (data.error) return [];
      const block = data.content?.find(b => b.type === "text");
      if (!block) return [];
      const match = block.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    };

    // Send screenshot image to Claude Vision for event extraction
    const extractFromImage = async (base64jpeg) => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: `You are a live music event extractor. You are shown a screenshot of a venue's events/music page. Extract ALL upcoming live music or entertainment events visible. Return ONLY a JSON array. Each event: { band (required), date (required), time, genre, notes, tickets }. Return [] if no events visible. Return ONLY valid JSON.`,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: base64jpeg },
              },
              {
                type: "text",
                text: "Extract all upcoming live music events visible in this venue events page screenshot.",
              },
            ],
          }],
        }),
      });
      const data = await res.json();
      if (data.error) return [];
      const block = data.content?.find(b => b.type === "text");
      if (!block) return [];
      const match = block.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    };

    // ── Step 1: Resolve the best target URL ───────────────────────────────────
    let targetUrl = url;
    const knownUrl = Object.entries(KNOWN_EVENT_URLS)
      .find(([domain]) => hostname.includes(domain))?.[1];
    if (knownUrl) targetUrl = knownUrl;

    // ── Step 2: Fetch the target page ─────────────────────────────────────────
    const startPage = await fetchPage(targetUrl);
    let bestText    = startPage?.text?.slice(0, 14000) || null;
    let bestScore   = startPage ? scoreContent(startPage.text) : 0;
    let foundEventPage = bestScore >= 3;
    let usedScreenshot = false;

    // ── Step 3: Probe common paths if no good content yet ─────────────────────
    if (!foundEventPage && !knownUrl) {
      for (const path of EVENT_PATHS) {
        try {
          const page = await fetchPage(baseUrl + path);
          if (!page) continue;
          const score = scoreContent(page.text);
          if (score >= 3 && score > bestScore) {
            bestText = page.text.slice(0, 14000);
            bestScore = score;
            targetUrl = baseUrl + path;
            foundEventPage = true;
            if (score >= 6) break;
          }
        } catch { continue; }
      }
    }

    // ── Step 4: Scan homepage links ───────────────────────────────────────────
    if (!foundEventPage && startPage) {
      const linkPat = /<a[^>]+href=["']([^"'#?][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
      const candidates = new Map();
      let m;
      while ((m = linkPat.exec(startPage.html)) !== null) {
        let href = m[1].trim();
        const anchor = m[2].replace(/<[^>]+>/g, "").trim();
        try {
          if (href.startsWith("/")) href = baseUrl + href;
          else if (!href.startsWith("http")) continue;
          const parsed = new URL(href);
          if (parsed.origin !== baseUrl) continue;
          if (/\.(jpg|png|gif|pdf|zip|css|js|svg|ico)$/i.test(parsed.pathname)) continue;
          if (/\/(wp-admin|sitemap|privacy|terms|contact|about|menu|food|drink|order|gift|merch)/i.test(parsed.pathname)) continue;
          const s = scoreUrl(parsed.pathname, anchor);
          if (s > 0) candidates.set(href, Math.max(candidates.get(href) || 0, s));
        } catch { continue; }
      }
      const sorted = [...candidates.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      for (const [cUrl] of sorted) {
        try {
          const page = await fetchPage(cUrl);
          if (!page) continue;
          const score = scoreContent(page.text);
          if (score >= 3 && score > bestScore) {
            bestText = page.text.slice(0, 14000);
            bestScore = score;
            targetUrl = cUrl;
            foundEventPage = true;
            if (score >= 8) break;
          }
        } catch { continue; }
      }
    }

    // ── Step 5: Screenshot if JS-heavy or low text score ─────────────────────
    const siteIsJsHeavy = startPage ? isJsHeavy(startPage.html) : false;
    const useScreenshot  = APIFLASH_KEY && (alwaysScreenshot || siteIsJsHeavy || bestScore < 5);

    if (useScreenshot) {
      const base64 = await screenshotPage(targetUrl);
      if (base64) {
        const events = await extractFromImage(base64);
        usedScreenshot = true;
        return Response.json({ events, foundEventPage: events.length > 0, fallbackLinks, usedScreenshot });
      }
    }

    // ── Step 6: Text extraction ───────────────────────────────────────────────
    if (!bestText) {
      return Response.json({ events: [], foundEventPage: false, fallbackLinks, isJsRendered: siteIsJsHeavy });
    }

    const events = await extractFromText(bestText);
    return Response.json({ events, foundEventPage: events.length > 0, fallbackLinks, usedScreenshot, isJsRendered: siteIsJsHeavy && !usedScreenshot });

  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}