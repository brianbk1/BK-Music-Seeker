# LocalLiveMusic.ai — new post: "September at LoCali"

This is post #2 in the same data-driven blog you already deployed, so it slots into
the existing Next.js app.

## Replace ONE file
| File in this zip | Put it at | Action |
|---|---|---|
| `app/content/blog.js` | `app/content/blog.js` | **Replace** |

That's the only change. `/blog`, `/blog/[slug]`, the Blog nav tab, and `sitemap.xml`
all read from `BLOG_POSTS`, so they update automatically:
- New post lives at **/blog/locali-west-chester-september-live-music**
- It appears first on **/blog** (sorted newest-first; dated Sep 9 vs the Lily Allen post's Sep 1)
- It's added to the sitemap automatically

Verified with `next build`: both posts prerender with full content, and the index
lists LoCali above Lily Allen.

## What changed inside blog.js
- Added the LoCali post object + its `LoCaliBody`.
- Added two reusable components to the toolkit (handy for future venue posts):
  - `Callout` — the soft orange "why it made the list" aside
  - `LineupTable` — the Date/Artist/Time schedule table
- The Lily Allen post is unchanged.

## No hero image (by choice)
No photo came with this post, and I won't fabricate one of a real venue or of the
local performers. The layout handles image-less posts fine — the index card just shows
text. To add one later: drop a rights-cleared image (a LoCali interior shot, a West
Chester streetscape) into `public/blog-images/` and set `hero` + `heroAlt` on the LoCali
post object.

## One thing to confirm before publishing
The lineup (artists, dates, times) and the "remaining September" framing came straight
from your draft — I didn't independently verify them against LoCali's live calendar
(enjoylocali.com/events). Worth a glance so a cancelled or moved set doesn't go out wrong.
