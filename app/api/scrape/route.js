export async function POST(req) {
  try {
    const { url } = await req.json();

    // Fetch the venue page
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BBKMusicSeeker/1.0)" }
    });

    if (!pageRes.ok) {
      return Response.json({ error: { message: `Could not fetch page: ${pageRes.status}` } });
    }

    const html = await pageRes.text();

    // Strip HTML tags to get readable text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 8000); // limit to 8000 chars for Claude

    // Send to Claude to extract events
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
        system: `You are a live music event extractor. Given text scraped from a venue's entertainment or events page, extract all upcoming live music events. Return ONLY a JSON array (no markdown, no preamble). Each event should have:
- band: artist or band name
- date: day and date as written on the page
- time: start time if available, otherwise ""
- genre: music genre if known, otherwise ""
- notes: any extra details
- tickets: ticket URL or "Check venue website" or "Free"

If no events are found, return an empty array []. Return ONLY valid JSON, nothing else.`,
        messages: [{ role: "user", content: `Extract live music events from this venue page text:\n\n${text}` }],
      }),
    });

    const data = await claudeRes.json();
    if (data.error) return Response.json({ error: data.error });

    const textBlock = data.content?.find(b => b.type === "text");
    const raw = textBlock?.text?.trim().replace(/```json|```/g, "").trim() || "[]";
    const events = JSON.parse(raw);

    return Response.json({ events });
  } catch (err) {
    return Response.json({ error: { message: err.message } }, { status: 500 });
  }
}