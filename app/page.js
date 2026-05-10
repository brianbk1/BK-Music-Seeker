"use client";
import { useState } from "react";

// ─── Featured Venues ──────────────────────────────────────────────────────────

const FEATURED_VENUES = [
  {
    name: "Pietro's Prime",
    tag: "Live music Wed–Sat",
    description: "West Chester's premier upscale steakhouse with exceptional cuisine, the best martinis in town, and live entertainment every Wednesday through Saturday night.",
    address: "125 West Market St, West Chester, PA 19382",
    scheduleUrl: "https://www.pietrosprime.com/entertainment",
    reserveUrl: "https://www.opentable.com/pietros-prime",
    color: "#e85d04",
    upcomingShows: [
      { date: "Wed May 13", event: "John Grecia", location: "Pietro's Prime", url: "https://www.pietrosprime.com/event-details/john-grecia-45" },
      { date: "Thu May 14", event: "Brian McConnell", location: "Pietro's Prime", url: "https://www.pietrosprime.com/event-details/brian-mcconnell-39" },
      { date: "Fri May 15", event: "John Grecia & Drew Neilands", location: "Pietro's Prime", url: "https://www.pietrosprime.com/event-details/john-grecia-drew-neilands" },
      { date: "Sat May 16", event: "Midnight Blue", location: "Pietro's Prime", url: "https://www.pietrosprime.com/event-details/midnight-blue-3" },
      { date: "Wed May 20", event: "John Grecia", location: "Pietro's Prime", url: "https://www.pietrosprime.com/event-details/john-grecia-46" },
    ],
  },
  {
    name: "Saloon 151",
    tag: "Whiskey Bar — Open 7 Days 11am–2am",
    description: "West Chester's premier whiskey bar with the best bourbon & tequila selection in PA. Old West-inspired décor, slow-cooked BBQ, craft beers on tap, and weekly entertainment including Quizzo, Music Bingo, Karaoke, live acoustic music and DJs.",
    address: "151 W Gay St, West Chester, PA 19380",
    scheduleUrl: "https://www.saloon151.com/weekly-specials",
    reserveUrl: "https://www.saloon151.com/",
    color: "#92400e",
    upcomingShows: [
      { date: "Every Monday", event: "🃏 Free Poker Night — sign-ups 7:30pm + Burger Monday", location: "Saloon 151", url: "https://www.saloon151.com/weekly-specials" },
      { date: "Every Tuesday", event: "🧠 Quizzo Game Night 7pm (hosted by DJ)", location: "Saloon 151", url: "https://www.saloon151.com/weekly-specials" },
      { date: "Every Wednesday", event: "🎵 Music Bingo 8pm — 5 rounds, gift card prizes", location: "Saloon 151", url: "https://www.saloon151.com/weekly-specials" },
      { date: "Every Friday", event: "🎧 DJ 10pm–2am + drink specials all night", location: "Tequila Bar", url: "https://www.saloon151.com/weekly-specials" },
      { date: "Every Saturday", event: "🎧 DJ 10pm–2am + $4 Harp Pints all day", location: "Saloon 151", url: "https://www.saloon151.com/weekly-specials" },
      { date: "Every Sunday", event: "🦀 Crab Legs 3–9pm + Live Music + $3 Miller Lites", location: "Saloon 151", url: "https://www.saloon151.com/weekly-specials" },
    ],
  },
  {
    name: "Station 142",
    tag: "Live music Thurs–Sat",
    description: "West Chester's premier live music venue featuring an intimate stage, state-of-the-art sound system, two full bars, rooftop dining, and top local and regional acts.",
    address: "142 E Market St, West Chester, PA 19382",
    scheduleUrl: "https://station142.com/live-music/",
    reserveUrl: "https://station142.com/",
    color: "#1a0a00",
    upcomingShows: [
      { date: "May 10", event: "Mother's Day Brunch — Lauren Benedetti on the Roof", location: "Rooftop", url: "https://station142.com/live-music/" },
      { date: "May 12", event: "Karaoke Night", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 13", event: "Open Mic Night", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 14", event: "Never the Less + DJ JJ Golick", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 15", event: "Shot of Southern + DJ ZYN", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 16", event: "CandiFlyp + DJ Jacky T", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 17", event: "🎉 1 Year Anniversary! Lost In Paris 4–7pm", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 21", event: "Noah Richardson", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 22", event: "Biscotti Boys", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 23", event: "Former Strangers + DJ Teal Tuesday", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 29", event: "Dale Rhose + DJ Corey Curtain", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 30", event: "Lecompt + DJ Salvo", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "May 31", event: "JEXXA Duo — Acoustic on Rooftop 12–3pm", location: "Rooftop", url: "https://station142.com/live-music/" },
      { date: "Jun 5", event: "Bad Hombres", location: "Station 142", url: "https://station142.com/live-music/" },
      { date: "Jun 6", event: "Perfect Strangers (Rooftop) + Basic Cable", location: "Station 142", url: "https://station142.com/live-music/" },
    ],
  },
];

const VENUE_PHOTOS = {
  "Pietro's Prime": [
    { url: "https://static.wixstatic.com/media/c229b4_6991ae3c501a428b957d18cba284bc21~mv2_d_5472_3648_s_4_2.jpg/v1/fill/w_600,h_300,al_c,q_85,usm_0.66_1.00_0.01/c229b4_6991ae3c501a428b957d18cba284bc21~mv2_d_5472_3648_s_4_2.jpg", label: "📸 Outside" },
    { url: "https://static.wixstatic.com/media/4a2f4a_44c12976dbec43eabe684cbba8d5cd17~mv2_d_5758_3844_s_4_2.jpg/v1/fill/w_600,h_300,al_c,q_85,usm_0.66_1.00_0.01/4a2f4a_44c12976dbec43eabe684cbba8d5cd17~mv2_d_5758_3844_s_4_2.jpg", label: "🍸 Bar Area" },
    { url: "https://static.wixstatic.com/media/4a2f4a_9358f8d9bf2c4473bd6c5264f89c26c0~mv2_d_5541_3718_s_4_2.jpg/v1/fill/w_600,h_300,al_c,q_85,usm_0.66_1.00_0.01/4a2f4a_9358f8d9bf2c4473bd6c5264f89c26c0~mv2_d_5541_3718_s_4_2.jpg", label: "🍸 Bar Area" },
  ],
  "Station 142": [
    { url: "https://station142.com/wp-content/uploads/2025/11/station-142-band-on-stage.jpg", label: "📸 Live Stage" },
    { url: "https://station142.com/wp-content/uploads/2025/10/lecompt-copy.jpg", label: "🍸 Bar Area" },
    { url: "https://station142.com/wp-content/uploads/2026/01/image2.png", label: "🍸 Bar Area" },
  ],
  "Saloon 151": [
    { url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=300&fit=crop", label: "📸 Outside" },
    { url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=300&fit=crop", label: "🥃 Whiskey Bar" },
    { url: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&h=300&fit=crop", label: "🍻 Bar Area" },
  ],
};

// ─── Featured Bands ───────────────────────────────────────────────────────────

const FEATURED_BANDS = [
  {
    name: "Lost In Paris",
    tag: "Northeast's Premier Cover Band",
    genre: "Top 40 / Cover Band",
    homebase: "West Chester, PA",
    description: "Four unique musical talents delivering a high-energy show that leaves audiences screaming for more. Playing clubs, casinos, colleges, and private events across the Northeast.",
    website: "https://lipband.com",
    facebook: "https://www.facebook.com/lostinparis",
    instagram: "https://www.instagram.com/lipband/",
    color: "#1a0a00",
    photos: [
      { url: "https://station142.com/wp-content/uploads/2026/04/4B87FABE-4526-4C17-A550-8E29D56EE42A.jpeg", label: "🎤 Lost In Paris Live" },
      { url: "https://lipband.com/wp-content/uploads/2024/04/LIP-logo2-BLKTRN.png", label: "🎸 Band Logo", isBg: true },
      { url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=300&fit=crop", label: "🎶 Live Show" },
    ],
    upcomingShows: [
      { date: "May 13", event: "LIP Duo @ The Starboard", location: "Dewey Beach, DE", url: "https://thestarboard.com/" },
      { date: "May 15", event: "@ Chesapeake Inn", location: "Chesapeake City, MD", url: "https://chesapeakeinn.com/" },
      { date: "May 16", event: "@ Seacrets Beach Stage", location: "Ocean City, MD", url: "https://seacrets.com/" },
      { date: "May 17", event: "@ Station 142 Anniversary", location: "West Chester, PA", url: "https://station142.com" },
      { date: "May 20", event: "@ The Starboard", location: "Dewey Beach, DE", url: "https://thestarboard.com/" },
      { date: "May 22", event: "@ Herndon Rocks", location: "Herndon, VA", url: "https://www.herndonrocks.com" },
      { date: "May 23–24", event: "@ Seacrets", location: "Ocean City, MD", url: "https://seacrets.com/" },
      { date: "May 29", event: "@ The Princeton", location: "Avalon, NJ", url: "https://www.princetonbar.com/" },
      { date: "June 6", event: "@ Nola's Bar, Ocean Casino", location: "Atlantic City, NJ", url: "https://www.theoceanac.com/venues/nolas-bar-lounge/" },
    ],
  },
  {
    name: "Roger That",
    tag: "High Energy 80s–Today Cover Band",
    genre: "Pop / Rock Cover Band",
    homebase: "Philadelphia / Delaware Valley, PA",
    description: "A high-energy, co-fronted full band playing hits from the 80s to today. Male and female lead vocalists bring a dynamic, crowd-pleasing show to bars and venues across the Delaware Valley.",
    website: null,
    facebook: "https://www.facebook.com/RogerThatOfficialBand/",
    instagram: null,
    color: "#2563eb",
    photos: [
      { url: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=600&h=300&fit=crop", label: "🎸 On Stage" },
      { url: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&h=300&fit=crop", label: "🎤 Live Show" },
      { url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=300&fit=crop", label: "🎶 Crowd" },
    ],
    upcomingShows: null,
    facebookNote: "Check their Facebook page for upcoming show dates",
  },
  {
    name: "Hake & Jarema",
    tag: "Acoustic Duo — Classic Hits Since 2000",
    genre: "Acoustic / Classic Rock / Blues",
    homebase: "West Chester, PA",
    description: "Bill Hake and Matt Jarema have been serving up the classic hits of yesteryear since 2000. Their acoustic sets weave through the Allman Brothers, Beatles, Jim Croce, Otis Redding, Van Morrison, Willie Nelson and more — roots music with a soulful original twist.",
    website: "http://www.hakeandjarema.com",
    facebook: "https://www.facebook.com/hakeandjarema/",
    instagram: null,
    color: "#065f46",
    photos: [
      { url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=300&fit=crop", label: "🎸 Bill & Matt" },
      { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop", label: "🎤 Acoustic Set" },
      { url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=300&fit=crop", label: "🎶 Live Show" },
    ],
    upcomingShows: null,
    facebookNote: "Follow their Facebook page for upcoming show dates across Chester County",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const WC_ZIPS = ["19380","19381","19382","19383","west chester","westchester"];
const isWestChester = (q) => q && WC_ZIPS.some(z => q.toLowerCase().includes(z));

const DATE_FILTERS = ["Today", "This Weekend", "Next 7 Days"];
const RADIUS_OPTIONS = [5, 10, 20, 50];
const SEARCH_MODES = ["By Location", "By Band", "By Genre"];

const GENRE_QUICK = [
  "EDM","Acoustic","Jazz","Rock","Country","Blues",
  "R&B","Hip Hop","Folk","Indie","Classical","Reggae",
  "Punk","Metal","Pop","Soul","Funk","Bluegrass",
];

const GENRE_VENUE_KEYWORDS = {
  EDM:"nightclub dance club", Acoustic:"acoustic live music bar cafe",
  Jazz:"jazz club lounge", Rock:"rock bar live music venue",
  Country:"country bar honky tonk", Blues:"blues bar live music",
  "R&B":"R&B lounge bar live music", "Hip Hop":"hip hop nightclub bar",
  Folk:"folk music venue coffee house", Indie:"indie music bar venue",
  Classical:"concert hall symphony orchestra", Reggae:"reggae bar live music",
  Punk:"punk rock bar venue", Metal:"metal rock bar venue",
  Pop:"live music bar venue", Soul:"soul R&B lounge bar",
  Funk:"funk soul bar live music", Bluegrass:"bluegrass folk bar venue",
};

const GENRE_COLORS = {
  Rock:"#e85d04", Jazz:"#1D9E75", Country:"#BA7517", Pop:"#D4537E",
  Blues:"#378ADD", "Cover Band":"#888780", Folk:"#639922", "R&B":"#D85a30",
  Acoustic:"#0F6E56", Indie:"#7F77DD", Classical:"#185FA5", Karaoke:"#9333ea",
  "Open Mic":"#0891b2", EDM:"#9333ea", "Hip Hop":"#D85a30", Reggae:"#1D9E75",
  Punk:"#e85d04", Metal:"#64748b", Soul:"#BA7517", Funk:"#D4537E", Bluegrass:"#639922",
};
const gc = (g) => GENRE_COLORS[g] || "#e85d04";

const LOCATION_PROMPT = `You are a live music event finder. The user provides a location. Find live music events near that specific location only.
Return a JSON array of up to 6 realistic live music events. Each result must have:
- band, venue, date (e.g. "Friday, May 9"), time (e.g. "8:00 PM"), genre, address (full with city/state), tickets ("Check venue website" or "Free"), notes, venueBio (2 sentences), bandBio (2 sentences or ""), confidence ("high" or "medium")
RULES: 1. Only return venues near the EXACT location. Never default to West Chester PA. 2. Do NOT include Pietro's Prime or Station 142. 3. Never return "Unknown".
Return ONLY valid JSON array, nothing else.`;

const BAND_LOOKUP_PROMPT = `You are a music knowledge assistant. The user provides a band/artist name and location. Identify ALL bands or artists that share or closely match that name — including local/regional acts, cover bands, and nationally known artists.
Return a JSON array where each item is a distinct band/artist. Each item must have:
- name, homebase (city/state), genre, description (2 sentences), isLocal (true if near search location), websiteHint (URL or ""), confidence ("high" or "medium")
RULES: 1. Put the most locally-relevant match first. 2. Include both local AND national acts with the same name. 3. If only one act exists, return a single-item array. 4. Never hallucinate show dates — describe the band only.
Return ONLY valid JSON array, nothing else.`;


// ─── Venue Show List (for featured venues with real upcoming shows) ────────────

function VenueShowList({ venue }) {
  const [expanded, setExpanded] = useState(false);
  const shows = venue.upcomingShows || [];
  const preview = shows.slice(0, 3);
  const rest = shows.slice(3);

  return (
    <div style={{ borderTop: "1px solid " + venue.color + "33", paddingTop: 10 }}>

      <p style={{ fontSize: 11, fontWeight: 600, color: venue.color, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        📅 Upcoming Shows
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {(expanded ? shows : preview).map((show, si) => (
          <a key={si} href={show.url} target="_blank" rel="noreferrer"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "#fff", borderRadius: 7, border: "1px solid #e2e8f0", textDecoration: "none", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: venue.color, whiteSpace: "nowrap" }}>{show.date}</span>
              <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{show.event}</span>
            </div>
            <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>→</span>
          </a>
        ))}
      </div>
      {rest.length > 0 && (
        <button onClick={() => setExpanded(!expanded)}
          style={{ marginTop: 6, fontSize: 11, color: venue.color, background: "transparent", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}>
          {expanded ? "▲ Show less" : `▼ +${rest.length} more shows`}
        </button>
      )}
    </div>
  );
}

// ─── Photo Gallery Component ──────────────────────────────────────────────────

function PhotoGallery({ photos, color }) {
  const [active, setActive] = useState(0);
  if (!photos || !photos.length) return null;
  const current = photos[active];
  return (
    <div style={{ marginTop: 12, marginBottom: 4 }}>
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: 6, height: 160, background: current.isBg ? "#111" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {current.isBg
          ? <img src={current.url} alt={current.label} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", padding: 16 }} />
          : <img src={current.url} alt={current.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        }
        <span style={{ position: "absolute", bottom: 8, left: 10, fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(0,0,0,0.55)", color: "#fff", fontWeight: 600 }}>
          {current.label}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {photos.map((p, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ flex: 1, height: 50, borderRadius: 8, overflow: "hidden", padding: 0, border: `2px solid ${active === i ? color : "transparent"}`, cursor: "pointer", background: p.isBg ? "#111" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={p.url} alt={p.label} style={{ width: "100%", height: "100%", objectFit: p.isBg ? "contain" : "cover" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Featured Bands Section ───────────────────────────────────────────────────

function FeaturedBands() {
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#e85d04", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 10px" }}>🎸 Featured Local Bands</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {FEATURED_BANDS.map((band, i) => (
          <div key={i} style={{ flex: "1 1 280px", background: `linear-gradient(135deg,${band.color}18,${band.color}06)`, border: `1.5px solid ${band.color}44`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 2px", color: "#0f172a" }}>{band.name}</p>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: band.color + "22", color: band.color, fontWeight: 600 }}>{band.tag}</span>
              </div>
            </div>

            <PhotoGallery photos={band.photos} color={band.color} />

            <p style={{ fontSize: 12, color: "#64748b", margin: "10px 0 4px", lineHeight: 1.5 }}>{band.description}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 10px" }}>📍 {band.homebase} &nbsp;•&nbsp; 🎵 {band.genre}</p>

            {/* Social / website links */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {band.website && (
                <a href={band.website} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: band.color, color: "#fff", textDecoration: "none", fontWeight: 500 }}>
                  🌐 Website
                </a>
              )}
              {band.facebook && (
                <a href={band.facebook} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#1877f2", color: "#fff", textDecoration: "none", fontWeight: 500 }}>
                  👍 Facebook
                </a>
              )}
              {band.instagram && (
                <a href={band.instagram} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#c026d3", color: "#fff", textDecoration: "none", fontWeight: 500 }}>
                  📸 Instagram
                </a>
              )}
            </div>

            {/* Upcoming shows */}
            {band.upcomingShows ? (
              <>
                <button onClick={() => toggleExpand(i)}
                  style={{ fontSize: 12, color: band.color, background: "transparent", border: `1px solid ${band.color}44`, borderRadius: 99, padding: "5px 14px", cursor: "pointer", fontWeight: 500, marginBottom: 8 }}>
                  {expanded[i] ? "▲ Hide Shows" : `▼ Upcoming Shows (${band.upcomingShows.length})`}
                </button>
                {expanded[i] && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {band.upcomingShows.map((show, si) => (
                      <a key={si} href={show.url} target="_blank" rel="noreferrer"
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", textDecoration: "none", gap: 8 }}>
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: band.color, marginRight: 6 }}>{show.date}</span>
                          <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 500 }}>{show.event}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>📍 {show.location}</span>
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#64748b" }}>
                📅 {band.facebookNote}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Band Disambiguation Picker ───────────────────────────────────────────────

function BandPicker({ bands, loading, onSelect }) {
  if (loading) return (
    <div style={{ textAlign: "center", padding: "2rem 0", color: "#64748b" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🎸</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>Looking up bands with that name…</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Checking local & national acts</div>
    </div>
  );
  if (!bands || !bands.length) return null;
  if (bands.length === 1) { setTimeout(() => onSelect(bands[0]), 0); return null; }
  return (
    <div style={{ padding: "0 0 1rem" }}>
      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", color: "#0369a1" }}>🎸 Found {bands.length} acts with that name</p>
        <p style={{ fontSize: 12, color: "#0284c7", margin: 0 }}>Select the one you're looking for:</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bands.map((b, i) => (
          <button key={i} onClick={() => onSelect(b)}
            style={{ textAlign: "left", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#e85d04"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 2px", color: "#0f172a" }}>{b.name}</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>📍 {b.homebase} &nbsp;•&nbsp; 🎵 {b.genre}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {b.isLocal && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>📍 Local Act</span>}
                {b.confidence === "medium" && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#fef9c3", color: "#854d0e", fontWeight: 600 }}>⚠️ Inferred</span>}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{b.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Band Results Panel ───────────────────────────────────────────────────────

function BandResultsPanel({ band, location, radius, bandVenues, bandVenuesLoading, bandVenuesError, bandScanningVenue, bandScannedVenues, onFindVenues, onScrape, onChangeBand }) {
  const enc = encodeURIComponent(band.name);
  const [aiShows, setAiShows]       = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);

  const fetchAiShows = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You are a live music expert. Given a band/artist name and location, return their upcoming shows or typical recurring venues near that location. Return ONLY a JSON array of up to 6 shows: [{ venue, address, date, time, notes, confidence: 'high'|'medium' }]. Only include shows you know with reasonable confidence. Return [] if unknown. ONLY valid JSON.",
          messages: [{ role: "user", content: `Upcoming shows for "${band.name}" (${band.genre}, based in ${band.homebase}) near ${location} within ${radius} miles. What venues do they typically play and are there any known upcoming dates?` }],
        }),
      });
      const data = await res.json();
      const block = data.content?.find(b => b.type === "text");
      if (block) {
        const match = block.text.trim().replace(/```json|```/g,"").trim().match(/\[[\s\S]*\]/);
        setAiShows(match ? JSON.parse(match[0]) : []);
      }
    } catch { setAiShows([]); }
    finally { setAiLoading(false); }
  };

  // Build real source links — show band website prominently if known
  const hasWebsite = band.websiteHint && band.websiteHint.startsWith("http");
  const links = [
    { label: "🎵 Songkick",     href: `https://www.songkick.com/search?query=${enc}`,                          bg: "#f97316" },
    { label: "🎸 Bandsintown",  href: `https://www.bandsintown.com/search?query=${enc}`,                       bg: "#16a34a" },
    { label: "🎟 Ticketmaster", href: `https://www.ticketmaster.com/search?q=${enc}`,                          bg: "#2563eb" },
    { label: "👍 Facebook",     href: `https://www.facebook.com/search/events/?q=${enc}`,                     bg: "#1877f2" },
    { label: "📸 Instagram",    href: `https://www.instagram.com/explore/search/keyword/?q=${enc}`,            bg: "#c026d3" },
    { label: "▶️ YouTube",      href: `https://www.youtube.com/results?search_query=${enc}+live`,              bg: "#dc2626" },
    { label: "🔍 Google",       href: `https://www.google.com/search?q=${enc}+upcoming+shows+2026`,           bg: "#374151" },
  ];

  return (
    <div style={{ padding: "0 0 1.5rem" }}>

      {/* Band card header */}
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 2px", color: "#0f172a" }}>🎸 {band.name}</p>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 6px" }}>📍 {band.homebase} &nbsp;•&nbsp; 🎵 {band.genre}</p>
        <p style={{ fontSize: 12, color: "#374151", margin: "0 0 10px", lineHeight: 1.5 }}>{band.description}</p>
        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {hasWebsite && (
            <a href={band.websiteHint} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, padding: "6px 14px", borderRadius: 99, background: "#0f172a", color: "#fff", textDecoration: "none", fontWeight: 600 }}>
              🌐 Their Website
            </a>
          )}
          {!hasWebsite && (
            <a href={`https://www.google.com/search?q=${enc}+band+official+website`} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, padding: "6px 14px", borderRadius: 99, background: "#f1f5f9", color: "#374151", textDecoration: "none", border: "1px solid #e2e8f0" }}>
              🔍 Find Their Website
            </a>
          )}
          <button onClick={onChangeBand}
            style={{ fontSize: 12, padding: "6px 14px", borderRadius: 99, background: "transparent", border: "1px solid #bbf7d0", color: "#16a34a", cursor: "pointer" }}>
            ← Wrong band?
          </button>
        </div>
      </div>

      {/* AI show suggestions */}
      <div style={{ marginBottom: 16 }}>
        {aiShows === null && !aiLoading && (
          <button onClick={fetchAiShows}
            style={{ fontSize: 12, padding: "7px 16px", borderRadius: 99, background: "#7c3aed22", color: "#7c3aed", border: "1px solid #7c3aed44", cursor: "pointer", fontWeight: 600 }}>
            🤖 AI: Find likely upcoming shows
          </button>
        )}
        {aiLoading && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>🤖 Looking for upcoming shows…</p>}
        {aiShows !== null && aiShows.length > 0 && (
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", margin: 0 }}>🤖 AI: Likely upcoming shows for {band.name}</p>
              <span style={{ fontSize: 10, background: "#fef9c3", color: "#854d0e", padding: "1px 6px", borderRadius: 99 }}>⚠️ Unverified</span>
            </div>
            {aiShows.map((show, si) => (
              <div key={si} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #e9d5ff", borderLeft: "3px solid #7c3aed" }}>
                <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px", color: "#0f172a" }}>{show.venue}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 11, color: "#64748b" }}>
                  {show.date && <span>📅 {show.date}</span>}
                  {show.time && <span>🕐 {show.time}</span>}
                  {show.address && <span>📍 {show.address}</span>}
                  {show.notes && <span>ℹ️ {show.notes}</span>}
                </div>
                {show.confidence === "medium" && (
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: "#fef9c3", color: "#854d0e", fontWeight: 600, marginTop: 4, display: "inline-block" }}>⚠️ Unverified</span>
                )}
              </div>
            ))}
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "6px 0 0" }}>Verify before heading out — tap "Scan Site" on venues below or check their website</p>
          </div>
        )}
        {aiShows !== null && aiShows.length === 0 && (
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0" }}>No upcoming shows found by AI — use the source links below to find their real schedule.</p>
        )}
      </div>

      <div style={{ background: "#fff8f0", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#92400e" }}>
        ⚠️ Always verify AI results — check their website or social pages for the real schedule.
      </div>
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px" }}>🍺 Nearby Venues Near {location}</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 10px" }}>Find live music venues within {radius} mi — scan their sites to check if <strong>{band.name}</strong> is on the schedule.</p>
        <button onClick={onFindVenues} disabled={bandVenuesLoading}
          style={{ fontSize: 12, padding: "7px 16px", borderRadius: 99, background: bandVenuesLoading ? "#e2e8f0" : "#e85d04", color: bandVenuesLoading ? "#94a3b8" : "#fff", border: "none", cursor: bandVenuesLoading ? "default" : "pointer", fontWeight: 600, marginBottom: 12 }}>
          {bandVenuesLoading ? "🔍 Searching…" : `🔍 Find Venues Near ${location}`}
        </button>
        {bandVenuesError && <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 8 }}>{bandVenuesError}</div>}
        {bandVenues !== null && !bandVenuesLoading && (
          bandVenues.length === 0
            ? <p style={{ fontSize: 13, color: "#64748b" }}>No venues found. Try expanding the radius.</p>
            : <>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 10px" }}>{bandVenues.length} venues found • Tap "Scan Site" to check schedules</p>
                {bandVenues.map((v, vi) => {
                  const sc = v.musicScore === "high" ? "#16a34a" : v.musicScore === "medium" ? "#d97706" : "#94a3b8";
                  const sl = v.musicScore === "high" ? "🎵 Likely has music" : v.musicScore === "medium" ? "🎲 Possible music" : "🍽 Unknown";
                  const isScanning = bandScanningVenue === v.website;
                  const scanned = bandScannedVenues[v.website];
                  return (
                    <div key={vi} style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: "1px solid #e2e8f0", borderLeft: `4px solid ${sc}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#0f172a" }}>{v.name}</p>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: sc + "22", color: sc, fontWeight: 600 }}>{sl}</span>
                        {v.isOpen === true  && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>Open Now</span>}
                        {v.isOpen === false && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: "#dc2626", fontWeight: 600 }}>Closed</span>}
                      </div>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }}>📍 {v.address}</p>
                      {v.rating && <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }}>⭐ {v.rating} ({v.totalRatings?.toLocaleString()} reviews)</p>}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {v.website && (
                          <button onClick={() => onScrape(v.website)} disabled={isScanning}
                            style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: isScanning ? "#e2e8f0" : "#e85d04", color: isScanning ? "#94a3b8" : "#fff", border: "none", cursor: isScanning ? "default" : "pointer", fontWeight: 500 }}>
                            {isScanning ? "🎵 Finding…" : "🎵 Find Events"}
                          </button>
                        )}
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(band.name + " " + v.name)}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#64748b", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>
                          🔍 Search {band.name} here
                        </a>
                        {v.website  && <a href={v.website}  target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#64748b", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>🌐 Website</a>}
                        {v.facebook && <a href={v.facebook} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#1d4ed8", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>👍 Facebook</a>}
                      </div>
                      {scanned !== undefined && (
                        <div style={{ marginTop: 10 }}>
                          {scanned.length === 0
                            ? <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No events found on this site.</p>
                            : <>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", margin: "0 0 6px" }}>✓ Events found — check if {band.name} is listed:</p>
                                {scanned.map((e, ei) => (
                                  <div key={ei} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #e2e8f0", borderLeft: "3px solid #e85d04" }}>
                                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", color: "#0f172a" }}>{e.band}</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12, color: "#64748b" }}>
                                      {e.date && <span>📅 {e.date}</span>}
                                      {e.time && <span>🕐 {e.time}</span>}
                                      {e.notes && <span>ℹ️ {e.notes}</span>}
                                    </div>
                                  </div>
                                ))}
                              </>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
        )}
      </div>
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginTop: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>🔗 Find them on these sources</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {links.map((l, i) => (
            <a key={i} href={l.href} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 14px", borderRadius: 12, background: l.bg, color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Genre Venue Finder ───────────────────────────────────────────────────────

function GenreVenueFinder({ genre, location, radius, onFindVenues, localVenues, localLoading, localError, scanningVenue, scannedVenues, onScrape }) {
  const enc = encodeURIComponent(genre);
  const locEnc = encodeURIComponent(location);
  return (
    <div style={{ padding: "0 0 1.5rem" }}>
      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", color: "#0369a1" }}>🎶 Finding <em>{genre}</em> near <em>{location}</em></p>
        <p style={{ fontSize: 12, color: "#0284c7", margin: "0 0 10px" }}>Find bars and venues nearby that host {genre} music. Scan their sites for real event listings.</p>
        <button onClick={onFindVenues} disabled={localLoading}
          style={{ fontSize: 12, padding: "7px 16px", borderRadius: 99, background: localLoading ? "#e2e8f0" : "#0369a1", color: localLoading ? "#94a3b8" : "#fff", border: "none", cursor: localLoading ? "default" : "pointer", fontWeight: 600 }}>
          {localLoading ? "🔍 Searching…" : `🔍 Find ${genre} Venues Near Me`}
        </button>
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>🔗 Search directly</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "🎵 Songkick",        href: `https://www.songkick.com/search?query=${enc}+${locEnc}`,                                    bg: "#f97316" },
          { label: "🎸 Bandsintown",     href: `https://www.bandsintown.com/search?query=${enc}`,                                           bg: "#16a34a" },
          { label: "📅 Facebook Events", href: `https://www.facebook.com/events/search/?q=${enc}+${locEnc}`,                               bg: "#1877f2" },
          { label: "🔍 Google",          href: `https://www.google.com/search?q=${enc}+live+music+near+${locEnc}+this+weekend`,            bg: "#374151" },
        ].map((l, i) => (
          <a key={i} href={l.href} target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderRadius: 12, background: l.bg, color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
            {l.label}
          </a>
        ))}
      </div>
      {localError && <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 8 }}>{localError}</div>}
      {localVenues !== null && !localLoading && (
        localVenues.length === 0
          ? <p style={{ fontSize: 13, color: "#64748b" }}>No venues found. Try expanding the radius.</p>
          : <>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>🍺 Nearby {genre} venues</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 10px" }}>{localVenues.length} venues • Tap "Scan Site" for real listings</p>
              {localVenues.map((v, vi) => {
                const sc = v.musicScore === "high" ? "#16a34a" : v.musicScore === "medium" ? "#d97706" : "#94a3b8";
                const sl = v.musicScore === "high" ? "🎵 Likely has music" : v.musicScore === "medium" ? "🎲 Possible" : "🍽 Unknown";
                const isScanning = scanningVenue === v.website;
                const scanned = scannedVenues[v.website];
                return (
                  <div key={vi} style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: "1px solid #e2e8f0", borderLeft: `4px solid ${sc}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#0f172a" }}>{v.name}</p>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: sc + "22", color: sc, fontWeight: 600 }}>{sl}</span>
                      {v.isOpen === true  && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>Open Now</span>}
                      {v.isOpen === false && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: "#dc2626", fontWeight: 600 }}>Closed</span>}
                    </div>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px" }}>📍 {v.address}</p>
                    {v.rating && <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }}>⭐ {v.rating} ({v.totalRatings?.toLocaleString()} reviews)</p>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {v.website && (
                        <button onClick={() => onScrape(v.website)} disabled={isScanning}
                          style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: isScanning ? "#e2e8f0" : "#e85d04", color: isScanning ? "#94a3b8" : "#fff", border: "none", cursor: isScanning ? "default" : "pointer", fontWeight: 500 }}>
                          {isScanning ? "🎵 Finding…" : "🎵 Find Events"}
                        </button>
                      )}

                      {v.website   && <a href={v.website}   target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#64748b", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>🌐 Website</a>}
                      {v.instagram && <a href={v.instagram} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#c026d3", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>📸 Instagram</a>}
                      {v.facebook  && <a href={v.facebook}  target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#1d4ed8", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>👍 Facebook</a>}
                    </div>
                    {scanned !== undefined && (
                      <div style={{ marginTop: 10 }}>
                        {scanned.length === 0
                          ? <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No event pages found on this site.</p>
                          : <>
                              <p style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", margin: "0 0 6px" }}>✓ Events found:</p>
                              {scanned.map((e, ei) => (
                                <div key={ei} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #e2e8f0", borderLeft: "3px solid #e85d04" }}>
                                  <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", color: "#0f172a" }}>{e.band}</p>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12, color: "#64748b" }}>
                                    {e.date && <span>📅 {e.date}</span>}
                                    {e.time && <span>🕐 {e.time}</span>}
                                    {e.notes && <span>ℹ️ {e.notes}</span>}
                                  </div>
                                </div>
                              ))}
                            </>
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────



// ─── Community Panel (Ratings + URL Contributions) ───────────────────────────

function CommunityPanel({ venue, onClose }) {
  const key = (venue.website || venue.name).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [rating, setRating]     = useState(0);
  const [hover, setHover]       = useState(0);
  const [note, setNote]         = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState("");

  // Load existing community data on open
  useState(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/community?key=" + encodeURIComponent(key));
        const d = await res.json();
        setData(d || { ratings: [], eventUrl: null });
      } catch { setData({ ratings: [], eventUrl: null }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const submitRating = async () => {
    if (!rating) return;
    setSaving(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: "rate", rating, note: note.trim() }),
      });
      const d = await res.json();
      setData(d);
      setRating(0); setNote(""); setSaved("Rating saved! Thanks!");
      setTimeout(() => setSaved(""), 3000);
    } catch { setSaved("Error saving — try again."); }
    finally { setSaving(false); }
  };

  const submitUrl = async () => {
    const u = urlInput.trim();
    if (!u || !u.startsWith("http")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: "addUrl", url: u, venueName: venue.name }),
      });
      const d = await res.json();
      setData(d);
      setUrlInput(""); setSaved("URL saved! Thanks for contributing!");
      setTimeout(() => setSaved(""), 3000);
    } catch { setSaved("Error saving — try again."); }
    finally { setSaving(false); }
  };

  const avgRating = data?.ratings?.length
    ? (data.ratings.reduce((s, r) => s + r.rating, 0) / data.ratings.length).toFixed(1)
    : null;

  return (
    <div style={{ marginTop: 10, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0f172a", color: "#fff" }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>⭐ Community — {venue.name}</span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {loading ? (
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Loading community data…</p>
        ) : (
          <>
            {/* Community stats */}
            {data?.ratings?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{avgRating}</span>
                  <div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: 16, color: s <= Math.round(avgRating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.ratings.length} community rating{data.ratings.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {data.ratings.slice(-3).reverse().map((r, i) => (
                  <div key={i} style={{ borderTop: "1px solid #f1f5f9", paddingTop: 6, marginTop: 6 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 12, color: s <= r.rating ? "#f59e0b" : "#e2e8f0" }}>★</span>)}
                    </div>
                    {r.note && <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.4 }}>{r.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Community event URL */}
            {data?.eventUrl && (
              <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: "1px solid #bbf7d0" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", margin: "0 0 4px" }}>🔗 Community-contributed events page:</p>
                <a href={data.eventUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: "#0369a1", wordBreak: "break-all" }}>{data.eventUrl}</a>
              </div>
            )}

            {/* Rate this venue */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>⭐ Rate your experience here:</p>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(s)}
                    style={{ fontSize: 28, background: "transparent", border: "none", cursor: "pointer", color: s <= (hover || rating) ? "#f59e0b" : "#e2e8f0", padding: "0 2px", lineHeight: 1 }}>
                    ★
                  </button>
                ))}
                {rating > 0 && <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center", marginLeft: 4 }}>{"★".repeat(rating)} ({rating}/5)</span>}
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional: describe the music, vibe, crowd… (max 200 chars)"
                maxLength={200}
                rows={2}
                style={{ width: "100%", fontSize: 12, borderRadius: 8, padding: "8px 10px", border: "1px solid #e2e8f0", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "system-ui" }}
              />
              <button onClick={submitRating} disabled={!rating || saving}
                style={{ marginTop: 6, fontSize: 12, padding: "7px 16px", borderRadius: 99, background: rating && !saving ? "#0f172a" : "#e2e8f0", color: rating && !saving ? "#fff" : "#94a3b8", border: "none", cursor: rating && !saving ? "pointer" : "default", fontWeight: 600 }}>
                {saving ? "Saving…" : "Submit Rating"}
              </button>
            </div>

            {/* Add entertainment URL */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>🔗 Know their events page URL?</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 8px" }}>Help others find their schedule — paste the direct link to their entertainment/events page.</p>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://venue.com/events"
                  style={{ flex: 1, fontSize: 12, borderRadius: 8, padding: "7px 10px", border: "1px solid #e2e8f0", outline: "none" }}
                />
                <button onClick={submitUrl} disabled={!urlInput.trim().startsWith("http") || saving}
                  style={{ fontSize: 12, padding: "0 14px", borderRadius: 8, background: urlInput.trim().startsWith("http") && !saving ? "#e85d04" : "#e2e8f0", color: urlInput.trim().startsWith("http") && !saving ? "#fff" : "#94a3b8", border: "none", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {saving ? "…" : "Add URL"}
                </button>
              </div>
            </div>

            {saved && <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, margin: "10px 0 0" }}>{saved}</p>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Venue Chatbot Component ──────────────────────────────────────────────────

function VenueChatbot({ venue, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I can answer questions about **${venue.name}**. Ask me about the food, vibe, music, hours, parking — anything!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useState(null);

  const systemPrompt = `You are a helpful assistant that knows about the venue "${venue.name}" located at ${venue.address}.
${venue.summary ? `Google describes it as: "${venue.summary}"` : ""}
${venue.rating ? `It has a ${venue.rating} star rating with ${venue.totalRatings} reviews.` : ""}
${venue.musicScore === "high" ? "This venue is known to host live music." : venue.musicScore === "medium" ? "This venue may host live music occasionally." : ""}
Answer questions about this venue helpfully and conversationally. If you don't know something specific, say so and suggest they check the venue's website or call ahead. Keep answers concise — 2-4 sentences max.`;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const block = data.content?.find(b => b.type === "text");
      const reply = block?.text || "Sorry, I couldn't get an answer. Try checking their website!";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Try again!" }]);
    }
    finally { setLoading(false); }
  };

  const QUICK_QUESTIONS = ["What's the vibe like?", "What's on the menu?", "Is there a cover charge?", "What music do they feature?", "Best night to visit?", "Is parking easy?"];

  return (
    <div style={{ marginTop: 10, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#e85d04", color: "#fff" }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>🏠 About {venue.name}</span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ padding: "12px 14px", maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "#e85d04" : "#fff",
            color: m.role === "user" ? "#fff" : "#0f172a",
            border: m.role === "assistant" ? "1px solid #e2e8f0" : "none",
            borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            padding: "8px 12px", fontSize: 13, lineHeight: 1.5, maxWidth: "85%",
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px 12px 12px 2px", padding: "8px 12px", fontSize: 13, color: "#94a3b8" }}>
            ✦ Thinking…
          </div>
        )}
      </div>

      {/* Quick questions */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 14px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => { setInput(q); }}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b", cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything about this venue…"
          style={{ flex: 1, fontSize: 13, borderRadius: 8, padding: "7px 10px", border: "1px solid #e2e8f0", outline: "none" }}
        />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ padding: "0 14px", borderRadius: 8, border: "none", background: input.trim() && !loading ? "#e85d04" : "#e2e8f0", color: input.trim() && !loading ? "#fff" : "#94a3b8", cursor: input.trim() && !loading ? "pointer" : "default", fontWeight: 600, fontSize: 13 }}>
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [searchMode, setSearchMode]     = useState("By Location");

  // Location
  const [query, setQuery]               = useState("");
  const [dateFilter, setDateFilter]     = useState("Next 7 Days");
  const [radius, setRadius]             = useState(10);
  const [results, setResults]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [locating, setLocating]         = useState(false);
  const [error, setError]               = useState("");
  const [searched, setSearched]         = useState("");
  const [expanded, setExpanded]         = useState(null);
  const [showFeatured, setShowFeatured] = useState(false);
  const [localVenues, setLocalVenues]   = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError]     = useState("");
  const [scanningVenue, setScanningVenue]   = useState(null);
  const [scannedVenues, setScannedVenues]   = useState({});
  const [aiSuggestions, setAiSuggestions]   = useState({});   // url → {loading, performers}
  const [suggestingVenue, setSuggestingVenue] = useState(null);
  const [happyHours, setHappyHours]           = useState({});  // url → {loading, data}
  const [fetchingHH, setFetchingHH]           = useState(null);
  const [openChatVenue, setOpenChatVenue]     = useState(null); // venue key with chat open
  const [openCommunityVenue, setOpenCommunityVenue] = useState(null); // venue key with community panel open

  // Band
  const [bandName, setBandName]               = useState("");
  const [bandLocation, setBandLocation]       = useState("");
  const [bandLookupLoading, setBandLookupLoading] = useState(false);
  const [bandMatches, setBandMatches]         = useState(null);
  const [selectedBand, setSelectedBand]       = useState(null);
  const [bandVenues, setBandVenues]           = useState(null);
  const [bandVenuesLoading, setBandVenuesLoading] = useState(false);
  const [bandVenuesError, setBandVenuesError] = useState("");
  const [bandScanningVenue, setBandScanningVenue] = useState(null);
  const [bandScannedVenues, setBandScannedVenues] = useState({});

  // Genre
  const [genreQuery, setGenreQuery]         = useState("");
  const [genreLocation, setGenreLocation]   = useState("");
  const [genreSearched, setGenreSearched]   = useState(false);
  const [genreVenues, setGenreVenues]       = useState(null);
  const [genreLoading, setGenreLoading]     = useState(false);
  const [genreError, setGenreError]         = useState("");
  const [genreScanningVenue, setGenreScanningVenue] = useState(null);
  const [genreScannedVenues, setGenreScannedVenues] = useState({});

  const QUICK = ["19382 (West Chester)", "Sea Isle, NJ", "Kennett Square, PA", "Malvern, PA", "Phoenixville, PA", "Pocono Lake, PA"];
  const isLocationMode = searchMode === "By Location";
  const isBandMode     = searchMode === "By Band";
  const isGenreMode    = searchMode === "By Genre";

  const getDateRange = (f) => {
    const today = new Date();
    const day = today.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
    if (f === "Today") return `today only, ${day}`;
    if (f === "This Weekend") return `this weekend (Saturday and Sunday)`;
    return `the next 7 days starting ${day}`;
  };

  const callAPI = async (system, userMsg) => {
    const res = await fetch("/api/search", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({system, messages:[{role:"user",content:userMsg}]}) });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const block = data.content?.find(b => b.type==="text");
    if (!block) throw new Error("No response received.");
    const match = block.text.trim().replace(/```json|```/g,"").trim().match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Could not parse response.");
    return JSON.parse(match[0]);
  };

  const scrapeVenue = async (url, setScanning, setScanned, venueName, venueAddress) => {
    setScanning(url);
    try {
      const res = await fetch("/api/scrape", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url, venueName, venueAddress})});
      const data = await res.json();
      // Store full result including fallback links and JS detection
      setScanned(prev => ({...prev,[url]: data.error ? { events:[], error: data.error.message } : { events: data.events||[], fallbackLinks: data.fallbackLinks, isJsRendered: data.isJsRendered }}));
    } catch(e) { setScanned(prev=>({...prev,[url]:{ events:[], error: e.message }})); }
    finally { setScanning(null); }
  };

  const suggestSchedule = async (venue) => {
    const key = venue.website || venue.name;
    if (aiSuggestions[key] || suggestingVenue === key) return;
    setSuggestingVenue(key);
    setAiSuggestions(prev => ({ ...prev, [key]: { loading: true, schedule: [] } }));
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
system: "You are a local entertainment expert with deep knowledge of bars and venues. Return the KNOWN upcoming shows and weekly entertainment schedule for the given venue. Use your specific knowledge — examples: Station 142 West Chester PA (142 E Market St): Tuesday Karaoke 8pm-12am ($50 gift card to best performer), Wednesday open, Thursday Open Mic Night 7-11pm, Friday-Saturday live bands 9pm (acts include Shot of Southern, CandiFlyp, Lecompt, Biscotti Boys, Never the Less, Bad Hombres, Basic Cable, Former Strangers), Sunday open. Kildares Irish Pub West Chester PA: Monday Quizzo 9-11pm, Wednesday Pub Pong 10pm-2am, Thursday Name That Tune 8-10pm + Karaoke 10pm-2am, Friday DJs 10pm-2am (first Friday Dueling Pianos 7-10pm), Saturday DJs 10pm-2am, Sunday Karaoke with Brian Aglira 10pm-2am. Saloon 151 West Chester PA: live acoustic music, poker nights, quizzo, music bingo, karaoke, DJs throughout the week. Pietro's Prime West Chester PA: live entertainment Wednesday-Saturday nights. Slow Hand WC: regular live music and events, check slowhand-wc.com/events. VK Brewing Co & Eatery Exton PA (693 Lincoln Hwy): Tuesday 6:30pm alternating Trivia (hosted by Seamus) and Music Bingo (hosted by DJ Bill) with prizes, Friday live music 6-9pm, Saturday live music 6-9pm. Closed Mondays. For any venue you know, return both recurring weekly events AND any known upcoming specific acts/dates. Include ALL types of entertainment: live music, open mic, karaoke, trivia, music bingo, quizzo, poker nights, line dancing, dueling pianos, piano bar, DJ nights, country nights, dance nights, comedy, themed events. Return ONLY a JSON array: [{ day, event, time, notes }]. Return [] only if you truly have no knowledge of this specific venue. ONLY valid JSON.",
          messages: [{ role: "user", content: "Weekly entertainment schedule for: " + venue.name + " at " + venue.address }],
        }),
      });
      const data = await res.json();
      const block = data.content?.find(b => b.type === "text");
      if (block) {
        const cleaned = block.text.trim().replace(/```json|```/g, "").trim();
        const match = cleaned.match(/\[[\s\S]*\]/);
        const schedule = match ? JSON.parse(match[0]) : [];
        setAiSuggestions(prev => ({ ...prev, [key]: { loading: false, schedule } }));
      }
    } catch { setAiSuggestions(prev => ({ ...prev, [key]: { loading: false, schedule: [] } })); }
    finally { setSuggestingVenue(null); }
  };

  const fetchHappyHour = async (venue) => {
    const key = venue.website || venue.name;
    if (happyHours[key] || fetchingHH === key) return;
    setFetchingHH(key);
    setHappyHours(prev => ({ ...prev, [key]: { loading: true, data: null } }));
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You are a local bar and restaurant expert. Given a venue name and address, return their happy hour details ONLY if you know them with HIGH CONFIDENCE from your training data. Do not guess or make up specials. Return a JSON object: { hasHappyHour: true/false, days: string, hours: string, deals: string (pipe-separated list of deals), confidence: high/low }. If you are not highly confident, return { hasHappyHour: false, confidence: low }. Return ONLY valid JSON.",
          messages: [{ role: "user", content: "What are the happy hour specials for " + venue.name + " at " + venue.address + "? Only return details you know with high confidence." }],
        }),
      });
      const data = await res.json();
      const block = data.content?.find(b => b.type === "text");
      if (block) {
        const cleaned = block.text.trim().replace(/```json|```/g, "").trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        const result = match ? JSON.parse(match[0]) : { hasHappyHour: false, confidence: "low" };
        setHappyHours(prev => ({ ...prev, [key]: { loading: false, data: result } }));
      }
    } catch { setHappyHours(prev => ({ ...prev, [key]: { loading: false, data: { hasHappyHour: false } } })); }
    finally { setFetchingHH(null); }
  };

  const findLocalVenues = async (loc) => {
    setLocalLoading(true); setLocalError(""); setLocalVenues(null);
    try {
      const res = await fetch("/api/venues",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:loc,radius})});
      const data = await res.json();
      if (data.error) { setLocalError(`Error: ${data.error.message}`); return; }
      setLocalVenues(data.venues);
    } catch(e) { setLocalError(`Error: ${e.message}`); }
    finally { setLocalLoading(false); }
  };

  const searchByLocation = async (q) => {
    const sq=(q||query).trim(); if(!sq) return;
    const wc=isWestChester(sq);
    setLoading(true); setError(""); setResults(null); setSearched(sq); setExpanded(null);
    setLocalVenues(null); setLocalError(""); setScannedVenues({}); setShowFeatured(wc);
    findLocalVenues(sq);
    if(wc){setResults([]);setLoading(false);return;}
    try { setResults(await callAPI(LOCATION_PROMPT,`Find live music events near: "${sq}" within ${radius} miles, for ${getDateRange(dateFilter)}.`)); }
    catch(e){setError(`Error: ${e.message}`);}
    finally{setLoading(false);}
  };

  const useLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async({coords:{latitude:lat,longitude:lng}})=>{
        try{
          const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data=await res.json(); const a=data.address;
          const loc=`${a.city||a.town||a.village||a.county}, ${a.state}`;
          setQuery(loc);setLocating(false);searchByLocation(loc);
        }catch{setLocating(false);}
      },
      ()=>{setError("Location access denied.");setLocating(false);}
    );
  };

  const lookupBand = async () => {
    const name=bandName.trim(); const loc=bandLocation.trim();
    if(!name||!loc) return;
    setBandLookupLoading(true); setBandMatches(null); setSelectedBand(null); setBandVenues(null); setBandScannedVenues({});
    try { setBandMatches(await callAPI(BAND_LOOKUP_PROMPT,`Find all bands/artists named: "${name}". Location context: "${loc}" within ${radius} miles. Prioritize local/regional acts near that location.`)); }
    catch { setBandMatches([]); }
    finally { setBandLookupLoading(false); }
  };

  const findBandVenues = async () => {
    setBandVenuesLoading(true); setBandVenuesError(""); setBandVenues(null); setBandScannedVenues({});
    try {
      const res=await fetch("/api/venues",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:bandLocation.trim(),radius})});
      const data=await res.json();
      if(data.error){setBandVenuesError(`Error: ${data.error.message}`);return;}
      setBandVenues(data.venues);
    } catch(e){setBandVenuesError(`Error: ${e.message}`);}
    finally{setBandVenuesLoading(false);}
  };

  const findGenreVenues = async () => {
    setGenreLoading(true); setGenreError(""); setGenreVenues(null); setGenreScannedVenues({});
    try {
      const res=await fetch("/api/venues",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:genreLocation.trim(),radius,keywords:GENRE_VENUE_KEYWORDS[genreQuery]||"live music"})});
      const data=await res.json();
      if(data.error){setGenreError(`Error: ${data.error.message}`);return;}
      setGenreVenues(data.venues);
    } catch(e){setGenreError(`Error: ${e.message}`);}
    finally{setGenreLoading(false);}
  };

  const s = {
    wrap:      {fontFamily:"system-ui,sans-serif",maxWidth:700,margin:"0 auto",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.12)"},
    body:      {background:"#fff",padding:"1.25rem 1.5rem 0"},
    row:       {display:"flex",gap:8,marginBottom:8},
    input:     {flex:1,fontSize:15,borderRadius:10,padding:"10px 14px",border:"1px solid #e2e8f0",outline:"none"},
    inputSm:   {flex:1,fontSize:14,borderRadius:10,padding:"9px 12px",border:"1px solid #e2e8f0",outline:"none"},
    btnLoc:    {padding:"0 14px",fontSize:18,borderRadius:10,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer"},
    btnSearch: (d)=>({padding:"0 18px",fontSize:15,fontWeight:500,borderRadius:10,border:"none",background:d?"#e2e8f0":"#e85d04",color:d?"#94a3b8":"#fff",cursor:d?"default":"pointer"}),
    modeBtn:   (on)=>({fontSize:12,padding:"6px 14px",borderRadius:99,border:`1.5px solid ${on?"#e85d04":"#e2e8f0"}`,background:on?"#e85d04":"transparent",color:on?"#fff":"#64748b",cursor:"pointer",fontWeight:on?600:400,whiteSpace:"nowrap"}),
    filterBtn: (on)=>({fontSize:12,padding:"5px 14px",borderRadius:99,border:`1.5px solid ${on?"#e85d04":"#e2e8f0"}`,background:on?"#e85d04":"transparent",color:on?"#fff":"#64748b",cursor:"pointer",fontWeight:on?600:400}),
    quickBtn:  {fontSize:11,padding:"4px 12px",borderRadius:99,border:"0.5px solid #e85d04",color:"#e85d04",background:"transparent",cursor:"pointer"},
    genreChip: (on)=>({fontSize:11,padding:"4px 12px",borderRadius:99,border:`1px solid ${on?"#e85d04":"#e2e8f0"}`,background:on?"#e85d04":"#f8fafc",color:on?"#fff":"#64748b",cursor:"pointer",fontWeight:on?600:400}),
    results:   {background:"#fff",padding:"0 1.5rem 1.5rem"},
    card:      (g)=>({background:"#f8fafc",borderRadius:14,overflow:"hidden",borderLeft:`4px solid ${gc(g)}`,marginBottom:10}),
    cardInner: {padding:"14px 16px"},
    cardTop:   {display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6},
    bandName:  {fontWeight:600,fontSize:15,margin:"0 0 2px",color:"#0f172a"},
    venueName: {fontSize:13,color:"#64748b",margin:0},
    badge:     (g)=>({fontSize:10,padding:"3px 10px",borderRadius:99,background:gc(g)+"22",color:gc(g),fontWeight:600,whiteSpace:"nowrap",flexShrink:0}),
    meta:      {display:"flex",flexWrap:"wrap",gap:"4px 16px",fontSize:12,color:"#64748b",marginBottom:8},
    expandBtn: {fontSize:12,color:"#e85d04",background:"transparent",border:"none",cursor:"pointer",padding:0,fontWeight:500},
    expandBox: {borderTop:"1px solid #e2e8f0",padding:"14px 16px",background:"#fff"},
    bioLabel:  {fontSize:12,fontWeight:600,color:"#e85d04",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.5px"},
    bioText:   {fontSize:13,color:"#64748b",margin:0,lineHeight:1.5},
  };

  return (
    <div style={s.wrap}>

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#e85d04 0%,#c44a00 100%)",textAlign:"center",padding:"12px 0 0"}}>
        <p style={{margin:"0 0 8px",fontSize:11,color:"rgba(255,255,255,0.85)",letterSpacing:"2px",textTransform:"uppercase"}}>Find live music anywhere</p>
        <img src="/hero.png" alt="" style={{width:"100%",display:"block",objectFit:"cover",objectPosition:"center top",maxHeight:220}} />
      </div>

      {/* Search Panel */}
      <div style={s.body}>
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {SEARCH_MODES.map(m=>(
            <button key={m} style={s.modeBtn(searchMode===m)}
              onClick={()=>{setSearchMode(m);setError("");setExpanded(null);setBandMatches(null);setSelectedBand(null);setGenreSearched(false);}}>
              {m==="By Location"?"📍 By Location":m==="By Band"?"🎸 By Band":"🎶 By Genre"}
            </button>
          ))}
        </div>

        {isLocationMode && (
          <>
            <div style={s.row}>
              <input style={s.input} type="text" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchByLocation()} placeholder="Zip code, city, venue, or restaurant…"/>
              <button style={s.btnLoc} onClick={useLocation} title="Use my location">{locating?"⏳":"📍"}</button>
              <button style={s.btnSearch(loading||!query.trim())} onClick={()=>searchByLocation()} disabled={loading||!query.trim()}>{loading?"…":"Search"}</button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {DATE_FILTERS.map(f=><button key={f} style={s.filterBtn(dateFilter===f)} onClick={()=>setDateFilter(f)}>{f}</button>)}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
              <span style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap"}}>📍 Within:</span>
              {RADIUS_OPTIONS.map(r=><button key={r} style={s.filterBtn(radius===r)} onClick={()=>setRadius(r)}>{r} mi</button>)}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.25rem"}}>
              {QUICK.map(sq=><button key={sq} style={s.quickBtn} onClick={()=>{setQuery(sq);searchByLocation(sq);}}>{sq}</button>)}
            </div>
          </>
        )}

        {isBandMode && (
          <>
            <div style={{fontSize:12,color:"#64748b",marginBottom:8,lineHeight:1.5}}>
              Enter a band name and your location. We'll find all matching acts so you can pick the right one, then show real sources and nearby venues.
            </div>
            <div style={s.row}>
              <input style={s.inputSm} type="text" value={bandName} onChange={e=>setBandName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookupBand()} placeholder="Band or artist name…"/>
              <input style={s.inputSm} type="text" value={bandLocation} onChange={e=>setBandLocation(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookupBand()} placeholder="Your city or zip…"/>
              <button style={s.btnSearch(!bandName.trim()||!bandLocation.trim()||bandLookupLoading)} onClick={lookupBand} disabled={!bandName.trim()||!bandLocation.trim()||bandLookupLoading}>
                {bandLookupLoading?"…":"Find"}
              </button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",marginTop:8}}>
              <span style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap"}}>📍 Within:</span>
              {RADIUS_OPTIONS.map(r=><button key={r} style={s.filterBtn(radius===r)} onClick={()=>setRadius(r)}>{r} mi</button>)}
            </div>
            <div style={{marginBottom:"0.5rem"}}/>
          </>
        )}

        {isGenreMode && (
          <>
            <div style={{fontSize:12,color:"#64748b",marginBottom:8,lineHeight:1.5}}>
              Pick a genre and enter your location — we'll find nearby venues that host that type of music.
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {GENRE_QUICK.map(g=>(
                <button key={g} style={s.genreChip(genreQuery===g)} onClick={()=>{setGenreQuery(g);setGenreSearched(false);setGenreVenues(null);}}>{g}</button>
              ))}
            </div>
            <div style={s.row}>
              <input style={s.inputSm} type="text" value={genreQuery} onChange={e=>setGenreQuery(e.target.value)} placeholder="Genre…"/>
              <input style={s.inputSm} type="text" value={genreLocation} onChange={e=>setGenreLocation(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setGenreSearched(true)} placeholder="City or zip…"/>
              <button style={s.btnSearch(!genreQuery.trim()||!genreLocation.trim())} onClick={()=>setGenreSearched(true)} disabled={!genreQuery.trim()||!genreLocation.trim()}>Find</button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",marginTop:8}}>
              <span style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap"}}>📍 Within:</span>
              {RADIUS_OPTIONS.map(r=><button key={r} style={s.filterBtn(radius===r)} onClick={()=>setRadius(r)}>{r} mi</button>)}
            </div>
            <div style={{marginBottom:"0.5rem"}}/>
          </>
        )}
      </div>

      {/* Band: picker or results */}
      {isBandMode && !bandLookupLoading && bandMatches === null && (
        <div style={{background:"#fff",borderTop:"1px solid #e2e8f0",padding:"1.25rem 1.5rem"}}>
          <FeaturedBands />
        </div>
      )}

      {isBandMode && (bandLookupLoading || bandMatches !== null) && (
        <div style={{background:"#fff",borderTop:"1px solid #e2e8f0",padding:"1.25rem 1.5rem 0"}}>
          {!selectedBand
            ? <BandPicker bands={bandMatches} loading={bandLookupLoading} onSelect={b=>{setSelectedBand(b);setBandVenues(null);setBandScannedVenues({});}} />
            : <BandResultsPanel
                band={selectedBand} location={bandLocation} radius={radius}
                bandVenues={bandVenues} bandVenuesLoading={bandVenuesLoading} bandVenuesError={bandVenuesError}
                bandScanningVenue={bandScanningVenue} bandScannedVenues={bandScannedVenues}
                onFindVenues={findBandVenues}
                onScrape={url=>scrapeVenue(url,setBandScanningVenue,setBandScannedVenues)}
                onChangeBand={()=>setSelectedBand(null)}
              />
          }
        </div>
      )}

      {/* Genre results */}
      {isGenreMode && genreSearched && (
        <div style={{background:"#fff",borderTop:"1px solid #e2e8f0",padding:"1.25rem 1.5rem 0"}}>
          <GenreVenueFinder
            genre={genreQuery} location={genreLocation} radius={radius}
            onFindVenues={findGenreVenues}
            localVenues={genreVenues} localLoading={genreLoading} localError={genreError}
            scanningVenue={genreScanningVenue} scannedVenues={genreScannedVenues}
            onScrape={url=>scrapeVenue(url,setGenreScanningVenue,setGenreScannedVenues)}
          />
        </div>
      )}

      {/* Location results */}
      {isLocationMode && (
        <div style={{...s.results, minHeight: results!==null||loading?100:0}}>
          {error && <div style={{background:"#fee2e2",border:"0.5px solid #fca5a5",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#dc2626",marginBottom:12}}>{error}</div>}
          {loading && (
            <div style={{textAlign:"center",padding:"2.5rem 0",color:"#64748b"}}>
              <div style={{fontSize:32,marginBottom:12}}>🎵</div>
              <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Finding live music near {searched}…</div>
              <div style={{fontSize:12,color:"#94a3b8"}}>{dateFilter} • Scanning venues & events</div>
            </div>
          )}
          {results!==null && !loading && (
            <>
              {showFeatured && (
                <>
                  {/* Featured Venues */}
                  <div style={{marginBottom:16}}>
                    <p style={{fontSize:11,fontWeight:600,color:"#e85d04",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>⭐ Featured West Chester Venues</p>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {FEATURED_VENUES.map((v,i)=>(
                        <div key={i} style={{flex:"1 1 260px",background:`linear-gradient(135deg,${v.color}22,${v.color}08)`,border:`1.5px solid ${v.color}44`,borderRadius:14,padding:"14px 16px"}}>
                          <p style={{fontWeight:700,fontSize:15,margin:"0 0 4px",color:"#0f172a"}}>{v.name}</p>
                          <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:v.color+"22",color:v.color,fontWeight:600}}>{v.tag}</span>
                          <PhotoGallery photos={VENUE_PHOTOS[v.name]} color={v.color} />
                          <p style={{fontSize:12,color:"#64748b",margin:"10px 0 8px",lineHeight:1.5}}>{v.description}</p>
                          <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 10px"}}>📍 {v.address}</p>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:v.upcomingShows?8:0}}>
                            <a href={v.scheduleUrl} target="_blank" rel="noreferrer" style={{fontSize:12,padding:"6px 14px",borderRadius:99,background:v.color,color:"#fff",textDecoration:"none",fontWeight:500}}>🎵 View Schedule</a>
                            <a href={v.reserveUrl} target="_blank" rel="noreferrer" style={{fontSize:12,padding:"6px 14px",borderRadius:99,background:"#f1f5f9",color:"#64748b",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>Reserve</a>
                        <a href={`https://www.opentable.com/s?term=${encodeURIComponent(v.name)}&covers=2&metroId=0`} target="_blank" rel="noreferrer" style={{fontSize:12,padding:"6px 14px",borderRadius:99,background:"#DA3743",color:"#fff",textDecoration:"none",fontWeight:500}}>🍽 OpenTable</a>
                          </div>
                          {v.upcomingShows && <VenueShowList venue={v} />}
                        </div>
                      ))}
                    </div>
                  </div>

                </>
              )}
              {results.length>0 && (
                <>
                  <p style={{fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>
                    {showFeatured?"🎸 More Live Music Nearby":"🎸 Live Music Events"}
                  </p>
                  <div style={{background:"#fff8f0",border:"1px solid #fed7aa",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#92400e"}}>
                    ⚠️ <strong>Always verify before you go</strong> — AI results may not be accurate.
                    <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                      <a href={`https://www.songkick.com/metro-areas/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"4px 12px",borderRadius:99,background:"#f97316",color:"#fff",textDecoration:"none",fontWeight:500}}>🎵 Songkick</a>
                      <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"4px 12px",borderRadius:99,background:"#16a34a",color:"#fff",textDecoration:"none",fontWeight:500}}>🎸 Bandsintown</a>
                      <a href={`https://www.google.com/search?q=live+music+${encodeURIComponent(searched)}+this+weekend`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"4px 12px",borderRadius:99,background:"#3b82f6",color:"#fff",textDecoration:"none",fontWeight:500}}>🔍 Google</a>
                    </div>
                  </div>
                  {results.map((r,i)=>(
                    <div key={i} style={s.card(r.genre)}>
                      <div style={s.cardInner}>
                        <div style={s.cardTop}>
                          <div><p style={s.bandName}>{r.band}</p><p style={s.venueName}>{r.venue}</p></div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                            {r.genre&&<span style={s.badge(r.genre)}>{r.genre}</span>}
                            {r.confidence==="medium"&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"#fef9c3",color:"#854d0e",fontWeight:600}}>⚠️ Unverified</span>}
                          </div>
                        </div>
                        <div style={s.meta}>
                          {r.date&&<span>📅 {r.date}</span>}
                          {r.time&&<span>🕐 {r.time}</span>}
                          {r.address&&<span>📍 {r.address}</span>}
                          {r.notes&&<span>ℹ️ {r.notes}</span>}
                          {r.tickets&&r.tickets.startsWith("http")?<a href={r.tickets} target="_blank" rel="noreferrer" style={{color:"#e85d04",fontWeight:500}}>🎟 Tickets</a>:r.tickets?<span>🎟 {r.tickets}</span>:null}
                        </div>
                        <button style={s.expandBtn} onClick={()=>setExpanded(expanded===i?null:i)}>
                          {expanded===i?"▲ Hide details":"▼ Show venue & artist info"}
                        </button>
                      </div>
                      {expanded===i&&(
                        <div style={s.expandBox}>
                          {r.venueBio&&<div style={{marginBottom:12}}><p style={s.bioLabel}>🏠 About the Venue</p><p style={s.bioText}>{r.venueBio}</p></div>}
                          {r.bandBio&&r.bandBio.trim().length>10&&<div style={{marginBottom:12}}><p style={s.bioLabel}>🎤 About the Artist</p><p style={s.bioText}>{r.bandBio}</p></div>}
                          <div style={{borderTop:"1px solid #f1f5f9",paddingTop:10}}>
                            <p style={s.bioLabel}>🔍 Verify this event</p>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                              <a href={`https://www.google.com/search?q=${encodeURIComponent((r.band||"")+" "+(r.venue||""))}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"#3b82f6",color:"#fff",textDecoration:"none"}}>🔍 Google</a>
                              <a href={`https://www.songkick.com/search?query=${encodeURIComponent(r.band||"")}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"#f97316",color:"#fff",textDecoration:"none"}}>🎵 Songkick</a>
                              <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(r.band||"")}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"#16a34a",color:"#fff",textDecoration:"none"}}>🎸 Bandsintown</a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
              {results.length===0&&!showFeatured&&<p style={{fontSize:13,color:"#64748b",padding:"1rem 0"}}>No events found. Try expanding the radius or check Songkick / Bandsintown directly.</p>}
            </>
          )}
        </div>
      )}

      {/* Nearby Bars & Restaurants */}
      {isLocationMode&&(localLoading||localVenues!==null||localError)&&(
        <div style={{background:"#fff",borderTop:"1px solid #e2e8f0",padding:"1.25rem 1.5rem"}}>
          <p style={{fontSize:12,fontWeight:600,color:"#e85d04",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>🍺 Nearby Bars & Restaurants</p>
          {localLoading&&<div style={{fontSize:13,color:"#64748b",padding:"8px 0"}}><div style={{marginBottom:4}}>🔍 Finding bars & restaurants near {searched}…</div><div style={{fontSize:11,color:"#94a3b8"}}>Scoring each venue for live music likelihood.</div></div>}
          {localError&&<div style={{fontSize:12,color:"#dc2626",marginTop:8}}>{localError}</div>}
          {localVenues!==null&&!localLoading&&(
            localVenues.length===0?<p style={{fontSize:13,color:"#64748b",margin:"8px 0"}}>No venues found nearby.</p>:
            <>
              <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 10px"}}>Found {localVenues.length} venues • Sorted by music likelihood • Tap "Scan Site" for real events</p>
              {localVenues.map((v,vi)=>{
                const sc=v.musicScore==="high"?"#16a34a":v.musicScore==="medium"?"#d97706":"#94a3b8";
                const sl=v.musicScore==="high"?"🎵 Likely has music":v.musicScore==="medium"?"🎲 Possible music":"🍽 Unknown";
                const isScanning=scanningVenue===v.website;
                const scanned=scannedVenues[v.website];
                return(
                  <div key={vi} style={{background:"#f8fafc",borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid #e2e8f0",borderLeft:`4px solid ${sc}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                      <p style={{fontWeight:700,fontSize:15,margin:0,color:"#0f172a"}}>{v.name}</p>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:sc+"22",color:sc,fontWeight:600}}>{sl}</span>
                      {v.isOpen===true&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#dcfce7",color:"#16a34a",fontWeight:600}}>Open Now</span>}
                      {v.isOpen===false&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#fee2e2",color:"#dc2626",fontWeight:600}}>Closed</span>}
                    </div>
                    <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 2px"}}>📍 {v.address}</p>
                    {v.rating&&<p style={{fontSize:11,color:"#94a3b8",margin:"0 0 4px"}}>⭐ {v.rating} ({v.totalRatings?.toLocaleString()} reviews)</p>}
                    {v.summary&&<p style={{fontSize:12,color:"#64748b",margin:"0 0 6px",fontStyle:"italic"}}>{v.summary}</p>}
                    {v.photos&&v.photos.length>0&&(
                      <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto"}}>
                        {v.photos.slice(0,3).map((photo,pi)=>(
                          <img key={pi} src={photo} alt="" style={{width:80,height:56,objectFit:"cover",borderRadius:6,flexShrink:0,border:"1px solid #e2e8f0"}} onError={e=>e.target.style.display="none"} />
                        ))}
                      </div>
                    )}
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                      <button onClick={()=>setOpenChatVenue(openChatVenue===(v.website||v.name)?null:(v.website||v.name))}
                        style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd",cursor:"pointer",fontWeight:500}}>
                        🏠 About This Venue
                      </button>
                      {v.website&&(
                        <button onClick={()=>scrapeVenue(v.website,setScanningVenue,setScannedVenues,v.name,v.address)} disabled={isScanning}
                          style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:isScanning?"#e2e8f0":"#e85d04",color:isScanning?"#94a3b8":"#fff",border:"none",cursor:isScanning?"default":"pointer",fontWeight:500}}>
                          {isScanning?"🎵 Finding…":"🎵 Find Events"}
                        </button>
                      )}
                      <button onClick={()=>setOpenCommunityVenue(openCommunityVenue===(v.website||v.name)?null:(v.website||v.name))}
                        style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f8fafc",color:"#0f172a",border:"1px solid #e2e8f0",cursor:"pointer",fontWeight:500}}>
                        ⭐ Rate
                      </button>
                      <button onClick={()=>fetchHappyHour(v)}
                        disabled={fetchingHH===(v.website||v.name)}
                        style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#fefce8",color:"#92400e",border:"1px solid #fde68a",cursor:"pointer",fontWeight:500}}>
                        {fetchingHH===(v.website||v.name)?"🍺 Checking…":"🍺 Happy Hour?"}
                      </button>

                      {v.website&&<a href={v.website} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#64748b",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>🌐 Website</a>}
                      <a href={`https://www.opentable.com/s?term=${encodeURIComponent(v.name)}&covers=2&metroId=0`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#DA3743",color:"#fff",textDecoration:"none",fontWeight:500}}>🍽 Reserve</a>
                      {v.instagram&&<a href={v.instagram} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#c026d3",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>📸 Instagram</a>}
                      {v.facebook&&<a href={v.facebook} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#1d4ed8",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>👍 Facebook</a>}
                    </div>
                    {v.events&&v.events.length>0&&!scanned&&(
                      <div style={{marginTop:10}}>
                        <p style={{fontSize:11,fontWeight:600,color:"#16a34a",margin:"0 0 6px"}}>✓ Live events found on their website:</p>
                        {v.events.map((e,ei)=>(
                          <div key={ei} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:6,border:"1px solid #e2e8f0",borderLeft:"3px solid #e85d04"}}>
                            <p style={{fontWeight:600,fontSize:14,margin:"0 0 4px",color:"#0f172a"}}>{e.band}</p>
                            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:12,color:"#64748b"}}>
                              {e.date&&<span>📅 {e.date}</span>}
                              {e.time&&<span>🕐 {e.time}</span>}
                              {e.notes&&<span>ℹ️ {e.notes}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Venue Chatbot */}
                    {openChatVenue===(v.website||v.name) && (
                      <VenueChatbot venue={v} onClose={()=>setOpenChatVenue(null)} />
                    )}
                    {openCommunityVenue===(v.website||v.name) && (
                      <CommunityPanel venue={v} onClose={()=>setOpenCommunityVenue(null)} />
                    )}

                    {/* Happy Hour result */}
                    {(() => {
                      const key = v.website || v.name;
                      const hh = happyHours[key];
                      if (!hh) return null;
                      if (hh.loading) return <p style={{fontSize:11,color:"#94a3b8",margin:"6px 0 0"}}>🍺 Checking happy hour info…</p>;
                      if (!hh.data?.hasHappyHour) return null;
                      if (hh.data.confidence === "low") return null;
                      return (
                        <div style={{marginTop:10,background:"#fefce8",border:"1px solid #fde68a",borderRadius:10,padding:"10px 12px"}}>
                          <p style={{fontSize:11,fontWeight:700,color:"#92400e",margin:"0 0 4px"}}>🍺 Happy Hour — {hh.data.days} {hh.data.hours}</p>
                          <div style={{display:"flex",flexDirection:"column",gap:3}}>
                            {(hh.data.deals||"").split("|").map((deal,di)=>(
                              <p key={di} style={{fontSize:12,color:"#78350f",margin:0,lineHeight:1.4}}>• {deal.trim()}</p>
                            ))}
                          </div>
                          <p style={{fontSize:10,color:"#a16207",margin:"6px 0 0"}}>⚠️ Verify with venue — specials may change</p>
                        </div>
                      );
                    })()}

                    {/* AI weekly schedule suggestions for unscanned high-likelihood venues */}
                    {(!v.events || v.events.length===0) && !scanned && (v.musicScore==="high" || v.musicScore==="medium") && (() => {
                      const key = v.website || v.name;
                      const suggestion = aiSuggestions[key];
                      return (
                        <div style={{marginTop:10}}>
                          {!suggestion && (
                            <button onClick={()=>suggestSchedule(v)}
                              style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#7c3aed22",color:"#7c3aed",border:"1px solid #7c3aed44",cursor:"pointer",fontWeight:500}}>
                              🤖 AI: Suggest their schedule
                            </button>
                          )}
                          {suggestion?.loading && (
                            <p style={{fontSize:11,color:"#94a3b8",margin:"4px 0 0"}}>🤖 Looking up their entertainment schedule…</p>
                          )}
                          {suggestion && !suggestion.loading && suggestion.schedule && suggestion.schedule.length > 0 && (
                            <div style={{background:"#faf5ff",border:"1px solid #e9d5ff",borderRadius:10,padding:"10px 12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                                <p style={{fontSize:11,fontWeight:600,color:"#7c3aed",margin:0}}>🤖 AI: Likely weekly entertainment schedule</p>
                                <span style={{fontSize:10,background:"#fef9c3",color:"#854d0e",padding:"1px 6px",borderRadius:99,fontWeight:400,whiteSpace:"nowrap"}}>⚠️ Unverified</span>
                              </div>
                              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                                {suggestion.schedule.map((s,si)=>(
                                  <div key={si} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 8px",background:"#fff",borderRadius:8,border:"1px solid #e9d5ff"}}>
                                    <span style={{fontSize:11,fontWeight:700,color:"#7c3aed",minWidth:90,flexShrink:0}}>{s.day}</span>
                                    <div style={{flex:1}}>
                                      <span style={{fontSize:12,fontWeight:600,color:"#0f172a"}}>{s.event}</span>
                                      {s.time && <span style={{fontSize:11,color:"#64748b",marginLeft:6}}>🕐 {s.time}</span>}
                                      {s.notes && <p style={{fontSize:11,color:"#94a3b8",margin:"2px 0 0",lineHeight:1.4}}>{s.notes}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p style={{fontSize:10,color:"#94a3b8",margin:"8px 0 0"}}>👆 Tap "Scan Site for Events" above to verify the real schedule</p>
                            </div>
                          )}
                          {suggestion && !suggestion.loading && suggestion.schedule && suggestion.schedule.length === 0 && (
                            <p style={{fontSize:11,color:"#94a3b8",margin:"4px 0 0"}}>No schedule found — tap "🎵 Find Events" above or visit their website.</p>
                          )}
                        </div>
                      );
                    })()}
                    {scanned!==undefined&&(
                      <div style={{marginTop:10}}>
                        {scanned.events && scanned.events.length > 0 ? (
                          <>
                            <p style={{fontSize:11,fontWeight:600,color:"#16a34a",margin:"0 0 6px"}}>✓ Live events found on their website:</p>
                            {scanned.events.map((e,ei)=>(
                              <div key={ei} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:6,border:"1px solid #e2e8f0",borderLeft:"3px solid #e85d04"}}>
                                <p style={{fontWeight:600,fontSize:14,margin:"0 0 4px",color:"#0f172a"}}>{e.band}</p>
                                <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:12,color:"#64748b"}}>
                                  {e.date&&<span>📅 {e.date}</span>}
                                  {e.time&&<span>🕐 {e.time}</span>}
                                  {e.notes&&<span>ℹ️ {e.notes}</span>}
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:"1px solid #e2e8f0"}}>
                            {scanned.isJsRendered
                              ? <p style={{fontSize:12,color:"#92400e",margin:"0 0 8px"}}>⚡ This site uses JavaScript to load events — our scanner can't read them. Check directly:</p>
                              : <p style={{fontSize:12,color:"#94a3b8",margin:"0 0 8px"}}>No events found on their site. They may post on Facebook or social media instead:</p>
                            }
                            {scanned.fallbackLinks && (
                              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                <a href={scanned.fallbackLinks.google} target="_blank" rel="noreferrer"
                                  style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"#374151",color:"#fff",textDecoration:"none",fontWeight:500}}>🔍 Google Events</a>
                                <a href={scanned.fallbackLinks.facebook} target="_blank" rel="noreferrer"
                                  style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"#1877f2",color:"#fff",textDecoration:"none",fontWeight:500}}>👍 Find on Facebook</a>
                                <a href={scanned.fallbackLinks.bandsintown} target="_blank" rel="noreferrer"
                                  style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"#16a34a",color:"#fff",textDecoration:"none",fontWeight:500}}>🎸 Bandsintown</a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}