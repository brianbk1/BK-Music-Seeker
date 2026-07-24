import { PageShell } from "../components/SiteChrome";
import { ForMusiciansSection } from "../content/sections";

export const metadata = {
  title: "For Musicians and Venue Owners — Booking, Pay, Promotion | BBK Music Seeker",
  description: "How to get booked at small rooms, what venues actually want, common pay structures, promoting a show people attend, and getting your band or venue listed.",
  alternates: { canonical: "/musicians" },
};

export default function MusiciansPage() {
  return (
    <PageShell
      title="For Musicians and Venue Owners"
      intro="Booking small rooms, getting paid, promoting a show, and getting listed here."
    >
      <ForMusiciansSection />
    </PageShell>
  );
}
