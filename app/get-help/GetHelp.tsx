"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteTop } from "../myreach/ui";
import { byKey, fullHref, type ReachResource } from "./resources";
import "./get-help.css";

/* REACH Get Help: EFF's own 211 for college students. Ask like you'd text a
   friend, get help in plain words, nearest first. Local spots come from MyEFF's
   database (eff_reach_find: HUD housing counselors synced weekly, plus spots
   students and chapters suggested that a person approved); national lines and
   EFF's tools come from resources.ts. Nothing about who searched is saved: the
   database only counts searches that found nothing local, by need and state. */

const SUPABASE = "https://voljlrqyruluuqrfqwww.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGpscnF5cnVsdXVxcmZxd3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTY2NTEsImV4cCI6MjEwMDgzMjY1MX0.O9Ini6y-jLZIyVClID9mslNwi4Ga33EieKGEhX0QSao";

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(`${SUPABASE}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message || "Something went wrong. Try again in a second.");
  return d as T;
}

type Need = { key: string; label: string; db: string | null; national: string[]; say: string };
const NEEDS: Need[] = [
  { key: "food", label: "I'm out of food", db: "food", national: ["food", "snapstate", "snap", "findhelp", "swipe"],
    say: "Hi, I'm a college student and I'm out of food this week. Do you have anything I can get today, and do I need to bring anything?" },
  { key: "housing", label: "Rent, housing or a place to stay", db: "housing", national: ["helpdesk", "portal", "findhelp"],
    say: "Hi, I'm a college student and I'm behind on rent (or about to lose my place). What help do you have, and what should I bring?" },
  { key: "money", label: "I need money, fast", db: "money", national: ["portal", "helpdesk", "notenough", "lifeline"],
    say: "Hi, I'm a college student with an emergency bill I can't cover. Is there emergency aid or a payment plan I can ask for?" },
  { key: "school", label: "Tuition, a hold or financial aid", db: "school", national: ["kit", "pellprotector", "fsaphone", "fafsa", "notenough", "helpdesk"],
    say: "Hi, I have a hold on my account and I can't register. Can you tell me exactly what's causing it and what my options are, like a payment plan or an appeal?" },
  { key: "dropout", label: "I'm thinking about dropping out", db: "school", national: ["kit", "lighthouse", "helpdesk", "chapters"],
    say: "Hi, I'm thinking about leaving school and I want to know my options first, like a lighter load, a leave of absence, or help with what's making it hard." },
  { key: "mind", label: "Stressed, anxious or burnt out", db: "mind", national: ["988", "text", "steve", "trevor", "selah", "lighthouse"],
    say: "Hi, I've been really stressed and it's getting hard to keep up. Can I talk to someone this week?" },
  { key: "health", label: "Doctor, dentist or meds", db: "health", national: ["findhelp"],
    say: "Hi, I'm a college student without much money. Do you have a sliding fee or free visits, and can I be seen soon?" },
  { key: "phone", label: "My phone or internet got cut off", db: "phone", national: ["lifeline"],
    say: "Hi, my phone (or internet) got shut off and I need it for school. What discounts or help do you have?" },
  { key: "work", label: "I need a job or an internship", db: "work", national: ["resume", "interview", "letters"],
    say: "Hi, I'm a college student looking for part-time work that fits around my classes. What's open right now?" },
  { key: "scholarships", label: "Scholarships and free money", db: "money", national: ["walk", "match", "careeronestop", "uncf", "tmcf", "hsf", "ftc"],
    say: "Hi, I'm a college student looking for scholarships I can still apply for this term. What do you have, and when are the deadlines?" },
  { key: "lonely", label: "I feel alone here", db: "mind", national: ["chapters", "lighthouse", "selah", "awkward"],
    say: "Hi, I'm new here and haven't really found my people yet. Are there groups or people I could meet?" },
];

const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");
const SUGGEST_NEEDS = [["food", "Food"], ["housing", "Housing"], ["money", "Money"], ["school", "School stuff"], ["mind", "Mental health"], ["health", "Health"],
  ["phone", "Phone/internet"], ["work", "Jobs"], ["family", "Kids/family"], ["ride", "Getting around"], ["legal", "Legal"], ["safety", "Safety"]] as const;

type School = { id: string; name: string; city?: string | null; state?: string | null };
type Local = { id: string; source: string; name: string; summary: string | null; phone: string | null; url: string | null; address: string | null; city: string | null; state: string | null; cost: string; where: string };
type Found = { state: string | null; city: string | null; local: Local[] };

export default function GetHelp() {
  const [need, setNeed] = useState<Need | null>(null);
  const [crisis, setCrisis] = useState(false);
  const [schoolQ, setSchoolQ] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const results = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = schoolQ.trim();
    if (q.length < 2 || (school && q === school.name)) { setSchools([]); return; }
    const t = setTimeout(() => rpc<School[]>("eff_search_institutions", { p_query: q, p_limit: 6 }).then(setSchools).catch(() => setSchools([])), 220);
    return () => clearTimeout(t);
  }, [schoolQ, school]);

  const where = school ? school.name : state ? `${city ? `${city}, ` : ""}${state}` : "";
  const national = useMemo(() => (need ? need.national.map(byKey).filter(Boolean) as ReachResource[] : []), [need]);

  async function find() {
    if (!need) return;
    setErr(""); setBusy(true); setFound(null);
    try {
      const f = await rpc<Found>("eff_reach_find", { p_need: need.db, p_state: school ? null : state || null, p_city: school ? null : city || null, p_institution: school?.id || null });
      setFound(f);
      setTimeout(() => results.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    setBusy(false);
  }
  async function flag(id: string) {
    setFlagged((f) => ({ ...f, [id]: true }));
    await rpc("eff_reach_flag", { p_id: id, p_reason: "Did not work (REACH Get Help)" }).catch(() => {});
  }
  function copySay() {
    if (!need) return;
    navigator.clipboard?.writeText(need.say).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
  }

  return (
    <main className="gh">
      <div className="gh-crisis" role="note">In crisis or worried about a friend? <a href="tel:988">Call or text 988</a> · In danger now? <a href="tel:911">911</a></div>

      <div className="sc sc-bar"><SiteTop on="/get-help" /></div>
      <header className="gh-hero">
        <h1>What&rsquo;s going on?</h1>
        <p>Pick what&rsquo;s closest. We&rsquo;ll show you who can help, near you first, in plain words. Nothing you pick is saved.</p>
      </header>

      <section className="gh-needs" aria-label="What do you need help with?">
        <button className={`gh-need gh-need-crisis${crisis ? " on" : ""}`} aria-pressed={crisis} onClick={() => { setCrisis(true); setNeed(null); setFound(null); }}>I&rsquo;m not okay right now</button>
        {NEEDS.map((n) => (
          <button key={n.key} className={`gh-need${need?.key === n.key ? " on" : ""}`} aria-pressed={need?.key === n.key} onClick={() => { setNeed(n); setCrisis(false); setFound(null); }}>{n.label}</button>
        ))}
      </section>

      {crisis ? (
        <section className="gh-card gh-now" aria-live="polite">
          <h2>You don&rsquo;t have to figure this out alone.</h2>
          <p>Reach a real person right now. It&rsquo;s free, it&rsquo;s private, and they&rsquo;re there any hour.</p>
          <div className="gh-now-row">
            <a className="gh-btn big" href="tel:988">Call 988</a>
            <a className="gh-btn big" href="sms:988">Text 988</a>
            <a className="gh-btn big ghost" href="sms:741741?&body=HOME">Text HOME to 741741</a>
          </div>
          <p className="gh-small">Students of color: text STEVE to 741741. LGBTQ+ and under 25: <a href="https://www.thetrevorproject.org/get-help/">The Trevor Project</a>. In danger right now: call 911.</p>
          <p className="gh-small">When you&rsquo;re ready, <a href="https://my.estherfundsfoundation.org/lighthouse">tell EFF what&rsquo;s going on</a> and a person will reach out.</p>
        </section>
      ) : null}

      {need ? (
        <section className="gh-card gh-where">
          <h2>Where are you?</h2>
          <label className="gh-field">Your school
            <input value={schoolQ} onChange={(e) => { setSchoolQ(e.target.value); setSchool(null); }} placeholder="Start typing your school" autoComplete="off" />
          </label>
          {schools.length ? (
            <ul className="gh-schools" role="listbox">
              {schools.map((s) => <li key={s.id}><button onClick={() => { setSchool(s); setSchoolQ(s.name); setSchools([]); }}>{s.name}{s.city ? <span> · {s.city}{s.state ? `, ${s.state}` : ""}</span> : null}</button></li>)}
            </ul>
          ) : null}
          <p className="gh-or">or</p>
          <div className="gh-row">
            <label className="gh-field">State
              <select value={state} onChange={(e) => { setState(e.target.value); setSchool(null); }}>
                <option value="">Pick one</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="gh-field">City (optional)
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Tallahassee" />
            </label>
          </div>
          <button className="gh-btn" onClick={find} disabled={busy}>{busy ? "Looking…" : where ? `Show me help near ${where}` : "Show me help"}</button>
          {err ? <p className="gh-err" role="alert">{err}</p> : null}
        </section>
      ) : null}

      {need && found ? (
        <div ref={results} className="gh-results" aria-live="polite">
          <section className="gh-card gh-say">
            <h2>Not sure what to say?</h2>
            <p className="gh-script">&ldquo;{need.say}&rdquo;</p>
            <button className="gh-btn ghost sm" onClick={copySay}>{copied ? "Copied" : "Copy it"}</button>
            <p className="gh-small">Calling is the scary part. Reading this word for word is completely fine.</p>
          </section>

          <section>
            <h2 className="gh-h2">{found.local.length ? `Near ${where || "you"}` : "Near you"}</h2>
            {found.local.length ? (
              <div className="gh-list">
                {found.local.map((r) => (
                  <article key={r.id} className="gh-res">
                    <p className="gh-tag">{r.where === "campus" ? "On your campus" : r.where === "city" ? "In your city" : `In ${r.state}`} · {r.cost === "free" ? "Free" : r.cost === "sliding" ? "Pay what you can" : "Cost varies"}</p>
                    <h3>{r.name}</h3>
                    {r.summary ? <p>{r.summary}</p> : null}
                    {r.address || r.city ? <p className="gh-small">{[r.address, r.city, r.state].filter(Boolean).join(", ")}</p> : null}
                    <div className="gh-acts">
                      {r.phone ? <a className="gh-btn sm" href={`tel:${r.phone.replace(/[^0-9+]/g, "")}`}>Call</a> : null}
                      {r.url ? <a className="gh-btn sm ghost" href={r.url} target="_blank" rel="noopener noreferrer">Website</a> : null}
                      <button className="gh-link" disabled={flagged[r.id]} onClick={() => flag(r.id)}>{flagged[r.id] ? "Thanks, we'll check it" : "This didn't work"}</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="gh-empty">We don&rsquo;t have a spot for this near {where || "you"} yet. 211 does: tap below and put in your zip. And if you know a place that helped you, add it so the next person finds it.</p>
            )}
          </section>

          <section className="gh-card gh-211">
            <h2>Check 211 near you too</h2>
            <p>211 connects you to local help for food, rent, utilities and more, anywhere in the country.</p>
            <div className="gh-now-row">
              <a className="gh-btn" href="https://211.org/" target="_blank" rel="noopener noreferrer">Search 211 by zip</a>
              <a className="gh-btn ghost" href="tel:211">Call 211</a>
            </div>
          </section>

          {national.length ? (
            <section>
              <h2 className="gh-h2">From EFF and anywhere in the U.S.</h2>
              <div className="gh-list">
                {national.map((r) => (
                  <article key={r.key} className="gh-res">
                    <p className="gh-tag">{r.outside ? "National" : "From EFF"}</p>
                    <h3>{r.name}</h3>
                    <p>{r.what}</p>
                    <div className="gh-acts"><a className="gh-btn sm" href={fullHref(r.href)} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{r.cta}</a></div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="gh-card gh-person">
            <h2>Rather talk to a real person?</h2>
            <p>Tell EFF what&rsquo;s going on. A person reads it, not a bot, and you can follow it until someone has it.</p>
            <div className="gh-now-row">
              <a className="gh-btn" href="https://my.estherfundsfoundation.org/lighthouse">Talk to EFF</a>
              <a className="gh-btn ghost" href="https://my.estherfundsfoundation.org/chapters">Find your EFF chapter</a>
            </div>
          </section>

          <Suggest school={school} state={state} city={city} />
        </div>
      ) : null}

      <footer className="gh-foot">
        <p>REACH is EFF&rsquo;s student support: <a href="/">REACH home</a> · <a href="/scholarships">Scholarships</a> · <a href="https://my.estherfundsfoundation.org/kit">Survival Kit</a></p>
        <p className="gh-small">Before you drop out, REACH.</p>
      </footer>
    </main>
  );
}

function Suggest({ school, state, city }: { school: School | null; state: string; city: string }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", summary: "", phone: "", url: "", email: "", cost: "free", website: "" });
  const [needs, setNeeds] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      await rpc("eff_reach_suggest", { p: { ...f, needs, institution_id: school?.id || null, state: school ? null : state, city: school ? null : city } });
      setMsg("Got it. A person at EFF will check it, and then it shows up for everyone near you. Thank you for looking out."); setOpen(false);
    } catch (x) { setErr(x instanceof Error ? x.message : String(x)); }
    setBusy(false);
  }
  if (msg) return <section className="gh-card"><p>{msg}</p></section>;
  return (
    <section className="gh-card gh-suggest">
      <h2>Know a spot that helped you?</h2>
      <p>The campus pantry, a church that gives out groceries, the emergency fund nobody talks about. Add it and the next student finds it.</p>
      {!open ? <button className="gh-btn ghost" onClick={() => setOpen(true)}>Add a spot</button> : (
        <form onSubmit={send} className="gh-form">
          <label className="gh-field">Name of the place<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <fieldset className="gh-checks"><legend>What does it help with?</legend>
            {SUGGEST_NEEDS.map(([k, l]) => <label key={k}><input type="checkbox" checked={needs.includes(k)} onChange={(e) => setNeeds(e.target.checked ? [...needs, k] : needs.filter((x) => x !== k))} /> {l}</label>)}
          </fieldset>
          <label className="gh-field">What do they do? (a sentence or two)<textarea required rows={3} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></label>
          <div className="gh-row">
            <label className="gh-field">Phone<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" /></label>
            <label className="gh-field">Website (https://…)<input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} inputMode="url" /></label>
          </div>
          <label className="gh-field">Cost
            <select value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })}><option value="free">Free</option><option value="sliding">Pay what you can</option><option value="varies">It varies</option></select>
          </label>
          <label className="gh-field">Your email (optional, only if we have a question)<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <label className="gh-hp" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label>
          <p className="gh-small">It&rsquo;s for {school ? school.name : state ? `${city ? `${city}, ` : ""}${state}` : "the place you picked above"}.</p>
          {err ? <p className="gh-err" role="alert">{err}</p> : null}
          <button className="gh-btn" disabled={busy}>{busy ? "Sending…" : "Send it"}</button>
        </form>
      )}
    </section>
  );
}
