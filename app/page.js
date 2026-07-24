// Server Component — intro + MusicApp + tabbed editorial content.
//
// AUTO-REFRESH: `revalidate` below controls how often Next.js regenerates this
// page and re-pulls venue event feeds. 86400 = once a day. Set to 1209600 for
// every other week. No redeploy needed for the content to change — the venues
// update their own calendars and this page picks it up.
import MusicApp from "./MusicApp";
import ContentTabs from "./ContentTabs";
import { getUpcomingEvents, feedTimestamp, WEEKLY_RHYTHM } from "./lib/venueFeeds";

export const revalidate = 86400;

export default async function Page() {
  const events = await getUpcomingEvents({ limit: 24 });
  const updated = feedTimestamp();

  return (
    <>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1.5rem 0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>
          BBK Music Seeker — Find Live Music Near You Tonight
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0 0 1rem", lineHeight: 1.7 }}>
          BBK Music Seeker is a free AI-powered live music discovery tool that helps you find who is playing near you tonight, this weekend, or any night. Search by zip code, city, venue name, or artist. Filter by date, distance, cultural style, or band name. Whether you want jazz at a neighborhood bar, an Irish folk session, or a touring country artist at a regional venue, BBK Music Seeker surfaces live music that most event apps miss entirely.
        </p>

        <section style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>How to Find Live Music Near You</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.5rem", lineHeight: 1.7 }}>
            Enter any zip code or city name and BBK Music Seeker searches venue websites, cross-references public event listings, and uses AI to fill in gaps where schedules are incomplete or hard to find. Results show the performing artist, venue, address, start time, and links to buy tickets or make a reservation.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Use the date filter to narrow results to tonight, this weekend, the next 7 days, or plan ahead with 3-month and 6-month views. The distance filter sets your search radius to 5, 10, 20, or 50 miles. Scroll past the search tool for this week&rsquo;s confirmed lineups, a full venue guide, genre explainers, and practical guides for both fans and working musicians.
          </p>
        </section>

        <section style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>Search for Your Favorite Band or Artist</h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.7 }}>
            Type in any band or artist name and find every upcoming performance near you. Irish country star Nathan Carter is currently featured, with his October 30th show at the Commodore John Barry Arts and Cultural Center in Philadelphia surfacing for users searching the area. Musicians can request to be added through the Get Your Band Listed form.
          </p>
        </section>

        <div style={{ textAlign: "center", padding: "1rem 0 1.5rem" }}>
          <a href="#music-app"
            style={{ display: "inline-block", background: "linear-gradient(135deg,#e85d04,#c44a00)", color: "#fff", padding: "12px 32px", borderRadius: "99px", textDecoration: "none", fontWeight: 700, fontSize: "15px", boxShadow: "0 2px 12px rgba(232,93,4,0.35)", letterSpacing: "0.3px" }}>
            🎵 Start Your Live Music Search
          </a>
        </div>

      </div>

      <div id="music-app"><MusicApp /></div>

      <ContentTabs events={events} weeklyRhythm={WEEKLY_RHYTHM} updated={updated} />
    </>
  );
}
