const VIBE_TTL = 60 * 60; // 1 hour
const MAX_VIBES_STORED = 20;

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

// Handles both old single-object format {stars,comment,postedAt}
// and new array format [{...},{...}]
const parseVibes = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && parsed.postedAt) return [parsed]; // old single-object format
    return [];
  } catch { return []; }
};

const filterFresh = (vibes) => {
  const cutoff = Date.now() - VIBE_TTL * 1000;
  return vibes.filter(v => v.postedAt > cutoff);
};

// GET — ?venue=station-142 OR ?all=true
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const venue = searchParams.get("venue");
    const fetchAll = searchParams.get("all");

    if (venue) {
      const raw = await redisGet(`vibe:${venue}`);
      const fresh = filterFresh(parseVibes(raw));
      return Response.json({ vibes: fresh });
    }

    if (fetchAll) {
      const keys = await redisKeys("vibe:*");
      if (!keys || keys.length === 0) return Response.json({ vibes: {} });
      const result = {};
      await Promise.all(keys.map(async (key) => {
        const raw = await redisGet(key);
        const fresh = filterFresh(parseVibes(raw));
        if (fresh.length > 0) result[key.replace("vibe:", "")] = fresh;
      }));
      return Response.json({ vibes: result });
    }

    return Response.json({ error: "Missing venue or all param" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST — add a vibe for a venue, expires in 1 hour
export async function POST(req) {
  try {
    const { venueKey, stars, comment } = await req.json();

    if (!venueKey || !stars || stars < 1 || stars > 5) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const blocked = ["fuck", "shit", "bitch", "cunt", "dick", "asshole"];
    if (blocked.some(w => (comment || "").toLowerCase().includes(w))) {
      return Response.json({ error: "Please keep it friendly! 🙏" }, { status: 400 });
    }

    const newVibe = {
      stars,
      comment: (comment || "").slice(0, 120).trim(),
      postedAt: Date.now(),
    };

    const raw = await redisGet(`vibe:${venueKey}`);
    const existing = filterFresh(parseVibes(raw));
    const updated = [...existing, newVibe].slice(-MAX_VIBES_STORED);

    // 2hr TTL so key persists while vibes are still fresh
    await redisSet(`vibe:${venueKey}`, JSON.stringify(updated), VIBE_TTL * 2);

    return Response.json({ ok: true, vibe: newVibe, total: updated.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}