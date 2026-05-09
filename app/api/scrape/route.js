export async function POST(req) {
  try {
    const { url, venueName, venueAddress } = await req.json();

    const URL_EVENT_KEYWORDS = [
      "music", "event", "entertainment", "calendar", "show", "schedule",
      "live", "band", "gig", "concert", "perform", "whats-on", "what-on",
      "lineup", "upcoming", "tonight", "weekend", "ticket",
    ];

    const CONTENT_EVENT_KEYWORDS = [
      "band", "live music", "entertainment", "show", "perform",
      "schedule", "event", "pm", "doors open", "tickets", "admission",
      "cover charge", "dj", "acoustic", "karaoke", "open mic",
      "tonight", "this weekend", "upcoming", "lineup",
    ];

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
      } catch {
        return null;
      }
    };

    const scoreUrl = (href, anchorText = "") => {
      const combined = (href + " " + anchorText).toLowerCase();
      return URL_EVENT_KEYWORDS.filter(kw => combined.includes(kw)).length;
    };

    const scoreContent = (text) => {
      const lower = text.toLowerCase();
      return CONTENT_EVENT_KEYWORDS.filter(kw => lower.includes(kw)).length;
    };

    // Build fallback search links using venue name/address
    const searchQuery = encodeURIComponent(`${venueName || ""} ${venueAddress || ""} live music events`.trim());
    const fbQuery = encodeURIComponent(venueName || "");
    const fallbackLinks = {
      google: `https://www.google.com/search?q=${searchQuery}`,
      facebook: `https://www.facebook.com/search/pages/?q=${fbQuery}`,
      bandsintown: `https://www.bandsintown.com/search?query=${encodeURIComponent(venueName || "")}`,
    };

    // ── Step 1: Fetch the starting URL ────────────────────────────────────────
    const startPage = await fetchPage(url);
    if (!startPage) {
      return Response.json({ events: [], foundEventPage: false, fallbackLinks, reason: "Could not fetch site" });
    }

    const baseUrl = new URL(url).origin;

    // ── Step 2: Score the starting page itself ────────────────────────────────
    let bestText = startPage.text.slice(0, 12000);
    let bestScore = scoreContent(startPage.text);
    let foundEventPage = bestScore >= 4;

    // ── Step 3: Extract and score ALL internal links ──────────────────────────
    const linkPattern = /<a[^>]+href=["']([^"'#?][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const candidates = new Map();
    let match;

    while ((match = linkPattern.exec(startPage.html)) !== null) {
      let href = match[1].trim();
      const anchorText = match[2].replace(/<[^>]+>/g, "").trim();
      try {
        if (href.startsWith("//")) href = "https:" + href;
        else if (href.startsWith("/")) href = baseUrl + href;
        else if (!href.startsWith("http")) continue;

        const parsed = new URL(href);
        if (parsed.origin !== baseUrl) continue;
        if (/\.(jpg|jpeg|png|gif|pdf|zip|css|js|svg|ico)$/i.test(parsed.pathname)) continue;
        if (/\/(wp-admin|wp-login|wp-json|feed|rss|sitemap|privacy|terms|contact|about|menu|food|drink|order|gift|merch|partner)/i.test(parsed.pathname)) continue;

        const score = scoreUrl(parsed.pathname, anchorText);
        if (score > 0) {
          candidates.set(href, Math.max(candidates.get(href) || 0, score));
        }
      } catch { continue; }
    }

    // ── Step 4: Fetch and score top candidates ────────────────────────────────
    const sorted = [...candidates.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    for (const [candidateUrl] of sorted) {
      if (candidateUrl === url) continue;
      try {
        const page = await fetchPage(candidateUrl);
        if (!page) continue;

        const contentScore = scoreContent(page.text);
        const urlScore = candidates.get(candidateUrl) || 0;
        const totalScore = urlScore + contentScore;

        if (contentScore >= 3 && totalScore > bestScore) {
          bestText = page.text.slice(0, 12000);
          bestScore = totalScore;
          foundEventPage = true;
          if (totalScore >= 10) break;
        }
      } catch { continue; }
    }

    // ── Step 5: Detect if site is likely JS-rendered (Wix, Squarespace, etc.) ─
    const isJsRendered = /wixsite|wix\.com|squarespace|webflow|framer\.com|godaddysites/i.test(startPage.html)
      || startPage.html.includes("__wix") || startPage.html.includes("window.__ss_")
      || (startPage.text.length < 500 && startPage.html.length > 5000); // lots of HTML, little text = JS app

    // ── Step 6: Send best page to Claude ─────────────────────────────────────
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: `You are a live music event extractor. Given text scraped from a venue's website, extract all upcoming live music or entertainment events. Return ONLY a JSON array (no markdown, no preamble). Each event should have:
- band: artist or band name (required)
- date: day and date as written on the page (required)
- time: start time if available, otherwise ""
- genre: music genre if mentioned, otherwise ""
- notes: any extra details (cover charge, age restriction, special event, etc.)
- tickets: ticket URL or "Check venue website" or "Free"

If no events are found, return an empty array []. Return ONLY valid JSON, nothing else.`,
        messages: [{ role: "user", content: `Extract upcoming live music events from this venue website text:\n\n${bestText}` }],
      }),
    });

    const data = await claudeRes.json();
    if (data.error) return Response.json({ events: [], foundEventPage: false, fallbackLinks, isJsRendered });

    const textBlock = data.content?.find(b => b.type === "text");
    const raw = textBlock?.text?.trim().replace(/```json|```/g, "").trim() || "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const events = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return Response.json({ events, foundEventPage, fallbackLinks, isJsRendered });
  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}