import { PageShell } from "../components/SiteChrome";
import { AboutSection } from "../content/legal";

export const metadata = {
  title: "About BBK Music Seeker",
  description: "Why BBK Music Seeker exists, how it finds live music at small venues, and who runs it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <PageShell title="About"><AboutSection /></PageShell>;
}
