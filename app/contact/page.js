import { PageShell } from "../components/SiteChrome";
import { ContactSection } from "../content/legal";

export const metadata = {
  title: "Contact BBK Music Seeker",
  description: "Get in touch about venue listings, artist submissions, corrections, or removal requests.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <PageShell title="Contact"><ContactSection /></PageShell>;
}
