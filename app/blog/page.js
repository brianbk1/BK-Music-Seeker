import Link from "next/link";
import { PageShell } from "../components/SiteChrome";
import { S, ORANGE } from "../content/sections";
import { BLOG_POSTS } from "../content/blog";

export const metadata = {
  title: "Blog — Live Music Picks & Venue Spotlights | LocalLiveMusic.ai",
  description:
    "Weekly picks of interesting artists playing venues that define their local music scenes — from neighborhood clubs to outdoor amphitheaters.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <PageShell
      title="The Blog"
      intro="There are thousands of concerts every week. The hard part isn’t finding a list — it’s figuring out what’s actually worth seeing. Here’s what we’d go out for."
    >
      <div style={{ display: "grid", gap: "1.25rem" }}>
        {posts.map((post) => (
          <article
            key={post.slug}
            style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              {post.hero && (
                <img
                  src={post.hero}
                  alt={post.heroAlt || post.title}
                  loading="lazy"
                  style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                />
              )}
              <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
                <div style={{
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.4px",
                  textTransform: "uppercase", color: ORANGE, margin: "0 0 0.4rem",
                }}>
                  {post.city} · {post.dateLabel}
                </div>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem", lineHeight: 1.35 }}>
                  {post.title}
                </h2>
                <p style={{ ...S.p, margin: "0 0 0.75rem" }}>{post.excerpt}</p>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: ORANGE }}>Read more →</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
