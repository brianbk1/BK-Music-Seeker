import { SITE, NAV, FOOTER_NAV } from "./content/siteInfo";
import { BLOG_POSTS } from "./content/blog";

export default function sitemap() {
  const now = new Date();
  const priority = { "/": 1.0, "/this-week": 0.9 };

  const pages = [...NAV, ...FOOTER_NAV].map((item) => ({
    url: `${SITE.url}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: item.href === "/this-week" || item.href === "/" ? "daily" : "monthly",
    priority: priority[item.href] ?? 0.7,
  }));

  const posts = BLOG_POSTS.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
