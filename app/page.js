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
const RADIUS_OPTIONS = [5, 10, 20];
const GENRE_COLORS = {
  Rock:"#e85d04", Jazz:"#1D9E75", Country:"#BA7517", Pop:"#D4537E",
  Blues:"#378ADD", "Cover Band":"#888780", Folk:"#639922", "R&B":"#D85a30",
  Acoustic:"#0F6E56", Indie:"#7F77DD", Classical:"#185FA5", Karaoke:"#9333ea", "Open Mic":"#0891b2",
};
const gc = (g) => GENRE_COLORS[g] || "#e85d04";

const SYSTEM_PROMPT = `You are a live music event finder assistant. The user will provide a location — zip code, city name, city+state, neighborhood, or a specific venue/restaurant name anywhere in the United States. Find live music events near THAT specific location only.

Return a JSON array of up to 6 realistic live music events near the location for the date range given. Use real, well-known venues in the area. It is okay to suggest likely events based on typical schedules for known venues, but be honest about confidence.

Each result must have:
- band: artist or band name
- venue: venue name (use real venues in the area)
- date: day and date (e.g. "Friday, May 9")
- time: start time (e.g. "8:00 PM")
- genre: music genre
- address: full venue address including city and state
- tickets: "Check venue website" or "Free"
- notes: extra info
- venueBio: 2-sentence description of the venue
- bandBio: 2-sentence artist description if known, otherwise ""
- confidence: "high" if certain this event is real, "medium" if a reasonable suggestion

RULES:
1. Only return venues near the EXACT location specified. Never default to West Chester PA.
2. Do NOT include Pietro's Prime or Station 142.
3. If a specific venue or restaurant is named, focus on that venue and nearby venues.
4. Never return "Unknown" — always provide best suggestions using real local venues.
Return ONLY valid JSON array, nothing else.`;

export default function App() {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Next 7 Days");
  const [radius, setRadius] = useState(10);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [showFeatured, setShowFeatured] = useState(false);
  const [localVenues, setLocalVenues] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [venueUrl, setVenueUrl] = useState("");
  const [venueEvents, setVenueEvents] = useState(null);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueError, setVenueError] = useState("");

  const QUICK = ["19382 (West Chester)", "Sea Isle, NJ", "Kennett Square, PA", "Malvern, PA", "Phoenixville, PA", "Pocono Lake, PA"];

  const getDateRange = (filter) => {
    const today = new Date();
    const day = today.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
    if (filter === "Today") return `today only, ${day}`;
    if (filter === "This Weekend") return `this weekend (Saturday and Sunday)`;
    return `the next 7 days starting ${day}`;
  };

  const findLocalVenues = async (loc, r) => {
    const location = loc || searched || query;
    const searchRadius = r || radius;
    if (!location) return;
    setLocalLoading(true); setLocalError(""); setLocalVenues(null);
    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, radius: searchRadius }),
      });
      const data = await res.json();
      if (data.error) { setLocalError(`Error: ${data.error.message}`); return; }
      setLocalVenues(data.venues);
    } catch(e) { setLocalError(`Error: ${e.message}`); }
    finally { setLocalLoading(false); }
  };

  const scrapeVenue = async (url) => {
    const target = url || venueUrl;
    if (!target) return;
    setVenueLoading(true); setVenueError(""); setVenueEvents(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (data.error) { setVenueError(`Error: ${data.error.message}`); return; }
      setVenueEvents(data.events);
    } catch(e) { setVenueError(`Error: ${e.message}`); }
    finally { setVenueLoading(false); }
  };

  const search = async (q) => {
    const sq = (q || query).trim();
    if (!sq) return;
    setLoading(true); setError(""); setResults(null); setSearched(sq); setExpanded(null);
    setLocalVenues(null); setLocalError("");
    const wc = isWestChester(sq);
    setShowFeatured(wc);

    // Always kick off local venue search in parallel
    findLocalVenues(sq, radius);

    // For West Chester, skip AI results
    if (wc) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Find live music events near or at: "${sq}" for ${getDateRange(dateFilter)}. If this is a specific venue or restaurant name, focus on that venue and nearby venues in the same area.` }],
        }),
      });
      const data = await res.json();
      if (data.error) { setError(`Error: ${data.error.message}`); return; }
      const textBlock = data.content?.find(b => b.type === "text");
      if (!textBlock) { setError("No response received."); return; }
      const raw = textBlock.text.trim().replace(/```json|```/g, "").trim();
      setResults(JSON.parse(raw));
    } catch (e) { setError(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const useLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const addr = data.address;
          const loc = `${addr.city || addr.town || addr.village || addr.county}, ${addr.state}`;
          setQuery(loc); setLocating(false); search(loc);
        } catch { setLocating(false); }
      },
      () => { setError("Location access denied."); setLocating(false); }
    );
  };

  const s = {
    wrap: { fontFamily:"system-ui,sans-serif", maxWidth:700, margin:"0 auto", borderRadius:20, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.12)" },
    body: { background:"#fff", padding:"1.25rem 1.5rem 0" },
    row: { display:"flex", gap:8, marginBottom:8 },
    input: { flex:1, fontSize:15, borderRadius:10, padding:"10px 14px", border:"1px solid #e2e8f0", outline:"none" },
    btnLoc: { padding:"0 14px", fontSize:18, borderRadius:10, border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer" },
    btnSearch: (dis) => ({ padding:"0 18px", fontSize:15, fontWeight:500, borderRadius:10, border:"none", background:dis?"#e2e8f0":"#e85d04", color:dis?"#94a3b8":"#fff", cursor:dis?"default":"pointer" }),
    filterBtn: (active) => ({ fontSize:12, padding:"5px 14px", borderRadius:99, border:`1.5px solid ${active?"#e85d04":"#e2e8f0"}`, background:active?"#e85d04":"transparent", color:active?"#fff":"#64748b", cursor:"pointer", fontWeight:active?600:400 }),
    quickBtn: { fontSize:11, padding:"4px 12px", borderRadius:99, border:"0.5px solid #e85d04", color:"#e85d04", background:"transparent", cursor:"pointer" },
    results: { background:"#fff", padding:"0 1.5rem 1.5rem" },
    card: (genre) => ({ background:"#f8fafc", borderRadius:14, overflow:"hidden", borderLeft:`4px solid ${gc(genre)}`, marginBottom:10 }),
    cardInner: { padding:"14px 16px" },
    cardTop: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:6 },
    bandName: { fontWeight:600, fontSize:15, margin:"0 0 2px", color:"#0f172a" },
    venueName: { fontSize:13, color:"#64748b", margin:0 },
    genreBadge: (genre) => ({ fontSize:10, padding:"3px 10px", borderRadius:99, background:gc(genre)+"22", color:gc(genre), fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }),
    meta: { display:"flex", flexWrap:"wrap", gap:"4px 16px", fontSize:12, color:"#64748b", marginBottom:8 },
    expandBtn: { fontSize:12, color:"#e85d04", background:"transparent", border:"none", cursor:"pointer", padding:0, fontWeight:500 },
    expandedBox: { borderTop:"1px solid #e2e8f0", padding:"14px 16px", background:"#fff" },
    bioLabel: { fontSize:12, fontWeight:600, color:"#e85d04", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.5px" },
    bioText: { fontSize:13, color:"#64748b", margin:0, lineHeight:1.5 },
  };

  return (
    <div style={s.wrap}>

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#e85d04 0%,#c44a00 100%)", textAlign:"center", padding:"12px 0 0"}}>
        <p style={{margin:"0 0 8px", fontSize:11, color:"rgba(255,255,255,0.85)", letterSpacing:"2px", textTransform:"uppercase"}}>Find live music anywhere</p>
        <img src="/hero.png" alt="" style={{width:"100%", display:"block", objectFit:"cover", objectPosition:"center top", maxHeight:220}} />
      </div>

      {/* Search */}
      <div style={s.body}>
        <div style={s.row}>
          <input style={s.input} type="text" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="Zip code, city, venue, or restaurant…" />
          <button style={s.btnLoc} onClick={useLocation} title="Use my location">{locating?"⏳":"📍"}</button>
          <button style={s.btnSearch(loading||!query.trim())} onClick={()=>search()} disabled={loading||!query.trim()}>{loading?"…":"Search"}</button>
        </div>
        <div style={{display:"flex", gap:6, marginBottom:10}}>
          {DATE_FILTERS.map(f=>(
            <button key={f} style={s.filterBtn(dateFilter===f)} onClick={()=>setDateFilter(f)}>{f}</button>
          ))}
        </div>
        <div style={{display:"flex", gap:6, marginBottom:10, alignItems:"center"}}>
          <span style={{fontSize:11, color:"#94a3b8", whiteSpace:"nowrap"}}>📍 Within:</span>
          {RADIUS_OPTIONS.map(r=>(
            <button key={r} style={s.filterBtn(radius===r)} onClick={()=>setRadius(r)}>{r} mi</button>
          ))}
        </div>
        <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.25rem"}}>
          {QUICK.map(sq=>(
            <button key={sq} style={s.quickBtn} onClick={()=>{setQuery(sq);search(sq);}}>{sq}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={s.results}>
        {error && <div style={{background:"#fee2e2",border:"0.5px solid #fca5a5",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#dc2626",marginBottom:12}}>{error}</div>}

        {loading && (
          <div style={{textAlign:"center",padding:"2.5rem 0",color:"#64748b"}}>
            <div style={{fontSize:32,marginBottom:12}}>🎵</div>
            <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Finding live music near <em>{searched}</em>…</div>
            <div style={{fontSize:12,color:"#94a3b8"}}>{dateFilter} • Scanning venues &amp; events</div>
          </div>
        )}

        {results !== null && !loading && (
          <>
            {/* Featured Venues */}
            {showFeatured && (
              <div style={{marginBottom:16}}>
                <p style={{fontSize:11,fontWeight:600,color:"#e85d04",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>⭐ Featured West Chester Venues</p>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {FEATURED_VENUES.map((v,i)=>(
                    <div key={i} style={{flex:"1 1 260px",background:`linear-gradient(135deg,${v.color}22,${v.color}08)`,border:`1.5px solid ${v.color}44`,borderRadius:14,padding:"14px 16px"}}>
                      <p style={{fontWeight:700,fontSize:15,margin:"0 0 4px",color:"#0f172a"}}>{v.name}</p>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:v.color+"22",color:v.color,fontWeight:600}}>{v.tag}</span>
                      <p style={{fontSize:12,color:"#64748b",margin:"8px 0",lineHeight:1.5}}>{v.description}</p>
                      <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 10px"}}>📍 {v.address}</p>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <a href={v.scheduleUrl} target="_blank" rel="noreferrer" style={{fontSize:12,padding:"6px 14px",borderRadius:99,background:v.color,color:"#fff",textDecoration:"none",fontWeight:500}}>🎵 View Schedule</a>
                        <a href={v.reserveUrl} target="_blank" rel="noreferrer" style={{fontSize:12,padding:"6px 14px",borderRadius:99,background:"#f1f5f9",color:"#64748b",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>Reserve</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Results */}
            {results.length > 0 && (
              <>
                <p style={{fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>
                  {showFeatured ? "🎸 More Live Music Nearby" : "🎸 Live Music Events"}
                </p>
                <div style={{background:"#fff8f0",border:"1px solid #fed7aa",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#92400e"}}>
                  ⚠️ <strong>Always verify before you go</strong> — AI results may not be accurate. Check:
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
                        <div>
                          <p style={s.bandName}>{r.band}</p>
                          <p style={s.venueName}>{r.venue}</p>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                          {r.genre && <span style={s.genreBadge(r.genre)}>{r.genre}</span>}
                          {r.confidence==="medium" && <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"#fef9c3",color:"#854d0e",fontWeight:600}}>⚠️ Unverified</span>}
                        </div>
                      </div>
                      <div style={s.meta}>
                        {r.date && <span>📅 {r.date}</span>}
                        {r.time && <span>🕐 {r.time}</span>}
                        {r.address && <span>📍 {r.address}</span>}
                        {r.notes && <span>ℹ️ {r.notes}</span>}
                        {r.tickets && r.tickets.startsWith("http")
                          ? <a href={r.tickets} target="_blank" rel="noreferrer" style={{color:"#e85d04",fontWeight:500}}>🎟 Tickets</a>
                          : r.tickets ? <span>🎟 {r.tickets}</span> : null}
                      </div>
                      <button style={s.expandBtn} onClick={()=>setExpanded(expanded===i?null:i)}>
                        {expanded===i?"▲ Hide details":"▼ Show venue & artist info"}
                      </button>
                    </div>
                    {expanded===i && (
                      <div style={s.expandedBox}>
                        {r.venueBio && (
                          <div style={{marginBottom:12}}>
                            <p style={s.bioLabel}>🏠 About the Venue</p>
                            <p style={s.bioText}>{r.venueBio}</p>
                          </div>
                        )}
                        {r.bandBio && r.bandBio.trim().length>10 && (
                          <div style={{marginBottom:12}}>
                            <p style={s.bioLabel}>🎤 About the Artist</p>
                            <p style={s.bioText}>{r.bandBio}</p>
                          </div>
                        )}
                        <div style={{borderTop:"1px solid #f1f5f9",paddingTop:10}}>
                          <p style={s.bioLabel}>🔍 How we found this</p>
                          <p style={{fontSize:12,color:"#94a3b8",margin:"0 0 8px",lineHeight:1.5}}>
                            {r.confidence==="high" ? "Identified with high confidence. Still confirm with the venue before heading out." : "AI suggestion based on typical venue schedules. Please verify directly."}
                          </p>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            <a href={`https://www.google.com/search?q=${encodeURIComponent((r.band||"")+" "+(r.venue||""))}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"4px 10px",borderRadius:99,background:"#3b82f6",color:"#fff",textDecoration:"none"}}>🔍 Google this event</a>
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
          </>
        )}
      </div>

      {/* Local Venue Finder */}
      {(localLoading || localVenues !== null || localError) && (
        <div style={{background:"#fff",borderTop:"1px solid #e2e8f0",padding:"1.25rem 1.5rem"}}>
          <p style={{fontSize:12,fontWeight:600,color:"#e85d04",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>🍺 Nearby Bars & Restaurants</p>
          {localLoading && (
            <div style={{fontSize:13,color:"#64748b",padding:"8px 0"}}>
              <div style={{marginBottom:4}}>🔍 Finding bars & restaurants near {searched}…</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>Scoring each venue for live music likelihood.</div>
            </div>
          )}
          {localError && <div style={{fontSize:12,color:"#dc2626",marginTop:8}}>{localError}</div>}
          {localVenues !== null && !localLoading && (
            localVenues.length === 0
              ? <p style={{fontSize:13,color:"#64748b",margin:"8px 0"}}>No venues found nearby.</p>
              : <>
                  <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 10px"}}>
                    Found {localVenues.length} venues • Sorted by music likelihood • Tap "Scan Site" to check for events
                  </p>
                  {localVenues.map((v,vi)=>{
                    const scoreColor = v.musicScore==="high"?"#16a34a":v.musicScore==="medium"?"#d97706":"#94a3b8";
                    const scoreLabel = v.musicScore==="high"?"🎵 Likely has music":v.musicScore==="medium"?"🎲 Possible music":"🍽 Unknown";
                    return (
                      <div key={vi} style={{background:"#f8fafc",borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid #e2e8f0",borderLeft:`4px solid ${scoreColor}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:2}}>
                              <p style={{fontWeight:700,fontSize:15,margin:0,color:"#0f172a"}}>{v.name}</p>
                              <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:scoreColor+"22",color:scoreColor,fontWeight:600}}>{scoreLabel}</span>
                              {v.isOpen===true && <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#dcfce7",color:"#16a34a",fontWeight:600}}>Open Now</span>}
                              {v.isOpen===false && <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#fee2e2",color:"#dc2626",fontWeight:600}}>Closed</span>}
                            </div>
                            <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 2px"}}>📍 {v.address}</p>
                            {v.rating && <p style={{fontSize:11,color:"#94a3b8",margin:0}}>⭐ {v.rating} ({v.totalRatings?.toLocaleString()} reviews)</p>}
                            {v.summary && <p style={{fontSize:12,color:"#64748b",margin:"4px 0 0",fontStyle:"italic"}}>{v.summary}</p>}
                          </div>
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                          {v.website && (
                            <button onClick={()=>scrapeVenue(v.website)}
                              style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#e85d04",color:"#fff",border:"none",cursor:"pointer",fontWeight:500}}>
                              🔍 Scan Site for Events
                            </button>
                          )}
                          <a href={`https://www.google.com/search?q=${encodeURIComponent(v.name+" "+v.address+" live music events")}`}
                            target="_blank" rel="noreferrer"
                            style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#64748b",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>
                            🌐 Search Events
                          </a>
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noreferrer"
                              style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#64748b",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>
                              🌍 Visit Site
                            </a>
                          )}
                        </div>
                        {/* Show scanned events inline */}
                        {venueLoading && venueUrl===v.website && (
                          <div style={{fontSize:12,color:"#64748b",marginTop:8}}>🔍 Scanning website…</div>
                        )}
                        {venueEvents && venueUrl===v.website && !venueLoading && (
                          <div style={{marginTop:10}}>
                            {venueEvents.length===0
                              ? <p style={{fontSize:12,color:"#94a3b8",margin:0}}>No event pages found on this site.</p>
                              : venueEvents.map((e,ei)=>(
                                <div key={ei} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:6,border:"1px solid #e2e8f0",borderLeft:"3px solid #e85d04"}}>
                                  <p style={{fontWeight:600,fontSize:14,margin:"0 0 4px",color:"#0f172a"}}>{e.band}</p>
                                  <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:12,color:"#64748b"}}>
                                    {e.date && <span>📅 {e.date}</span>}
                                    {e.time && <span>🕐 {e.time}</span>}
                                    {e.notes && <span>ℹ️ {e.notes}</span>}
                                  </div>
                                </div>
                              ))
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