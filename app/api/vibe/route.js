// Simple Redis helper using Upstash REST API — no npm package needed
const redis = async (cmd, ...args) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/${[cmd, ...args].join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
};

const redisSet = async (key, value, exSeconds) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", key, value, "EX", exSeconds]),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return (await res.json()).result;
};

// GET — fetch vibes for one or all venues
// ?venue=station-142  OR  ?all=true
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const venue = searchParams.get("venue");
    const all = searchParams.get("all");

    if (venue) {
      const raw = await redis("GET", `vibe:${venue}`);
      if (!raw) return Response.json({ vibe: null });
      return Response.json({ vibe: JSON.parse(raw) });
    }

    if (all) {
      // Get all vibe keys
      const keys = await redis("KEYS", "vibe:*");
      if (!keys || keys.length === 0) return Response.json({ vibes: {} });

      // Fetch all values
      const vibes = {};
      await Promise.all(keys.map(async (key) => {
        const raw = await redis("GET", key);
        if (raw) {
          const venueKey = key.replace("vibe:", "");
          vibes[venueKey] = JSON.parse(raw);
        }
      }));
      return Response.json({ vibes });
    }

    return Response.json({ error: "Missing venue or all param" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST — save a vibe (stars + comment) for a venue, expires in 1 hour
export async function POST(req) {
  try {
    const { venueKey, stars, comment } = await req.json();

    if (!venueKey || !stars || stars < 1 || stars > 5) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    // Basic profanity filter — just block the worst words
    const blocked = ["fuck", "shit", "ass", "bitch", "cunt", "dick"];
    const clean = (comment || "").toLowerCase();
    if (blocked.some(w => clean.includes(w))) {
      return Response.json({ error: "Please keep it friendly!" }, { status: 400 });
    }

    const vibe = {
      stars,
      comment: (comment || "").slice(0, 120).trim(),
      postedAt: Date.now(),
    };

    await redisSet(`vibe:${venueKey}`, JSON.stringify(vibe), 3600); // 1 hour TTL

    return Response.json({ ok: true, vibe });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}