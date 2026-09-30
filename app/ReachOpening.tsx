"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./reach-open.css";

/* The REACH opening: a scroll-driven stage. Lights down; the things that make
   students leave drift out of the dark toward you; "Before you drop out,"; the five
   letters fly in from deep space and lock; the lights come up on REACH and the doors
   to help. Scroll drives it (a 520vh track, a sticky 100vh stage). Reduced motion
   gets the finished frame. "Skip the intro" always works. */

const WEIGHTS = [
  { t: "a bill you can't cover", x: -28, y: -18 },
  { t: "a hold on registration", x: 24, y: -26 },
  { t: "an empty fridge", x: -20, y: 22 },
  { t: "a class you're failing", x: 30, y: 16 },
  { t: "a hard week that won't end", x: -6, y: -34 },
  { t: "nobody to call", x: 4, y: 30 },
];
const LETTERS = [
  { l: "R", w: "Reach out" },
  { l: "E", w: "Engage your community" },
  { l: "A", w: "Access resources" },
  { l: "C", w: "Care for your mental health" },
  { l: "H", w: "Hold on" },
];

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function ReachOpening() {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const weights = useRef<Array<HTMLDivElement | null>>([]);
  const letters = useRef<Array<HTMLDivElement | null>>([]);
  const [still, setStill] = useState(false);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setStill(true); return; }
    const t0 = window.setTimeout(() => setLit(true), 250);
    let raf = 0;
    const frame = () => {
      raf = 0;
      const el = track.current, st = stage.current;
      if (!el || !st) return;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = clamp(-r.top / (run || 1));
      st.style.setProperty("--p", p.toFixed(4));
      st.dataset.end = p > 0.88 ? "1" : "";
      // 1. the weights: each drifts from deep space through the camera in its own window
      weights.current.forEach((w, i) => {
        if (!w) return;
        const a = 0.06 + i * 0.05, t = seg(p, a, a + 0.2);
        const z = -1500 + t * 1800;
        const o = t <= 0 || t >= 0.92 ? 0 : Math.min(1, t * 4) * Math.min(1, (0.92 - t) * 5);
        w.style.transform = `translate(-50%,-50%) translate3d(${WEIGHTS[i].x}vw, ${WEIGHTS[i].y}vh, ${z}px) rotateY(${(0.5 - t) * WEIGHTS[i].x * 0.9}deg)`;
        w.style.opacity = o.toFixed(3);
        w.style.filter = `blur(${Math.max(0, (1 - t) * 6 - 2).toFixed(1)}px)`;
      });
      // 2. the letters: fly in from far away, one after another, and lock
      letters.current.forEach((n, i) => {
        if (!n) return;
        const a = 0.56 + i * 0.035, t = ease(seg(p, a, a + 0.12));
        const push = seg(p, 0.86, 1);
        n.style.transform = `translate3d(0, ${(1 - t) * (i % 2 ? -40 : 40)}vh, ${(1 - t) * -2600 + push * 260}px) rotateX(${(1 - t) * (i % 2 ? 70 : -70)}deg) rotateY(${(1 - t) * (i - 2) * 40}deg)`;
        n.style.opacity = t.toFixed(3);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.clearTimeout(t0); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const skip = () => document.getElementById("what")?.scrollIntoView({ behavior: still ? "auto" : "smooth" });

  return (
    <section ref={track} className={`ro${still ? " ro-still" : ""}${lit ? " ro-lit" : ""}`} aria-label="REACH, by Esther Funds Foundation">
      <div ref={stage} className="ro-stage">
        <div className="ro-glow" aria-hidden="true" />
        <div className="ro-dust" aria-hidden="true" />
        <div className="ro-spot" aria-hidden="true" />
        <div className="ro-grain" aria-hidden="true" />

        <p className="ro-first">It almost never happens all at once.</p>
        <p className="ro-second">It happens one thing at a time.</p>

        <div className="ro-space" aria-hidden={!still}>
          {WEIGHTS.map((w, i) => <div key={w.t} ref={(el) => { weights.current[i] = el; }} className="ro-weight">{w.t}</div>)}
        </div>

        <p className="ro-before">Before you drop out,</p>

        <div className="ro-word" role="img" aria-label="REACH">
          {LETTERS.map((x, i) => (
            <div key={x.l} ref={(el) => { letters.current[i] = el; }} className="ro-letter">
              <b>{x.l}</b><span>{x.w}</span>
            </div>
          ))}
        </div>

        <div className="ro-end">
          <p className="ro-by">by Esther Funds Foundation</p>
          <p className="ro-line">Help, money and people for college students, in one place. Free. Always.</p>
          <div className="ro-acts">
            <Link className="ro-btn hot" href="/get-help">I need help right now</Link>
            <Link className="ro-btn" href="/scholarships">Find money for school</Link>
            <Link className="ro-btn ghost" href="/apply">Apply to EFF</Link>
          </div>
        </div>

        <button type="button" className="ro-skip" onClick={skip}>Skip the intro ↓</button>
        <div className="ro-cue" aria-hidden="true"><span />Scroll</div>
      </div>
    </section>
  );
}
