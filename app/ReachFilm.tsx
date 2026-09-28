"use client";

/* Cinematic scenes that tell what REACH is, woven between the Action Hub's
   tools. Every date and number links to the EFF post it came from. Each scene
   reads fully with reduced motion: nothing pins, everything is shown. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./reach-film.css";

function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches); sync();
    m.addEventListener("change", sync); return () => m.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* progress 0→1 while a tall section scrolls past a sticky stage */
function useScrub(steps: number) {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const reduced = useReduced();
  useEffect(() => {
    const el = ref.current; if (!el || reduced) return;
    let raf = 0;
    const update = () => { raf = 0; const r = el.getBoundingClientRect(); setP(Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)))); };
    const ask = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); addEventListener("scroll", ask, { passive: true }); addEventListener("resize", ask);
    return () => { removeEventListener("scroll", ask); removeEventListener("resize", ask); cancelAnimationFrame(raf); };
  }, [reduced]);
  return { ref, p, step: Math.min(steps - 1, Math.floor(p * steps)), reduced };
}

function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return { ref, seen };
}

const PILLARS = [
  { l: "R", t: "Reach Out", x: "Ask early. Help is available, and it is okay to reach for it before a challenge becomes a crisis.", hue: "#b98cff" },
  { l: "E", t: "Engage Your Community", x: "College is also people. Connect to peers, campus offices, ambassadors, and community support.", hue: "#8fd3ff" },
  { l: "A", t: "Access Resources", x: "Scholarships, financial aid, SNAP, food pantries, tutoring, and support routes exist to be used.", hue: "#ff9ed8" },
  { l: "C", t: "Care for Your Mental Health", x: "You deserve support before you are at your limit. In a crisis, call or text 988.", hue: "#a7b8ff" },
  { l: "H", t: "Hold On", x: "Every completed semester is a victory. You are not behind. You are building.", hue: "#ffd35a" },
];

export function ReachLetters() {
  const { ref, step, reduced } = useScrub(PILLARS.length);
  const [tilt, setTilt] = useState(0);
  return (
    <section ref={ref} className={`rf-letters ${reduced ? "still" : ""}`} aria-label="What R.E.A.C.H. stands for" onPointerMove={(e) => setTilt((e.clientX / innerWidth - 0.5) * 24)}>
      <div className="rf-stage">
        <p className="rf-kick">What R.E.A.C.H. stands for</p>
        <ol>
          {PILLARS.map((q, i) => (
            <li key={q.l} className={reduced || i === step ? "on" : ""} style={{ ["--hue" as string]: q.hue, ["--tilt" as string]: `${tilt}deg` }}>
              <span className="rf-big" aria-hidden="true">{q.l}</span>
              <div><h2>{q.t}</h2><p>{q.x}</p>{q.l === "C" ? <a className="rf-988" href="https://988lifeline.org/">988 Suicide & Crisis Lifeline ↗</a> : null}</div>
            </li>
          ))}
        </ol>
        <div className="rf-rail" aria-hidden="true">{PILLARS.map((q, i) => <i key={q.l} className={i === step ? "on" : ""} />)}</div>
      </div>
    </section>
  );
}

export function ReachWalkers() {
  const { ref, p, step, reduced } = useScrub(3);
  return (
    <section ref={ref} className={`rf-walk ${reduced ? "still" : ""}`} aria-label="Real students, real support" style={{ ["--p" as string]: reduced ? 1 : p }}>
      <div className="rf-stage">
        <div className="rf-walk-copy">
          <p className="rf-kick">Why REACH exists</p>
          <h2><span className={reduced || step >= 0 ? "on" : ""}>Real students.</span> <span className={reduced || step >= 1 ? "on" : ""}>Real pressure.</span> <em className={reduced || step >= 2 ? "on" : ""}>Real support.</em></h2>
          <p className={reduced || step >= 2 ? "on" : ""}>“Most students don’t leave school because they aren’t capable. They leave because life becomes too expensive, too heavy, and too isolating.” <a href="https://www.instagram.com/p/DZnxaMJJNlE/">EFF, 15 June 2026 ↗</a></p>
        </div>
        <div className="rf-walkers" aria-hidden="true">
          {[1, 2, 3].map((n) => <img key={n} src={`/reach-walker-${n}.jpg`} alt="" width={579} height={879} loading="lazy" />)}
        </div>
      </div>
    </section>
  );
}

const INSIDE = ["Food and hydration items", "Hygiene and laundry essentials", "Academic tools and encouragement", "REACH merch and practical supports", "Printed resources: SNAP, campus pantry, 988, financial aid, scholarships and study tips"];

export function ReachBox() {
  const { ref, p, step, reduced } = useScrub(6);
  return (
    <>
      <section ref={ref} className={`rf-box ${reduced ? "still" : ""}`} aria-label="Inside a REACH Box" style={{ ["--p" as string]: reduced ? 1 : p }}>
        <div className="rf-stage">
          <div className="rf-box-copy">
            <p className="rf-kick">The REACH Box</p>
            <h2>A box with a route beyond it.</h2>
            <p>Free care packages with essentials, resources, and a note that says the thing students most need to hear: someone cares about you.</p>
          </div>
          <div className="rf-cube-wrap" aria-hidden="true">
            <div className="rf-cube">
              <i className="f front"><b>REACH</b></i><i className="f back" /><i className="f left" /><i className="f right"><b className="s">EVERY FUTURE FULFILLED</b></i><i className="f bottom" /><i className="f lid" />
              <span className="rf-glow" />
            </div>
          </div>
          <ul className="rf-items">
            {INSIDE.map((x, i) => <li key={x} className={reduced || i < step ? "on" : ""}><span>{String(i + 1).padStart(2, "0")}</span>{x}</li>)}
          </ul>
        </div>
      </section>
      <div className="rf-note" role="note">
        <p className="rf-note-h">Where deliveries stand</p>
        <p>On 3 September 2026 EFF paused delivery of <em>new</em> REACH Boxes while it reviews fulfillment. <strong>REACH itself is not paused</strong>, and a box the Foundation already confirmed is still on its way.</p>
        <p>Enrolled and facing an urgent food emergency? Use the <a href="https://form.jotform.com/262448222885060">Emergency Food Request ↗</a>. For local food and community help today, call or visit <a href="https://www.211.org/">211 ↗</a>. <a href="https://www.instagram.com/p/Dcz3HMmxHMb/">EFF’s update ↗</a></p>
      </div>
    </>
  );
}

const STATS = [
  { n: 1000, s: "+", t: "students reached out for support" },
  { n: 325, s: "+", t: "colleges sent applications" },
  { n: 300, s: "", t: "REACH Boxes in the first wave" },
  { n: 257, s: "", t: "student ambassadors stepped up" },
];

const TIMELINE: [string, string, string, string][] = [
  ["23 May 2026", "Introducing REACH", "A national student support movement: reach, engage, access, care, hold on.", "DYsIVIrJKHu"],
  ["8 June", "211 students were waiting", "They applied for a REACH Box, but their campus had no ambassador to get it to them.", "DZVSJL_iQNH"],
  ["15 June", "Day 1", "The food for the first 300 REACH care boxes moved into the distribution space.", "DZnxaMJJNlE"],
  ["16 June", "Round One", "Nine campuses for the first wave: Southern University and A&M College, Prairie View A&M, Norfolk State, Howard, Alabama A&M, Florida A&M, Xavier University of Louisiana, Jackson State and UNC Greensboro.", "DZqoSl6pk-r"],
  ["18 June", "The REACH Warehouse", "An empty storage unit became a space dedicated to keeping students enrolled. The same day, WALB News told the story.", "DZuwHSopLJv"],
  ["23 June", "The first REACH Box", "“One box down. Thousands more futures to fulfill.”", "DZ8E7yUJnNA"],
  ["26 June", "22 states", "REACH Ambassadors were serving in 22 states, with all 50 as the goal.", "DaDws4NJCs6"],
  ["9 July", "The REACH Action Hub", "One place for scholarships, emergency support, a stay-enrolled plan and next steps. This website.", "DalZroCEcgF"],
  ["22 August", "Packages on their way", "EFF finished shipping its REACH Encouragement Packages, and 65 ambassadors received their shirts.", "DcWilc9xQwP"],
  ["3 September", "New deliveries paused, REACH is not", "New box deliveries paused for a fulfillment review; an Emergency Food Request opened for urgent needs.", "Dcz3HMmxHMb"],
  ["13 September", "Free recommendation letters", "Scholarship recommendation letters, free, through REACH.", "DdPONP7xFfz"],
  ["14 September", "Students serving students", "The EFF chapter at UNC Greensboro hosted a REACH Workshop and packed free care packages for their campus.", "DdUB7qBEf6D"],
];

function Count({ n, s, go }: { n: number; s: string; go: boolean }) {
  const [v, setV] = useState(0);
  const reduced = useReduced();
  useEffect(() => {
    if (!go) return;
    if (reduced) { setV(n); return; }
    const t0 = performance.now(); let raf = 0;
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1600); setV(Math.round(n * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [go, n, reduced]);
  return <b>{v.toLocaleString("en-US")}{s}</b>;
}

export function ReachStory() {
  const stats = useSeen<HTMLDivElement>();
  return (
    <section className="rf-story" aria-label="How REACH began">
      <p className="rf-kick">The story so far</p>
      <h2>One question: <em>how do we keep students from dropping out?</em></h2>
      <div className="rf-stats" ref={stats.ref}>
        {STATS.map((x) => <div key={x.t}><Count n={x.n} s={x.s} go={stats.seen} /><span>{x.t}</span></div>)}
      </div>
      <p className="rf-src">As EFF posted on 15 June 2026. <a href="https://www.instagram.com/p/DZll1FiCQ-t/">See the post ↗</a></p>
      <ol className="rf-time">{TIMELINE.map(([d, t, x, code]) => <TimeItem key={t} d={d} t={t} x={x} code={code} />)}</ol>
      <div className="rf-story-go">
        <Link className="bridge-button" href="/ambassadors">Meet the ambassadors</Link>
        <a className="bridge-button ghost" href="https://www.instagram.com/effcampusreachbox/">Follow @effcampusreachbox ↗</a>
      </div>
    </section>
  );
}

function TimeItem({ d, t, x, code }: { d: string; t: string; x: string; code: string }) {
  const { ref, seen } = useSeen<HTMLLIElement>();
  return <li ref={ref} className={seen ? "in" : ""}><time>{d}</time><h3>{t}</h3><p>{x}</p><a href={`https://www.instagram.com/p/${code}/`}>post ↗</a></li>;
}

export function ReachStill() {
  const { ref, seen } = useSeen<HTMLElement>();
  return (
    <section ref={ref} className={`rf-still ${seen ? "in" : ""}`} aria-label="You are not alone">
      <p>You are seen.<br />You are supported.<br /><em>You are not alone.</em></p>
      <small>Before you drop out, reach.</small>
    </section>
  );
}
