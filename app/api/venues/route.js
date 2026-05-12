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

    // Screenshot and event extraction helper
    const screenshotPage = async (screenshotUrl) => {
      const APIFLASH_KEY = process.env.APIFLASH_KEY;
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
          max_tokens: 400,
          system: `You are a live music event extractor. Extract all upcoming live music or entertainment events visible. Return ONLY a JSON array. Each event: { band, date, time, notes }. Return [] if no events visible. Return ONLY valid JSON.`,
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

        // Extract events using screenshot + Claude Vision for HIGH AND MEDIUM confidence venues
        let events = [];
        if ((musicScore === "high" || musicScore === "medium") && r.website) {
          try {
            const baseUrl   = r.website.replace(/\/$/, "");
            const eventPaths = ["/entertainment","/events","/live-music","/music","/calendar","/shows","/whats-on"];
            for (const path of eventPaths) {
              try {
                const eventUrl = `${baseUrl}${path}`;
                const base64 = await screenshotPage(eventUrl);
                if (base64) {
                  const extracted = await extractFromImage(base64);
                  if (extracted && extracted.length > 0) {
                    events = extracted;
                    break;
                  }
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