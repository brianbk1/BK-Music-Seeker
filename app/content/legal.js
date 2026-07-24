// ─────────────────────────────────────────────────────────────────────────────
// LEGAL & INFO SECTIONS — About, Contact, Privacy Policy, Terms of Use.
// Contact details come from ./siteInfo.js — edit them there, not here.
//
// NOTE: The privacy policy below describes what this application actually does,
// based on its real code (geolocation, AI search proxy, analytics, AdSense).
// It is a starting point written in plain language, not legal advice. Have
// counsel review it if the site becomes commercially significant.
// ─────────────────────────────────────────────────────────────────────────────

import { SITE } from "./siteInfo";
import { S, A } from "./sections";

const Updated = () => (
  <p style={{ ...S.p, fontSize: "0.75rem", color: "#94a3b8" }}>
    Last updated: {SITE.policyUpdated}
  </p>
);

// ── ABOUT ────────────────────────────────────────────────────────────────────

export function AboutSection() {
  return (
    <section style={S.sec}>
      <h2 style={S.h2}>About BBK Music Seeker</h2>
      <p style={S.p}>
        BBK Music Seeker exists because finding live music at small venues is unreasonably hard. Ticketing platforms cover arenas and theaters well, because that is where the commission is. They do not cover the acoustic duo at a wine lounge on a Tuesday, the Irish session at a cultural center, or the cover band that packs a neighborhood bar every Saturday — and that is the overwhelming majority of live music actually happening on any given night in America.
      </p>
      <p style={S.p}>
        Those shows are not unlisted. They are listed badly: on a venue&rsquo;s own calendar page, in a Facebook post, on an Instagram story that disappears in a day. No single place aggregates them, because there is no ticket to sell. This site reads those scattered sources — venue calendars directly where they publish structured data, AI-assisted lookups where they do not — and puts them in one place.
      </p>

      <h3 style={S.h3}>How It Works</h3>
      <p style={S.p}>
        You enter a zip code or a city. The tool checks venue websites and public event listings, then uses AI to fill gaps where a schedule is incomplete or buried. Featured venues get a dedicated card with their standing weekly schedule and a button that looks up the current week&rsquo;s performers on demand. You can filter by date range, distance, cultural style, or a specific band name.
      </p>
      <p style={S.p}>
        There is no account, no login, and no cost. The site is supported by advertising.
      </p>

      <h3 style={S.h3}>Accuracy</h3>
      <p style={S.p}>
        Small venues change plans. Bands cancel, weather moves outdoor shows indoors, and a listing posted three weeks ago may no longer be true. Some results are AI-assisted and can be wrong. Always confirm with the venue directly before making the drive. If you find an error, tell us and it gets fixed.
      </p>

      <h3 style={S.h3}>Who Runs This</h3>
      <p style={S.p}>
        BBK Music Seeker is built and operated by {SITE.company} in {SITE.location}. More at <A href={SITE.companyUrl}>thebkcg.com</A>. Questions, corrections, venue submissions, and artist listings all go to <a href={`mailto:${SITE.email}`} style={S.a}>{SITE.email}</a>.
      </p>
    </section>
  );
}

// ── CONTACT ──────────────────────────────────────────────────────────────────

export function ContactSection() {
  return (
    <section style={S.sec}>
      <h2 style={S.h2}>Contact</h2>
      <p style={S.p}>
        Email <a href={`mailto:${SITE.email}`} style={S.a}>{SITE.email}</a> for anything. Replies usually come within a couple of business days.
      </p>

      <h3 style={S.h3}>Venue Owners</h3>
      <p style={S.p}>
        To have your venue listed or featured, email us or use the Request a Venue form inside the search tool on the <a href="/" style={S.a}>home page</a>. Featured venues get a dedicated card in search results with a standing weekly schedule, on-demand performer lookup, and community ratings. If your site publishes a structured public events calendar, listings can be refreshed automatically — mention that and include the calendar URL.
      </p>

      <h3 style={S.h3}>Musicians and Bands</h3>
      <p style={S.p}>
        Use the Get Your Band Listed form in the search tool, or email us with your act name, genre, home region, and a link. Featured artists surface in searches near their upcoming performances.
      </p>

      <h3 style={S.h3}>Corrections</h3>
      <p style={S.p}>
        If a listing is wrong, out of date, or a venue has closed, please tell us. Include the venue name and what is incorrect. Corrections are prioritized over everything else in the inbox.
      </p>

      <h3 style={S.h3}>Removal Requests</h3>
      <p style={S.p}>
        Venues and artists who do not want to appear on the site can email us and will be removed, no explanation needed.
      </p>

      <h3 style={S.h3}>Business Details</h3>
      <p style={S.p}>
        {SITE.company}<br />
        {SITE.location}<br />
        <A href={SITE.companyUrl}>thebkcg.com</A>
      </p>
    </section>
  );
}

// ── PRIVACY POLICY ───────────────────────────────────────────────────────────

export function PrivacyPolicySection() {
  return (
    <section style={S.sec}>
      <h2 style={S.h2}>Privacy Policy</h2>
      <Updated />
      <p style={S.p}>
        This policy explains what {SITE.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, why, and what you can do about it. It applies to {SITE.url}. Plain language is the goal — if anything here is unclear, email <a href={`mailto:${SITE.email}`} style={S.a}>{SITE.email}</a> and ask.
      </p>

      <h3 style={S.h3}>The Short Version</h3>
      <p style={S.p}>
        There are no accounts and no logins, so we do not hold a profile on you. We do not sell personal information. The site is free and supported by advertising, which means Google and its partners set cookies in your browser. Searches you type are sent to an AI provider to generate results. If you choose to share your location, it is used once to work out your city and is not stored.
      </p>

      <h3 style={S.h3}>What We Collect</h3>
      <p style={S.p}>
        <strong style={S.b}>Search information.</strong> The zip code, city, venue, or artist name you enter, along with your filter choices — date range, distance, genre. These are processed to produce results.
      </p>
      <p style={S.p}>
        <strong style={S.b}>Location, only if you allow it.</strong> If you tap the location button, your browser asks permission and, if granted, provides coordinates. Those coordinates are sent once to the OpenStreetMap Nominatim service to convert them into a city name, which then becomes your search term. We do not retain the coordinates and we do not track your location in the background. Denying permission simply means typing a location instead, and everything else works identically.
      </p>
      <p style={S.p}>
        <strong style={S.b}>Information you submit voluntarily.</strong> If you use a contact, band listing, or venue request form, we receive whatever you put in it — typically a name, an email address, an act or venue name, and a message. If you leave a community rating for a venue, that rating is stored and shown to other visitors. Do not put anything sensitive in a public rating.
      </p>
      <p style={S.p}>
        <strong style={S.b}>Automatically collected technical data.</strong> Like nearly all websites, our hosting provider and analytics record standard technical information: IP address, browser type and version, device type, referring page, pages viewed, and timestamps.
      </p>
      <p style={S.p}>
        <strong style={S.b}>What we do not collect.</strong> No account credentials, because there are no accounts. No payment information, because nothing is sold here. We do not knowingly collect information from children under 13.
      </p>

      <h3 style={S.h3}>How Information Is Used</h3>
      <ul style={S.ul}>
        <li>To generate live music results for the location and filters you entered</li>
        <li>To display venue schedules and community ratings</li>
        <li>To respond to messages, listing requests, and corrections you send us</li>
        <li>To understand aggregate usage — which features get used, where traffic comes from — so the site can be improved</li>
        <li>To serve advertising, which is what keeps the site free</li>
        <li>To detect abuse and keep the service running</li>
      </ul>

      <h3 style={S.h3}>Third Parties That Receive Data</h3>
      <p style={S.p}>
        <strong style={S.b}>Anthropic.</strong> Search terms and filter selections are sent to Anthropic&rsquo;s API to generate results and look up venue schedules. Requests are proxied through our server, so your IP address is not passed along with them. See <A href="https://www.anthropic.com/legal/privacy">Anthropic&rsquo;s privacy policy</A>.
      </p>
      <p style={S.p}>
        <strong style={S.b}>Google AdSense.</strong> Advertising is served by Google (publisher ID {SITE.adsenseId}). Google and its partner vendors use cookies to serve ads based on your prior visits to this and other sites. Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and other sites on the internet. Details and controls are in <A href="https://policies.google.com/technologies/partner-sites">How Google uses information from sites that use its services</A>.
      </p>
      <p style={S.p}>
        <strong style={S.b}>Google Analytics.</strong> We use Google Analytics 4 to measure aggregate traffic. See <A href="https://policies.google.com/privacy">Google&rsquo;s privacy policy</A>.
      </p>
      <p style={S.p}>
        <strong style={S.b}>OpenStreetMap.</strong> The Nominatim service converts coordinates to a place name when you use the location feature. See the <A href="https://wiki.osmfoundation.org/wiki/Privacy_Policy">OSM Foundation privacy policy</A>.
      </p>
      <p style={S.p}>
        <strong style={S.b}>Vercel.</strong> Our hosting provider, which processes standard server request data. See <A href="https://vercel.com/legal/privacy-policy">Vercel&rsquo;s privacy policy</A>.
      </p>
      <p style={S.p}>
        <strong style={S.b}>Venue websites.</strong> We read publicly published event calendars from venue websites. This is a one-way read on our servers; no information about you is sent to those venues.
      </p>

      <h3 style={S.h3}>Cookies and Advertising Choices</h3>
      <p style={S.p}>
        Cookies are small files stored by your browser. We use them for analytics and advertising, not for authentication. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.
      </p>
      <p style={S.p}>
        You can turn off personalized advertising at <A href="https://www.google.com/settings/ads">Google Ads Settings</A>, opt out of many third-party vendors at <A href="https://www.aboutads.info/choices/">aboutads.info/choices</A> or <A href="https://optout.networkadvertising.org/">the Network Advertising Initiative</A>, and block or delete cookies entirely in your browser settings. Opting out of personalized ads does not remove ads; it makes them less relevant. Blocking all cookies may affect how some features behave.
      </p>

      <h3 style={S.h3}>If You Are in the EEA, UK, or Switzerland</h3>
      <p style={S.p}>
        Under the GDPR you have the right to access, correct, delete, restrict, or object to processing of your personal data, and to data portability. Our legal bases are consent (for location and for advertising and analytics cookies where consent is required), legitimate interest (for operating and securing the site), and contract performance where relevant. Where consent is required, a consent notice is presented before non-essential cookies are set, and you may withdraw consent at any time. You also have the right to complain to your local supervisory authority. To exercise any of these rights, email <a href={`mailto:${SITE.email}`} style={S.a}>{SITE.email}</a>.
      </p>

      <h3 style={S.h3}>If You Are in California</h3>
      <p style={S.p}>
        Under the CCPA and CPRA you have the right to know what personal information is collected and how it is used, to request deletion, to correct inaccurate information, and to opt out of the sale or sharing of personal information. We do not sell personal information for money. Some advertising cookie activity may qualify as &ldquo;sharing&rdquo; for cross-context behavioral advertising under California law; you can opt out using the advertising controls linked above or by emailing us. We will not discriminate against you for exercising these rights.
      </p>

      <h3 style={S.h3}>Data Retention</h3>
      <p style={S.p}>
        Search terms are processed to produce results and are not stored in a form linked to you. Location coordinates are used once and discarded. Messages you send us are kept as long as needed to handle the request and for reasonable record keeping. Community venue ratings are kept until removed. Analytics data is retained according to Google Analytics settings, which default to 14 months.
      </p>

      <h3 style={S.h3}>Security</h3>
      <p style={S.p}>
        The site is served over HTTPS and API keys are held server-side, never exposed to your browser. That said, no method of transmission or storage over the internet is completely secure, and we cannot guarantee absolute security.
      </p>

      <h3 style={S.h3}>Children&rsquo;s Privacy</h3>
      <p style={S.p}>
        This site is not directed to children under 13 and we do not knowingly collect personal information from them. If you believe a child has provided information, email us and it will be deleted.
      </p>

      <h3 style={S.h3}>Changes to This Policy</h3>
      <p style={S.p}>
        This policy may be updated as the site changes. The date at the top reflects the most recent revision. Material changes will be noted on this page.
      </p>

      <h3 style={S.h3}>Contact</h3>
      <p style={S.p}>
        Privacy questions or requests: <a href={`mailto:${SITE.email}`} style={S.a}>{SITE.email}</a>, {SITE.company}, {SITE.location}.
      </p>
    </section>
  );
}

// ── TERMS OF USE ─────────────────────────────────────────────────────────────

export function TermsSection() {
  return (
    <section style={S.sec}>
      <h2 style={S.h2}>Terms of Use</h2>
      <Updated />
      <p style={S.p}>
        By using {SITE.url} you agree to these terms. If you do not agree, please do not use the site.
      </p>

      <h3 style={S.h3}>What This Service Is</h3>
      <p style={S.p}>
        {SITE.name} is a free live music discovery tool operated by {SITE.company}. It aggregates publicly available event information and supplements it with AI-generated results. It is provided for personal, non-commercial use.
      </p>

      <h3 style={S.h3}>No Guarantee of Accuracy</h3>
      <p style={S.p}>
        Event listings come from third-party sources and AI-assisted lookups, and may be incomplete, outdated, or wrong. Venues cancel, reschedule, and change lineups without notice. Always confirm details directly with the venue before traveling. We are not responsible for wasted trips, cancelled shows, incorrect times, or any decision made in reliance on information found here.
      </p>

      <h3 style={S.h3}>No Affiliation With Venues</h3>
      <p style={S.p}>
        Listing a venue or artist does not imply any partnership, sponsorship, or endorsement in either direction unless explicitly stated. We are not the organizer of any event listed and have no control over what happens at one. Venue names, logos, and trademarks belong to their owners.
      </p>

      <h3 style={S.h3}>Acceptable Use</h3>
      <ul style={S.ul}>
        <li>Do not scrape, bulk-download, or systematically copy the site&rsquo;s content</li>
        <li>Do not attempt to disrupt, overload, or gain unauthorized access to the service</li>
        <li>Do not submit false listings, spam, or abusive content through any form</li>
        <li>Do not use community ratings to defame a venue or a person</li>
      </ul>
      <p style={S.p}>
        We may remove submitted content and block access at our discretion.
      </p>

      <h3 style={S.h3}>User Submissions</h3>
      <p style={S.p}>
        If you submit a venue request, artist listing, or community rating, you confirm you have the right to share it and you grant us a non-exclusive license to display it on the site. You remain responsible for what you submit.
      </p>

      <h3 style={S.h3}>Third-Party Links and Advertising</h3>
      <p style={S.p}>
        The site links to venue websites, ticketing pages, reservation platforms, and other external resources, and displays third-party advertising. We do not control those destinations and are not responsible for their content, practices, or transactions you enter into with them.
      </p>

      <h3 style={S.h3}>Disclaimer and Limitation of Liability</h3>
      <p style={S.p}>
        The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied, including fitness for a particular purpose and accuracy. To the fullest extent permitted by law, {SITE.company} is not liable for any indirect, incidental, or consequential damages arising from your use of the site. Some jurisdictions do not allow certain limitations, in which case they apply to the extent permitted.
      </p>

      <h3 style={S.h3}>Intellectual Property</h3>
      <p style={S.p}>
        Original editorial content, design, and code on this site belong to {SITE.company}. Event data, venue names, and artist names belong to their respective owners.
      </p>

      <h3 style={S.h3}>Changes and Governing Law</h3>
      <p style={S.p}>
        These terms may change; continued use after an update constitutes acceptance. Any dispute is governed by the laws of the Commonwealth of Pennsylvania, United States, without regard to conflict of law principles.
      </p>

      <h3 style={S.h3}>Contact</h3>
      <p style={S.p}>
        Questions about these terms: <a href={`mailto:${SITE.email}`} style={S.a}>{SITE.email}</a>.
      </p>
    </section>
  );
}
