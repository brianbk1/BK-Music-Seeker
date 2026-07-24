import { PageShell } from "../components/SiteChrome";
import { PrivacyPolicySection } from "../content/legal";

export const metadata = {
  title: "Privacy Policy | BBK Music Seeker",
  description: "What BBK Music Seeker collects, how it is used, which third parties are involved, cookie and advertising choices, and your rights under GDPR and CCPA.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PageShell title="Privacy Policy"><PrivacyPolicySection /></PageShell>;
}
