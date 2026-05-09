"use client";
import { useState } from "react";

const FEATURED_VENUES = [
  { name:"Pietro's Prime", tag:"Live music Wed–Sat", description:"West Chester's premier upscale steakhouse with exceptional cuisine, the best martinis in town, and live entertainment every Wednesday through Saturday night.", address:"125 West Market St, West Chester, PA 19382", scheduleUrl:"https://www.pietrosprime.com/entertainment", reserveUrl:"https://www.opentable.com/pietros-prime", color:"#e85d04" },
  { name:"Station 142", tag:"Live music Thurs–Sat", description:"West Chester's premier live music venue featuring an intimate stage, state-of-the-art sound system, two full bars, rooftop dining, and top local and regional acts.", address:"142 E Market St, West Chester, PA 19382", scheduleUrl:"https://station142.com/live-music/", reserveUrl:"https://station142.com/", color:"#1a0a00" },
];

const WC_ZIPS = ["19380","19381","19382","19383","west chester","westchester"];
const isWC = (q) => q && WC_ZIPS.some(z => q.toLowerCase().includes(z));
const DATE_FILTERS = ["Today","This Weekend","Next 7 Days"];
const RADIUS_OPTIONS = [5,10,20];
const QUICK = ["19382 (West Chester)","Sea Isle, NJ","Kennett Square, PA","Malvern, PA","Phoenixville, PA","Pocono Lake, PA"];

const SYSTEM_PROMPT = `You are a live music event finder. Find live music events near the exact location given. Return ONLY a JSON array with up to 6 results. Each item: { band, venue, date, time, genre, address, tickets, notes, venueBio, bandBio, confidence }. confidence is "high" or "medium". Never return Unknown. Never default to West Chester PA unless asked. Do NOT include Pietro's Prime or Station 142. Return ONLY valid JSON.`;

export default function App() {
  const [query, setQuery] = useState("");
  const [activeQuick, setActiveQuick] = useState("");
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
  const [scannedVenues, setScannedVenues] = useState({});
  const [scanningVenue, setScanningVenue] = useState(null);

  const getDateRange = (f) => {
    const d = new Date();
    const day = d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
    if (f==="Today") return `today only, ${day}`;
    if (f==="This Weekend") return `this weekend (Saturday and Sunday)`;
    return `the next 7 days starting ${day}`;
  };

  const findLocalVenues = async (loc, r) => {
    if (!loc) return;
    setLocalLoading(true); setLocalError(""); setLocalVenues(null);
    try {
      const res = await fetch("/api/venues", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({location:loc, radius:r||radius}) });
      const data = await res.json();
      if (data.error) { setLocalError(data.error.message); return; }
      setLocalVenues(data.venues);
    } catch(e) { setLocalError(e.message); }
    finally { setLocalLoading(false); }
  };

  const scrapeVenue = async (url) => {
    if (!url) return;
    setScanningVenue(url);
    try {
      const res = await fetch("/api/scrape", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({url}) });
      const data = await res.json();
      setScannedVenues(prev => ({...prev, [url]: data.error ? [] : (data.events||[])}));
    } catch { setScannedVenues(prev => ({...prev, [url]:[]})); }
    finally { setScanningVenue(null); }
  };

  const search = async (q) => {
    const sq = (q||query).trim();
    if (!sq) return;
    setLoading(true); setError(""); setResults(null); setSearched(sq); setExpanded(null);
    setLocalVenues(null); setLocalError(""); setScannedVenues({});
    const wc = isWC(sq);
    setShowFeatured(wc);
    findLocalVenues(sq, radius);
    if (wc) { setResults([]); setLoading(false); return; }
    try {
      const res = await fetch("/api/search", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ system:SYSTEM_PROMPT, messages:[{role:"user", content:`Find live music near: "${sq}" for ${getDateRange(dateFilter)}.`}] }) });
      const data = await res.json();
      if (data.error) { setError(data.error.message); return; }
      const tb = data.content?.find(b=>b.type==="text");
      if (!tb) { setError("No response."); return; }
      setResults(JSON.parse(tb.text.trim().replace(/```json|```/g,"").trim()));
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const useLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const data = await res.json();
        const a = data.address;
        const loc = `${a.city||a.town||a.village||a.county}, ${a.state}`;
        setQuery(loc); setLocating(false); search(loc);
      } catch { setLocating(false); }
    }, () => { setError("Location access denied."); setLocating(false); });
  };

  const btn = (active) => ({ fontSize:12, padding:"5px 14px", borderRadius:99, border:`1.5px solid ${active?"#e85d04":"#e2e8f0"}`, background:active?"#e85d04":"transparent", color:active?"#fff":"#64748b", cursor:"pointer", fontWeight:active?600:400 });
  const gc = (g) => ({"Rock":"#e85d04","Jazz":"#1D9E75","Country":"#BA7517","Pop":"#D4537E","Blues":"#378ADD","Cover Band":"#888780","Folk":"#639922","R&B":"#D85a30","Acoustic":"#0F6E56","Indie":"#7F77DD"})[g]||"#e85d04";

  return (
    <div style={{fontFamily:"system-ui,sans-serif",maxWidth:700,margin:"0 auto",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.12)"}}>

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#e85d04 0%,#c44a00 100%)",textAlign:"center",padding:"10px 0 0"}}>
        <p style={{margin:"0 0 8px",fontSize:11,color:"rgba(255,255,255,0.85)",letterSpacing:"2px",textTransform:"uppercase"}}>Find live music anywhere</p>
        <img src="/hero.png" alt="" style={{width:"100%",display:"block",objectFit:"cover",objectPosition:"center top",maxHeight:220}} />
      </div>

      {/* Search */}
      <div style={{background:"#fff",padding:"1.25rem 1.5rem 0"}}>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()}
            placeholder="Zip code, city, venue, or restaurant…"
            style={{flex:1,fontSize:15,borderRadius:10,padding:"10px 14px",border:"1px solid #e2e8f0",outline:"none"}} />
          <button onClick={useLocation} title="Use my location"
            style={{padding:"0 14px",fontSize:18,borderRadius:10,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer"}}>
            {locating?"⏳":"📍"}
          </button>
          <button onClick={()=>search()} disabled={loading||!query.trim()}
            style={{padding:"0 18px",fontSize:15,fontWeight:500,borderRadius:10,border:"none",background:loading||!query.trim()?"#e2e8f0":"#e85d04",color:loading||!query.trim()?"#94a3b8":"#fff",cursor:loading||!query.trim()?"default":"pointer"}}>
            {loading?"…":"Search"}
          </button>
        </div>

        {/* Date filters */}
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {DATE_FILTERS.map(f=>(
            <button key={f} style={btn(dateFilter===f)} onClick={()=>setDateFilter(f)}>{f}</button>
          ))}
        </div>

        {/* Radius filters */}
        <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap"}}>📍 Within:</span>
          {RADIUS_OPTIONS.map(r=>(
            <button key={r} style={btn(radius===r)} onClick={()=>setRadius(r)}>{r} mi</button>
          ))}
        </div>

        {/* Quick picks */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.25rem"}}>
          {QUICK.map(sq=>(
            <button key={sq}
              onClick={()=>{ setActiveQuick(sq); setQuery(sq); search(sq); }}
              style={{fontSize:11,padding:"5px 14px",borderRadius:99,border:"1.5px solid #e85d04",background:activeQuick===sq?"#e85d04":"transparent",color:activeQuick===sq?"#fff":"#e85d04",cursor:"pointer",fontWeight:activeQuick===sq?600:400}}>
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{background:"#fff",padding:"0 1.5rem 1.5rem",minHeight:80}}>
        {error && <div style={{background:"#fee2e2",border:"0.5px solid #fca5a5",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#dc2626",marginBottom:12}}>{error}</div>}

        {loading && (
          <div style={{textAlign:"center",padding:"2rem 0",color:"#64748b"}}>
            <div style={{fontSize:28,marginBottom:8}}>🎵</div>
            <div style={{fontSize:14,fontWeight:500}}>Finding live music near <em>{searched}</em>…</div>
          </div>
        )}

        {results !== null && !loading && (
          <>
            {/* Featured West Chester Venues */}
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
                  {showFeatured?"🎸 More Live Music Nearby":"🎸 Live Music Events"}
                </p>
                <div style={{background:"#fff8f0",border:"1px solid #fed7aa",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#92400e"}}>
                  ⚠️ <strong>Always verify before you go</strong> — AI results may not be accurate.
                  <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                    <a href={`https://www.songkick.com/metro-areas/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:"#f97316",color:"#fff",textDecoration:"none"}}>🎵 Songkick</a>
                    <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:"#16a34a",color:"#fff",textDecoration:"none"}}>🎸 Bandsintown</a>
                    <a href={`https://www.google.com/search?q=live+music+${encodeURIComponent(searched)}+this+weekend`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:"#3b82f6",color:"#fff",textDecoration:"none"}}>🔍 Google</a>
                  </div>
                </div>
                {results.map((r,i)=>(
                  <div key={i} style={{background:"#f8fafc",borderRadius:14,overflow:"hidden",borderLeft:`4px solid ${gc(r.genre)}`,marginBottom:10}}>
                    <div style={{padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                        <div>
                          <p style={{fontWeight:600,fontSize:15,margin:"0 0 2px",color:"#0f172a"}}>{r.band}</p>
                          <p style={{fontSize:13,color:"#64748b",margin:0}}>{r.venue}</p>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                          {r.genre && <span style={{fontSize:10,padding:"3px 10px",borderRadius:99,background:gc(r.genre)+"22",color:gc(r.genre),fontWeight:600}}>{r.genre}</span>}
                          {r.confidence==="medium" && <span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"#fef9c3",color:"#854d0e",fontWeight:600}}>⚠️ Unverified</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"4px 16px",fontSize:12,color:"#64748b",marginBottom:8}}>
                        {r.date && <span>📅 {r.date}</span>}
                        {r.time && <span>🕐 {r.time}</span>}
                        {r.address && <span>📍 {r.address}</span>}
                        {r.notes && <span>ℹ️ {r.notes}</span>}
                        {r.tickets && r.tickets.startsWith("http") ? <a href={r.tickets} target="_blank" rel="noreferrer" style={{color:"#e85d04",fontWeight:500}}>🎟 Tickets</a> : r.tickets ? <span>🎟 {r.tickets}</span> : null}
                      </div>
                      <button style={{fontSize:12,color:"#e85d04",background:"transparent",border:"none",cursor:"pointer",padding:0,fontWeight:500}} onClick={()=>setExpanded(expanded===i?null:i)}>
                        {expanded===i?"▲ Hide details":"▼ Show venue & artist info"}
                      </button>
                    </div>
                    {expanded===i && (
                      <div style={{borderTop:"1px solid #e2e8f0",padding:"14px 16px",background:"#fff"}}>
                        {r.venueBio && <div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:"#e85d04",margin:"0 0 4px",textTransform:"uppercase"}}>🏠 About the Venue</p><p style={{fontSize:13,color:"#64748b",margin:0,lineHeight:1.5}}>{r.venueBio}</p></div>}
                        {r.bandBio && r.bandBio.length>10 && <div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:"#e85d04",margin:"0 0 4px",textTransform:"uppercase"}}>🎤 About the Artist</p><p style={{fontSize:13,color:"#64748b",margin:0,lineHeight:1.5}}>{r.bandBio}</p></div>}
                        <div style={{borderTop:"1px solid #f1f5f9",paddingTop:10}}>
                          <p style={{fontSize:12,fontWeight:600,color:"#e85d04",margin:"0 0 6px",textTransform:"uppercase"}}>🔍 Verify this event</p>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
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
          </>
        )}
      </div>

      {/* Nearby Bars & Restaurants */}
      {(localLoading || localVenues !== null || localError) && (
        <div style={{background:"#fff",borderTop:"1px solid #e2e8f0",padding:"1.25rem 1.5rem"}}>
          <p style={{fontSize:12,fontWeight:600,color:"#e85d04",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>🍺 Nearby Bars & Restaurants</p>
          {localLoading && <div style={{fontSize:13,color:"#64748b",padding:"8px 0"}}>🔍 Finding venues near {searched}… <span style={{fontSize:11,color:"#94a3b8"}}>Scoring for live music likelihood.</span></div>}
          {localError && <div style={{fontSize:12,color:"#dc2626"}}>{localError}</div>}
          {localVenues !== null && !localLoading && (
            localVenues.length === 0
              ? <p style={{fontSize:13,color:"#64748b"}}>No venues found nearby.</p>
              : <>
                  <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 10px"}}>Found {localVenues.length} venues • Sorted by music likelihood</p>
                  {localVenues.map((v,vi)=>{
                    const sc = v.musicScore==="high"?"#16a34a":v.musicScore==="medium"?"#d97706":"#94a3b8";
                    const sl = v.musicScore==="high"?"🎵 Likely has music":v.musicScore==="medium"?"🎲 Possible music":"🍽 Unknown";
                    return (
                      <div key={vi} style={{background:"#f8fafc",borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid #e2e8f0",borderLeft:`4px solid ${sc}`}}>
                        <div style={{marginBottom:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                            <p style={{fontWeight:700,fontSize:15,margin:0,color:"#0f172a"}}>{v.name}</p>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:sc+"22",color:sc,fontWeight:600}}>{sl}</span>
                            {v.isOpen===true && <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#dcfce7",color:"#16a34a",fontWeight:600}}>Open Now</span>}
                            {v.isOpen===false && <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#fee2e2",color:"#dc2626",fontWeight:600}}>Closed</span>}
                          </div>
                          <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 2px"}}>📍 {v.address}</p>
                          {v.rating && <p style={{fontSize:11,color:"#94a3b8",margin:0}}>⭐ {v.rating} ({(v.totalRatings||0).toLocaleString()} reviews)</p>}
                          {v.summary && <p style={{fontSize:12,color:"#64748b",margin:"4px 0 0",fontStyle:"italic"}}>{v.summary}</p>}
                        </div>

                        {/* Photos */}
                        {v.photos && v.photos.length > 0 && (
                          <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto"}}>
                            {v.photos.map((src,pi)=>(
                              <img key={pi} src={src} alt={v.name} style={{height:90,width:130,objectFit:"cover",borderRadius:8,flexShrink:0,border:"1px solid #e2e8f0"}} />
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                          {v.website && (
                            <button onClick={()=>scrapeVenue(v.website)} disabled={scanningVenue===v.website}
                              style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:scanningVenue===v.website?"#e2e8f0":"#e85d04",color:scanningVenue===v.website?"#94a3b8":"#fff",border:"none",cursor:scanningVenue===v.website?"default":"pointer",fontWeight:500}}>
                              {scanningVenue===v.website?"🔍 Scanning…":"🔍 Scan Site for Events"}
                            </button>
                          )}
                          <a href={`https://www.google.com/search?q=${encodeURIComponent(v.name+" "+v.address+" live music events")}`} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#64748b",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>🌐 Search Events</a>
                          {v.website && <a href={v.website} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#64748b",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>🌍 Visit Site</a>}
                          {v.instagram && <a href={v.instagram} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#c026d3",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>📸 Instagram</a>}
                          {v.facebook && <a href={v.facebook} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:99,background:"#f1f5f9",color:"#1d4ed8",textDecoration:"none",border:"0.5px solid #e2e8f0"}}>👍 Facebook</a>}
                        </div>

                        {/* Auto-found events */}
                        {v.events && v.events.length > 0 && (
                          <div style={{marginBottom:8}}>
                            <p style={{fontSize:11,fontWeight:600,color:"#16a34a",margin:"0 0 6px"}}>✓ Events found on their website:</p>
                            {v.events.map((e,ei)=>(
                              <div key={ei} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:6,border:"1px solid #e2e8f0",borderLeft:"3px solid #e85d04"}}>
                                <p style={{fontWeight:600,fontSize:14,margin:"0 0 4px",color:"#0f172a"}}>{e.band}</p>
                                <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:12,color:"#64748b"}}>
                                  {e.date && <span>📅 {e.date}</span>}
                                  {e.time && <span>🕐 {e.time}</span>}
                                  {e.notes && <span>ℹ️ {e.notes}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Scanned events */}
                        {scannedVenues[v.website] !== undefined && (
                          <div>
                            {scannedVenues[v.website].length === 0
                              ? <p style={{fontSize:12,color:"#94a3b8",margin:0}}>No event pages found on this site.</p>
                              : <>
                                  <p style={{fontSize:11,fontWeight:600,color:"#16a34a",margin:"0 0 6px"}}>✓ Scanned events from their website:</p>
                                  {scannedVenues[v.website].map((e,ei)=>(
                                    <div key={ei} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:6,border:"1px solid #e2e8f0",borderLeft:"3px solid #e85d04"}}>
                                      <p style={{fontWeight:600,fontSize:14,margin:"0 0 4px",color:"#0f172a"}}>{e.band}</p>
                                      <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:12,color:"#64748b"}}>
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
      )}
    </div>
  );
}