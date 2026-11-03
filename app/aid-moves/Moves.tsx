"use client";

import { useState } from "react";
import { SiteFoot, SiteTop } from "../myreach/ui";
import { MOVES, STATES, type Move } from "./content";

function Card({ m, i }: { m: Move; i: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(m.script); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };
  return (
    <article className="am-card" id={m.key}>
      <span className="am-n">{String(i + 1).padStart(2, "0")}</span>
      <p className="am-hook">{m.hook}</p>
      <h2>{m.title}</h2>
      <ul className="am-truth">{m.truth.map((t, k) => <li key={k}>{t}</li>)}</ul>
      {m.bring ? <><h3>What to bring</h3><ul className="am-bring">{m.bring.map((b) => <li key={b}>{b}</li>)}</ul></> : null}
      <h3>What to say</h3>
      <blockquote className="am-script">{m.script}</blockquote>
      <button type="button" className="sc-btn sm" onClick={copy}>{copied ? "Copied" : "Copy the words"}</button>
      <div className="am-when">{m.when.map((w) => <p key={w}><b>When:</b> {w}</p>)}</div>
      <p className="am-src">Source: {m.sources.map(([l, u], k) => <span key={u}>{k ? " · " : ""}<a href={u} target="_blank" rel="noopener noreferrer">{l}</a></span>)}</p>
    </article>
  );
}

export default function Moves() {
  const [st, setSt] = useState("");
  const s = STATES.find((x) => x.st === st);
  return (
    <div className="sc am">
      <SiteTop />
      <main>
        <section className="sc-hero"><div className="sc-wrap">
          <span className="sc-kick"><span className="dot" />Financial aid, the deep layer</span>
          <h1 className="cr-h1">The aid moves nobody tells you.</h1>
          <p>Financial aid has more doors than the FAFSA. These are fourteen of them, from the official rules, in plain words, with what to say. You don&rsquo;t need permission to ask.</p>
        </div></section>
        <section className="sc-wrap">
          <div className="am-state">
            <h2>First: does your state pay out early?</h2>
            <p>Some states give their grants until the money runs out. File the FAFSA in October or November there, or you can get nothing. The 2027&ndash;28 FAFSA is open now.</p>
            <label className="sc-field">Your state
              <select value={st} onChange={(e) => setSt(e.target.value)}>
                <option value="">Pick your state</option>
                {STATES.map((x) => <option key={x.st} value={x.st}>{x.name}</option>)}
                <option value="other">Another state</option>
              </select>
            </label>
            {s ? <p className={`am-st ${s.first ? "hot" : ""}`}>{s.first ? <b>Money runs out here. File now. </b> : null}{s.when}</p> : null}
            {st === "other" ? <p className="am-st">Find your state&rsquo;s date on <a href="https://studentaid.gov/apply-for-aid/fafsa/fafsa-deadlines" target="_blank" rel="noopener noreferrer">studentaid.gov&rsquo;s deadline list</a>.</p> : null}
            <p className="am-src">Source: <a href="https://studentaid.gov/sites/default/files/2027-28-fafsa-form.pdf" target="_blank" rel="noopener noreferrer">the 2027&ndash;28 FAFSA form&rsquo;s state deadlines</a></p>
          </div>
          <nav className="am-toc">{MOVES.map((m, i) => <a key={m.key} href={`#${m.key}`}><span>{String(i + 1).padStart(2, "0")}</span>{m.hook}</a>)}</nav>
          {MOVES.map((m, i) => <Card key={m.key} m={m} i={i} />)}
          <div className="am-college">
            <h2>Every college does this its own way.</h2>
            <p>Find your college on REACH to see its own forms and its own words for these appeals.</p>
            <a className="sc-btn" href="/my-college">Find my college</a>
          </div>
          <p className="cr-note am-foot">General information from U.S. Department of Education and USDA rules, checked November 2026. Your college&rsquo;s aid office makes the final call on your aid. In a crisis, call or text <a href="tel:988">988</a>.</p>
        </section>
      </main>
      <SiteFoot />
    </div>
  );
}
