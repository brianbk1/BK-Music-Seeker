"use client";
import { useState } from "react";

const FEATURED_VENUES = [
  {
    name: "Pietro's Prime",
    tag: "Live music Wed–Sat",
    description: "West Chester's premier upscale steakhouse with exceptional cuisine, the best martinis in town, and live entertainment every Wednesday through Saturday night.",
    address: "125 West Market St, West Chester, PA 19382",
    scheduleUrl: "https://www.pietrosprime.com/entertainment",
    reserveUrl: "https://www.opentable.com/pietros-prime",
    color: "#e85d04",
  },
  {
    name: "Station 142",
    tag: "Live music Thurs–Sat",
    description: "West Chester's premier live music venue featuring an intimate stage, state-of-the-art sound system, two full bars, rooftop dining, and top local and regional acts.",
    address: "142 E Market St, West Chester, PA 19382",
    scheduleUrl: "https://station142.com/live-music/",
    reserveUrl: "https://station142.com/",
    color: "#1a0a00",
  },
];

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

const GENRE_COLORS = {
  Rock:"#e85d04", Jazz:"#1D9E75", Country:"#BA7517", Pop:"#D4537E",
  Blues:"#378ADD", "Cover Band":"#888780", Folk:"#639922", "R&B":"#D85a30",
  Acoustic:"#0F6E56", Indie:"#7F77DD", Classical:"#185FA5", Karaoke:"#9333ea",
  "Open Mic":"#0891b2", EDM:"#9333ea", "Hip Hop":"#D85a30", Reggae:"#1D9E75",
  Punk:"#e85d04", Metal:"#64748b", Soul:"#BA7517", Funk:"#D4537E", Bluegrass:"#639922",
};
const gc = (g) => GENRE_COLORS[g] || "#e85d04";

// Real photos from each venue's actual website
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
};

// ─── System Prompts ────────────────────────────────────────────────────────────

const LOCATION_PROMPT = `You are a live music event finder. The user provides a location. Find live music events near that specific location only.

Return a JSON array of up to 6 realistic live music events. Each result must have:
- band, venue, date (e.g. "Friday, May 9"), time (e.g. "8:00 PM"), genre, address (full with city/state), tickets ("Check venue website" or "Free"), notes, venueBio (2 sentences), bandBio (2 sentences or ""), confidence ("high" or "medium")

RULES:
1. Only return venues near the EXACT location. Never default to West Chester PA.
2. Do NOT include Pietro's Prime or Station 142.
3. Never return "Unknown".
Return ONLY valid JSON array, nothing else.`;

const BAND_PROMPT = `You are a live music event finder. The user provides a band/artist name AND a location with a search radius. Find upcoming live shows for that specific artist within or near that radius.

Return a JSON array of up to 8 upcoming shows. Each result must have:
- band, venue, date (e.g. "Friday, May 9"), time (e.g. "8:00 PM"), genre, address (full with city/state), tickets ("Check venue website", a URL, or "Free"), notes, venueBio (2 sentences), bandBio (2 sentences), confidence ("high" or "medium"), distanceMiles (estimated miles from the search location as a number)

RULES:
1. Focus on shows WITHIN or near the specified radius from the given location.
2. The same band name may refer to different acts — use location context to find the right one.
3. Sort results by distance (closest first).
4. Never return "Unknown".
Return ONLY valid JSON array, nothing else.`;

const GENRE_PROMPT = `You are a live music event finder. The user provides a music genre and a location with a search radius. Find live music events of that genre near that location.

Return a JSON array of up to 8 upcoming events matching the genre. Each result must have:
- band, venue, date (e.g. "Friday, May 9"), time (e.g. "8:00 PM"), genre (matching requested genre), address (full with city/state), tickets ("Check venue website", a URL, or "Free"), notes, venueBio (2 sentences), bandBio (2 sentences or ""), confidence ("high" or "medium"), distanceMiles (estimated miles from the search location as a number)

RULES:
1. Only return events matching or very closely related to the requested genre.
2. Stay within or near the specified radius from the given location.
3. Use venues appropriate for the genre: EDM at clubs, acoustic at coffee shops/small bars, jazz at jazz clubs, bluegrass at folk venues, metal at rock clubs, classical at concert halls.
4. Sort results by distance (closest first).
5. Never return "Unknown".
Return ONLY valid JSON array, nothing else.`;

// ─── Photo Gallery Component ───────────────────────────────────────────────────

function VenuePhotoGallery({ venueName, color }) {
  const [active, setActive] = useState(0);
  const photos = VENUE_PHOTOS[venueName] || [];
  if (!photos.length) return null;
  return (
    <div style={{ marginTop: 12, marginBottom: 4 }}>
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: 6, height: 160, background: "#f1f5f9" }}>
        <img src={photos[active].url} alt={photos[active].label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <span style={{ position: "absolute", bottom: 8, left: 10, fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(0,0,0,0.55)", color: "#fff", fontWeight: 600 }}>
          {photos[active].label}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {photos.map((p, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ flex: 1, height: 50, borderRadius: 8, overflow: "hidden", padding: 0, border: `2px solid ${active === i ? color : "transparent"}`, cursor: "pointer", background: "#f1f5f9" }}>
            <img src={p.url} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [searchMode, setSearchMode]     = useState("By Location");
  const [query, setQuery]               = useState("");         // location mode
  const [bandName, setBandName]         = useState("");         // band mode — artist name
  const [bandLocation, setBandLocation] = useState("");         // band mode — city/zip
  const [genreQuery, setGenreQuery]     = useState("");         // genre mode — genre
  const [genreLocation, setGenreLocation] = useState("");       // genre mode — city/zip
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
  const [scanningVenue, setScanningVenue] = useState(null);
  const [scannedVenues, setScannedVenues] = useState({});

  const QUICK      = ["19382 (West Chester)", "Sea Isle, NJ", "Kennett Square, PA", "Malvern, PA", "Phoenixville, PA", "Pocono Lake, PA"];
  const BAND_QUICK = ["Bruce Springsteen", "Dave Matthews Band", "Zac Brown Band", "The Lumineers", "Hozier", "Caamp"];

  const isLocationMode = searchMode === "By Location";
  const isBandMode     = searchMode === "By Band";
  const isGenreMode    = searchMode === "By Genre";

  const isDisabled = loading ||
    (isLocationMode && !query.trim()) ||
    (isBandMode  && (!bandName.trim() || !bandLocation.trim())) ||
    (isGenreMode && (!genreQuery.trim() || !genreLocation.trim()));

  const getDateRange = (f) => {
    const today = new Date();
    const day = today.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
    if (f === "Today") return `today only, ${day}`;
    if (f === "This Weekend") return `this weekend (Saturday and Sunday)`;
    return `the next 7 days starting ${day}`;
  };

  const resetSearch = (label) => {
    setLoading(true); setError(""); setResults(null); setSearched(label);
    setExpanded(null); setLocalVenues(null); setLocalError(""); setScannedVenues({});
    setShowFeatured(false);
  };

  const callAPI = async (system, userMsg) => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages: [{ role: "user", content: userMsg }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const block = data.content?.find(b => b.type === "text");
    if (!block) throw new Error("No response received.");
    return JSON.parse(block.text.trim().replace(/```json|```/g, "").trim());
  };

  const findLocalVenues = async (loc) => {
    if (!loc) return;
    setLocalLoading(true); setLocalError(""); setLocalVenues(null);
    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: loc, radius }),
      });
      const data = await res.json();
      if (data.error) { setLocalError(`Error: ${data.error.message}`); return; }
      setLocalVenues(data.venues);
    } catch (e) { setLocalError(`Error: ${e.message}`); }
    finally { setLocalLoading(false); }
  };

  const scrapeVenue = async (url) => {
    if (!url) return;
    setScanningVenue(url);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setScannedVenues(prev => ({ ...prev, [url]: data.error ? [] : (data.events || []) }));
    } catch { setScannedVenues(prev => ({ ...prev, [url]: [] })); }
    finally { setScanningVenue(null); }
  };

  // ── Search handlers ────────────────────────────────────────────────────────

  const searchByLocation = async (q) => {
    const sq = (q || query).trim();
    if (!sq) return;
    const wc = isWestChester(sq);
    resetSearch(sq);
    setShowFeatured(wc);
    findLocalVenues(sq);
    if (wc) { setResults([]); setLoading(false); return; }
    try {
      const msgs = `Find live music events near: "${sq}" within ${radius} miles, for ${getDateRange(dateFilter)}.`;
      setResults(await callAPI(LOCATION_PROMPT, msgs));
    } catch (e) { setError(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const searchByBand = async () => {
    const name = bandName.trim();
    const loc  = bandLocation.trim();
    if (!name || !loc) return;
    const label = `${name} near ${loc}`;
    resetSearch(label);
    try {
      const msg = `Find upcoming live shows for the band/artist: "${name}" within ${radius} miles of "${loc}", for ${getDateRange(dateFilter)}. Include distanceMiles for each show.`;
      setResults(await callAPI(BAND_PROMPT, msg));
    } catch (e) { setError(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const searchByGenre = async () => {
    const genre = genreQuery.trim();
    const loc   = genreLocation.trim();
    if (!genre || !loc) return;
    const label = `${genre} near ${loc}`;
    resetSearch(label);
    try {
      const msg = `Find live ${genre} music events within ${radius} miles of "${loc}", for ${getDateRange(dateFilter)}. Include distanceMiles for each event.`;
      setResults(await callAPI(GENRE_PROMPT, msg));
    } catch (e) { setError(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (isLocationMode) searchByLocation();
    else if (isBandMode) searchByBand();
    else searchByGenre();
  };

  const useLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const a    = data.address;
          const loc  = `${a.city || a.town || a.village || a.county}, ${a.state}`;
          setQuery(loc); setLocating(false); searchByLocation(loc);
        } catch { setLocating(false); }
      },
      () => { setError("Location access denied."); setLocating(false); }
    );
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const s = {
    wrap:      { fontFamily:"system-ui,sans-serif", maxWidth:700, margin:"0 auto", borderRadius:20, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.12)" },
    body:      { background:"#fff", padding:"1.25rem 1.5rem 0" },
    row:       { display:"flex", gap:8, marginBottom:8 },
    input:     { flex:1, fontSize:15, borderRadius:10, padding:"10px 14px", border:"1px solid #e2e8f0", outline:"none" },
    inputSm:   { flex:1, fontSize:14, borderRadius:10, padding:"9px 12px", border:"1px solid #e2e8f0", outline:"none" },
    btnLoc:    { padding:"0 14px", fontSize:18, borderRadius:10, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer" },
    btnSearch: (dis) => ({ padding:"0 18px", fontSize:15, fontWeight:500, borderRadius:10, border:"none", background:dis?"#e2e8f0":"#e85d04", color:dis?"#94a3b8":"#fff", cursor:dis?"default":"pointer" }),
    modeBtn:   (on)  => ({ fontSize:12, padding:"6px 14px", borderRadius:99, border:`1.5px solid ${on?"#e85d04":"#e2e8f0"}`, background:on?"#e85d04":"transparent", color:on?"#fff":"#64748b", cursor:"pointer", fontWeight:on?600:400, whiteSpace:"nowrap" }),
    filterBtn: (on)  => ({ fontSize:12, padding:"5px 14px", borderRadius:99, border:`1.5px solid ${on?"#e85d04":"#e2e8f0"}`, background:on?"#e85d04":"transparent", color:on?"#fff":"#64748b", cursor:"pointer", fontWeight:on?600:400 }),
    quickBtn:  { fontSize:11, padding:"4px 12px", borderRadius:99, border:"0.5px solid #e85d04", color:"#e85d04", background:"transparent", cursor:"pointer" },
    genreChip: (on)  => ({ fontSize:11, padding:"4px 12px", borderRadius:99, border:`1px solid ${on?"#e85d04":"#e2e8f0"}`, background:on?"#e85d04":"#f8fafc", color:on?"#fff":"#64748b", cursor:"pointer", fontWeight:on?600:400 }),
    results:   { background:"#fff", padding:"0 1.5rem 1.5rem" },
    card:      (g)   => ({ background:"#f8fafc", borderRadius:14, overflow:"hidden", borderLeft:`4px solid ${gc(g)}`, marginBottom:10 }),
    cardInner: { padding:"14px 16px" },
    cardTop:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:6 },
    bandName:  { fontWeight:600, fontSize:15, margin:"0 0 2px", color:"#0f172a" },
    venueName: { fontSize:13, color:"#64748b", margin:0 },
    badge:     (g)   => ({ fontSize:10, padding:"3px 10px", borderRadius:99, background:gc(g)+"22", color:gc(g), fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }),
    meta:      { display:"flex", flexWrap:"wrap", gap:"4px 16px", fontSize:12, color:"#64748b", marginBottom:8 },
    expandBtn: { fontSize:12, color:"#e85d04", background:"transparent", border:"none", cursor:"pointer", padding:0, fontWeight:500 },
    expandBox: { borderTop:"1px solid #e2e8f0", padding:"14px 16px", background:"#fff" },
    bioLabel:  { fontSize:12, fontWeight:600, color:"#e85d04", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.5px" },
    bioText:   { fontSize:13, color:"#64748b", margin:0, lineHeight:1.5 },
  };

  const modeIcon  = isGenreMode ? "🎶" : isBandMode ? "🎸" : "🎵";
  const loadText  = isGenreMode ? `Finding ${searched}…` : isBandMode ? `Finding shows for ${searched}…` : `Finding live music near ${searched}…`;
  const loadSub   = isGenreMode ? "Scanning venues for that vibe" : isBandMode ? "Searching tour dates & venues" : "Scanning venues & events";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={s.wrap}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#e85d04 0%,#c44a00 100%)", textAlign:"center", padding:"12px 0 0" }}>
        <p style={{ margin:"0 0 8px", fontSize:11, color:"rgba(255,255,255,0.85)", letterSpacing:"2px", textTransform:"uppercase" }}>Find live music anywhere</p>
        <img src="/hero.png" alt="" style={{ width:"100%", display:"block", objectFit:"cover", objectPosition:"center top", maxHeight:220 }} />
      </div>

      {/* Search Panel */}
      <div style={s.body}>

        {/* Mode Toggle */}
        <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
          {SEARCH_MODES.map(m => (
            <button key={m} style={s.modeBtn(searchMode===m)}
              onClick={() => { setSearchMode(m); setResults(null); setError(""); setExpanded(null); }}>
              {m==="By Location"?"📍 By Location": m==="By Band"?"🎸 By Band":"🎶 By Genre"}
            </button>
          ))}
        </div>

        {/* ── By Location ── */}
        {isLocationMode && (
          <div style={s.row}>
            <input style={s.input} type="text" value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&searchByLocation()} placeholder="Zip code, city, venue, or restaurant…" />
            <button style={s.btnLoc} onClick={useLocation} title="Use my location">{locating?"⏳":"📍"}</button>
            <button style={s.btnSearch(isDisabled)} onClick={handleSearch} disabled={isDisabled}>{loading?"…":"Search"}</button>
          </div>
        )}

        {/* ── By Band ── */}
        {isBandMode && (
          <>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>
              Enter the band or artist name <strong>and</strong> your location — helps find the right act when names overlap.
            </div>
            <div style={s.row}>
              <input style={s.inputSm} type="text" value={bandName} onChange={e=>setBandName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&searchByBand()} placeholder="Band or artist name…" />
              <input style={s.inputSm} type="text" value={bandLocation} onChange={e=>setBandLocation(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&searchByBand()} placeholder="Your city or zip code…" />
              <button style={s.btnSearch(isDisabled)} onClick={handleSearch} disabled={isDisabled}>{loading?"…":"Search"}</button>
            </div>
          </>
        )}

        {/* ── By Genre ── */}
        {isGenreMode && (
          <>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>
              Pick a genre below or type your own, then enter your location:
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
              {GENRE_QUICK.map(g => (
                <button key={g} style={s.genreChip(genreQuery===g)} onClick={()=>setGenreQuery(g)}>{g}</button>
              ))}
            </div>
            <div style={s.row}>
              <input style={s.inputSm} type="text" value={genreQuery} onChange={e=>setGenreQuery(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&searchByGenre()} placeholder="Genre (e.g. EDM, Acoustic, Jazz…)" />
              <input style={s.inputSm} type="text" value={genreLocation} onChange={e=>setGenreLocation(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&searchByGenre()} placeholder="City or zip code…" />
              <button style={s.btnSearch(isDisabled)} onClick={handleSearch} disabled={isDisabled}>{loading?"…":"Search"}</button>
            </div>
          </>
        )}

        {/* Date Filter */}
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          {DATE_FILTERS.map(f => (
            <button key={f} style={s.filterBtn(dateFilter===f)} onClick={()=>setDateFilter(f)}>{f}</button>
          ))}
        </div>

        {/* Radius — shown for all modes */}
        <div style={{ display:"flex", gap:6, marginBottom:10, alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#94a3b8", whiteSpace:"nowrap" }}>📍 Within:</span>
          {RADIUS_OPTIONS.map(r => (
            <button key={r} style={s.filterBtn(radius===r)} onClick={()=>setRadius(r)}>{r} mi</button>
          ))}
        </div>

        {/* Quick picks */}
        {isLocationMode && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.25rem" }}>
            {QUICK.map(sq => (
              <button key={sq} style={s.quickBtn} onClick={()=>{ setQuery(sq); searchByLocation(sq); }}>{sq}</button>
            ))}
          </div>
        )}
        {isBandMode && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.25rem" }}>
            {BAND_QUICK.map(b => (
              <button key={b} style={s.quickBtn} onClick={()=>setBandName(b)}>{b}</button>
            ))}
          </div>
        )}
        {isGenreMode && <div style={{ marginBottom:"1rem" }} />}
      </div>

      {/* Results Area */}
      <div style={{ ...s.results, minHeight:100 }}>
        {error && (
          <div style={{ background:"#fee2e2", border:"0.5px solid #fca5a5", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:12 }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign:"center", padding:"2.5rem 0", color:"#64748b" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{modeIcon}</div>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>{loadText}</div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>{dateFilter} • {loadSub}</div>
          </div>
        )}

        {results !== null && !loading && (
          <>
            {/* West Chester featured venues */}
            {showFeatured && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:11, fontWeight:600, color:"#e85d04", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 8px" }}>⭐ Featured West Chester Venues</p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {FEATURED_VENUES.map((v,i) => (
                    <div key={i} style={{ flex:"1 1 260px", background:`linear-gradient(135deg,${v.color}22,${v.color}08)`, border:`1.5px solid ${v.color}44`, borderRadius:14, padding:"14px 16px" }}>
                      <p style={{ fontWeight:700, fontSize:15, margin:"0 0 4px", color:"#0f172a" }}>{v.name}</p>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:v.color+"22", color:v.color, fontWeight:600 }}>{v.tag}</span>
                      <VenuePhotoGallery venueName={v.name} color={v.color} />
                      <p style={{ fontSize:12, color:"#64748b", margin:"10px 0 8px", lineHeight:1.5 }}>{v.description}</p>
                      <p style={{ fontSize:11, color:"#94a3b8", margin:"0 0 10px" }}>📍 {v.address}</p>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <a href={v.scheduleUrl} target="_blank" rel="noreferrer"
                          style={{ fontSize:12, padding:"6px 14px", borderRadius:99, background:v.color, color:"#fff", textDecoration:"none", fontWeight:500 }}>🎵 View Schedule</a>
                        <a href={v.reserveUrl} target="_blank" rel="noreferrer"
                          style={{ fontSize:12, padding:"6px 14px", borderRadius:99, background:"#f1f5f9", color:"#64748b", textDecoration:"none", border:"0.5px solid #e2e8f0" }}>Reserve</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Band/Genre verification notice */}
            {(isBandMode || isGenreMode) && results.length > 0 && (
              <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:12, color:"#15803d" }}>
                {isBandMode
                  ? <>🎸 Showing shows for <strong>{bandName}</strong> near <strong>{bandLocation}</strong> within <strong>{radius} mi</strong> — verify on the artist's official site.</>
                  : <>🎶 Showing <strong>{genreQuery}</strong> events near <strong>{genreLocation}</strong> within <strong>{radius} mi</strong> — always verify before heading out.</>
                }
                <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                  <a href={`https://www.songkick.com/search?query=${encodeURIComponent(isBandMode?bandName:genreQuery)}`} target="_blank" rel="noreferrer"
                    style={{ fontSize:11, padding:"4px 12px", borderRadius:99, background:"#f97316", color:"#fff", textDecoration:"none", fontWeight:500 }}>🎵 Songkick</a>
                  <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(isBandMode?bandName:genreQuery)}`} target="_blank" rel="noreferrer"
                    style={{ fontSize:11, padding:"4px 12px", borderRadius:99, background:"#16a34a", color:"#fff", textDecoration:"none", fontWeight:500 }}>🎸 Bandsintown</a>
                  {isBandMode && (
                    <a href={`https://www.ticketmaster.com/search?q=${encodeURIComponent(bandName)}`} target="_blank" rel="noreferrer"
                      style={{ fontSize:11, padding:"4px 12px", borderRadius:99, background:"#2563eb", color:"#fff", textDecoration:"none", fontWeight:500 }}>🎟 Ticketmaster</a>
                  )}
                </div>
              </div>
            )}

            {/* AI Event Cards */}
            {results.length > 0 && (
              <>
                <p style={{ fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 8px" }}>
                  {isGenreMode ? `🎶 ${genreQuery} Events` : isBandMode ? `🎸 Shows for ${bandName}` : showFeatured ? "🎸 More Live Music Nearby" : "🎸 Live Music Events"}
                </p>

                {isLocationMode && (
                  <div style={{ background:"#fff8f0", border:"1px solid #fed7aa", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:12, color:"#92400e" }}>
                    ⚠️ <strong>Always verify before you go</strong> — AI results may not be accurate.
                    <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                      <a href={`https://www.songkick.com/metro-areas/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer"
                        style={{ fontSize:11, padding:"4px 12px", borderRadius:99, background:"#f97316", color:"#fff", textDecoration:"none", fontWeight:500 }}>🎵 Songkick</a>
                      <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer"
                        style={{ fontSize:11, padding:"4px 12px", borderRadius:99, background:"#16a34a", color:"#fff", textDecoration:"none", fontWeight:500 }}>🎸 Bandsintown</a>
                      <a href={`https://www.google.com/search?q=live+music+${encodeURIComponent(searched)}+this+weekend`} target="_blank" rel="noreferrer"
                        style={{ fontSize:11, padding:"4px 12px", borderRadius:99, background:"#3b82f6", color:"#fff", textDecoration:"none", fontWeight:500 }}>🔍 Google</a>
                    </div>
                  </div>
                )}

                {results.map((r,i) => (
                  <div key={i} style={s.card(r.genre)}>
                    <div style={s.cardInner}>
                      <div style={s.cardTop}>
                        <div>
                          <p style={s.bandName}>{r.band}</p>
                          <p style={s.venueName}>{r.venue}</p>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                          {r.genre && <span style={s.badge(r.genre)}>{r.genre}</span>}
                          {r.distanceMiles != null && (
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:"#f1f5f9", color:"#64748b", fontWeight:600 }}>
                              📍 ~{Math.round(r.distanceMiles)} mi
                            </span>
                          )}
                          {r.confidence==="medium" && (
                            <span style={{ fontSize:9, padding:"2px 8px", borderRadius:99, background:"#fef9c3", color:"#854d0e", fontWeight:600 }}>⚠️ Unverified</span>
                          )}
                        </div>
                      </div>
                      <div style={s.meta}>
                        {r.date    && <span>📅 {r.date}</span>}
                        {r.time    && <span>🕐 {r.time}</span>}
                        {r.address && <span>📍 {r.address}</span>}
                        {r.notes   && <span>ℹ️ {r.notes}</span>}
                        {r.tickets && r.tickets.startsWith("http")
                          ? <a href={r.tickets} target="_blank" rel="noreferrer" style={{ color:"#e85d04", fontWeight:500 }}>🎟 Tickets</a>
                          : r.tickets ? <span>🎟 {r.tickets}</span> : null}
                      </div>
                      <button style={s.expandBtn} onClick={()=>setExpanded(expanded===i?null:i)}>
                        {expanded===i?"▲ Hide details":"▼ Show venue & artist info"}
                      </button>
                    </div>
                    {expanded===i && (
                      <div style={s.expandBox}>
                        {r.venueBio && (
                          <div style={{ marginBottom:12 }}>
                            <p style={s.bioLabel}>🏠 About the Venue</p>
                            <p style={s.bioText}>{r.venueBio}</p>
                          </div>
                        )}
                        {r.bandBio && r.bandBio.trim().length > 10 && (
                          <div style={{ marginBottom:12 }}>
                            <p style={s.bioLabel}>🎤 About the Artist</p>
                            <p style={s.bioText}>{r.bandBio}</p>
                          </div>
                        )}
                        <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:10 }}>
                          <p style={s.bioLabel}>🔍 Verify this event</p>
                          <p style={{ fontSize:12, color:"#94a3b8", margin:"0 0 8px", lineHeight:1.5 }}>
                            {r.confidence==="high"
                              ? "High confidence — still confirm with the venue before heading out."
                              : "AI suggestion based on typical schedules. Please verify directly."}
                          </p>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            <a href={`https://www.google.com/search?q=${encodeURIComponent((r.band||"")+" "+(r.venue||""))}`} target="_blank" rel="noreferrer"
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:99, background:"#3b82f6", color:"#fff", textDecoration:"none" }}>🔍 Google</a>
                            <a href={`https://www.songkick.com/search?query=${encodeURIComponent(r.band||"")}`} target="_blank" rel="noreferrer"
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:99, background:"#f97316", color:"#fff", textDecoration:"none" }}>🎵 Songkick</a>
                            <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(r.band||"")}`} target="_blank" rel="noreferrer"
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:99, background:"#16a34a", color:"#fff", textDecoration:"none" }}>🎸 Bandsintown</a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {results.length === 0 && !showFeatured && (
              <p style={{ fontSize:13, color:"#64748b", padding:"1rem 0" }}>No events found. Try expanding the radius or check Songkick / Bandsintown directly.</p>
            )}
          </>
        )}
      </div>

      {/* Nearby Bars & Restaurants — location mode only */}
      {isLocationMode && (localLoading || localVenues !== null || localError) && (
        <div style={{ background:"#fff", borderTop:"1px solid #e2e8f0", padding:"1.25rem 1.5rem" }}>
          <p style={{ fontSize:12, fontWeight:600, color:"#e85d04", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 6px" }}>🍺 Nearby Bars & Restaurants</p>
          {localLoading && (
            <div style={{ fontSize:13, color:"#64748b", padding:"8px 0" }}>
              <div style={{ marginBottom:4 }}>🔍 Finding bars & restaurants near {searched}…</div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>Scoring each venue for live music likelihood.</div>
            </div>
          )}
          {localError && <div style={{ fontSize:12, color:"#dc2626", marginTop:8 }}>{localError}</div>}
          {localVenues !== null && !localLoading && (
            localVenues.length === 0
              ? <p style={{ fontSize:13, color:"#64748b", margin:"8px 0" }}>No venues found nearby.</p>
              : <>
                  <p style={{ fontSize:11, color:"#94a3b8", margin:"0 0 10px" }}>
                    Found {localVenues.length} venues • Sorted by music likelihood • Tap "Scan Site" to check for events
                  </p>
                  {localVenues.map((v,vi) => {
                    const scoreColor = v.musicScore==="high"?"#16a34a": v.musicScore==="medium"?"#d97706":"#94a3b8";
                    const scoreLabel = v.musicScore==="high"?"🎵 Likely has music": v.musicScore==="medium"?"🎲 Possible music":"🍽 Unknown";
                    const isScanning = scanningVenue===v.website;
                    const scanned    = scannedVenues[v.website];
                    return (
                      <div key={vi} style={{ background:"#f8fafc", borderRadius:14, padding:"14px 16px", marginBottom:10, border:"1px solid #e2e8f0", borderLeft:`4px solid ${scoreColor}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                              <p style={{ fontWeight:700, fontSize:15, margin:0, color:"#0f172a" }}>{v.name}</p>
                              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:scoreColor+"22", color:scoreColor, fontWeight:600 }}>{scoreLabel}</span>
                              {v.isOpen===true  && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:"#dcfce7", color:"#16a34a", fontWeight:600 }}>Open Now</span>}
                              {v.isOpen===false && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:"#fee2e2", color:"#dc2626", fontWeight:600 }}>Closed</span>}
                            </div>
                            <p style={{ fontSize:11, color:"#94a3b8", margin:"0 0 2px" }}>📍 {v.address}</p>
                            {v.rating && <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>⭐ {v.rating} ({v.totalRatings?.toLocaleString()} reviews)</p>}
                            {v.summary && <p style={{ fontSize:12, color:"#64748b", margin:"4px 0 0", fontStyle:"italic" }}>{v.summary}</p>}
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                          {v.website && (
                            <button onClick={()=>scrapeVenue(v.website)} disabled={isScanning}
                              style={{ fontSize:11, padding:"5px 12px", borderRadius:99, background:isScanning?"#e2e8f0":"#e85d04", color:isScanning?"#94a3b8":"#fff", border:"none", cursor:isScanning?"default":"pointer", fontWeight:500 }}>
                              {isScanning?"🔍 Scanning…":"🔍 Scan Site for Events"}
                            </button>
                          )}
                          <a href={`https://www.google.com/search?q=${encodeURIComponent(v.name+" "+v.address+" live music events")}`}
                            target="_blank" rel="noreferrer"
                            style={{ fontSize:11, padding:"5px 12px", borderRadius:99, background:"#f1f5f9", color:"#64748b", textDecoration:"none", border:"0.5px solid #e2e8f0" }}>
                            🌐 Search Events
                          </a>
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noreferrer"
                              style={{ fontSize:11, padding:"5px 12px", borderRadius:99, background:"#f1f5f9", color:"#64748b", textDecoration:"none", border:"0.5px solid #e2e8f0" }}>
                              🌍 Visit Site
                            </a>
                          )}
                          {v.instagram && (
                            <a href={v.instagram} target="_blank" rel="noreferrer"
                              style={{ fontSize:11, padding:"5px 12px", borderRadius:99, background:"#f1f5f9", color:"#c026d3", textDecoration:"none", border:"0.5px solid #e2e8f0" }}>
                              📸 Instagram
                            </a>
                          )}
                          {v.facebook && (
                            <a href={v.facebook} target="_blank" rel="noreferrer"
                              style={{ fontSize:11, padding:"5px 12px", borderRadius:99, background:"#f1f5f9", color:"#1d4ed8", textDecoration:"none", border:"0.5px solid #e2e8f0" }}>
                              👍 Facebook
                            </a>
                          )}
                        </div>

                        {/* Pre-loaded venue events */}
                        {v.events && v.events.length > 0 && !scanned && (
                          <div style={{ marginTop:10 }}>
                            <p style={{ fontSize:11, fontWeight:600, color:"#16a34a", margin:"0 0 6px" }}>✓ Live events found on their website:</p>
                            {v.events.map((e,ei) => (
                              <div key={ei} style={{ background:"#fff", borderRadius:10, padding:"10px 12px", marginBottom:6, border:"1px solid #e2e8f0", borderLeft:"3px solid #e85d04" }}>
                                <p style={{ fontWeight:600, fontSize:14, margin:"0 0 4px", color:"#0f172a" }}>{e.band}</p>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 14px", fontSize:12, color:"#64748b" }}>
                                  {e.date  && <span>📅 {e.date}</span>}
                                  {e.time  && <span>🕐 {e.time}</span>}
                                  {e.notes && <span>ℹ️ {e.notes}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* On-demand scanned events */}
                        {scanned !== undefined && (
                          <div style={{ marginTop:10 }}>
                            {scanned.length === 0
                              ? <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>No event pages found on this site.</p>
                              : <>
                                  <p style={{ fontSize:11, fontWeight:600, color:"#16a34a", margin:"0 0 6px" }}>✓ Live events found on their website:</p>
                                  {scanned.map((e,ei) => (
                                    <div key={ei} style={{ background:"#fff", borderRadius:10, padding:"10px 12px", marginBottom:6, border:"1px solid #e2e8f0", borderLeft:"3px solid #e85d04" }}>
                                      <p style={{ fontWeight:600, fontSize:14, margin:"0 0 4px", color:"#0f172a" }}>{e.band}</p>
                                      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 14px", fontSize:12, color:"#64748b" }}>
                                        {e.date  && <span>📅 {e.date}</span>}
                                        {e.time  && <span>🕐 {e.time}</span>}
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
      )}
    </div>
  );
}