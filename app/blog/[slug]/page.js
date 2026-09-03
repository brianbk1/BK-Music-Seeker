import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/SiteChrome";
import { ORANGE } from "../../content/sections";
import { BLOG_POSTS, getPost, BlogImage } from "../../content/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | LocalLiveMusic.ai`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.hero ? [post.hero] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const Body = post.Body;

  return (
    <PageShell>
      <div style={{ marginBottom: "0.75rem" }}>
        <Link href="/blog" style={{ fontSize: "0.8rem", fontWeight: 600, color: ORANGE, textDecoration: "none" }}>
          ← All posts
        </Link>
      </div>

      <div style={{
        fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.5px",
        textTransform: "uppercase", color: ORANGE, margin: "0 0 0.5rem",
      }}>
        {post.city} · {post.dateLabel}
      </div>

      <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.25, margin: "0 0 0.35rem" }}>
        {post.title}
      </h1>
      <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "0 0 0.25rem" }}>
        By {post.author}
      </p>

      {post.hero && (
        <BlogImage src={post.hero} alt={post.heroAlt || post.title} />
      )}

      <Body />
    </PageShell>
  );
}
