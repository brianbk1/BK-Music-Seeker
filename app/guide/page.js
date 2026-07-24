import { PageShell } from "../components/SiteChrome";
import { LiveMusic101Section } from "../content/sections";

export const metadata = {
  title: "Live Music 101 — Set Times, Covers, Etiquette, and Hearing | BBK Music Seeker",
  description: "A practical guide to going out for live music: when bands actually start, cover charges and tipping, reading the room, protecting your hearing, and all-ages options.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return (
    <PageShell
      title="Live Music 101"
      intro="Practical answers for going out to see music, plus how the American live music tradition got here."
    >
      <LiveMusic101Section />
    </PageShell>
  );
}
