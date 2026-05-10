// Community route - stores ratings and event URLs
// Uses Vercel KV if available, falls back to in-memory store for development

// In-memory fallback (resets on redeploy, but works without KV setup)
const memoryStore = new Map();

async function kvGet(key) {
  try {
    // Try Vercel KV if env vars are set
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      return await kv.get(key);
    }
  } catch {}
  return memoryStore.get(key) || null;
}

async function kvSet(key, value) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      await kv.set(key, value);
      return;
    }
  } catch {}
  memoryStore.set(key, value);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return Response.json({ error: "Missing key" }, { status: 400 });

    const data = await kvGet(`venue:${key}`) || { ratings: [], eventUrl: null };
    return Response.json(data);
  } catch (err) {
    return Response.json({ ratings: [], eventUrl: null });
  }
}

export async function POST(req) {
  try {
    const { key, action, rating, note, url, venueName } = await req.json();
    if (!key || !action) return Response.json({ error: "Missing fields" }, { status: 400 });

    const existing = await kvGet(`venue:${key}`) || { ratings: [], eventUrl: null };

    if (action === "rate") {
      if (!rating || rating < 1 || rating > 5) {
        return Response.json({ error: "Invalid rating" }, { status: 400 });
      }
      existing.ratings = existing.ratings || [];
      existing.ratings.push({
        rating,
        note: (note || "").slice(0, 200),
        timestamp: new Date().toISOString(),
      });
      // Keep last 50 ratings
      if (existing.ratings.length > 50) {
        existing.ratings = existing.ratings.slice(-50);
      }
    }

    if (action === "addUrl") {
      if (!url || !url.startsWith("http")) {
        return Response.json({ error: "Invalid URL" }, { status: 400 });
      }
      existing.eventUrl = url;
      existing.eventUrlVenue = venueName || "";
      existing.eventUrlAddedAt = new Date().toISOString();
    }

    await kvSet(`venue:${key}`, existing);
    return Response.json(existing);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}