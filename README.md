# LocalLiveMusic.ai — new post: "Nathan Carter Returns to Philadelphia This October"

Post #3 in the data-driven blog. Verified with a real `next build`: all three posts
prerender, the Nathan Carter post renders with full content AND the hero image, it leads
the /blog index, and the sitemap picks up the slug automatically.

## Replace / add these files (paths relative to the repo root)

| File in this zip | Put it at | Action |
|---|---|---|
| `app/content/blog.js` | `app/content/blog.js` | **Replace** |
| `public/blog-images/nathan-carter-irish-center.jpg` | `public/blog-images/nathan-carter-irish-center.jpg` | **Add** (hero) |
| `nathan-carter-instagram.png` | *(not for the site)* | Your Instagram graphic — post separately |

`blog.js` is the only code change. The /blog index, the /blog/[slug] route, the Blog nav
tab and the sitemap all read from BLOG_POSTS, so they update automatically. The new post
lives at **/blog/nathan-carter-philadelphia-irish-center-october-2026** and sorts first
(dated 2026-10-08).

## The images — corrected
Your doc's hero (acoustic guitar + vintage mic, green/amber light, shamrocks) is the one
used, optimized from a 2.7 MB PNG to a 201 KB JPG (1200px). I also checked your Instagram
graphic: its text ("Nathan Carter in Philadelphia / Friday, October 30, 2026 / At the
Irish Center / locallivemusic.ai") matches the verified facts. Both images fit the event.

(For the record: in an earlier reply I wrongly said the images were the College Fit Finder
artwork. That was my extraction error — I unzipped two docs into the same folder and
viewed leftover files. Your images were always correct.)

## Fact check (verified against primary sources)
- Fri, Oct 30, 2026 at the Commodore John Barry Arts & Cultural Center (Irish Center) —
  confirmed on the Irish Center's own announcement and Nathan Carter's official tour dates.
- Prices $50 advance / $65 door / $100 VIP + meet-and-greet — exact match to the Irish
  Center page.
- Oct 31 Zankel Hall at Carnegie Hall (NY) and Nov 1 Chicago — on Carter's dates page; the
  Carnegie date is independently listed as 10/31/2026 7:30 PM.
- Address 6815 Emlen Street, Philadelphia, PA 19119, and contact 215-843-8051 — per the
  venue. Door/performance TIME is intentionally not asserted (the post tells readers to
  confirm it with the venue), since it wasn't on the official page.

## Note on your repo
The 204 MB BK-Music-Seeker.zip is the ORIGINAL pre-blog codebase — it doesn't contain the
blog scaffolding (`app/blog/`, the sitemap blog wiring, the Blog nav). If your live site
already has the blog working (it does — you've published posts), just drop in this `blog.js`
+ the image and you're set. If you ever rebuild from that old zip, you'll also need the
blog route files from the original `locallivemusic-blog` package.
