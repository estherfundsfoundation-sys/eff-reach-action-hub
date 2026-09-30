"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEVELS, dueLabel, urgent } from "../lib";
import type { Match, Profile } from "../match";
import { Top, SaveButton, Foot } from "../parts";

/* "Match me": a few questions, then open scholarships sorted for this student with the
   reasons each fits and what they still need to check. Answers stay in this browser
   (localStorage reach-match-profile); the REACH server uses them for one request and
   keeps nothing. */
const KEY = "reach-match-profile";
const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR".split(" ");
const GPA = [{ v: "3.5-4.0", l: "3.5 – 4.0" }, { v: "3.0-3.49", l: "3.0 – 3.49" }, { v: "2.5-2.99", l: "2.5 – 2.99" }, { v: "2.0-2.49", l: "2.0 – 2.49" }, { v: "below-2.0", l: "Under 2.0" }];
const ME = [
  { v: "first-generation", l: "First in my family in college" }, { v: "black-african-american", l: "Black / African American" },
  { v: "hispanic-latino", l: "Hispanic / Latino" }, { v: "native-indigenous", l: "Native / Indigenous" }, { v: "aapi", l: "Asian American / Pacific Islander" },
  { v: "women", l: "Woman" }, { v: "hbcu", l: "At an HBCU" }, { v: "community-college", l: "At a community college" },
  { v: "parenting-student", l: "I'm a parent" }, { v: "veteran-military", l: "Veteran / military family" }, { v: "disability", l: "Living with a disability" },
  { v: "lgbtq", l: "LGBTQ+" }, { v: "immigrant", l: "Immigrant / DACA / Dreamer" },
];

export default function Quiz() {
  const [p, setP] = useState<Profile>({ identity: [] });
  const [res, setRes] = useState<{ matches: Match[]; considered: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && typeof v === "object") setP({ identity: [], ...v }); } catch { /* none */ } }, []);
  const set = (patch: Partial<Profile>) => setP((cur) => ({ ...cur, ...patch }));
  const toggle = (v: string) => set({ identity: (p.identity ?? []).includes(v) ? (p.identity ?? []).filter((x) => x !== v) : [...(p.identity ?? []), v] });

  async function go() {
    if (!p.level) { setErr("Pick where you are in school first."); return; }
    setErr(""); setBusy(true);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ }
    try {
      const r = await fetch("/api/scholarships/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Try again in a minute.");
      setRes(j);
      setTimeout(() => document.getElementById("matches")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) { setErr(e instanceof Error ? e.message : "Try again in a minute."); }
    setBusy(false);
  }

  return (
    <main className="sc">
      <Top on="/scholarships/match" />
      <div className="sc-wrap">
        <div className="sc-quiz">
          <span className="sc-kick">Two minutes · stays on your phone</span>
          <h1 style={{ margin: "10px 0 8px", font: '900 clamp(38px,8vw,72px)/.98 "Georama","Archivo","Arial Black",sans-serif', letterSpacing: "-.03em", color: "var(--p)" }}>Find the ones meant for you.</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: "var(--i2)", margin: 0 }}>Answer what you want; skip what you don&rsquo;t. REACH sorts every open scholarship and tells you why each one fits.</p>

          <section className="sc-step">
            <h2>Where are you in school?</h2>
            <div className="sc-pills" role="group" aria-label="Level">
              {LEVELS.map((l) => <button type="button" key={l.v} className={`sc-pill${p.level === l.v ? " on" : ""}`} aria-pressed={p.level === l.v} onClick={() => set({ level: l.v })}>{l.label}</button>)}
            </div>
          </section>

          <section className="sc-step">
            <h2>Where do you live, and what do you study?</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              <label className="sc-field">State<select value={p.state ?? ""} onChange={(e) => set({ state: e.target.value || null })}><option value="">Skip</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label className="sc-field grow">Your school (optional)<input value={p.school ?? ""} onChange={(e) => set({ school: e.target.value || null })} placeholder="e.g. Florida State University" /></label>
              <label className="sc-field grow">Major or what you want to study (optional)<input value={p.field ?? ""} onChange={(e) => set({ field: e.target.value || null })} placeholder="e.g. nursing" /></label>
            </div>
          </section>

          <section className="sc-step">
            <h2>Your GPA (optional)</h2>
            <div className="sc-pills">
              {GPA.map((g) => <button type="button" key={g.v} className={`sc-pill${p.gpa === g.v ? " on" : ""}`} aria-pressed={p.gpa === g.v} onClick={() => set({ gpa: p.gpa === g.v ? null : g.v })}>{g.l}</button>)}
            </div>
          </section>

          <section className="sc-step">
            <h2>Anything that describes you? (optional)</h2>
            <p className="sc-small" style={{ margin: 0 }}>Lots of scholarships are for specific students. Pick any that fit and we&rsquo;ll surface those.</p>
            <div className="sc-pills">
              {ME.map((m) => <button type="button" key={m.v} className={`sc-pill${(p.identity ?? []).includes(m.v) ? " on" : ""}`} aria-pressed={(p.identity ?? []).includes(m.v)} onClick={() => toggle(m.v)}>{m.l}</button>)}
            </div>
          </section>

          {err ? <p style={{ color: "#b3123a", fontWeight: 600 }}>{err}</p> : null}
          <div className="sc-acts">
            <button className="sc-btn coral" style={{ minHeight: 56, fontSize: 18 }} disabled={busy} onClick={go}>{busy ? "Sorting…" : "Show my matches"}</button>
            {res ? <button type="button" className="sc-btn ghost sm" onClick={() => { try { localStorage.removeItem(KEY); } catch { /* */ } setP({ identity: [] }); setRes(null); }}>Clear my answers</button> : null}
          </div>
        </div>

        {res ? (
          <section id="matches" className="sc-section" style={{ scrollMarginTop: 80 }}>
            <h2 className="sc-h2">{res.matches.length ? `Your top ${res.matches.length}` : "No close matches yet"}</h2>
            <p className="sc-small">Sorted from {res.considered.toLocaleString()} open scholarships. &ldquo;Matched&rdquo; means worth a look; the provider decides who qualifies.</p>
            {res.matches.length ? (
              <div className="sc-grid">
                {res.matches.map((m) => (
                  <article className="sc-card" key={m.item.slug}>
                    <span className={`sc-conf ${m.confidence}`}>{m.confidence === "strong" ? "Strong match" : m.confidence === "possible" ? "Good fit" : "Worth a look"}</span>
                    <span className={`sc-due${urgent(m.item) ? " hot" : ""}`}>{dueLabel(m.item)}</span>
                    <div className={m.item.amount && /\d/.test(m.item.amount) ? "sc-amt" : "sc-amt quiet"}>{m.item.amount && /\d/.test(m.item.amount) ? m.item.amount : "Amount varies"}</div>
                    <h3><Link href={`/scholarships/${m.item.slug}`}>{m.item.title}</Link></h3>
                    <ul className="sc-why">{m.reasons.slice(0, 3).map((r) => <li key={r}>{r}</li>)}</ul>
                    {m.cautions.length ? <ul className="sc-why warn">{m.cautions.slice(0, 2).map((r) => <li key={r}>{r}</li>)}</ul> : null}
                    <SaveButton slug={m.item.slug} compact />
                  </article>
                ))}
              </div>
            ) : <div className="sc-empty"><p>Try leaving the school or major blank, or <Link href="/scholarships">browse everything</Link>.</p></div>}
          </section>
        ) : null}
      </div>
      <Foot />
    </main>
  );
}
