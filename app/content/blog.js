// ─────────────────────────────────────────────────────────────────────────────
// BLOG — single source of truth for LocalLiveMusic.ai posts.
//
// To publish a new post: add one object to BLOG_POSTS below. `Body` is a plain
// function component (no "use client", no async) so it renders fine in the
// server tree used by /blog and /blog/[slug].
//
// Reuses the shared style tokens (S, A, ORANGE) from sections.js so the blog
// looks like the rest of the site with zero extra CSS.
// ─────────────────────────────────────────────────────────────────────────────

import { S, A, ORANGE } from "./sections";

// ── Small shared blog building blocks ───────────────────────────────────────

// A captioned photo. Plain <img> keeps it dependency-free (no next/image config).
export function BlogImage({ src, alt, caption }) {
  return (
    <figure style={{ margin: "1.5rem 0" }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          width: "100%", height: "auto", display: "block",
          borderRadius: 12, border: "1px solid #e2e8f0",
        }}
      />
      {caption && (
        <figcaption style={{ fontSize: "0.72rem", color: "#94a3b8", margin: "0.5rem 0 0", lineHeight: 1.5 }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// The "Local Live Pick" spec box.
export function PickCard({ rows = [] }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${ORANGE}`,
      borderRadius: "0 12px 12px 0", padding: "1rem 1.25rem", margin: "1.75rem 0",
    }}>
      <div style={{
        fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.6px",
        textTransform: "uppercase", color: ORANGE, margin: "0 0 0.6rem",
      }}>
        🎶 The Local Live Pick
      </div>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.3rem 0.9rem" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <dt style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>{label}</dt>
            <dd style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// A prominent call-to-action button (external link).
export function CtaButton({ href, children }) {
  return (
    <p style={{ margin: "1.5rem 0 0.5rem" }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block", background: ORANGE, color: "#fff",
          fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
          padding: "10px 18px", borderRadius: 99,
        }}
      >
        {children}
      </a>
    </p>
  );
}

// ── POSTS ────────────────────────────────────────────────────────────────────

export const BLOG_POSTS = [
  {
    slug: "lily-allen-mann-philadelphia",
    title: "Philadelphia’s Sunday Night Pick: Lily Allen Takes Over the Mann",
    date: "2026-09-01",
    dateLabel: "September 1, 2026",
    city: "Philadelphia, PA",
    venue: "Highmark Mann Center for the Performing Arts",
    author: "LocalLiveMusic.ai",
    hero: "/blog-images/mann-dusk-skyline.jpg",
    heroAlt:
      "Dusk over the Mann Center in Fairmount Park, white event tents and a crowd gathered with the Philadelphia skyline behind them.",
    excerpt:
      "Lily Allen brings her West End Girl show to the Highmark Mann Center on Sunday, September 6 — a distinctive artist, a hilltop outdoor venue, and a Sunday night worth leaving the couch for.",
    Body: LilyAllenBody,
  },
];

// ── POST BODIES ───────────────────────────────────────────────────────────────

function LilyAllenBody() {
  return (
    <>
      <p style={S.p}>
        Philadelphia has no shortage of big concerts this September, but if you’re
        looking for a show that combines a distinctive artist, a great outdoor
        venue, and a Sunday night worth leaving the couch for,{" "}
        <strong style={S.b}>Lily Allen at the Mann on September 6</strong> stands out.
      </p>
      <p style={S.p}>
        The British singer-songwriter brings her <em>West End Girl</em> show to the{" "}
        Highmark Mann Center for the Performing Arts in Philadelphia’s Fairmount
        Park. The venue’s official calendar confirms the September 6 performance,
        while Visit Philadelphia highlights it as one of the city’s major concerts
        this month.
      </p>

      <BlogImage
        src="/blog-images/lily-allen-live.jpg"
        alt="Lily Allen performing on stage with purple hair, a red sequined varsity jacket, and pink shorts, flanked by giant prop baby bottles."
        caption="Lily Allen on stage — the bright pop staging that has always framed her sharper writing."
      />

      <h2 style={S.h2}>🎤 Why Lily Allen?</h2>
      <p style={S.p}>
        Allen has always occupied an interesting space between pop star and
        storyteller. Her music can sound bright and catchy while the lyrics
        underneath it are considerably sharper.
      </p>
      <p style={S.p}>
        This tour puts that contrast front and center. The Philadelphia show
        features material from <em>West End Girl</em> alongside songs spanning her
        roughly 20-year career.
      </p>
      <p style={S.p}>
        That makes this more than a nostalgia stop. It’s a chance to see an
        established artist bringing newer, more personal material to the stage while
        still having a catalog recognizable enough for a big outdoor crowd.
      </p>

      <h2 style={S.h2}>📍 Why the Mann?</h2>
      <p style={S.p}>
        Part of what we want to do at LocalLiveMusic.ai is highlight the place, not
        just the performer.
      </p>

      <BlogImage
        src="/blog-images/mann-lawn-crowd.jpg"
        alt="A large crowd relaxing in lawn chairs on the grass at the Mann Center at sunset, the wooden pavilion and Philadelphia skyline in the distance."
        caption="The lawn at the Mann — a hilltop setting in Fairmount Park with the skyline on the horizon."
      />

      <p style={S.p}>
        The Mann is exactly the kind of venue that makes a concert feel tied to its
        city. Located in Fairmount Park, the outdoor complex combines live music
        with a hilltop setting and views toward the Philadelphia skyline. It hosts
        everything from touring pop and rock acts to Philadelphia Orchestra
        performances.
      </p>
      <p style={S.p}>
        That matters. Seeing a band in a generic arena can be great. Seeing one
        somewhere that actually feels like Philadelphia is different.
      </p>

      <PickCard
        rows={[
          ["Artist", "Lily Allen"],
          ["City", "Philadelphia, Pennsylvania"],
          ["Venue", "Highmark Mann Center for the Performing Arts"],
          ["Date", "Sunday, September 6, 2026"],
          ["Show", "Lily Allen Performs West End Girl"],
        ]}
      />

      <h2 style={S.h2}>Why LocalLiveMusic.ai?</h2>
      <p style={S.p}>
        There are thousands of concerts happening every week. The problem isn’t
        finding a list of them. It’s figuring out what’s actually worth seeing.
      </p>
      <p style={S.p}>That’s what we want LocalLiveMusic.ai to do differently.</p>
      <p style={S.p}>
        We’ll spotlight interesting artists playing venues that help define their
        local music scenes — from neighborhood clubs and historic theaters to
        outdoor amphitheaters and legendary rooms.
      </p>
      <p style={S.p}>
        Sometimes it’ll be a major artist like Lily Allen. Other weeks it might be a
        band you’ve never heard of playing a 500-person room you shouldn’t miss.
      </p>
      <p style={{ ...S.p, fontWeight: 600, color: "#0f172a" }}>
        Great band. Great city. Great venue. Go see it live.
      </p>

      <CtaButton href="https://highmarkmann.org/events">
        See the Mann’s official event calendar →
      </CtaButton>
      <p style={{ ...S.p, fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.75rem" }}>
        Schedules and lineups change — always confirm date, time, and ticket
        details on the venue’s own page before heading out.
      </p>
    </>
  );
}

// Helper used by /blog/[slug]: get one post (or undefined) by slug.
export function getPost(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
