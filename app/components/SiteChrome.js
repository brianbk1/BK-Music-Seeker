"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SITE, NAV, FOOTER_NAV } from "../content/siteInfo";

const ORANGE = "#e85d04";

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      style={{
        maxWidth: 700, margin: "0 auto", padding: "0.75rem 1.5rem",
        display: "flex", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{
              flex: "0 0 auto", fontSize: 13, fontWeight: active ? 700 : 500,
              padding: "6px 14px", borderRadius: 99, textDecoration: "none",
              border: `1.5px solid ${active ? ORANGE : "#e2e8f0"}`,
              background: active ? ORANGE : "#fff",
              color: active ? "#fff" : "#64748b", whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer
      style={{
        maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem 3rem",
        borderTop: "1px solid #e2e8f0",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem", marginBottom: "1rem" }}>
        {[...NAV, ...FOOTER_NAV].map((item) => (
          <Link key={item.href} href={item.href}
            style={{ fontSize: "0.8rem", color: "#64748b", textDecoration: "none" }}>
            {item.label}
          </Link>
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: 1.7 }}>
        {SITE.name} is a product of{" "}
        <a href={SITE.companyUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8" }}>
          {SITE.company}
        </a>
        , {SITE.location}. Contact{" "}
        <a href={`mailto:${SITE.email}`} style={{ color: "#94a3b8" }}>{SITE.email}</a>.
        Live music schedules change frequently — always verify event details with the venue before attending.
        <br />© {new Date().getFullYear()} {SITE.company}. All rights reserved.
      </p>
    </footer>
  );
}

/**
 * Standard wrapper for every standalone content route.
 * Homepage uses SiteNav + ContentTabs + SiteFooter directly instead.
 */
export function PageShell({ title, intro, children }) {
  return (
    <>
      <SiteNav />
      <main
        style={{
          maxWidth: 700, margin: "0 auto", padding: "1rem 1.5rem 2rem",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {title && (
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.6rem" }}>
            {title}
          </h1>
        )}
        {intro && (
          <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0 0 1.5rem", lineHeight: 1.7 }}>
            {intro}
          </p>
        )}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
