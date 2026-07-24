import { SITE } from "./content/siteInfo";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
