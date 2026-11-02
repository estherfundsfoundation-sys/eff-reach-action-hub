"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteTop, SiteFoot } from "../../myreach/ui";
import LibCard from "../../content/LibCard";
import { CATS, ORDER } from "../../content/library";
import { useLibrary } from "../../content/useLibrary";
import { KITS, type Kit } from "../toolkits";

/* A REACH toolkit page (/for/families, /for/schools, /for/colleges, /for/community): the promise,
   numbered steps, printable checklists, words to copy, and every REACH Library resource for that
   audience, by section. Print it with the button: the print styles drop the site chrome. */
export default function Toolkit({ kit }: { kit: Kit }) {
  const { items } = useLibrary();
  const [copied, setCopied] = useState("");
  const groups = useMemo(() => ORDER.map((c) => ({ c, list: items.filter((i) => i.cat === c && i.who.includes(kit.who)) })).filter((g) => g.list.length), [items, kit.who]);
  const copy = (t: string, k: string) => { navigator.clipboard?.writeText(t).then(() => { setCopied(k); setTimeout(() => setCopied(""), 2000); }).catch(() => {}); };
  const ext = (h?: string) => !!h && h.startsWith("http");

  return (
    <main className="sc rs" style={{ ["--hue" as string]: kit.hue }}>
      <SiteTop on="/start" />
      <section className="rs-kit-hero">
        <div className="sc-wrap">
          <nav className="rs-tabs" aria-label="Toolkits">
            <Link href="/start">Students</Link>
            {KITS.map((k) => <Link key={k.slug} href={`/for/${k.slug}`} className={k.slug === kit.slug ? "on" : ""} aria-current={k.slug === kit.slug ? "page" : undefined}>{k.tab}</Link>)}
          </nav>
          <p className="rs-k">{kit.k}</p>
          <h1>{kit.title} <em>{kit.em}</em></h1>
          <p className="rs-lede">{kit.lede}</p>
          <div className="rs-acts rs-noprint"><button type="button" className="sc-btn coral" onClick={() => window.print()}>Print this toolkit</button><a className="sc-btn ghost" href="#resources">Every resource for you</a></div>
        </div>
      </section>

      <div className="sc-wrap">
        <section className="rs-sec">
          <div className="rs-sec-h"><span style={{ background: kit.hue }} aria-hidden="true">1</span><div><h2>{kit.steps.heading}</h2></div></div>
          <ol className="rs-steps">
            {kit.steps.list.map((s) => <li key={s.title}><b>{s.title}</b><p>{s.text}{s.href ? <> <a href={s.href} target={ext(s.href) ? "_blank" : undefined} rel={ext(s.href) ? "noopener noreferrer" : undefined}>{s.link} →</a></> : null}</p></li>)}
          </ol>
        </section>

        <section className="rs-sec">
          <div className="rs-sec-h"><span style={{ background: kit.hue }} aria-hidden="true">2</span><div><h2>Keep these close</h2><p>Print them, put them on the fridge, the bulletin board or the staff room wall.</p></div></div>
          <div className="rs-cards2">{kit.boxes.map((b) => <div key={b.title} className="rs-box"><h3>{b.title}</h3><ul>{b.items.map((t) => <li key={t}>{t}</li>)}</ul></div>)}</div>
        </section>

        <section className="rs-sec">
          <div className="rs-sec-h"><span style={{ background: kit.hue }} aria-hidden="true">3</span><div><h2>Words you can copy</h2><p>Paste them as they are, or make them yours.</p></div></div>
          <div className="rs-cards2">{kit.copy.map((c) => <div key={c.title}><h3 style={{ margin: "0 0 8px", color: "var(--p)" }}>{c.title}</h3><div className="rs-copy">{c.text}<button type="button" className="sc-btn ghost rs-noprint" onClick={() => copy(c.text, c.title)}>{copied === c.title ? "Copied" : "Copy"}</button></div></div>)}</div>
        </section>

        <section className="rs-sec" id="resources">
          <div className="rs-sec-h"><span style={{ background: kit.hue }} aria-hidden="true">4</span><div><h2>Every resource for you</h2><p>From the REACH Library: checked every morning, official sources and EFF&rsquo;s own tools.</p></div></div>
          {groups.map((g) => (
            <div key={g.c} style={{ margin: "22px 0" }}>
              <h3 style={{ margin: "0 0 10px", font: "900 22px/1.1 var(--rx-head)", color: "var(--p)" }}>{CATS[g.c].glyph} {CATS[g.c].title}</h3>
              <div className="lb-grid">{g.list.map((i) => <LibCard key={i.key} i={i} />)}</div>
            </div>
          ))}
        </section>

        <section className="rs-more">
          <h2>{kit.close.title}</h2>
          <p>{kit.close.text}</p>
          <div className="rs-acts">{kit.close.cta.map((c, n) => <a key={c.href} className={`sc-btn ${n ? "ghost" : "coral"}`} href={c.href}>{c.label}</a>)}</div>
        </section>
        <p className="rs-print">REACH by Esther Funds Foundation · reach.estherfundsfoundation.org · In crisis, call or text 988.</p>
      </div>
      <SiteFoot />
    </main>
  );
}
