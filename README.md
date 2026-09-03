# LocalLiveMusic.ai — Blog

A `/blog` section for the BK-Music-Seeker (LocalLiveMusic.ai) Next.js app, matching the
existing design system (700px column, `#e85d04` accent, the shared `S` style tokens,
`PageShell` chrome). Verified with `next build` — `/blog` prerenders static and each
post is generated via `generateStaticParams`.

## What's here

Copy these into your repo, preserving paths:

```
app/content/blog.js          NEW  – post data + shared blog UI (BlogImage, PickCard, CtaButton)
app/blog/page.js             NEW  – blog index (lists all posts as cards)
app/blog/[slug]/page.js      NEW  – individual post route + per-post SEO metadata
app/content/siteInfo.js      EDIT – adds { href:"/blog", label:"Blog" } to NAV
app/sitemap.js               EDIT – also emits every /blog/<slug> URL
public/blog-images/          NEW  – 3 images for the first post
```

The two EDIT files are full replacements. The only real change in each:
- **siteInfo.js** — one new line in the `NAV` array (Blog, placed after Guide).
- **sitemap.js** — imports `BLOG_POSTS` and appends post URLs.

## Adding the next post

Everything is data-driven. In `app/content/blog.js`, add one object to `BLOG_POSTS`
and write a matching `Body` component:

```js
{
  slug: "your-post-slug",
  title: "…",
  date: "2026-09-15",
  dateLabel: "September 15, 2026",
  city: "Philadelphia, PA",
  venue: "…",
  author: "LocalLiveMusic.ai",
  hero: "/blog-images/your-hero.jpg",
  heroAlt: "…",
  excerpt: "One or two sentences for the index card + meta description.",
  Body: YourBodyComponent,
}
```

Inside a `Body`, reuse the shared `S` style tokens plus `<BlogImage>`, `<PickCard>`,
and `<CtaButton>`. Drop hero/inline images into `public/blog-images/`. The index,
routing, sitemap, and SEO metadata all pick it up automatically.

## First post

`lily-allen-mann-philadelphia` — Lily Allen at the Highmark Mann Center, Sun Sep 6, 2026.
The Mann calendar link was cleaned to `https://highmarkmann.org/events` (tracking param removed).

## Images (already placed in public/blog-images/)

- `mann-dusk-skyline.jpg` – hero: Mann tents + Philly skyline at dusk
- `lily-allen-live.jpg`   – Lily Allen performing
- `mann-lawn-crowd.jpg`   – crowd on the lawn at the Mann

Plain `<img>` tags are used (no `next/image` config needed). If you'd rather use
`next/image` later, swap the tags in `blog.js` / `blog/page.js` / `blog/[slug]/page.js`.
