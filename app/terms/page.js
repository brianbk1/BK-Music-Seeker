import { PageShell } from "../components/SiteChrome";
import { TermsSection } from "../content/legal";

export const metadata = {
  title: "Terms of Use | BBK Music Seeker",
  description: "Terms governing use of BBK Music Seeker, including accuracy disclaimers, acceptable use, and limitation of liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <PageShell title="Terms of Use"><TermsSection /></PageShell>;
}
