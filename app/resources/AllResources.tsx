"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES } from "../content/resources";
import { SiteTop, SiteFoot } from "../myreach/ui";

/* Every REACH resource on one page, from app/content/resources.ts: jump to a category or
   search across all of them. */
export default function AllResources() {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CATEGORIES;
    return CATEGORIES.map((c) => ({ ...c, items: c.items.filter((i) => `${i.title} ${i.text}`.toLowerCase().includes(s)) })).filter((c) => c.items.length);
  }, [q]);
  const total = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

  return (
    <main className="sc rh">
      <SiteTop on="/resources" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />{total} tools, guides and lifelines</span>
          <h1>Everything, <em>organized.</em></h1>
          <p>Find it by what&rsquo;s going on. EFF tools are free and private: no account needed unless you&rsquo;re applying to EFF.</p>
          <div className="sc-filters" style={{ marginTop: 18 }}>
            <label className="sc-field grow"><span>Search everything</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="rent, FAFSA, résumé, 988, appeal…" /></label>
          </div>
          <nav className="sc-pills" aria-label="Categories">
            {CATEGORIES.map((c) => <a key={c.key} className="sc-pill" href={`#${c.key}`} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", borderColor: c.hue }}>{c.glyph} {c.title}</a>)}
          </nav>
        </div>
      </section>
      <div className="sc-wrap sc-section">
        {!shown.length ? <div className="sc-empty"><h2>Nothing by that name.</h2><p>Try another word, or <Link href="/get-help">tell Get Help what&rsquo;s going on</Link>.</p></div> : null}
        {shown.map((c) => (
          <section key={c.key} id={c.key} style={{ scrollMarginTop: 90, marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "30px 0 6px" }}>
              <span className="rh-door-glyph" style={{ ["--hue" as string]: c.hue, background: c.hue, transform: "none" }} aria-hidden="true">{c.glyph}</span>
              <h2 style={{ margin: 0, fontSize: "clamp(28px,5vw,48px)" }}>{c.title}</h2>
            </div>
            <p className="sc-small" style={{ fontSize: 17, margin: "0 0 14px" }}>{c.line}</p>
            <div className="sc-kits">
              {c.items.map((i) => (
                <a key={i.title + i.href} className="sc-kit" href={i.href} target={i.href.startsWith("http") ? "_blank" : undefined} rel={i.href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ borderTop: `4px solid ${c.hue}` }}>
                  <em>{i.tag === "Now" ? "Start here" : i.tag === "Official" ? "Official source ↗" : i.tag || "REACH"}</em>
                  <b>{i.title}</b><span>{i.text}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
      <SiteFoot />
    </main>
  );
}
