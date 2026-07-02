// Server Component — renders interactive app first, then rich static SEO content for Google AdSense.
import MusicApp from "./MusicApp";

export default function Page() {
  return (
    <>
      <MusicApp />

      {/* ── Rich static content for Google AdSense compliance ── */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem 3rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", borderTop: "1px solid #e2e8f0" }}>

        <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>
          BBK Music Seeker — Find Live Music Near You Tonight
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0 0 1.5rem", lineHeight: 1.7 }}>
          BBK Music Seeker is a free AI-powered live music discovery tool that helps you find out who is playing near you tonight, this weekend, or any night you choose. Search by zip code, city, venue name, or restaurant. Filter by date range, distance, cultural music style, or specific band name. Whether you are looking for a jazz quartet at a neighborhood bar, an Irish folk session at a cultural center, or a touring country artist at a regional venue, BBK Music Seeker surfaces live music that most event apps miss entirely.
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>How to Find Live Music Near You</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Finding live music used to mean calling venues, checking multiple websites, or scrolling through Facebook events hoping to catch something before it happened. BBK Music Seeker changes that by doing the research for you. Enter any zip code or city name and the app searches venue websites, cross-references public event listings, and uses AI to fill in gaps where schedules are incomplete or hard to find.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Results show the performing artist or band name, the venue, the address, the start time, and links to buy tickets, make a reservation, or check the venue's social media for last-minute updates. The interface is designed to be fast — most searches return results in under 10 seconds.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.7 }}>
            Use the date filter to narrow results to tonight, this weekend, the next 7 days, or plan further ahead with the 3-month and 6-month views. The distance filter lets you set your search radius to 5, 10, 20, or 50 miles from your location, so you can find music in your immediate neighborhood or discover venues worth a short drive.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>Search for Your Favorite Band or Artist</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            One of the most useful features of BBK Music Seeker is the Band and Artist search. Instead of searching for venues and hoping your favorite act happens to be playing, you can search the other way around — type in any band or artist name and find every upcoming performance near you featuring that performer.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            This is especially useful for fans of touring regional and national acts. Irish country star Nathan Carter, for example, is currently featured as a highlighted artist on BBK Music Seeker, with his October 30th show at the Commodore John Barry Arts and Cultural Center in Philadelphia already surfacing for users searching the Philadelphia area. As more artists and venues request to be featured, the artist search will grow to cover hundreds of performers across every genre.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.7 }}>
            Musicians and touring artists can request to be added to BBK Music Seeker directly through the app using the Get Your Band Listed form. Submissions go directly to the BBK Music Seeker team for review and listing.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>Find Music by Cultural Style and Genre</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            BBK Music Seeker includes a Cultural Style filter with 14 genre options that let you search for music tied to specific cultural traditions and communities. This feature is designed for music fans who are not just looking for any live music, but for a specific sound, tradition, or cultural experience.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Available cultural styles include Irish and Celtic, Latin and Salsa, Jazz, Blues, Bluegrass and Americana, Gospel, Reggae, Cajun and Zydeco, Flamenco, Indian Classical and Bollywood, Afrobeat, Klezmer and Jewish music, Greek and Mediterranean, and Hip-Hop and R&amp;B. Selecting one or more styles filters the AI search to prioritize venues, events, and cultural centers associated with that musical tradition.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.7 }}>
            The Cultural Style filter also activates featured venue cards for culturally specific venues. Selecting Irish and Celtic, for example, will surface the Commodore John Barry Arts and Cultural Center at 6815 Emlen Street in Philadelphia as a featured venue, showing their upcoming events calendar including concerts, traditional music sessions, and cultural programming open to the public.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>Featured Venues and Live Music Hotspots</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            BBK Music Seeker maintains a curated list of featured venues in areas with strong live music scenes. These venues appear as highlighted cards at the top of search results for their location, showing their known weekly schedule, a button to find this week's specific performers, a Live Vibe section for community ratings and reports, and links to their website, OpenTable reservation system, and social media.
          </p>

          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.5rem" }}>West Chester, PA — Live Music Every Weekend</h3>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Downtown West Chester, Pennsylvania is one of the most active live music destinations in the Philadelphia suburbs. The walkable borough is packed with venues that book live entertainment Wednesday through Saturday every week. Pietro's Prime at 125 West Market Street hosts live music every Wednesday through Saturday from 7 to 10pm. Station 142 at 142 East Market Street features an intimate stage with local and regional acts Thursday through Saturday, plus karaoke on Tuesdays and an open mic on Thursdays. Brickette Lounge offers live music on Friday and Saturday nights along with line dancing events throughout the week. Slow Hand Food and Drink, housed in a converted historic firehouse, features live music every Friday and Saturday at 7pm. Square Bar and Saloon 151 round out the downtown strip with live music, karaoke, and music bingo programming across the week.
          </p>

          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.5rem" }}>Pocono Lake, PA — Mountain Music at Its Best</h3>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            The Pocono Lake area in the Pocono Mountains of northeastern Pennsylvania has a year-round live music scene centered on lakeside bars and mountain taverns. Featured venues include Nick's Lakehouse, a beloved waterfront bar and grill on the lake with regular live music throughout the summer and fall; Boulder View Tavern, a Pocono institution known for its casual atmosphere and regular live entertainment; Murph's Hideaway, a local favorite for live music and community events; and Jubilee, a popular destination for live music and dining in the mountains. All four venues are featured on BBK Music Seeker with weekly schedule information and performer lookup.
          </p>

          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.5rem" }}>Philadelphia, PA — Irish and Celtic Music in Mt. Airy</h3>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            The Commodore John Barry Arts and Cultural Center, located at 6815 Emlen Street in the Mt. Airy neighborhood of Philadelphia, is one of the premier Irish and Celtic cultural venues on the East Coast. The center hosts a diverse calendar of live music and cultural events open to the public year-round, including traditional Irish music sessions, Celtic concerts, and performances by both local artists and internationally recognized performers. Upcoming highlights include a concert by Nathan Carter, one of Ireland's top country and folk artists, on Friday October 30th. General admission tickets are $50 and meet-and-greet packages are also available.
          </p>

          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.5rem" }}>Chicago, IL — Country and Live Music at Bubb City</h3>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.7 }}>
            Bubb City at 435 North Dearborn Street in Chicago is the city's premier destination for country music and live entertainment. The venue draws large crowds for its honky-tonk atmosphere, high-energy live performances, and world-class sound system. BBK Music Seeker features Bubb City as a highlighted venue for Chicago searches, with weekly schedule information and performer lookup available directly in the app.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>Live Music in Major Cities Across the US</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Beyond its featured venue markets, BBK Music Seeker supports live music searches in cities and towns across the entire United States. The app covers hundreds of markets and is designed to surface live music wherever it is happening — from major metropolitan areas to smaller regional towns with active local music scenes.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            <strong style={{ color: "#0f172a" }}>Los Angeles, CA:</strong> LA's live music scene spans legendary Sunset Strip clubs, rooftop bars in Silver Lake, intimate acoustic venues in Santa Monica, and everything in between. Search any LA neighborhood zip code to find what is playing near you tonight.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            <strong style={{ color: "#0f172a" }}>Miami, FL:</strong> Miami's music scene is driven by Latin rhythms, jazz, electronic, and hip-hop. From Little Havana to Wynwood to South Beach, live music is happening every night of the week across dozens of clubs, bars, and cultural venues.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            <strong style={{ color: "#0f172a" }}>Dallas, TX:</strong> Deep Ellum is Dallas's legendary live music and arts district, hosting blues, country, rock, and jazz acts nightly across dozens of clubs and bars. BBK Music Seeker covers Deep Ellum and the broader Dallas metro area.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: "#0f172a" }}>Seattle, WA:</strong> From grunge to indie rock to jazz, Seattle's music legacy lives on in clubs across Capitol Hill, Ballard, and Belltown. Search Seattle to find live music from local acts and national touring artists playing the city's many renowned venues.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>Get Your Venue or Band Listed on BBK Music Seeker</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            BBK Music Seeker welcomes submissions from venue owners, event promoters, and musicians who want to be featured on the platform. Being listed on BBK Music Seeker connects you directly with music fans who are actively searching for live entertainment in your area.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Venue owners can use the Request a Venue form to submit their venue name, address, website, and social media links along with a description of their live music programming. Featured venues receive a dedicated card in search results showing their known weekly schedule, a performer lookup feature, and community vibe ratings from users who have visited.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.7 }}>
            Musicians and bands can use the Get Your Band Listed form to submit their artist name, genre, and upcoming performance information. Featured artists appear as highlighted pills in the Band and Artist search section, making it easy for fans to find your shows with a single tap.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>Why BBK Music Seeker Is Different</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Most live music discovery apps focus on ticketed concerts at large venues. They are great for finding a stadium show or a sold-out club gig, but they miss the vast majority of live music that happens every week at bars, restaurants, breweries, and smaller venues that do not use ticketing platforms. This is the music that makes a city feel alive — the Friday night jazz duo at a neighborhood wine bar, the acoustic singer-songwriter at a gastropub, the Saturday night cover band that has the whole room dancing.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            BBK Music Seeker is built specifically to surface this kind of music. By combining AI-powered web search with venue schedule databases, social media monitoring, and direct event page scraping, the app finds live music that does not make it onto Ticketmaster, Songkick, or Bandsintown. The result is a more complete picture of what is actually happening in your neighborhood on any given night.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.7 }}>
            BBK Music Seeker is completely free to use. No account required. No subscription. No ads interrupting your search. Just enter your location and find live music.
          </p>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 1.5rem" }} />
        <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
          BBK Music Seeker is a product of The BK Consulting Group. For venue and artist listing requests, contact us through the forms above. Live music schedules are updated continuously and may vary. Always verify event details with the venue before attending.
        </p>

      </div>
    </>
  );
}
