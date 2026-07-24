import { SITE, NAV, FOOTER_NAV } from "./content/siteInfo";

export default function sitemap() {
  const now = new Date();
  const priority = { "/": 1.0, "/this-week": 0.9 };
  return [...NAV, ...FOOTER_NAV].map((item) => ({
    url: `${SITE.url}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: item.href === "/this-week" || item.href === "/" ? "daily" : "monthly",
    priority: priority[item.href] ?? 0.7,
  }));
}
