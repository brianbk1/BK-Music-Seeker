export async function POST(req) {
  try {
    const { location } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // Search for bars/restaurants with live music keywords
    const searches = [
      `live music bar ${location}`,
      `entertainment restaurant ${location}`,
      `bar with bands ${location}`,
    ];

    const allResults = [];
    for (const q of searches) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.results) allResults.push(...data.results);
    }

    // Deduplicate by place_id
    const seen = new Set();
    const unique = allResults.filter(p => {
      if (seen.has(p.place_id)) return false;
      seen.add(p.place_id);
      return true;
    }).slice(0, 15);

    // Get details for each venue
    const venues = await Promise.all(unique.map(async (place) => {
      try {
        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,website,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,types,editorial_summary&key=${apiKey}`
        );
        const detail = await detailRes.json();
        const r = detail.result || {};

        // Score music likelihood based on available signals
        const name = (r.name || "").toLowerCase();
        const summary = (r.editorial_summary?.overview || "").toLowerCase();
        const types = (r.types || []).join(" ").toLowerCase();
        const reviews = (place.reviews || []).map(rv => rv.text || "").join(" ").toLowerCase();
        const combined = `${name} ${summary} ${types} ${reviews}`;

        const musicKeywords = ["music","band","live","entertainment","karaoke","dj","stage","concert","perform","show","jazz","blues","rock","acoustic"];
        const matches = musicKeywords.filter(kw => combined.includes(kw));
        
        let musicScore = "unknown";
        if (matches.length >= 3) musicScore = "high";
        else if (matches.length >= 1) musicScore = "medium";

        return {
          name: r.name || place.name,
          address: r.formatted_address || place.formatted_address || "",
          website: r.website || null,
          phone: r.formatted_phone_number || null,
          rating: r.rating || place.rating || null,
          totalRatings: r.user_ratings_total || place.user_ratings_total || 0,
          isOpen: place.opening_hours?.open_now,
          summary: r.editorial_summary?.overview || null,
          musicScore,
          matchedKeywords: matches,
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