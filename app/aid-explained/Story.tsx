"use client";

import { useState } from "react";
import { SiteFoot, SiteTop } from "../myreach/ui";
import { CHAPTERS, CHEAT, DATES, TEN, type Chapter } from "./content";

function Quiz({ c }: { c: Chapter }) {
  const [pick, setPick] = useState<number | null>(null);
  const chosen = pick === null ? null : c.q.options[pick];
  return (
    <div className="ae-q">
      <p className="ae-q-ask"><span>Try it</span>{c.q.ask}</p>
      <div className="ae-q-opts">
        {c.q.options.map((o, i) => (
          <button key={o.t} type="button" className={`ae-opt${pick === i ? (o.right ? " yes" : " no") : ""}`} onClick={() => setPick(i)} aria-pressed={pick === i}>{o.t}</button>
        ))}
      </div>
      {chosen ? <p className={`ae-q-why ${chosen.right ? "yes" : "no"}`} aria-live="polite">{chosen.right ? "Yes! " : "Not quite. "}{chosen.why}</p> : null}
    </div>
  );
}

function ChapterCard({ c }: { c: Chapter }) {
  return (
    <article className="ae-ch" id={c.key}>
      <span className="ae-n">{c.n}</span>
      <p className="ae-kick">Part {c.n}</p>
      <h2>{c.title}</h2>
      <div className="ae-story"><p className="ae-label">Maya&rsquo;s story</p>{c.story.map((s) => <p key={s}>{s}</p>)}</div>
      <p className="ae-label">In plain words</p>
      <div className="ae-plain">
        {c.plain.map((p) => typeof p === "string"
          ? <p key={p}>{p}</p>
          : <div key={p[0]} className="ae-term"><b>{p[0]}</b><span>{p[1]}</span></div>)}
      </div>
      {c.table ? (
        <table className="ae-table"><thead><tr><th>{c.table.head[0]}</th><th>{c.table.head[1]}</th></tr></thead>
          <tbody>{c.table.rows.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody></table>
      ) : null}
      {c.box ? <div className={`ae-box ${c.box.kind}`}><h3>{c.box.title}</h3>{c.box.body.map((b) => <p key={b}>{b}</p>)}</div> : null}
      <Quiz c={c} />
    </article>
  );
}

export default function Story() {
  return (
    <div className="sc ae">
      <SiteTop />
      <main>
        <section className="sc-hero"><div className="sc-wrap">
          <span className="sc-kick"><span className="dot" />Financial aid, the simple version</span>
          <h1 className="cr-h1">Financial aid, explained like a story.</h1>
          <p>One student. One small idea at a time. No hard math, and no big word without a translation. Read it in one sitting or a little at a time. It will wait for you.</p>
        </div></section>

        <section className="sc-wrap">
          <div className="ae-how">
            <div><b>1</b><span>Each idea shows up in Maya&rsquo;s story first.</span></div>
            <div><b>2</b><span>Then we say it in plain words.</span></div>
            <div><b>3</b><span>Then you answer one easy question.</span></div>
          </div>
          <p className="ae-note"><b>One honest thing first.</b> Your school&rsquo;s financial aid office makes the decisions about your aid. This page helps you understand the rules, find the right door, bring the right papers and say the right words.</p>

          <nav className="ae-toc" aria-label="Parts">{CHAPTERS.map((c) => <a key={c.key} href={`#${c.key}`}><span>{c.n}</span>{c.title}</a>)}</nav>

          {CHAPTERS.map((c) => <ChapterCard key={c.key} c={c} />)}

          <article className="ae-ch ae-end" id="cheat">
            <p className="ae-kick">Keep this</p>
            <h2>The numbers worth knowing</h2>
            <table className="ae-table"><tbody>{CHEAT.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody></table>
            <h3>Your year, in a few dates</h3>
            <ul className="ae-dates">{DATES.map(([d, t]) => <li key={d}><b>{d}</b><span>{t}</span></li>)}</ul>
            <p className="ae-small">Figures are for the 2026–27 aid year and change every year. Your own aid record lives at <a href="https://studentaid.gov" target="_blank" rel="noopener noreferrer">StudentAid.gov</a>.</p>
          </article>

          <article className="ae-ch ae-end" id="ten">
            <p className="ae-kick">You did it</p>
            <h2>The whole thing in ten sentences</h2>
            <ol className="ae-ten">{TEN.map((t) => <li key={t}>{t}</li>)}</ol>
          </article>

          <article className="ae-ch ae-next" id="next">
            <h2>Your next move</h2>
            <div className="ae-doors">
              <a href="/aid-moves"><b>The aid moves nobody tells you</b><span>Second looks, appeals, the Parent PLUS door, with the exact words to say.</span></a>
              <a href="/holdup"><b>HOLD UP</b><span>Read your bill and find your real balance before a hold stops you.</span></a>
              <a href="/screening"><b>Balance Screening</b><span>Owe your school? EFF reads your case and builds your plan with you.</span></a>
              <a href="/my-college"><b>My college</b><span>The help on your own campus, from your school&rsquo;s own pages.</span></a>
              <a href="/emergency"><b>REACH Emergency</b><span>Something happened this week? Start here.</span></a>
            </div>
          </article>
          <p className="ae-foot">Built by Esther Funds Foundation from the U.S. Department of Education&rsquo;s training for financial aid staff (2026–27). Need help right now? Call or text <a href="tel:988">988</a>. In an emergency, call <a href="tel:911">911</a>.</p>
        </section>
      </main>
      <SiteFoot />
    </div>
  );
}
