import { PageShell } from "../components/SiteChrome";
import { ThisWeekSection } from "../content/sections";
import { getUpcomingEvents, feedTimestamp, WEEKLY_RHYTHM } from "../lib/venueFeeds";

export const revalidate = 86400;

export const metadata = {
  title: "Live Music This Week — West Chester, PA | BBK Music Seeker",
  description: "Confirmed live music listings this week at West Chester and Chester County venues, pulled directly from venue calendars, plus the standing weekly schedule.",
  alternates: { canonical: "/this-week" },
};

export default async function ThisWeekPage() {
  const events = await getUpcomingEvents({ limit: 24 });
  return (
    <PageShell
      title="Live Music This Week"
      intro="Confirmed listings pulled straight from venue calendars, plus the recurring weekly schedule that runs year-round."
    >
      <ThisWeekSection events={events} weeklyRhythm={WEEKLY_RHYTHM} updated={feedTimestamp()} />
    </PageShell>
  );
}
