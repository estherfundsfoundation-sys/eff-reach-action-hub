"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEVELS, dueLabel, urgent, rpc, checkedOn, type Card } from "../lib";
import type { Match, Profile } from "../match";
import { Top, SaveButton, Foot } from "../parts";

/* "Match me": a few questions, then (1) FAFSA and the student's own state's aid first, (2) the scholarships EFF
   checked on the provider's own page that the student actually qualifies for, each with WHY ("FL resident ✓,
   GPA 3.2 ≥ 3.0 ✓"), (3) close calls with exactly what's missing, (4) when nothing fits, real help instead of a dead
   end (the EFF Emergency Grant, the Emergency Predictor, the student's own college's resources), then (5) the wider
   list, clearly marked as not checked by EFF. Known-ineligible awards are never shown as matches. Answers stay in this
   browser (localStorage reach-match-profile); MyEFF's eff_sch_match uses them for one request and keeps only counts. */
type DeepHit = Card & { why: string[]; check?: string[]; missing?: string[] };
type DeepRes = { fits: DeepHit[]; near: DeepHit[]; state_aid: Card[]; checked: number };
const FOCUS_OF: Record<string, string> = {
  "first-generation": "first_gen", "black-african-american": "black", "hispanic-latino": "hispanic", "native-indigenous": "native", aapi: "asian",
  women: "women", "veteran-military": "military", disability: "disability", lgbtq: "lgbtq", immigrant: "immigrant", foster: "foster",
};
const LEVEL_OF: Record<string, string> = { "high school": "high_school", undergraduate: "undergraduate", graduate: "graduate" };
const GPA_LOW: Record<string, string> = { "3.5-4.0": "3.5", "3.0-3.49": "3.0", "2.5-2.99": "2.5", "2.0-2.49": "2.0", "below-2.0": "1.9" };
const count = (k: string) => { rpc("eff_sch_count", { p_kind: k }).catch(() => {}); };
const KEY = "reach-match-profile";
const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR".split(" ");
const GPA = [{ v: "3.5-4.0", l: "3.5 – 4.0" }, { v: "3.0-3.49", l: "3.0 – 3.49" }, { v: "2.5-2.99", l: "2.5 – 2.99" }, { v: "2.0-2.49", l: "2.0 – 2.49" }, { v: "below-2.0", l: "Under 2.0" }];
const ME = [
  { v: "first-generation", l: "First in my family in college" }, { v: "black-african-american", l: "Black / African American" },
  { v: "hispanic-latino", l: "Hispanic / Latino" }, { v: "native-indigenous", l: "Native / Indigenous" }, { v: "aapi", l: "Asian American / Pacific Islander" },
  { v: "women", l: "Woman" }, { v: "hbcu", l: "At an HBCU" }, { v: "community-college", l: "At a community college" },
  { v: "parenting-student", l: "I'm a parent" }, { v: "veteran-military", l: "Veteran / military family" }, { v: "disability", l: "Living with a disability" },
  { v: "lgbtq", l: "LGBTQ+" }, { v: "immigrant", l: "Immigrant / DACA / Dreamer" }, { v: "foster", l: "Foster care" },
];
type More = { fafsa?: string; citizenship?: string; enrollment?: string; need?: string };
const MORE_KEY = "reach-match-more";

export default function Quiz() {
  const [p, setP] = useState<Profile>({ identity: [] });
  const [res, setRes] = useState<{ matches: Match[]; considered: number } | null>(null);
  const [deep, setDeep] = useState<DeepRes | null>(null);
  const [m, setM] = useState<More>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && typeof v === "object") setP({ identity: [], ...v }); } catch { /* none */ }
    try { const v = JSON.parse(localStorage.getItem(MORE_KEY) || "null"); if (v && typeof v === "object") setM(v); } catch { /* none */ }
  }, []);
  const set = (patch: Partial<Profile>) => setP((cur) => ({ ...cur, ...patch }));
  const toggle = (v: string) => set({ identity: (p.identity ?? []).includes(v) ? (p.identity ?? []).filter((x) => x !== v) : [...(p.identity ?? []), v] });

  async function go() {
    if (!p.level) { setErr("Pick where you are in school first."); return; }
    setErr(""); setBusy(true);
    try { localStorage.setItem(KEY, JSON.stringify(p)); localStorage.setItem(MORE_KEY, JSON.stringify(m)); } catch { /* private mode */ }
    rpc<DeepRes>("eff_sch_match", { p: {
      state: p.state || null, level: LEVEL_OF[p.level ?? ""] || null, gpa: p.gpa ? GPA_LOW[p.gpa] || null : null, major: p.field || null,
      enrollment: m.enrollment || null, citizenship: m.citizenship || null, need: m.need || null,
      focus: (p.identity ?? []).map((x) => FOCUS_OF[x]).filter(Boolean),
    } }, 0).then(setDeep).catch(() => setDeep({ fits: [], near: [], state_aid: [], checked: 0 }));
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
            <h2>First: have you filled out the FAFSA for next year?</h2>
            <p className="sc-small" style={{ margin: 0 }}>It comes before any scholarship. It&rsquo;s how you get a Pell Grant, state aid and most college aid, and you never pay it back.</p>
            <div className="sc-pills">
              {[["filed", "Yes, it's done"], ["not_yet", "Not yet"], ["unsure", "Not sure what that is"]].map(([v, l]) => <button type="button" key={v} className={`sc-pill${m.fafsa === v ? " on" : ""}`} aria-pressed={m.fafsa === v} onClick={() => setM({ ...m, fafsa: v })}>{l}</button>)}
            </div>
          </section>

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
            <h2>A few rules scholarships check (optional)</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              <label className="sc-field">Citizenship<select value={m.citizenship ?? ""} onChange={(e) => setM({ ...m, citizenship: e.target.value || undefined })}><option value="">Skip</option><option value="citizen">U.S. citizen</option><option value="permanent_resident">Permanent resident</option><option value="daca">DACA / undocumented</option><option value="international">International student</option></select></label>
              <label className="sc-field">In school<select value={m.enrollment ?? ""} onChange={(e) => setM({ ...m, enrollment: e.target.value || undefined })}><option value="">Skip</option><option value="full_time">Full-time</option><option value="part_time">Part-time</option></select></label>
              <label className="sc-field">Money is tight / Pell-eligible<select value={m.need ?? ""} onChange={(e) => setM({ ...m, need: e.target.value || undefined })}><option value="">Skip</option><option value="yes">Yes</option><option value="no">No</option><option value="unsure">Not sure</option></select></label>
            </div>
            <p className="sc-small">Only used to sort, right now, on this page. EFF never keeps or sells your answers.</p>
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

        {res || deep ? <span id="matches" style={{ display: "block", scrollMarginTop: 80 }} /> : null}
        {deep ? <DeepResults d={deep} fafsa={m.fafsa} state={p.state || null} /> : null}

        {res ? (
          <section className="sc-section">
            <h2 className="sc-h2">{res.matches.length ? `More to look at (${res.matches.length})` : "No close matches in the wider list"}</h2>
            <p className="sc-small">From {res.considered.toLocaleString()} open listings as their sources show them. EFF hasn&rsquo;t checked these on the provider&rsquo;s page yet, so &ldquo;match&rdquo; means worth a look; the provider decides who qualifies.</p>
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

function DeepCard({ c, kind }: { c: DeepHit; kind: "fit" | "near" }) {
  return (
    <article className="sc-card">
      <span className="sc-checked">✓ Checked by EFF</span>
      <span className={`sc-due${urgent(c) ? " hot" : ""}`}>{dueLabel(c)}</span>
      <div className={c.amount && /\d/.test(c.amount) ? "sc-amt" : "sc-amt quiet"}>{c.amount && /\d/.test(c.amount) ? c.amount : "Amount not stated"}</div>
      <h3><Link href={`/scholarships/${c.slug}`}>{c.title}</Link></h3>
      {c.why?.length ? <p className="sc-whyline"><b>{kind === "fit" ? "Matches:" : "You have:"}</b> {c.why.join(", ")}</p> : null}
      {kind === "near" && c.missing?.length ? <p className="sc-whyline warn"><b>Missing:</b> {c.missing.join(", ")}</p> : null}
      {kind === "fit" && c.check?.length ? <p className="sc-whyline soft"><b>Check on their page:</b> {c.check.join(", ")}</p> : null}
      {c.deep?.last_verified_at ? <p className="sc-by sc-last">Last checked {checkedOn(c.deep.last_verified_at)}</p> : null}
      <SaveButton slug={c.slug} compact />
    </article>
  );
}

function DeepResults({ d, fafsa, state }: { d: DeepRes; fafsa?: string; state: string | null }) {
  return (
    <>
      <section className="sc-section sc-fafsa">
        <h2 className="sc-h2">Step 1: the money you don&rsquo;t pay back</h2>
        {fafsa === "filed" ? (
          <p>Good: your FAFSA is in. Check your school&rsquo;s aid offer and your student account so nothing is left waiting. Scholarships stack on top of that aid.</p>
        ) : (
          <p>Before any scholarship: the FAFSA. It&rsquo;s free, it&rsquo;s how Pell Grants and most state and college aid reach you, and one finished FAFSA is often worth more than a dozen essays. <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer" onClick={() => count("fafsa_click")}>Start it on StudentAid.gov ↗</a></p>
        )}
        <p className="sc-small">Pell, and how scholarships can change it: <a href="https://my.estherfundsfoundation.org/kit/pell">Protect your Pell</a>.</p>
        {d.state_aid.length ? (
          <>
            <h3>{state}&rsquo;s own aid programs</h3>
            <div className="sc-grid">{d.state_aid.map((c) => <DeepCard key={c.slug} c={{ ...c, why: [] } as DeepHit} kind="fit" />)}</div>
          </>
        ) : state ? <p className="sc-small">We haven&rsquo;t checked {state}&rsquo;s state aid programs yet. Your state&rsquo;s higher education agency lists them, and your college&rsquo;s financial aid office can tell you which you&rsquo;re in line for.</p> : null}
      </section>

      <section className="sc-section">
        <h2 className="sc-h2">{d.fits.length ? `You qualify for ${d.fits.length} checked ${d.fits.length === 1 ? "scholarship" : "scholarships"}` : "None of EFF's checked scholarships fit yet"}</h2>
        <p className="sc-small">From {d.checked.toLocaleString()} open scholarships EFF checked on the provider&rsquo;s own page. We only show ones whose rules you meet, and say why.</p>
        {d.fits.length ? <div className="sc-grid">{d.fits.map((c) => <DeepCard key={c.slug} c={c} kind="fit" />)}</div> : null}
      </section>

      {!d.fits.length ? (
        <section className="sc-section sc-nofit">
          <h2 className="sc-h2">You&rsquo;re not out of options.</h2>
          <div className="sc-doors">
            <a className="sc-door" href="/apply/emergency-grant" onClick={() => count("fallback_grant")}><b>EFF Emergency Grant</b><span>A bill standing between you and class? EFF can pay it straight to the company.</span></a>
            <a className="sc-door" href="https://my.estherfundsfoundation.org/kit/predictor" onClick={() => count("fallback_predictor")}><b>See what&rsquo;s coming</b><span>The Emergency Predictor looks at your money and dates and warns you before a hold hits.</span></a>
            <a className="sc-door" href="/my-college" onClick={() => count("fallback_college")}><b>Your college&rsquo;s own help</b><span>Emergency funds, food, aid appeals: what your campus offers, in one place.</span></a>
          </div>
        </section>
      ) : null}

      {d.near.length ? (
        <section className="sc-section">
          <h2 className="sc-h2">Close calls</h2>
          <p className="sc-small">You meet everything but one rule. Worth knowing for later, or if something changes.</p>
          <div className="sc-grid">{d.near.map((c) => <DeepCard key={c.slug} c={c} kind="near" />)}</div>
        </section>
      ) : null}
    </>
  );
}
