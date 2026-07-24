import { PageShell } from "../components/SiteChrome";
import { GenresSection } from "../content/sections";

export const metadata = {
  title: "Music Genres and Cultural Styles Explained | BBK Music Seeker",
  description: "What fourteen live music traditions actually sound like in a room — Irish and Celtic, salsa, jazz, blues, bluegrass, gospel, reggae, zydeco, flamenco, and more.",
  alternates: { canonical: "/genres" },
};

export default function GenresPage() {
  return (
    <PageShell
      title="Genres and Cultural Styles"
      intro="What each tradition sounds like live, and the kind of venue that tends to host it."
    >
      <GenresSection />
    </PageShell>
  );
}
