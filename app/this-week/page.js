import { PageShell } from "../components/SiteChrome";
import { ThisWeekSection } from "../content/sections";
import { getUpcomingEvents, groupByDay, feedTimestamp, WEEKLY_RHYTHM, VENUE_FEEDS } from "../lib/venueFeeds";

export const revalidate = 86400;

export const metadata = {
  title: "Live Music This Week — West Chester, PA | BBK Music Seeker",
  description: "Confirmed live music listings this week at West Chester and Chester County venues, pulled directly from venue calendars, plus the standing weekly schedule.",
  alternates: { canonical: "/this-week" },
};

export default async function ThisWeekPage() {
  const events = await getUpcomingEvents({ limit: 40, windowDays: 14 });
  const days = groupByDay(events);
  const venues = VENUE_FEEDS.map((f) => f.name);
  return (
    <PageShell
      title="Live Music This Week"
      intro="Confirmed listings pulled straight from venue calendars, plus the recurring weekly schedule that runs year-round."
    >
      <ThisWeekSection days={days} venues={venues} weeklyRhythm={WEEKLY_RHYTHM} updated={feedTimestamp()} />
    </PageShell>
  );
}
