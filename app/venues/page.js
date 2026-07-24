import { PageShell } from "../components/SiteChrome";
import { VenueGuideSection } from "../content/sections";

export const metadata = {
  title: "Live Music Venue Guide — West Chester, Poconos, Philadelphia | BBK Music Seeker",
  description: "A guide to live music venues in West Chester PA, the Pocono lakes, Philadelphia, Chicago, and major US music cities — what each room books and when.",
  alternates: { canonical: "/venues" },
};

export default function VenuesPage() {
  return (
    <PageShell
      title="Live Music Venue Guide"
      intro="What each room actually books, what nights it runs, and what to expect when you walk in."
    >
      <VenueGuideSection />
    </PageShell>
  );
}
