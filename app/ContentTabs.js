"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ThisWeekSection,
  VenueGuideSection,
  GenresSection,
  LiveMusic101Section,
  ForMusiciansSection,
} from "./content/sections";
import { PrivacyPolicySection } from "./content/legal";

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT FOR SEO / ADSENSE:
// Every tab panel is rendered into the HTML on the server and hidden with CSS
// rather than conditionally mounted. Googlebot receives all of the text on the
// first response. Do not change this to {active === n && <Panel />} — that would
// hide the other tabs' content from crawlers entirely.
//
// The content itself lives in ./content/sections.js and ./content/legal.js and
// is shared with the standalone routes (/venues, /genres, etc). Edit it there.
// ─────────────────────────────────────────────────────────────────────────────

const ORANGE = "#e85d04";

export default function ContentTabs({ days = [], venues = [], weeklyRhythm = [], updated = "" }) {
  const [active, setActive] = useState(0);

  const TABS = [
    { label: "This Week",       href: "/this-week", node: <ThisWeekSection days={days} venues={venues} weeklyRhythm={weeklyRhythm} updated={updated} /> },
    { label: "Venue Guide",     href: "/venues",    node: <VenueGuideSection /> },
    { label: "Genres & Styles", href: "/genres",    node: <GenresSection /> },
    { label: "Live Music 101",  href: "/guide",     node: <LiveMusic101Section /> },
    { label: "For Musicians",   href: "/musicians", node: <ForMusiciansSection /> },
    { label: "Privacy",         href: "/privacy",   node: <PrivacyPolicySection /> },
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem 1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", borderTop: "1px solid #e2e8f0" }}>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: "1.25rem", borderBottom: "1px solid #e2e8f0", WebkitOverflowScrolling: "touch" }}>
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            aria-selected={active === i}
            style={{
              flex: "0 0 auto", fontSize: 13, fontWeight: active === i ? 700 : 500,
              padding: "8px 16px", borderRadius: 99,
              border: `1.5px solid ${active === i ? ORANGE : "#e2e8f0"}`,
              background: active === i ? ORANGE : "transparent",
              color: active === i ? "#fff" : "#64748b",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {TABS.map((t, i) => (
        <div key={t.label} style={{ display: active === i ? "block" : "none" }}>
          {t.node}
          <p style={{ margin: "0 0 1.5rem" }}>
            <Link href={t.href} style={{ fontSize: "0.8rem", color: ORANGE, textDecoration: "none", fontWeight: 600 }}>
              Open {t.label} as its own page →
            </Link>
          </p>
        </div>
      ))}
    </div>
  );
}
