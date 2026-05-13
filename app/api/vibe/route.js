const VIBE_TTL = 60 * 60; // 1 hour in seconds
const MAX_VIBES_STORED = 20; // max to store per venue (older ones get trimmed)

// Upstash REST helper — POST command
const redisCommand = async (command) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()).result;
  } catch { return null; }
};

const redisGet = async (key) => redisCommand(["GET", key]);
const redisSet = async (key, value, ex) => redisCommand(["SET", key, value, "EX", ex]);
const redisKeys = async (pattern) => redisCommand(["KEYS", pattern]);

// Filter vibes to only those posted in the last 60 minutes
const filterFresh = (vibes) => {
  const cutoff = Date.now() - VIBE_TTL * 1000;
  return vibes.filter(v => v.postedAt > cutoff);
};

// GET — fetch vibes
// ?venue=station-142  OR  ?all=true
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const venue = searchParams.get("venue");
    const all = searchParams.get("all");

    if (venue) {
      const raw = await redisGet(`vibe:${venue}`);
      if (!raw) return Response.json({ vibes: [] });
      const all = filterFresh(JSON.parse(raw));
      return Response.json({ vibes: all });
    }

    if (all) {
      const keys = await redisKeys("vibe:*");
      if (!keys || keys.length === 0) return Response.json({ vibes: {} });

      const result = {};
      await Promise.all(keys.map(async (key) => {
        const raw = await redisGet(key);
        if (raw) {
          const venueKey = key.replace("vibe:", "");
          const fresh = filterFresh(JSON.parse(raw));
          if (fresh.length > 0) result[venueKey] = fresh;
        }
      }));
      return Response.json({ vibes: result });
    }

    return Response.json({ error: "Missing venue or all param" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST — add a vibe to the list for a venue
export async function POST(req) {
  try {
    const { venueKey, stars, comment } = await req.json();

    if (!venueKey || !stars || stars < 1 || stars > 5) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    // Basic profanity filter
    const blocked = ["fuck", "shit", "bitch", "cunt", "dick", "asshole"];
    const clean = (comment || "").toLowerCase();
    if (blocked.some(w => clean.includes(w))) {
      return Response.json({ error: "Please keep it friendly! 🙏" }, { status: 400 });
    }

    const newVibe = {
      stars,
      comment: (comment || "").slice(0, 120).trim(),
      postedAt: Date.now(),
    };

    // Load existing vibes, add new one, trim old ones, save back
    const raw = await redisGet(`vibe:${venueKey}`);
    const existing = raw ? JSON.parse(raw) : [];
    const fresh = filterFresh(existing); // drop anything older than 60 min
    const updated = [...fresh, newVibe].slice(-MAX_VIBES_STORED); // keep newest 20

    // TTL of 2 hours so the key doesn't vanish while vibes are still fresh
    await redisSet(`vibe:${venueKey}`, JSON.stringify(updated), VIBE_TTL * 2);

    return Response.json({ ok: true, vibe: newVibe, total: updated.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}