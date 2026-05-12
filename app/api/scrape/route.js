export async function POST(req) {
  try {
    const { url, venueName, venueAddress } = await req.json();

    const baseUrl  = new URL(url).origin;
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    const APIFLASH_KEY = process.env.APIFLASH_KEY;

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

    const isJsHeavy = (html) =>
      /wixsite|wix\.com|squarespace|webflow|framer\.com|godaddysites/i.test(html) ||
      html.includes("__wix") ||
      html.includes("window.__ss_") ||
      (html.length > 5000 && html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().length < 300);

    // Use ApiFlash to screenshot a URL, returns base64 jpeg string or null
    const screenshotPage = async (screenshotUrl) => {
      if (!APIFLASH_KEY) return null;
      try {
        const params = new URLSearchParams({
          access_key: APIFLASH_KEY,
          url: screenshotUrl,
          format: "jpeg",
          quality: "85",
          full_page: "true",
          wait_until: "page_loaded",
          delay: "2",
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

    // Use Claude to extract events from text
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

    // Use Claude Vision to extract events from screenshot
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

    // Use Claude to intelligently find event page paths
    const findEventPagePaths = async (html, baseUrl) => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system: `You are a web navigator. Given HTML of a website homepage, find all links that likely lead to events, entertainment, or music schedules. Return ONLY a JSON array of relative paths (e.g., ["/events", "/live-music", "/calendar"]). Return [] if none found. Return ONLY valid JSON.`,
          messages: [{ role: "user", content: `Find event page links in this HTML:\n\n${html.slice(0, 8000)}` }],
        }),
      });
      const data = await res.json();
      if (data.error) return [];
      const block = data.content?.find(b => b.type === "text");
      if (!block) return [];
      try {
        const match = block.text.trim().replace(/```json|```/g, "").trim().match(/\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : [];
      } catch { return []; }
    };

    // ── Main flow: Try to find and extract events ──────────────────────────────

    let events = [];
    let usedScreenshot = false;
    let foundEventPage = false;

    // Step 1: Fetch homepage to find event page links
    const homepage = await fetchPage(baseUrl);
    if (!homepage) {
      return Response.json({ events: [], foundEventPage: false, fallbackLinks });
    }

    // Step 2: Use Claude to intelligently find event page paths from HTML
    const eventPaths = await findEventPagePaths(homepage.html, baseUrl);
    const pathsToTry = eventPaths.length > 0 ? eventPaths : [
      "/events", "/live-music", "/entertainment", "/music", "/calendar",
      "/shows", "/schedule", "/whats-on", "/upcoming",
    ];

    // Step 3: Try each potential event page
    for (const path of pathsToTry) {
      try {
        const fullUrl = path.startsWith("http") ? path : baseUrl + (path.startsWith("/") ? path : "/" + path);
        const page = await fetchPage(fullUrl);
        if (!page) continue;

        // Check if page is JS-heavy
        const siteIsJsHeavy = isJsHeavy(page.html);

        // Try screenshot first if JS-heavy or APIFLASH available
        if (siteIsJsHeavy && APIFLASH_KEY) {
          const base64 = await screenshotPage(fullUrl);
          if (base64) {
            const extracted = await extractFromImage(base64);
            if (extracted && extracted.length > 0) {
              events = extracted;
              foundEventPage = true;
              usedScreenshot = true;
              break;
            }
          }
        }

        // Try text extraction if screenshot didn't work or JS-heavy isn't detected
        if (!usedScreenshot && page.text) {
          const extracted = await extractFromText(page.text);
          if (extracted && extracted.length > 0) {
            events = extracted;
            foundEventPage = true;
            break;
          }
        }
      } catch { continue; }
    }

    // Step 4: If still no events, try screenshot of homepage as last resort
    if (events.length === 0 && APIFLASH_KEY) {
      const base64 = await screenshotPage(baseUrl);
      if (base64) {
        const extracted = await extractFromImage(base64);
        if (extracted && extracted.length > 0) {
          events = extracted;
          foundEventPage = true;
          usedScreenshot = true;
        }
      }
    }

    return Response.json({ events, foundEventPage, fallbackLinks, usedScreenshot });

  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}