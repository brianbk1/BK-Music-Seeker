"use client";

// InstagramFeed — BBK Music Seeker
// ---------------------------------------------------------------------------
// Live Instagram grid from a Behold JSON feed, styled to match the site
// (light theme, orange gradient CTA, slate text, 700px column).
//
// This is a CLIENT component ("use client" above is required) because it
// fetches in the browser. It still renders fine inside the async Server
// Component in app/page.js.
//
// Save this at: app/components/InstagramFeed.js
//
// TODO before it works: paste the locallivemusic Behold feed ID below, and
// confirm the Instagram handle in IG_URL.

import { useState, useEffect } from "react";

const FEED_ID = "5w8jGnIbTt1OgehLnZbp"; // Behold JSON feed for the locallivemusic IG account
const IG_URL = "https://instagram.com/locallivemusic"; // <-- confirm the real handle

const C = {
  ink: "#0f172a",
  slate: "#475569",
  orange: "#e85d04",
  orangeDeep: "#c44a00",
  skel: "#e2e8f0",
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function InstagramFeed({ feedId = FEED_ID, limit = 6 }) {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let active = true;
    setStatus("loading");

    fetch(`https://feeds.behold.so/${feedId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Behold feed request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const items = Array.isArray(data) ? data : data?.posts ?? [];
        setPosts(items.slice(0, limit));
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [feedId, limit]);

  const imageFor = (p) =>
    p?.sizes?.medium?.mediaUrl ||
    p?.sizes?.small?.mediaUrl ||
    p?.thumbnailUrl ||
    p?.mediaUrl ||
    "";

  const isVideo = (p) => p?.mediaType === "VIDEO" || p?.isReel === true;

  const altFor = (p) =>
    (p?.prunedCaption || p?.caption || "Instagram post").split("\n")[0].slice(0, 120);

  const wrap = {
    maxWidth: 700,
    margin: "0 auto",
    padding: "0.5rem 1.5rem 2rem",
    fontFamily: FONT,
  };
  const heading = {
    fontSize: "1rem",
    fontWeight: 700,
    color: C.ink,
    margin: "0 0 0.75rem",
  };
  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 8,
  };

  return (
    <section style={wrap} aria-label="Instagram feed">
      <style>{`
        @keyframes bbkPulse { 0%,100% { opacity: 0.5 } 50% { opacity: 0.85 } }
        .bbk-ig-tile img { transition: transform .3s ease; display:block; width:100%; height:100%; object-fit:cover; }
        .bbk-ig-tile:hover img { transform: scale(1.06); }
        .bbk-ig-skel { animation: bbkPulse 1.4s ease-in-out infinite; }
        .bbk-ig-follow:hover { filter: brightness(1.05); }
      `}</style>

      <h2 style={heading}>🎵 Follow Local Live Music on Instagram</h2>

      {status === "error" ? (
        <p style={{ fontSize: "0.875rem", color: C.slate, lineHeight: 1.7 }}>
          Couldn&apos;t load Instagram right now.{" "}
          <a href={IG_URL} target="_blank" rel="noopener noreferrer" style={{ color: C.orange }}>
            View on Instagram →
          </a>
        </p>
      ) : (
        <div style={grid}>
          {status === "loading"
            ? Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className="bbk-ig-skel"
                  style={{ aspectRatio: "1 / 1", borderRadius: 10, background: C.skel }}
                />
              ))
            : posts.map((p) => (
                <a
                  key={p.id}
                  className="bbk-ig-tile"
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={altFor(p)}
                  style={{
                    position: "relative",
                    display: "block",
                    aspectRatio: "1 / 1",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#f1f5f9",
                  }}
                >
                  <img src={imageFor(p)} alt={altFor(p)} loading="lazy" />
                  {isVideo(p) && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 999,
                      }}
                    >
                      ▶ {p.isReel ? "Reel" : "Video"}
                    </span>
                  )}
                </a>
              ))}
        </div>
      )}

      {status !== "error" && (
        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <a
            className="bbk-ig-follow"
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: `linear-gradient(135deg,${C.orange},${C.orangeDeep})`,
              color: "#fff",
              textDecoration: "none",
              padding: "12px 32px",
              borderRadius: 99,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.3px",
              boxShadow: "0 2px 12px rgba(232,93,4,0.35)",
            }}
          >
            Follow @locallivemusic
          </a>
        </div>
      )}
    </section>
  );
}
