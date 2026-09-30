"use client";

import Link from "next/link";
import { useRef } from "react";
import { CATEGORIES } from "./content/resources";

/* The seven doors on REACH home: each a card that tilts toward the pointer, with its
   three most-used items and a way into the full list on /resources. */
export default function Doors() {
  return (
    <div className="rh-door-grid">
      {CATEGORIES.map((c, i) => <Door key={c.key} c={c} i={i} />)}
    </div>
  );
}

function Door({ c, i }: { c: (typeof CATEGORIES)[number]; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`);
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
  };
  const leave = () => { ref.current?.style.setProperty("--rx", "0deg"); ref.current?.style.setProperty("--ry", "0deg"); };
  return (
    <article ref={ref} className="rh-door" style={{ ["--hue" as string]: c.hue, ["--d" as string]: `${i * 0.06}s` }} onPointerMove={move} onPointerLeave={leave}>
      <span className="rh-door-glyph" aria-hidden="true">{c.glyph}</span>
      <h3><Link href={`/resources#${c.key}`}>{c.title}</Link></h3>
      <p>{c.line}</p>
      <ul>
        {c.items.slice(0, 3).map((it) => (
          <li key={it.title}><a href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel={it.href.startsWith("http") ? "noopener noreferrer" : undefined}>{it.title}</a></li>
        ))}
      </ul>
      <Link className="rh-door-all" href={`/resources#${c.key}`}>All {c.items.length} →</Link>
    </article>
  );
}
