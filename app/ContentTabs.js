"use client";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT FOR SEO / ADSENSE:
// Every tab panel is rendered into the HTML on the server and hidden with CSS
// rather than conditionally mounted. Googlebot receives all of the text on the
// first response. Do not switch this to {active === n && <Panel />} — that would
// hide the other tabs' content from crawlers entirely.
// ─────────────────────────────────────────────────────────────────────────────

const ORANGE = "#e85d04";

const S = {
  h2:   { fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.6rem" },
  h3:   { fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", margin: "1.25rem 0 0.4rem" },
  h3o:  { fontSize: "0.9rem", fontWeight: 700, color: ORANGE, margin: "1.25rem 0 0.4rem" },
  p:    { fontSize: "0.875rem", color: "#475569", margin: "0 0 0.75rem", lineHeight: 1.75 },
  ul:   { fontSize: "0.875rem", color: "#475569", lineHeight: 1.9, margin: "0 0 1rem", paddingLeft: "1.25rem" },
  a:    { color: ORANGE, textDecoration: "none" },
  sec:  { marginBottom: "1.75rem" },
};

const A = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={S.a}>{children}</a>
);

const GENRES = [
  { name: "Irish & Celtic", text: "Built around fiddle, tin whistle, bodhrán, and button accordion, Irish traditional music is played in sessions rather than sets — musicians sit in a circle, someone starts a tune, and everyone who knows it joins in. Reels and jigs run in medleys of two or three. In the US the strongest scenes are in Philadelphia, Boston, Chicago, and the Twin Cities, usually centered on a cultural center or a pub with a standing weekly session." },
  { name: "Latin & Salsa", text: "Salsa is a New York invention built on Cuban son montuno, layered with Puerto Rican bomba and plena and a full brass section. What matters live is the clave — the two-bar rhythmic pattern everything else hangs on. Rooms that book salsa usually clear floor space and often run a free lesson in the first hour, which makes them unusually welcoming to beginners." },
  { name: "Jazz", text: "The broadest category on this list, covering everything from a solo pianist during dinner service to a hard bop quintet playing two full sets. Small-room jazz in America usually means a trio or quartet working through standards with room for improvisation. Listening rooms expect quiet during solos; jazz brunches and hotel bars do not. Knowing which you're walking into changes the whole night." },
  { name: "Blues", text: "Blues splits roughly into acoustic Delta styles — one guitar, one voice, often slide — and amplified Chicago styles built around harmonica, electric guitar, bass, and drums. The twelve-bar form is simple enough that touring players and local musicians can sit in together without rehearsal, which is why blues rooms so often run open jams on weeknights." },
  { name: "Bluegrass & Americana", text: "Acoustic string band music: banjo, fiddle, mandolin, guitar, upright bass, frequently played around a single microphone with players stepping forward for breaks. Bluegrass proper is fast and traditional; Americana is the wider tent that includes alt-country, folk revival, and singer-songwriter material. Both travel well to breweries, listening rooms, and outdoor summer series." },
  { name: "Gospel", text: "American gospel grew out of spirituals and the Black church tradition and remains most powerful in its original setting — a Sunday service with a full choir, organ, and congregation. Many churches welcome visitors to services with notable music programs. Secular gospel and gospel-soul shows also appear at festivals and concert halls, particularly in Chicago, Atlanta, New Orleans, and Philadelphia." },
  { name: "Reggae", text: "Jamaican reggae and its relatives — ska, rocksteady, dub, dancehall — are built on the offbeat guitar skank and a bass line that carries the melody. Live reggae in the US clusters around Caribbean restaurants, beach towns, and summer festival season, and tends toward long sets with heavy emphasis on groove over song structure." },
  { name: "Cajun & Zydeco", text: "Two related Louisiana traditions: Cajun music is French-language, fiddle-and-accordion led, and comes from white Acadian communities; zydeco is its Creole counterpart, faster, built on piano accordion and rubboard, with more blues and R&B in it. Both are dance musics first — outside Louisiana they show up mainly at festivals and dedicated dance halls." },
  { name: "Flamenco", text: "An Andalusian art form combining guitar, voice, percussive handclaps, and dance. A tablao performance is intimate and improvisational within strict rhythmic frameworks called compás. Authentic flamenco in the US is concentrated in New York, Chicago, Albuquerque, and the Bay Area, often at cultural centers rather than commercial venues." },
  { name: "Indian Classical & Bollywood", text: "Hindustani and Carnatic classical performances are long-form and improvisational, structured around a raga and a rhythmic cycle, typically featuring sitar, sarod, tabla, or voice. Concerts can run several hours. Bollywood and bhangra events are the opposite — high-energy, dance-driven, and usually held in banquet halls or club nights in cities with large South Asian communities." },
  { name: "Afrobeat", text: "Fela Kuti's Nigerian fusion of Yoruba rhythm, highlife, jazz, and funk, played by large bands with heavy horn sections and songs that run well past ten minutes. The contemporary Afrobeats scene — with an 's' — is a distinct, more pop-oriented West African export. Both draw well in New York, Atlanta, Houston, Washington DC, and Philadelphia." },
  { name: "Klezmer & Jewish Music", text: "Eastern European Jewish instrumental music built for weddings and celebrations, characterized by clarinet and violin lines that deliberately imitate the human voice — laughing, sobbing, bending between notes. The American klezmer revival that began in the 1970s is still going, and performances now range from traditional dance sets to avant-garde reinterpretations." },
  { name: "Greek & Mediterranean", text: "Bouzouki-driven music covering rebetiko — the urban Greek style sometimes described as the Greek blues — alongside laika and regional folk traditions. Most reliably found at Greek restaurants with weekend live music and at church festivals, which run through the summer in most American cities and are usually open to everyone." },
  { name: "Hip-Hop & R&B", text: "Live hip-hop ranges from a DJ and an MC to full bands backing a vocalist, and increasingly overlaps with neo-soul and contemporary R&B in the same rooms. Open mic and cypher nights remain the backbone of local scenes and are the best way to hear what a city actually sounds like right now rather than what's charting." },
];

export default function ContentTabs({ events = [], weeklyRhythm = [], updated = "" }) {
  const [active, setActive] = useState(0);

  const TABS = ["This Week", "Venue Guide", "Genres & Styles", "Live Music 101", "For Musicians"];

  const panel = (i) => ({
    display: active === i ? "block" : "none",
  });

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem 3rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", borderTop: "1px solid #e2e8f0" }}>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: "1.25rem", borderBottom: "1px solid #e2e8f0", WebkitOverflowScrolling: "touch" }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            aria-selected={active === i}
            style={{
              flex: "0 0 auto",
              fontSize: 13,
              fontWeight: active === i ? 700 : 500,
              padding: "8px 16px",
              borderRadius: 99,
              border: `1.5px solid ${active === i ? ORANGE : "#e2e8f0"}`,
              background: active === i ? ORANGE : "transparent",
              color: active === i ? "#fff" : "#64748b",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TAB 1: THIS WEEK (auto-updating from venue feeds) ─────────────── */}
      <div style={panel(0)}>
        <section style={S.sec}>
          <h2 style={S.h2}>Live Music This Week Near West Chester, PA</h2>
          <p style={S.p}>
            These listings are pulled directly from venue calendars, not from a ticketing aggregator, so they include the acoustic duo on a Tuesday and the songwriter circle on a Wednesday — the shows that never get a ticketing page. Always confirm with the venue before heading out; small rooms reschedule.
          </p>
          {updated && (
            <p style={{ ...S.p, fontSize: "0.75rem", color: "#94a3b8" }}>Listings last refreshed {updated}.</p>
          )}

          {events.length > 0 ? (
            <div style={{ margin: "1rem 0 1.5rem" }}>
              {events.map((e, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${ORANGE}`, background: "#fff8f0", borderRadius: "0 10px 10px 0", padding: "12px 14px", marginBottom: 10 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>
                    {e.url ? <A href={e.url}>{e.title}</A> : e.title}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0 0 6px" }}>
                    {e.dateLabel} · {e.timeLabel} · {e.venue}, {e.city}
                  </p>
                  {e.description && (
                    <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>{e.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={S.p}>
              Live listings are refreshing right now. In the meantime, the standing weekly schedule below covers what happens on a typical week — most of these are recurring events that run year-round.
            </p>
          )}

          <h3 style={S.h3}>The Standing Weekly Schedule</h3>
          <p style={S.p}>
            Beyond one-off bookings, the West Chester and Chester County scene runs on recurring nights. If you learn the rhythm below you can find live music almost any evening of the week without checking a calendar at all.
          </p>
          {weeklyRhythm.map((d) => (
            <div key={d.day} style={{ marginBottom: "0.85rem" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: ORANGE, margin: "0 0 0.25rem" }}>{d.day}</h4>
              <ul style={{ ...S.ul, margin: 0, lineHeight: 1.7 }}>
                {d.entries.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          ))}

          <h3 style={S.h3}>How These Listings Are Built</h3>
          <p style={S.p}>
            Every event above comes from a venue's own published calendar. Where a venue publishes structured event data, it is read directly and refreshed automatically. Where a venue only posts to social media, the search tool above uses AI to check their pages on demand. Nothing here is invented, and nothing is scraped from a competitor's listings.
          </p>
        </section>
      </div>

      {/* ── TAB 2: VENUE GUIDE ────────────────────────────────────────────── */}
      <div style={panel(1)}>
        <section style={S.sec}>
          <h2 style={S.h2}>Featured Live Music Venues</h2>

          <h3 style={S.h3o}>West Chester, PA (19382) — LoCali Wine Lounge</h3>
          <p style={S.p}>
            123 E Market Street. A California-inspired wine lounge built deliberately as a listening room, where the music is meant to be heard rather than talked over. The weekly rhythm centers on original material from regional songwriters: LoCali Live books a featured acoustic act Saturdays 6–8pm, Friday Hang runs 8–10pm, and Sunday Songs fills Sunday afternoons 4–6pm. Midweek brings songwriter circles, poetry open mics, and bring-your-own-vinyl nights. Flight Night runs every Friday 6–9pm, and Golden Hour — the daily happy hour — runs 4–6pm whenever the lounge is open. Hours: Wed–Fri 4–10pm, Sat 2–10pm, Sun 2–8pm. Calendar at <A href="https://www.enjoylocali.com/events">enjoylocali.com/events</A>.
          </p>

          <h3 style={S.h3o}>West Chester, PA (19382) — The Downtown Strip</h3>
          <p style={S.p}>
            <strong style={{ color: "#0f172a" }}>Pietro's Prime</strong> (125 W Market St) is the upscale end of the strip — a steakhouse with live entertainment Wednesday through Saturday, generally 7–10pm and later on Saturdays. <strong style={{ color: "#0f172a" }}>Station 142</strong> (142 E Market St) is the closest thing West Chester has to a purpose-built music venue: an intimate stage, a real sound system, two bars, and rooftop dining, with local and regional acts Thursday through Saturday plus a well-attended Thursday open mic that provides a house band and full PA.
          </p>
          <p style={S.p}>
            <strong style={{ color: "#0f172a" }}>Brickette Lounge</strong> (3 W Gay St) runs line dancing most weeknights and live country and western on weekends, with a BBQ menu and a 21+ policy after 5pm. <strong style={{ color: "#0f172a" }}>Slow Hand Food &amp; Drink</strong> (30 N Church St) occupies a historic firehouse and books local bands and solo artists Fridays and Saturdays. <strong style={{ color: "#0f172a" }}>Square Bar</strong> (250 E Chestnut St) has been the neighborhood dive for seventy years and still books weekend live music. <strong style={{ color: "#0f172a" }}>Saloon 151</strong> (151 W Gay St) leans on whiskey, Friday karaoke, Wednesday music bingo, and Tuesday Quizzo rather than booked bands.
          </p>

          <h3 style={S.h3o}>Pocono Lake, PA (18347)</h3>
          <p style={S.p}>
            The Pocono lakes region runs a summer-weighted schedule that thins out in winter. <strong style={{ color: "#0f172a" }}>Nick's Lakehouse</strong> is the waterfront option, with live music and an outdoor season that runs hard from Memorial Day through Labor Day. <strong style={{ color: "#0f172a" }}>Boulder View Tavern</strong> and <strong style={{ color: "#0f172a" }}>Murph's Hideaway</strong> are the year-round local rooms — hearty food, regular weekend bookings, and crowds that mix residents with vacation renters. <strong style={{ color: "#0f172a" }}>Jubilee</strong> rounds out the area for live music and dining. In a resort area like this, calling ahead matters more than usual: schedules swing hard with the season and the weather.
          </p>

          <h3 style={S.h3o}>Philadelphia, PA — Commodore John Barry Arts and Cultural Center</h3>
          <p style={S.p}>
            6815 Emlen Street in Mt. Airy, generally known as the Irish Center. It is the region's anchor for Irish and Celtic music, hosting touring performers from Ireland, traditional sessions, céilí dances, and cultural programming year-round, and it is open to the public rather than members-only. Nathan Carter performs October 30th — general admission $50, with meet-and-greet packages available. Full calendar at <A href="https://theirishcenter.org/irish-center-events-calendar/">theirishcenter.org</A>.
          </p>

          <h3 style={S.h3o}>Chicago, IL — Bubb City</h3>
          <p style={S.p}>
            435 North Dearborn Street. Chicago's country music bar and concert venue, drawing large crowds for honky-tonk nights and booked performances in the middle of River North.
          </p>

          <h3 style={S.h3}>Live Music Across the US</h3>
          <p style={S.p}>
            <strong style={{ color: "#0f172a" }}>Los Angeles:</strong> Sunset Strip rock clubs remain the historic draw, but the current scene is spread across Silver Lake rooftops, Echo Park bars, and small acoustic rooms in Santa Monica. Shows start late by national standards — a 9pm door often means an 11pm headliner.
          </p>
          <p style={S.p}>
            <strong style={{ color: "#0f172a" }}>Miami:</strong> Latin music dominates, with live salsa, son, and timba in Little Havana, experimental and hip-hop programming in Wynwood, and hotel-bar jazz across South Beach. Many venues run free dance lessons before the band starts.
          </p>
          <p style={S.p}>
            <strong style={{ color: "#0f172a" }}>Dallas:</strong> Deep Ellum is the historic core — the neighborhood where Blind Lemon Jefferson and Robert Johnson recorded — and still carries blues, country, rock, and jazz across a walkable cluster of clubs.
          </p>
          <p style={S.p}>
            <strong style={{ color: "#0f172a" }}>Seattle:</strong> The grunge legacy gets the attention, but the working scene is indie rock, jazz, and folk across Capitol Hill, Ballard, and Belltown, with an unusually strong all-ages venue tradition.
          </p>
          <p style={S.p}>
            <strong style={{ color: "#0f172a" }}>Nashville, New Orleans, and Austin</strong> are the three cities where live music happens at a scale that makes planning almost unnecessary — Broadway, Frenchmen Street, and Red River respectively will all have multiple bands playing within a block of each other on any given night, most with no cover.
          </p>
        </section>
      </div>

      {/* ── TAB 3: GENRES & STYLES ────────────────────────────────────────── */}
      <div style={panel(2)}>
        <section style={S.sec}>
          <h2 style={S.h2}>Find Music by Cultural Style and Genre</h2>
          <p style={S.p}>
            The search tool above filters by fourteen cultural traditions. Genre labels can be slippery in a live setting — a band billed as "Americana" might be closer to bluegrass or closer to rock depending on who's in the room — so the descriptions below cover what each tradition actually sounds and feels like live, and what kind of venue tends to host it.
          </p>
          {GENRES.map((g) => (
            <div key={g.name}>
              <h3 style={S.h3o}>{g.name}</h3>
              <p style={S.p}>{g.text}</p>
            </div>
          ))}

          <h3 style={S.h3}>A Note on Cover Bands and Tribute Acts</h3>
          <p style={S.p}>
            A large share of live music at neighborhood bars and restaurants is cover material, and there is nothing lesser about it — cover bands are how most working musicians earn a living, and a good one reads a room better than almost anyone. Tribute acts are a related but distinct category, recreating a specific artist's catalog and often their staging. If you specifically want original material, look for listings that say "original music," "songwriter," or "album release," which is how venues signal it.
          </p>
        </section>
      </div>

      {/* ── TAB 4: LIVE MUSIC 101 ─────────────────────────────────────────── */}
      <div style={panel(3)}>
        <section style={S.sec}>
          <h2 style={S.h2}>Live Music 101: A Practical Guide</h2>

          <h3 style={S.h3}>What Time Does the Music Actually Start?</h3>
          <p style={S.p}>
            Listed times are start times for the venue, not always for the band. As a rough guide: restaurant and wine bar music usually starts within fifteen minutes of the posted time because it is scheduled around dinner service. Bar and club shows run late — a listed 9pm start commonly means the first act at 9:30 and the headliner after 11. Afternoon sessions, brunches, and outdoor summer series are the most punctual of all. If you are going specifically to see one act on a multi-band bill, message the venue or the band that week; lineups shuffle constantly.
          </p>

          <h3 style={S.h3}>Cover Charges, Minimums, and Tipping</h3>
          <p style={S.p}>
            Most neighborhood live music in America is free at the door, funded by the bar tab. When there is a cover it is typically $5–$20 for local acts and considerably more for touring artists. Listening rooms and jazz clubs often charge a cover plus a one- or two-drink minimum per set, and they usually clear the room between sets. A tip jar or a merch table is how the band gets paid on a free-entry night — for many local acts, merch and tips exceed the venue's guarantee. Buying an album or a shirt directly from a musician returns far more to them than a streaming play ever will.
          </p>

          <h3 style={S.h3}>Reading the Room</h3>
          <p style={S.p}>
            The single most useful skill is recognizing what kind of room you have walked into. A listening room — a wine lounge, a jazz club, a house concert — expects conversation to drop while someone is playing, and talking through a quiet acoustic set genuinely ruins it for everyone within earshot, including the performer. A bar with a band in the corner is the opposite: the music is atmosphere, and nobody expects silence. Watching the regulars for the first few minutes tells you which is which faster than any listing does.
          </p>
          <p style={S.p}>
            A few things that hold everywhere: don't request songs mid-set, especially not at an original-music show. Don't film an entire performance with your phone held up. If a room is seated, stay seated. And if you like what you heard, say so to the musician afterward — small-room performers hear from almost nobody, and it matters more than you would think.
          </p>

          <h3 style={S.h3}>Protecting Your Hearing</h3>
          <p style={S.p}>
            Amplified music in a small room routinely reaches 100–110 decibels, a level at which hearing damage begins in under fifteen minutes. Musician's earplugs — the flat-attenuation kind that reduce volume evenly rather than muffling the highs — cost around $20 and preserve the sound while cutting 15–20 decibels. Ringing in your ears the next morning is not a sign of a good night out; it is a sign of injury. Standing to the side of the PA stacks rather than directly in front of them also helps considerably.
          </p>

          <h3 style={S.h3}>Bringing Kids, and Finding All-Ages Shows</h3>
          <p style={S.p}>
            Bars with 21+ policies after a certain hour are common, and it is worth checking before you drive over. Afternoon and early-evening events — Sunday sessions, brewery patios, farmers market series, church and cultural festivals — are typically all-ages and much better suited to families. Outdoor summer concert series run by townships and boroughs are the most reliably kid-friendly live music in most American towns, and they are almost always free.
          </p>

          <h3 style={S.h3}>A Brief History of Live Music in America</h3>
          <p style={S.p}>
            The American live music tradition grew directly out of the African American experience in the Deep South. As documented by the <A href="https://blogs.loc.gov/folklife/2017/02/birth-of-blues-and-jazz/">Library of Congress</A>, blues emerged from spirituals, work songs, and field hollers in the 19th century, evolving through the juke joints of the Mississippi Delta into one of the first wholly American musical forms to achieve worldwide recognition.
          </p>
          <p style={S.p}>
            In the early 20th century, jazz developed in New Orleans from a collision of blues, ragtime, brass band music, and the city's uniquely multicultural street culture, as <A href="https://hub.yamaha.com/brand/b-history/the-history-of-musical-genres-part-2-blues-and-jazz/">Yamaha Music</A> describes. Jazz moved north to Chicago and New York, transforming bars and dance halls along the way. Benny Goodman's January 1938 Carnegie Hall performance — the first major jazz concert by an integrated band — became a landmark in American cultural history.
          </p>
          <p style={S.p}>
            The 1950s brought rock and roll out of a fusion of country, blues, and swing, as documented in the <A href="https://www.howwegettonext.com/the-history-and-future-of-live-music/">History of Live Music</A>. The modern concert format emerged in the 1960s when promoter Bill Graham introduced advance ticketing, modern security, and the infrastructure that made large-scale live music commercially viable. Woodstock in 1969, attended by more than 400,000 people, set the template for the festival era that followed.
          </p>
          <p style={S.p}>
            From the Chicago blues bars that gave birth to rock and roll to the West Chester wine lounge booking a songwriter on a Saturday evening, live music has always been how communities process joy, grief, identity, and belonging. Every show happening near you tonight is part of that continuum.
          </p>

          <h3 style={S.h3}>Why Music Is Good for the Soul</h3>
          <p style={S.p}>
            The connection between music and wellbeing is one of the better-documented relationships in behavioral science. Research summarized by <A href="https://www.healthline.com/health/benefits-of-music">Healthline</A> found that listening to music triggers dopamine release and helps regulate cortisol. A 2025 systematic review in <A href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1608508/full">Frontiers in Psychology</A> concluded that music-based interventions significantly improve subjective wellbeing across both clinical and non-clinical populations.
          </p>
          <p style={S.p}>
            According to the <A href="https://www.menningerclinic.org/news-resources/exploring-the-mental-health-benefits-of-music">Menninger Clinic</A>, listening to music for roughly 50 minutes a week is associated with measurable immune and mental health benefits. The <A href="https://www.psychiatry.org/news-room/apa-blogs/power-of-music-in-mental-well-being">American Psychiatric Association</A> notes that music engagement plays a role in mood regulation and is used in treating mental health and substance use disorders. The <A href="https://globalwellnessinstitute.org/global-wellness-institute-blog/2025/04/02/music-for-health-and-wellbeing-initiative-trends-for-2025/">Global Wellness Institute</A> reported that academic interest in music and health tripled over the past decade.
          </p>
          <p style={S.p}>
            The research is still catching up to what anyone who has stood in a crowd already knows. Music experienced together, in one room, with strangers who briefly become a community, does something recordings cannot replicate. It is one of the last genuinely communal, unfiltered experiences left — happening once, and only once, in that particular way.
          </p>
        </section>
      </div>

      {/* ── TAB 5: FOR MUSICIANS & VENUES ─────────────────────────────────── */}
      <div style={panel(4)}>
        <section style={S.sec}>
          <h2 style={S.h2}>For Musicians and Venue Owners</h2>

          <h3 style={S.h3}>Getting Booked at Small Rooms</h3>
          <p style={S.p}>
            Small venues book on reliability far more than on talent. A booker's actual worry is whether you will show up on time, fit the room, play the right length, and bring anyone. Address those directly and you are ahead of most of the inquiries they receive. A useful first message is short: who you are, a genre in three words, one link to live audio or video, the rooms you have played, and two or three specific dates you are available. Attachments and long biographies get ignored.
          </p>
          <p style={S.p}>
            Go see the room first. Bookers can tell instantly whether you have been there, and a note referencing the act you saw last Friday reads completely differently from a mass email. Match your volume to the space — a full band with a drum kit is wrong for a wine lounge, and a solo acoustic act will disappear in a sports bar on a Saturday.
          </p>

          <h3 style={S.h3}>What Venues Actually Want</h3>
          <ul style={S.ul}>
            <li>Load in early, sound check quietly, and be ready before the posted time</li>
            <li>Play the agreed length — cutting a set short is remembered longer than playing well</li>
            <li>Control your stage volume; the fastest way to not get rebooked is to be too loud</li>
            <li>Bring people, and tell the venue in advance roughly how many to expect</li>
            <li>Promote the show on your own channels at least twice, including the day of</li>
            <li>Be pleasant to the bar staff, who are asked their opinion far more often than you would guess</li>
          </ul>

          <h3 style={S.h3}>Getting Paid</h3>
          <p style={S.p}>
            Common structures for local shows are a flat guarantee, a percentage of the door, a guarantee against a percentage, or bar-tab-plus-tips. Get the number and the structure in writing before the date, even if it is only a text message — most disputes at this level come from vague agreements rather than bad faith. Ask who handles the tip jar and whether the venue takes a cut of merch, which is unusual at small rooms but not unheard of. Register your original songs with a performing rights organization; venues with a public performance license generate royalties you are entitled to.
          </p>

          <h3 style={S.h3}>Promoting a Show That People Attend</h3>
          <p style={S.p}>
            The most effective promotion for a small show is unglamorous: post the date as soon as it is confirmed, post again a week out with something visual, post the day of with a specific start time, and personally invite twenty people who live nearby. Direct invitations outperform public posts by an enormous margin. Make sure the event exists somewhere searchable — the venue's own calendar page is the single most valuable listing, because discovery tools, search engines, and this site all read from it.
          </p>

          <h3 style={S.h3}>Building a Local Following</h3>
          <p style={S.p}>
            Playing the same city too often saturates it — a monthly show in one town generally draws better than a weekly one. Collect email addresses at the merch table, because it is the only audience list you own outright. Play with other local acts rather than only headlining; shared bills trade audiences and are how regional scenes actually grow. And record something, even roughly. A venue that can hear you is far more likely to book you than one reading a description.
          </p>

          <h3 style={S.h3}>Get Your Venue or Band Listed on BBK Music Seeker</h3>
          <p style={S.p}>
            BBK Music Seeker welcomes submissions from venue owners, promoters, and musicians. Venue owners can submit through the Request a Venue form — featured venues receive a dedicated card in search results with weekly schedule information, automatic performer lookup, and community vibe ratings. Musicians and bands can use the Get Your Band Listed form to appear as highlighted artists. Both forms are in the search tool above. Venues that publish a structured public events calendar can have their listings refreshed automatically.
          </p>

          <h3 style={S.h3}>Music Resources Worth Following</h3>
          <ul style={S.ul}>
            <li><A href="https://pitchfork.com">Pitchfork</A> — album reviews, artist profiles, and news across every genre</li>
            <li><A href="https://www.rollingstone.com/music/">Rolling Stone Music</A> — popular music, touring, and industry coverage since 1967</li>
            <li><A href="https://stereogum.com">Stereogum</A> — indie criticism and breaking news with a sharp editorial voice</li>
            <li><A href="https://www.brooklynvegan.com">BrooklynVegan</A> — live coverage and tour announcements across indie, punk, metal, and hip-hop</li>
            <li><A href="https://liveforlivemusic.com">Live For Live Music</A> — news and show recaps focused entirely on live performance</li>
            <li><A href="https://relix.com">Relix</A> — jam band and live music scene coverage with deep artist interviews</li>
            <li><A href="https://www.bandsintown.com">Bandsintown</A> — follow artists and get alerts when they tour nearby</li>
            <li><A href="https://www.songkick.com">Songkick</A> — concert discovery and ticketing across venue sizes</li>
            <li><A href="https://www.setlist.fm">Setlist.fm</A> — community-sourced setlists, useful for seeing what a touring act is actually playing</li>
            <li><A href="https://timeline.carnegiehall.org">Carnegie Hall Timeline</A> — the history of American music genres</li>
            <li><A href="https://blogs.loc.gov/folklife/">Library of Congress Folklife Blog</A> — authoritative writing on American musical traditions</li>
          </ul>

          <h3 style={S.h3}>Why BBK Music Seeker Is Different</h3>
          <p style={S.p}>
            Most live music apps focus on ticketed concerts at large venues, because that is where the ticketing commission is. BBK Music Seeker surfaces the Friday night jazz duo at a neighborhood wine bar, the acoustic songwriter at a gastropub, and the Saturday cover band that has the whole room dancing — music that never appears on a ticketing platform at all. It is free, requires no account, and covers hundreds of cities across the United States.
          </p>
        </section>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 1.5rem" }} />
      <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
        BBK Music Seeker is a product of <a href="https://thebkcg.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8" }}>The BK Consulting Group</a>. For venue and artist listing requests, use the forms in the search tool above. Live music schedules change frequently — always verify event details with the venue before attending.
      </p>
    </div>
  );
}
