// Server Component — renders interactive app first, then static SEO content below for Google AdSense compliance.
import MusicApp from "./MusicApp";

export default function Page() {
  return (
    <>
      {/* ── Interactive client app ── */}
      <MusicApp />

      {/* ── Static SEO content (server-rendered, crawlable by Google) ── */}
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "1.5rem 1.5rem 2rem",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <header style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 0.5rem",
              lineHeight: 1.3,
            }}
          >
            BBK Music Seeker — Find Live Music Near You
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
            Discover live music happening tonight at bars, restaurants, clubs, and independent
            venues near you. Search by zip code or city, track down your favorite band on tour,
            or filter by cultural style — Irish, Latin, Jazz, Afrobeat, and more. All in one place.
          </p>
        </header>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>
            How BBK Music Seeker Works
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.5rem", lineHeight: 1.6 }}>
            Enter your zip code or city name and BBK Music Seeker searches hundreds of local venues
            to surface tonight's live performances. We pull schedules directly from venue websites,
            cross-reference event listings, and use AI to fill in gaps — so you always get the most
            current information available.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.5rem", lineHeight: 1.6 }}>
            Looking for a specific artist? Use the Band or Artist search to find every upcoming show
            near you featuring that performer. Into a particular sound? Our Cultural Style filter
            surfaces Irish and Celtic sessions, Latin and Salsa nights, Afrobeat, Klezmer, Bluegrass,
            Gospel, Reggae, and more — including featured cultural venues like the Commodore John Barry
            Arts and Cultural Center in Philadelphia.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.5rem", lineHeight: 1.6 }}>
            Each result shows the performing artist, venue name and address, set time, genre, and a
            direct link to buy tickets or make a reservation. Use the date filter to browse tonight,
            this weekend, the next 7 days, or plan ahead with 3 and 6 month views.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
            Are you a musician or venue owner? Use the <strong>Get Your Band Listed</strong> or{" "}
            <strong>Request a Venue</strong> links to get featured on BBK Music Seeker and reach
            fans actively looking for live music near them.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>
            Featured Live Music Areas
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 1rem", lineHeight: 1.6 }}>
            BBK Music Seeker covers live music venues across the country, with
            especially deep coverage in the following communities:
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.4rem" }}>
              West Chester, PA (19382)
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
              Downtown West Chester is one of the Philadelphia suburbs most
              vibrant live music corridors. On any given Thursday through
              Saturday you will find original acts and cover bands performing
              across venues like Pietro's Prime (live music Wed–Sat),
              Station 142 (intimate stage with local and regional acts
              Thurs–Sat), Brickette Lounge (live music and events, 21+),
              Slow Hand Food and Drink (a historic firehouse turned music
              venue), and Square Bar (a neighborhood institution open since
              the 1950s). Saloon 151 rounds out the strip with karaoke
              Fridays and Music Bingo Wednesdays.
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.4rem" }}>
              Pocono Lake, PA (18347)
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
              The Pocono Mountains region offers year-round live music at
              lakeside bars and mountain taverns. Local favorites include
              Murph's Hideaway, Nick's Lakehouse, Boulder View Tavern, and
              Jubilee.
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.4rem" }}>
              Philadelphia, PA (19119)
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
              The Commodore John Barry Arts and Cultural Center in Mt. Airy
              hosts world-class Irish and Celtic performers, concerts,
              traditional music sessions, and cultural events open to the
              public year-round. Nathan Carter returns October 30th.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e85d04", margin: "0 0 0.4rem" }}>
              Nationwide Coverage
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
              Beyond Pennsylvania, BBK Music Seeker supports searches for live
              music in major cities including Los Angeles, Chicago, Miami,
              Dallas, Seattle, and hundreds of smaller markets.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem" }}>
            Why Use BBK Music Seeker?
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.5rem", lineHeight: 1.6 }}>
            Most event apps only list ticketed shows at major venues. BBK Music
            Seeker also surfaces free live music at neighborhood bars,
            restaurants, and smaller clubs — the kind of spontaneous night out
            that does not make it onto Ticketmaster.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
            Results include direct links to reserve a table via OpenTable,
            check the venue's Instagram, or verify the event on Songkick and
            Bandsintown before you head out.
          </p>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 1.5rem" }} />
      </div>
    </>
  );
}
