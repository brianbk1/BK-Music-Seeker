"use client";
import { useState, useEffect } from "react";

const FEATURED_VENUES = [
  { name:"Pietro's Prime", tag:"Live music Wed–Sat", description:"West Chester's premier upscale steakhouse with exceptional cuisine, the best martinis in town, and live entertainment every Wednesday through Saturday night.", address:"125 West Market St, West Chester, PA 19382", scheduleUrl:"https://www.pietrosprime.com/event-list", website:"https://www.pietrosprime.com", openTable:"https://www.opentable.com/pietros-prime", instagram:"https://www.instagram.com/pietrosprime/", color:"#e85d04" },
  { name:"Station 142", tag:"Live music Thurs–Sat", description:"West Chester's premier live music venue featuring an intimate stage, state-of-the-art sound system, two full bars, rooftop dining, and top local and regional acts.", address:"142 E Market St, West Chester, PA 19382", scheduleUrl:"https://station142.com/live-music/", website:"https://station142.com", openTable:null, instagram:"https://www.instagram.com/station.142/", color:"#1a0a00" },
  { name:"Brickette Lounge", tag:"Live music & events • 21+", description:"West Chester's lively neighborhood bar featuring live music, events, and a full BBQ menu on weekends. Bar open daily 12pm–2am. 21+ after 5pm.", address:"3 W Gay St, West Chester, PA 19380", scheduleUrl:"https://www.brickettelounge.com/music-events", website:"https://www.brickettelounge.com", openTable:null, instagram:"https://www.instagram.com/brickettelounge/", color:"#7c3aed" },
  { name:"Slow Hand Food & Drink", tag:"Live music & events", description:"West Chester's upscale American comfort restaurant in a historic firehouse, hosting live performances from local bands and solo artists alongside scratch-made food and award-winning cocktails.", address:"30 N Church St, West Chester, PA 19380", scheduleUrl:"https://www.slowhand-wc.com/events", website:"https://www.slowhand-wc.com", openTable:"https://www.opentable.com/slow-hand-food-and-drink", instagram:"https://www.instagram.com/slowhandwc/", color:"#0f766e" },
  { name:"Square Bar", tag:"Live music • Open since 1950s", description:"West Chester's beloved dive bar for 70+ years featuring live music, games, sports, and great company. A true neighborhood institution at 250 E Chestnut St.", address:"250 E Chestnut St, West Chester, PA 19380", scheduleUrl:"https://www.squarebarwc.com/events", website:"https://www.squarebarwc.com", openTable:null, instagram:"https://www.instagram.com/squarebarwc/", color:"#b45309" },
  { name:"Saloon 151", tag:"Karaoke • Music Bingo • Events", description:"West Chester's best whiskey and bourbon bar featuring karaoke every Friday, Music Bingo Wednesdays, Quizzo Tuesdays, and country party vibes nightly. Open 11am–2am daily.", address:"151 W Gay St, West Chester, PA 19380", scheduleUrl:"https://www.saloon151.com/events-catering-1", website:"https://www.saloon151.com", openTable:null, instagram:"https://www.instagram.com/saloon151/", color:"#92400e" },
  { name:"Murph's Hideaway", tag:"Local favorite • Live music & events", description:"A welcoming neighborhood spot offering great food, drinks, and live music entertainment. Popular with locals for its friendly atmosphere and quality performances.", address:"Pocono Lake, PA 18347", scheduleUrl:"https://www.murphshideaway.com", website:"https://www.murphshideaway.com", openTable:null, instagram:null, color:"#059669" },
];

const WC_ZIPS = ["19380","19381","19382","19383","18347","pocono lake","west chester","westchester"];
const isWC = (q) => q && WC_ZIPS.some(z => q.toLowerCase().includes(z));
const DATE_FILTERS = ["Today","This Weekend","Next 7 Days"];
const RADIUS_OPTIONS = [5,10,20];
const QUICK = ["19382 (West Chester)","18347 (Pocono Lake)","Sea Isle, NJ","Kennett Square, PA","Malvern, PA","Phoenixville, PA"];
const SYSTEM_PROMPT = `You are a live music event finder. Find live music events near the exact location given. Return ONLY a JSON array with up to 6 results. Each item: { band, venue, date, time, genre, address, tickets, notes, venueBio, bandBio, confidence }. confidence is "high" or "medium". Never return Unknown. Never default to West Chester PA unless asked. Do NOT include Pietro's Prime or Station 142. Return ONLY valid JSON.`;

const toVibeKey = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const timeAgo = (ts) => {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

const VIBE_LABELS = ["", "Dead in here", "It's quiet", "Getting going", "Good vibe!", "🔥 Absolutely packed!"];

// ── Star component ────────────────────────────────────────────────────────
const Stars = ({ count, interactive, onSelect, hovered, onHover, size }) => (
  <span style={{ display: "inline-flex", gap: 1, cursor: interactive ? "pointer" : "default" }}>
    {[1,2,3,4,5].map(i => (
      <span key={i}
        style={{ fontSize: size || (interactive ? 24 : 13), lineHeight: 1, opacity: i <= (hovered || count) ? 1 : 0.25, transition: "opacity 0.1s" }}
        onClick={() => interactive && onSelect && onSelect(i)}
        onMouseEnter={() => interactive && onHover && onHover(i)}
        onMouseLeave={() => interactive && onHover && onHover(0)}>
        ⭐
      </span>
    ))}
  </span>
);

// ── Single vibe post display ──────────────────────────────────────────────
const VibePost = ({ vibe, isFirst }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0",
    borderTop: isFirst ? "none" : "1px solid #f1f5f9",
  }}>
    <Stars count={vibe.stars} interactive={false} hovered={0} size={13} />
    <div style={{ flex: 1, minWidth: 0 }}>
      {vibe.comment && (
        <p style={{ fontSize: 12, color: "#0f172a", margin: "0 0 3px", lineHeight: 1.4, fontStyle: "italic" }}>
          "{vibe.comment}"
        </p>
      )}
      <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>{timeAgo(vibe.postedAt)}</p>
    </div>
  </div>
);

// ── Vibe input form (shown inside the card when + Share clicked) ──────────
const VibeForm = ({ venueKey, onSubmit, onCancel }) => {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!stars) { setError("Pick a star rating first"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueKey, stars, comment }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setSubmitting(false); return; }
      onSubmit(data.vibe);
    } catch { setError("Something went wrong, try again"); setSubmitting(false); }
  };

  return (
    <div style={{ padding: "12px 14px", borderTop: "1px solid #f1f5f9" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", margin: "0 0 10px" }}>
        What's happening right now?
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Stars count={stars} interactive={true} onSelect={setStars} hovered={hovered} onHover={setHovered} />
        {(hovered || stars) > 0 && (
          <span style={{ fontSize: 12, color: "#e85d04", fontWeight: 500 }}>
            {VIBE_LABELS[hovered || stars]}
          </span>
        )}
      </div>
      <input
        value={comment}
        onChange={e => setComment(e.target.value.slice(0, 120))}
        placeholder="What's happening? (optional)"
        style={{ width: "100%", fontSize: 12, padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none", boxSizing: "border-box", marginBottom: 8 }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>Visible for 1 hour · {120 - comment.length} chars left</p>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onCancel}
            style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, background: "transparent", color: "#94a3b8", border: "1px solid #e2e8f0", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={submit} disabled={submitting || !stars}
            style={{ fontSize: 11, padding: "5px 14px", borderRadius: 8, background: submitting || !stars ? "#e2e8f0" : "#e85d04", color: submitting || !stars ? "#94a3b8" : "#fff", border: "none", cursor: submitting || !stars ? "default" : "pointer", fontWeight: 600 }}>
            {submitting ? "Posting…" : "Post Vibe"}
          </button>
        </div>
      </div>
      {error && <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0" }}>{error}</p>}
    </div>
  );
};

// ── Full vibe section per venue card ──────────────────────────────────────
const VibeSection = ({ venueName, allVibes, instagram }) => {
  const venueKey = toVibeKey(venueName);
  const [showForm, setShowForm] = useState(false);
  const [localVibes, setLocalVibes] = useState([]);

  const serverVibes = allVibes[venueKey] || [];
  const merged = [...serverVibes];
  localVibes.forEach(lv => {
    if (!merged.find(sv => sv.postedAt === lv.postedAt)) merged.push(lv);
  });
  const currentVibes = merged.sort((a, b) => b.postedAt - a.postedAt);

  const handleSubmit = (vibe) => {
    setLocalVibes(prev => [...prev, vibe]);
    setShowForm(false);
  };

  return (
    <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>

      {/* Orange header bar */}
      <div style={{ background: "#e85d04", padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ color: "white", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Live Vibe
          </span>
          {currentVibes.length > 0 && (
            <span style={{ background: "rgba(255,255,255,0.25)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 400 }}>
              {currentVibes.length} in the last hour
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {instagram && (
            <a href={instagram} target="_blank" rel="noreferrer"
              style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, textDecoration: "none", fontWeight: 500 }}>
              📸 Photos
            </a>
          )}
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              style={{ background: "white", color: "#e85d04", border: "none", borderRadius: 99, fontSize: 11, fontWeight: 600, padding: "3px 10px", cursor: "pointer" }}>
              + Share
            </button>
          )}
        </div>
      </div>

      {/* Vibe posts */}
      {currentVibes.length > 0 && (
        <div style={{ background: "white", padding: "0 14px" }}>
          {currentVibes.map((v, i) => (
            <VibePost key={v.postedAt} vibe={v} isFirst={i === 0} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {currentVibes.length === 0 && !showForm && (
        <div style={{ background: "white", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, opacity: 0.4 }}>💬</span>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
            No reports yet — be the first to share the vibe!
          </p>
        </div>
      )}

      {/* Post form */}
      {showForm && (
        <div style={{ background: "white" }}>
          <VibeForm venueKey={venueKey} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
};

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
  const [venueSchedules, setVenueSchedules] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(null);
  const [allVibes, setAllVibes] = useState({});

  // Fetch all vibes on mount and refresh every 60 seconds
  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const res = await fetch("/api/vibe?all=true");
        const data = await res.json();
        if (data.vibes) setAllVibes(data.vibes);
      } catch {}
    };
    fetchVibes();
    const interval = setInterval(fetchVibes, 60000);
    return () => clearInterval(interval);
  }, []);

  const getDateRange = (f) => {
    const d = new Date();
    const day = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (f === "Today") return `today only, ${day}`;
    if (f === "This Weekend") return `this weekend (Saturday and Sunday)`;
    return `the next 7 days starting ${day}`;
  };

  const findLocalVenues = async (loc, r) => {
    if (!loc) return;
    setLocalLoading(true); setLocalError(""); setLocalVenues(null);
    try {
      const res = await fetch("/api/venues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: loc, radius: r || radius }) });
      const data = await res.json();
      if (data.error) { setLocalError(data.error.message); return; }
      setLocalVenues(data.venues);
    } catch (e) { setLocalError(e.message); }
    finally { setLocalLoading(false); }
  };

  const loadKnownSchedule = async (venue) => {
    const key = venue.website || venue.name;
    if (venueSchedules[key]) return;
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueName: venue.name, venueAddress: venue.address, venueWebsite: venue.website, findPerformers: false }),
      });
      const data = await res.json();
      if (data.schedule && data.schedule.length > 0) {
        setVenueSchedules(prev => ({ ...prev, [key]: data }));
      }
    } catch {}
  };

  useEffect(() => { if (showFeatured) FEATURED_VENUES.forEach(v => loadKnownSchedule(v)); }, [showFeatured]);
  useEffect(() => { if (localVenues) localVenues.forEach(v => loadKnownSchedule(v)); }, [localVenues]);

  const findPerformers = async (venue) => {
    const key = venue.website || venue.name;
    if (loadingSchedule === key) return;
    setLoadingSchedule(key);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueName: venue.name, venueAddress: venue.address, venueWebsite: venue.website, findPerformers: true }),
      });
      const data = await res.json();
      setVenueSchedules(prev => ({ ...prev, [key]: { schedule: data.schedule || [], source: data.source || "none", days: data.days } }));
    } catch {
      setVenueSchedules(prev => ({ ...prev, [key]: { schedule: [], source: "error" } }));
    } finally { setLoadingSchedule(null); }
  };

  const filterSchedule = (schedule, filter) => {
    const hasSpecificDates = schedule.some(e => /\d{1,2}/.test((e.day || "") + (e.date || "")));
    if (!hasSpecificDates) return schedule;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    if (filter === "Today") { end.setHours(23, 59, 59); }
    else if (filter === "This Weekend") { const d = now.getDay(); end.setDate(now.getDate() + (d === 6 ? 1 : 7 - d)); end.setHours(23, 59, 59); }
    else { end.setDate(now.getDate() + 7); }
    return schedule.filter(e => {
      const ds = e.date || e.day || ""; if (!ds) return true;
      const p = new Date(ds + " 2026"); if (isNaN(p)) return true;
      p.setHours(0, 0, 0, 0);
      if (filter === "Today") return p.getTime() === now.getTime();
      if (filter === "This Weekend") return (p.getDay() === 6 || p.getDay() === 0) && p >= now && p <= end;
      return p >= now && p <= end;
    });
  };

  const search = async (q) => {
    const sq = (q || query).trim();
    if (!sq) return;
    setLoading(true); setError(""); setResults(null); setSearched(sq); setExpanded(null);
    setLocalVenues(null); setLocalError(""); setVenueSchedules({});
    const wc = isWC(sq);
    setShowFeatured(wc);
    findLocalVenues(sq, radius);
    if (wc) { setResults([]); setLoading(false); return; }
    try {
      const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system: SYSTEM_PROMPT, messages: [{ role: "user", content: `Find live music near: "${sq}" for ${getDateRange(dateFilter)}.` }] }) });
      const data = await res.json();
      if (data.error) { setError(data.error.message); return; }
      const tb = data.content?.find(b => b.type === "text");
      if (!tb) { setError("No response."); return; }
      setResults(JSON.parse(tb.text.trim().replace(/```json|```/g, "").trim()));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const useLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const data = await res.json();
        const a = data.address;
        const loc = `${a.city || a.town || a.village || a.county}, ${a.state}`;
        setQuery(loc); setLocating(false); search(loc);
      } catch { setLocating(false); }
    }, () => { setError("Location access denied."); setLocating(false); });
  };

  const btn = (active) => ({ fontSize: 12, padding: "5px 14px", borderRadius: 99, border: `1.5px solid ${active ? "#e85d04" : "#e2e8f0"}`, background: active ? "#e85d04" : "transparent", color: active ? "#fff" : "#64748b", cursor: "pointer", fontWeight: active ? 600 : 400 });
  const gc = (g) => ({ "Rock": "#e85d04", "Jazz": "#1D9E75", "Country": "#BA7517", "Pop": "#D4537E", "Blues": "#378ADD", "Cover Band": "#888780", "Folk": "#639922", "R&B": "#D85a30", "Acoustic": "#0F6E56", "Indie": "#7F77DD" })[g] || "#e85d04";

  const ScheduleBlock = ({ schedData, isLoading, websiteUrl, isFeatured }) => {
    if (isLoading) return <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 0" }}>🔍 Searching for current performers…</p>;
    if (!schedData || schedData.schedule.length === 0) return null;
    const filtered = filterSchedule(schedData.schedule, dateFilter);
    if (filtered.length === 0) return null;
    const sourceLabel = schedData.source === "web_search" ? "📅 Found via web search:" : schedData.source === "website" ? "📅 From their website:" : "📅 Typical weekly schedule:";
    const bg = isFeatured ? "rgba(255,255,255,0.75)" : "#fff";
    return (
      <div style={{ marginTop: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#1D9E75", margin: "0 0 6px" }}>{sourceLabel}</p>
        {filtered.map((e, ei) => (
          <div key={ei} style={{ background: bg, borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #e2e8f0", borderLeft: "3px solid #1D9E75" }}>
            <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 3px", color: "#0f172a" }}>{e.event || e.band || "Event"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px", fontSize: 11, color: "#64748b" }}>
              {e.day && <span>📆 {e.day}</span>}
              {e.date && <span>📅 {e.date}</span>}
              {e.time && <span>🕐 {e.time}</span>}
              {e.notes && <span>ℹ️ {e.notes}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const NoScheduleMessage = ({ websiteUrl }) => (
    <div style={{ marginTop: 8, background: "#fff8f0", borderRadius: 10, padding: "10px 12px", border: "1px solid #fed7aa" }}>
      <p style={{ fontSize: 12, color: "#92400e", margin: "0 0 6px" }}>😕 Couldn't find a specific schedule right now.</p>
      {websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#e85d04", fontWeight: 600, textDecoration: "none" }}>👉 Visit their site to see the current event lineup →</a>}
    </div>
  );

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", maxWidth: 700, margin: "0 auto", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#e85d04 0%,#c44a00 100%)", textAlign: "center", padding: "10px 0 0" }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: "2px", textTransform: "uppercase" }}>Find live music anywhere</p>
        <img src="/hero.png" alt="" style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "center top", maxHeight: 220 }} />
      </div>

      {/* Search */}
      <div style={{ background: "#fff", padding: "1.25rem 1.5rem 0" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Zip code, city, venue, or restaurant…"
            style={{ flex: 1, fontSize: 15, borderRadius: 10, padding: "10px 14px", border: "1px solid #e2e8f0", outline: "none" }} />
          <button onClick={useLocation} title="Use my location"
            style={{ padding: "0 14px", fontSize: 18, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer" }}>
            {locating ? "⏳" : "📍"}
          </button>
          <button onClick={() => search()} disabled={loading || !query.trim()}
            style={{ padding: "0 18px", fontSize: 15, fontWeight: 500, borderRadius: 10, border: "none", background: loading || !query.trim() ? "#e2e8f0" : "#e85d04", color: loading || !query.trim() ? "#94a3b8" : "#fff", cursor: loading || !query.trim() ? "default" : "pointer" }}>
            {loading ? "…" : "Search"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {DATE_FILTERS.map(f => (<button key={f} style={btn(dateFilter === f)} onClick={() => setDateFilter(f)}>{f}</button>))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>📍 Within:</span>
          {RADIUS_OPTIONS.map(r => (<button key={r} style={btn(radius === r)} onClick={() => setRadius(r)}>{r} mi</button>))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {QUICK.map(sq => (
            <button key={sq} onClick={() => { setActiveQuick(sq); setQuery(sq); search(sq); }}
              style={{ fontSize: 11, padding: "5px 14px", borderRadius: 99, border: "1.5px solid #e85d04", background: activeQuick === sq ? "#e85d04" : "transparent", color: activeQuick === sq ? "#fff" : "#e85d04", cursor: "pointer", fontWeight: activeQuick === sq ? 600 : 400 }}>
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ background: "#fff", padding: "0 1.5rem 1.5rem", minHeight: 80 }}>
        {error && <div style={{ background: "#fee2e2", border: "0.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 12 }}>{error}</div>}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem 0", color: "#64748b" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎵</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Finding live music near <em>{searched}</em>…</div>
          </div>
        )}

        {results !== null && !loading && (
          <>
            {/* Featured Venues */}
            {showFeatured && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#e85d04", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>⭐ Featured Venues</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {FEATURED_VENUES.filter(v => {
                    const sl = searched.toLowerCase(), al = v.address.toLowerCase();
                    if (sl.includes("19382") || sl.includes("west chester") || sl.includes("westchester")) return al.includes("19382") || al.includes("west chester");
                    if (sl.includes("18347") || sl.includes("pocono lake")) return al.includes("18347") || al.includes("pocono lake");
                    return false;
                  }).map((v, i) => {
                    const key = v.website || v.name;
                    const isLoadingSched = loadingSchedule === key;
                    const schedData = venueSchedules[key];
                    const hasPerformerData = schedData && (schedData.source === "web_search" || schedData.source === "website");
                    return (
                      <div key={i} style={{ flex: "1 1 260px", background: `linear-gradient(135deg,${v.color}22,${v.color}08)`, border: `1.5px solid ${v.color}44`, borderRadius: 14, padding: "14px 16px" }}>
                        <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 4px", color: "#0f172a" }}>{v.name}</p>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: v.color + "22", color: v.color, fontWeight: 600 }}>{v.tag}</span>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "8px 0", lineHeight: 1.5 }}>{v.description}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 10px" }}>📍 {v.address}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                          {!hasPerformerData && (
                            <button onClick={() => findPerformers(v)} disabled={isLoadingSched}
                              style={{ fontSize: 12, padding: "6px 14px", borderRadius: 99, background: isLoadingSched ? "#e2e8f0" : "#1D9E75", color: isLoadingSched ? "#94a3b8" : "#fff", border: "none", cursor: isLoadingSched ? "default" : "pointer", fontWeight: 500 }}>
                              {isLoadingSched ? "🔍 Searching…" : "🔍 Find This Week's Performers"}
                            </button>
                          )}
                          <a href={v.website} target="_blank" rel="noreferrer"
                            style={{ fontSize: 12, padding: "6px 14px", borderRadius: 99, background: v.color, color: "#fff", textDecoration: "none", fontWeight: 500 }}>
                            🌍 Visit Site
                          </a>
                          {v.openTable && (
                            <a href={v.openTable} target="_blank" rel="noreferrer"
                              style={{ fontSize: 12, padding: "6px 14px", borderRadius: 99, background: "#f1f5f9", color: "#e85d04", textDecoration: "none", border: "0.5px solid #e2e8f0", fontWeight: 500 }}>
                              🍽 Reserve
                            </a>
                          )}
                        </div>
                        <ScheduleBlock schedData={schedData} isLoading={isLoadingSched} websiteUrl={v.scheduleUrl} isFeatured={true} />
                        {hasPerformerData === false && schedData && schedData.schedule.length === 0 && <NoScheduleMessage websiteUrl={v.scheduleUrl} />}
                        <VibeSection venueName={v.name} allVibes={allVibes} instagram={v.instagram} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Results */}
            {results.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>
                  {showFeatured ? "🎸 More Live Music Nearby" : "🎸 Live Music Events"}
                </p>
                <div style={{ background: "#fff8f0", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#92400e" }}>
                  ⚠️ <strong>Always verify before you go</strong> — AI results may not be accurate.
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <a href={`https://www.songkick.com/metro-areas/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#f97316", color: "#fff", textDecoration: "none" }}>🎵 Songkick</a>
                    <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(searched)}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#16a34a", color: "#fff", textDecoration: "none" }}>🎸 Bandsintown</a>
                    <a href={`https://www.google.com/search?q=live+music+${encodeURIComponent(searched)}+this+weekend`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#3b82f6", color: "#fff", textDecoration: "none" }}>🔍 Google</a>
                  </div>
                </div>
                {results.map((r, i) => (
                  <div key={i} style={{ background: "#f8fafc", borderRadius: 14, overflow: "hidden", borderLeft: `4px solid ${gc(r.genre)}`, marginBottom: 10 }}>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 2px", color: "#0f172a" }}>{r.band}</p>
                          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{r.venue}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          {r.genre && <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, background: gc(r.genre) + "22", color: gc(r.genre), fontWeight: 600 }}>{r.genre}</span>}
                          {r.confidence === "medium" && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 99, background: "#fef9c3", color: "#854d0e", fontWeight: 600 }}>⚠️ Unverified</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                        {r.date && <span>📅 {r.date}</span>}
                        {r.time && <span>🕐 {r.time}</span>}
                        {r.address && <span>📍 {r.address}</span>}
                        {r.notes && <span>ℹ️ {r.notes}</span>}
                        {r.tickets && r.tickets.startsWith("http") ? <a href={r.tickets} target="_blank" rel="noreferrer" style={{ color: "#e85d04", fontWeight: 500 }}>🎟 Tickets</a> : r.tickets ? <span>🎟 {r.tickets}</span> : null}
                      </div>
                      <button style={{ fontSize: 12, color: "#e85d04", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }} onClick={() => setExpanded(expanded === i ? null : i)}>
                        {expanded === i ? "▲ Hide details" : "▼ Show venue & artist info"}
                      </button>
                    </div>
                    {expanded === i && (
                      <div style={{ borderTop: "1px solid #e2e8f0", padding: "14px 16px", background: "#fff" }}>
                        {r.venueBio && <div style={{ marginBottom: 10 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#e85d04", margin: "0 0 4px", textTransform: "uppercase" }}>🏠 About the Venue</p><p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{r.venueBio}</p></div>}
                        {r.bandBio && r.bandBio.length > 10 && <div style={{ marginBottom: 10 }}><p style={{ fontSize: 12, fontWeight: 600, color: "#e85d04", margin: "0 0 4px", textTransform: "uppercase" }}>🎤 About the Artist</p><p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{r.bandBio}</p></div>}
                        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#e85d04", margin: "0 0 6px", textTransform: "uppercase" }}>🔍 Verify this event</p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <a href={`https://www.google.com/search?q=${encodeURIComponent((r.band || "") + " " + (r.venue || ""))}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "#3b82f6", color: "#fff", textDecoration: "none" }}>🔍 Google</a>
                            <a href={`https://www.songkick.com/search?query=${encodeURIComponent(r.band || "")}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "#f97316", color: "#fff", textDecoration: "none" }}>🎵 Songkick</a>
                            <a href={`https://www.bandsintown.com/search?query=${encodeURIComponent(r.band || "")}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "#16a34a", color: "#fff", textDecoration: "none" }}>🎸 Bandsintown</a>
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
        <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#e85d04", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>🍺 Nearby Bars & Restaurants</p>
          {localLoading && <div style={{ fontSize: 13, color: "#64748b", padding: "8px 0" }}>🔍 Finding venues near {searched}…</div>}
          {localError && <div style={{ fontSize: 12, color: "#dc2626" }}>{localError}</div>}
          {localVenues !== null && !localLoading && (
            localVenues.length === 0
              ? <p style={{ fontSize: 13, color: "#64748b" }}>No venues found nearby.</p>
              : <>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 10px" }}>Found {localVenues.length} venues • Sorted by music likelihood</p>
                {localVenues.map((v, vi) => {
                  const sc = v.musicScore === "high" ? "#16a34a" : v.musicScore === "medium" ? "#d97706" : "#94a3b8";
                  const sl = v.musicScore === "high" ? "🎵 Likely has music" : v.musicScore === "medium" ? "🎲 Possible music" : "🍽 Unknown";
                  const schedKey = v.website || v.name;
                  const schedData = venueSchedules[schedKey];
                  const isLoadingSched = loadingSchedule === schedKey;
                  const hasPerformerData = schedData && (schedData.source === "web_search" || schedData.source === "website");
                  const otLink = `https://www.opentable.com/s?term=${encodeURIComponent(v.name)}&covers=2`;
                  return (
                    <div key={vi} style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: "1px solid #e2e8f0", borderLeft: `4px solid ${sc}` }}>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#0f172a" }}>{v.name}</p>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: sc + "22", color: sc, fontWeight: 600 }}>{sl}</span>
                          {v.isOpen === true && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>Open Now</span>}
                          {v.isOpen === false && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: "#dc2626", fontWeight: 600 }}>Closed</span>}
                        </div>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px" }}>📍 {v.address}</p>
                        {v.rating && <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px" }}>⭐ {v.rating} ({(v.totalRatings || 0).toLocaleString()} reviews)</p>}
                        {v.summary && <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{v.summary}</p>}
                      </div>
                      {v.photos && v.photos.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
                          {v.photos.map((src, pi) => (
                            <img key={pi} src={src} alt={v.name} style={{ height: 90, width: 130, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "1px solid #e2e8f0" }} />
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {!hasPerformerData && (
                          <button onClick={() => findPerformers(v)} disabled={isLoadingSched}
                            style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: isLoadingSched ? "#e2e8f0" : "#1D9E75", color: isLoadingSched ? "#94a3b8" : "#fff", border: "none", cursor: isLoadingSched ? "default" : "pointer", fontWeight: 500 }}>
                            {isLoadingSched ? "🔍 Searching…" : "🔍 Find This Week's Performers"}
                          </button>
                        )}
                        <a href={otLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#fff0e8", color: "#e85d04", textDecoration: "none", border: "0.5px solid #fed7aa", fontWeight: 500 }}>🍽 Reserve</a>
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(v.name + " " + v.address + " live music events")}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#64748b", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>🌐 Search Events</a>
                        {v.website && <a href={v.website} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#64748b", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>🌍 Visit Site</a>}
                        {v.instagram && <a href={v.instagram} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#c026d3", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>📸 Instagram</a>}
                        {v.facebook && <a href={v.facebook} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: "#f1f5f9", color: "#1d4ed8", textDecoration: "none", border: "0.5px solid #e2e8f0" }}>👍 Facebook</a>}
                      </div>
                      <ScheduleBlock schedData={schedData} isLoading={isLoadingSched} websiteUrl={v.website} isFeatured={false} />
                      {hasPerformerData === false && schedData && schedData.schedule.length === 0 && <NoScheduleMessage websiteUrl={v.website} />}
                      <VibeSection venueName={v.name} allVibes={allVibes} instagram={v.instagram || null} />
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