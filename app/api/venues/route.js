export async function POST(req) {
  try {
    const { location, radius = 10, keywords } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const radiusMeters = radius * 1609; // miles to meters

    // First geocode the location to get lat/lng
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
    );
    const geoData = await geoRes.json();
    const coords = geoData.results?.[0]?.geometry?.location;

    // If genre keywords were passed (By Genre mode), use those as search terms.
    // Otherwise fall back to general live music searches.
    const searches = keywords
      ? [
          `${keywords} ${location}`,
          `${keywords} live music ${location}`,
          `live music bar ${location}`,
        ]
      : [
          `live music bar ${location}`,
          `entertainment restaurant ${location}`,
          `bar with bands ${location}`,
          `DJ night bar ${location}`,
          `acoustic music restaurant ${location}`,
          `live band restaurant ${location}`,
        ];

    const allResults = [];
    for (const q of searches) {
      const url = coords
        ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(q.split(" ").slice(0, 3).join(" "))}&type=bar|restaurant|night_club&key=${apiKey}`
        : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results) allResults.push(...data.results);
    }

    // Deduplicate by place_id
    const seen = new Set();
    const unique = allResults.filter(p => {
      if (seen.has(p.place_id)) return false;
      seen.add(p.place_id);
      return true;
    }).slice(0, 20);

    // Build music scoring keywords — use genre-specific ones if provided
    const defaultMusicKeywords = [
      "music","band","live","entertainment","karaoke","dj","stage","concert",
      "perform","show","jazz","blues","rock","acoustic","trivia","open mic",
      "cover","tribute","dance","nightlife","happy hour","comedy",
    ];

    // If genre keywords were passed, also score against those specific terms
    const genreKeywords = keywords
      ? keywords.toLowerCase().split(" ").filter(w => w.length > 2)
      : [];
    const scoringKeywords = [...new Set([...defaultMusicKeywords, ...genreKeywords])];

    // Get details for each venue
    const venues = await Promise.all(unique.map(async (place) => {
      try {
        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,website,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,types,editorial_summary,reviews,photos&key=${apiKey}`
        );
        const detail = await detailRes.json();
        const r = detail.result || {};

        // Score music likelihood
        const name        = (r.name || "").toLowerCase();
        const summary     = (r.editorial_summary?.overview || "").toLowerCase();
        const types       = (r.types || []).join(" ").toLowerCase();
        const reviewTexts = (r.reviews || []).map(rv => rv.text || "").join(" ").toLowerCase();
        const combined    = `${name} ${summary} ${types} ${reviewTexts}`;

        const matches = scoringKeywords.filter(kw => combined.includes(kw));

        let musicScore = "unknown";
        if (matches.length >= 3) musicScore = "high";
        else if (matches.length >= 1) musicScore = "medium";

        // Try to find social links from website
        let instagram = null;
        let facebook  = null;
        if (r.website) {
          try {
            const siteRes = await fetch(r.website, {
              headers: { "User-Agent": "Mozilla/5.0" },
              signal: AbortSignal.timeout(4000),
            });
            const html = await siteRes.text();
            const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
            const fbMatch = html.match(/facebook\.com\/([a-zA-Z0-9._]+)/);
            if (igMatch) instagram = `https://instagram.com/${igMatch[1]}`;
            if (fbMatch) facebook  = `https://facebook.com/${fbMatch[1]}`;
          } catch { /* ignore */ }
        }

        // Extract events for HIGH AND MEDIUM confidence music venues (not just high)
        let events = [];
        if ((musicScore === "high" || musicScore === "medium") && r.website) {
          try {
            const baseUrl   = r.website.replace(/\/$/, "");
            const eventPaths = ["/entertainment","/events","/live-music","/music","/calendar","/shows","/whats-on"];
            for (const path of eventPaths) {
              try {
                const pageRes = await fetch(`${baseUrl}${path}`, {
                  headers: { "User-Agent": "Mozilla/5.0" },
                  signal: AbortSignal.timeout(4000),
                });
                if (!pageRes.ok) continue;
                const html = await pageRes.text();
                const text = html
                  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .slice(0, 4000);

                const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                  },
                  body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 400,
                    system: `Extract live music or entertainment events from venue page text. Return ONLY a JSON array. Each event: { band, date, time, notes }. If no events found return []. Return ONLY valid JSON.`,
                    messages: [{ role: "user", content: text }],
                  }),
                });
                const cd = await claudeRes.json();
                const tb = cd.content?.find(b => b.type === "text");
                if (tb) {
                  const raw    = tb.text.trim().replace(/```json|```/g, "").trim();
                  const match  = raw.match(/\[[\s\S]*\]/);
                  const parsed = match ? JSON.parse(match[0]) : [];
                  if (parsed.length > 0) { events = parsed; break; }
                }
              } catch { continue; }
            }
          } catch { /* ignore */ }
        }

        // Get up to 3 photos
        const photos = (r.photos || []).slice(0, 3).map(p =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${apiKey}`
        );

        return {
          name:            r.name || place.name,
          address:         r.formatted_address || place.formatted_address || "",
          website:         r.website || null,
          phone:           r.formatted_phone_number || null,
          rating:          r.rating || place.rating || null,
          totalRatings:    r.user_ratings_total || place.user_ratings_total || 0,
          isOpen:          place.opening_hours?.open_now,
          summary:         r.editorial_summary?.overview || null,
          musicScore,
          matchedKeywords: matches,
          instagram,
          facebook,
          events,
          photos,
        };
      } catch {
        return null;
      }
    }));

    const found = venues
      .filter(Boolean)
      .sort((a, b) => {
        const order = { high: 0, medium: 1, unknown: 2 };
        return order[a.musicScore] - order[b.musicScore];
      });

    return Response.json({ venues: found });
  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}