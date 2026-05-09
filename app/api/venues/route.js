export async function POST(req) {
  try {
    const { location } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // Step 1: Search for bars/restaurants with live music in the area
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bar+restaurant+live+music+${encodeURIComponent(location)}&key=${apiKey}`
    );
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      return Response.json({ venues: [] });
    }

    // Step 2: Get website for each venue (top 8)
    const topVenues = searchData.results.slice(0, 8);
    const venueDetails = await Promise.all(
      topVenues.map(async (place) => {
        try {
          const detailRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,website,formatted_address,formatted_phone_number&key=${apiKey}`
          );
          const detailData = await detailRes.json();
          const result = detailData.result || {};
          return {
            name: result.name || place.name,
            address: result.formatted_address || "",
            website: result.website || null,
          };
        } catch {
          return { name: place.name, address: "", website: null };
        }
      })
    );

    // Step 3: For venues with websites, try to find their events page
    const venuesWithSites = venueDetails.filter(v => v.website);

    const results = await Promise.all(
      venuesWithSites.map(async (venue) => {
        try {
          // Try common event page paths
          const baseUrl = venue.website.replace(/\/$/, "");
          const eventPaths = [
            "/entertainment", "/events", "/live-music", "/music",
            "/calendar", "/shows", "/whats-on", "/live-entertainment"
          ];

          // First fetch the homepage to look for links to event pages
          const homeRes = await fetch(baseUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BBKMusicSeeker/1.0)" },
            signal: AbortSignal.timeout(5000),
          });
          const homeHtml = await homeRes.text();

          // Find event page links in the homepage
          const linkMatches = homeHtml.match(/href=["']([^"']*(?:event|entertainment|music|calendar|show|live)[^"']*)["']/gi) || [];
          const foundLinks = linkMatches
            .map(m => m.match(/href=["']([^"']+)["']/i)?.[1])
            .filter(Boolean)
            .map(link => link.startsWith("http") ? link : `${baseUrl}${link.startsWith("/") ? "" : "/"}${link}`)
            .slice(0, 3);

          // Try found links + common paths
          const urlsToTry = [...new Set([...foundLinks, ...eventPaths.map(p => `${baseUrl}${p}`)])].slice(0, 5);

          for (const url of urlsToTry) {
            try {
              const pageRes = await fetch(url, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; BBKMusicSeeker/1.0)" },
                signal: AbortSignal.timeout(5000),
              });
              if (!pageRes.ok) continue;

              const html = await pageRes.text();
              const text = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .slice(0, 6000);

              // Ask Claude if this page has events
              const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": process.env.ANTHROPIC_API_KEY,
                  "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                  model: "claude-sonnet-4-6",
                  max_tokens: 500,
                  system: `You extract live music or entertainment events from venue website text. Return ONLY a JSON array of events. Each event: { band, date, time, notes }. If no events found return []. Return ONLY valid JSON, nothing else.`,
                  messages: [{ role: "user", content: `Extract live music/entertainment events from this page:\n\n${text}` }],
                }),
              });

              const claudeData = await claudeRes.json();
              const textBlock = claudeData.content?.find(b => b.type === "text");
              if (!textBlock) continue;

              const raw = textBlock.text.trim().replace(/```json|```/g, "").trim();
              const events = JSON.parse(raw);

              if (events.length > 0) {
                return {
                  venue: venue.name,
                  address: venue.address,
                  website: url,
                  events,
                };
              }
            } catch { continue; }
          }
          return null;
        } catch { return null; }
      })
    );

    const found = results.filter(Boolean);
    return Response.json({ venues: found });

  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}