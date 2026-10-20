"use client";

import { RealStrip } from "../RealReach";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { call, readPass, startCode, writePass, SignedOut, type Pass } from "../myreach/pass";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { SignIn } from "../account/SignIn";
import { dueLabel, urgent } from "../scholarships/lib";
import type { Match } from "../scholarships/match";
import { SECTIONS, IDENTITY, completeness, kitRows, matchProfile, rows, str, type Profile, type Row, type Field } from "./fields";
import { TYPES, TYPE, draft, draftParas, fit, suggestKind, wordLimitIn, words, answered, type Kind } from "./essays";

/* Apply With Me (REACH Scholarships). The student builds her application once (profile and essay bank),
   finds matches, and for each scholarship gets a kit: every answer with a copy button and her essay fitted
   to the prompt. She opens the provider's page, pastes, reads it through and presses submit herself.
   Everything saves to her My REACH account in MyEFF (eff_raw_* functions, by the token in reach-pass). */

type Essay = { id: string; kind: Kind | "custom"; title: string; answers: Record<string, string>; body: string; updated_at: string };
type App = {
  id: string; slug: string | null; title: string; sponsor: string | null; url: string | null; deadline: string | null; deadline_kind: string | null;
  amount: string | null; amount_cents: number | null; listing_live: boolean | null; status: string; prompt: string | null; word_limit: number | null;
  essay_id: string | null; essay_body: string | null; why_line: string | null; notes: string | null; award_cents: number | null; applied_at: string | null;
};
type Me = { email: string; account: Record<string, unknown>; profile: Profile; essays: Essay[]; apps: App[] };
/* College applications (apply-with-me/college) share the table; this builder shows scholarships only. */
const onlySch = <T extends Me>(m: T): T => ({ ...m, apps: (m.apps || []).filter((a) => (a as App & { kind?: string }).kind !== "college") });
type View = "start" | "profile" | "essays" | "matches" | "kit" | "tracker";

const STEPS: Array<{ v: View; n: string; label: string }> = [
  { v: "profile", n: "1", label: "Your profile" }, { v: "essays", n: "2", label: "Essay bank" }, { v: "matches", n: "3", label: "Matches" },
  { v: "kit", n: "4", label: "Your kit" }, { v: "tracker", n: "5–6", label: "Submit & track" },
];
const STATUS: Record<string, string> = { saved: "On my list", working: "Working on it", applied: "Submitted", won: "Won", not_selected: "Not selected", skipped: "Skipped" };
const money = (c: number | null | undefined) => (c ? `$${Math.round(c / 100).toLocaleString()}` : "");

function Copy({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function go() {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    setDone(true); setTimeout(() => setDone(false), 1600);
  }
  return <button type="button" className={`aw-copy${done ? " done" : ""}`} onClick={go} aria-live="polite">{done ? "Copied ✓" : label}</button>;
}

export default function Builder() {
  const [pass, setPass] = useState<Pass | null>(null);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [view, setView] = useState<View>("start");
  const [kitId, setKitId] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async (p: Pass | null) => {
    if (!p) { setMe(null); return; }
    try { setMe(onlySch(await call<Me>("eff_raw_me", { p_token: p.token }))); }
    catch (e) { if (e instanceof SignedOut) setPass(null); else setErr(e instanceof Error ? e.message : "REACH didn't load."); }
  }, []);

  useEffect(() => {
    const p = readPass(); setPass(p); setReady(true); load(p);
    const q = new URLSearchParams(location.search);
    if (q.get("kit")) { setKitId(q.get("kit")); setView("kit"); }
    else if (location.hash === "#tracker") setView("tracker");
    const up = () => { const n = readPass(); setPass(n); load(n); };
    window.addEventListener("reach-pass", up);
    return () => window.removeEventListener("reach-pass", up);
  }, [load]);

  const run = useCallback(async <T,>(fn: string, body: Record<string, unknown>): Promise<T | null> => {
    if (!pass) return null;
    setErr("");
    try { const r = await call<T & Me>(fn, { p_token: pass.token, ...body }); if (r && (r as Me).apps) setMe(onlySch(r as Me)); return r; }
    catch (e) { if (!(e instanceof SignedOut)) setErr(e instanceof Error ? e.message : "That didn't save."); return null; }
  }, [pass]);

  function go(v: View, id?: string) {
    setView(v); if (id !== undefined) setKitId(id);
    const url = v === "kit" && (id ?? kitId) ? `?kit=${id ?? kitId}` : v === "tracker" ? "#tracker" : location.pathname;
    history.replaceState(null, "", url.startsWith("?") || url.startsWith("#") ? `${location.pathname}${url}` : url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) return <main className="sc aw"><SiteTop on="/scholarships" /><div className="sc-wrap aw-pad" /></main>;
  if (!pass) return (
    <main className="sc aw">
      <SiteTop on="/scholarships" />
      <Landing />
      <div className="sc-wrap" id="start">
        <SignIn onIn={() => { const p = readPass(); setPass(p); load(p); setView("profile"); }} startCode={startCode}
          title={<>Let&rsquo;s build it <em>together.</em></>} />
      </div>
      <SiteFoot />
    </main>
  );

  const profile = me?.profile || {};
  const pct = completeness(profile);
  const goodEssays = (me?.essays || []).filter((e) => words(e.body) >= 120).length;
  const applied = (me?.apps || []).filter((a) => ["applied", "won", "not_selected"].includes(a.status));
  const done: Record<View, boolean> = {
    start: true, profile: pct >= 70, essays: goodEssays > 0, matches: (me?.apps.length || 0) > 0,
    kit: (me?.apps || []).some((a) => a.essay_body), tracker: applied.length > 0,
  };
  const name = str(profile, "preferred_name") || str(profile, "first_name") || (me?.account.first_name as string) || "";

  return (
    <main className="sc aw">
      <SiteTop on="/scholarships" />
      <header className="aw-head">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />Apply With Me · REACH Scholarships</span>
          <h1>{view === "start" ? <>{name ? `${name}, let's` : "Let's"} get you <em>paid to learn.</em></> : STEPS.find((s) => s.v === view)?.label}</h1>
          <nav className="aw-steps" aria-label="Apply With Me steps">
            {STEPS.map((s) => (
              <button key={s.v} type="button" className={`${view === s.v ? "on " : ""}${done[s.v] ? "ok" : ""}`} aria-current={view === s.v ? "step" : undefined}
                onClick={() => go(s.v, s.v === "kit" ? (kitId || me?.apps.find((a) => ["saved", "working"].includes(a.status))?.id || undefined) : undefined)}>
                <b>{done[s.v] ? "✓" : s.n}</b><span>{s.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <div className="sc-wrap aw-pad">
        {err ? <p className="aw-err" role="alert">{err}</p> : null}
        {!me ? <p className="sc-small">Loading your application…</p>
          : view === "start" ? <Home me={me} pct={pct} essays={goodEssays} applied={applied} go={go} />
          : view === "profile" ? <ProfileView me={me} run={run} next={() => go("essays")} />
          : view === "essays" ? <EssaysView me={me} run={run} next={() => go("matches")} />
          : view === "matches" ? <MatchesView me={me} run={run} openKit={(id) => go("kit", id)} />
          : view === "kit" ? <KitView key={kitId || "none"} me={me} run={run} id={kitId} pick={(id) => go("kit", id)} back={() => go("matches")} tracker={() => go("tracker")} />
          : <TrackerView me={me} run={run} openKit={(id) => go("kit", id)} find={() => go("matches")} />}
        <p className="sc-small aw-out">
          Applying to college? <Link href="/apply-with-me/college">Apply With Me · College</Link> uses the same account. Signed in as {pass.email}. Your answers save to your REACH account. <button type="button" className="aw-link" onClick={() => { call("eff_reach_sign_out", { p_token: pass.token }).catch(() => {}); writePass(null); setPass(null); setMe(null); }}>Sign out</button>
        </p>
      </div>
      <SiteFoot />
    </main>
  );
}

/* ---------------- Signed out ---------------- */
function Landing() {
  return (
    <>
      <section className="aw-hero">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />Apply With Me · free · REACH by EFF</span>
          <h1>You don&rsquo;t have to apply <em>alone.</em></h1>
          <p className="aw-lede">EFF builds your scholarship application with you. You tell us your story once. We turn it into answers and essays for every scholarship. <b>You make it yours and click submit.</b></p>
          <div className="sc-acts"><a className="sc-btn coral" href="#start">Start my application</a><Link className="sc-btn ghost" href="/scholarships">Browse scholarships</Link></div>
          <p className="aw-lede" style={{ marginTop: 18 }}>In high school? <Link href="/apply-with-me/college"><b>Let us apply for college with you →</b></Link></p>
        </div>
      </section>
      <RealStrip photo="p7" video="v4" />
      <section className="sc-wrap aw-how">
        {[
          ["1", "Build your profile once", "School, activities, service, work, goals and recommenders. About 20 minutes, saved for good."],
          ["2", "Tell your story", "Answer a few interview questions in your own words. REACH turns them into first drafts of the essays scholarships ask most."],
          ["3", "Get matched", "REACH sorts thousands of open scholarships and shows the ones meant for you, with why."],
          ["4", "Open your kit", "Every answer ready with a copy button, and your essay fitted to that scholarship's question and word limit."],
          ["5", "You click submit", "Open the scholarship's own page, paste, read it through once, and press submit. It's your application, in your words."],
          ["6", "Track it all", "Deadlines, reminders a week and two days out, and every dollar you applied for and won."],
        ].map(([n, h, p]) => (
          <article key={n} className="aw-howcard"><b>{n}</b><h2>{h}</h2><p>{p}</p></article>
        ))}
      </section>
      <section className="sc-wrap"><p className="aw-promise">EFF never applies for you, never asks for your Social Security number, bank details or passwords, and never charges you to apply. Scholarships ask you to promise the work is yours, so it always is.</p></section>
    </>
  );
}

/* ---------------- Home ---------------- */
function Home({ me, pct, essays, applied, go }: { me: Me; pct: number; essays: number; applied: App[]; go: (v: View, id?: string) => void }) {
  const next = me.apps.filter((a) => ["saved", "working"].includes(a.status)).sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const appliedCents = applied.reduce((n, a) => n + (a.amount_cents || 0), 0);
  const won = me.apps.filter((a) => a.status === "won").reduce((n, a) => n + (a.award_cents || a.amount_cents || 0), 0);
  const step = pct < 70 ? { v: "profile" as View, t: "Finish your profile", p: `It's ${pct}% done. Most forms ask the same 30 things; fill them once here.` }
    : essays === 0 ? { v: "essays" as View, t: "Tell your story", p: "Answer five questions in your own words and get your first essay draft." }
    : next.length === 0 ? { v: "matches" as View, t: "Find your matches", p: "See the scholarships meant for you and add them to your list." }
    : { v: "kit" as View, t: `Apply to ${next[0].title}`, p: `${dueLabel({ deadline: next[0].deadline, deadline_kind: (next[0].deadline_kind as "date") || "varies" })}. Your kit is ready.`, id: next[0].id };
  return (
    <>
      <section className="aw-next">
        <span>Your next step</span><h2>{step.t}</h2><p>{step.p}</p>
        <button type="button" className="sc-btn coral" onClick={() => go(step.v, (step as { id?: string }).id)}>Let&rsquo;s go</button>
      </section>
      <div className="aw-stats">
        <div><b>{pct}%</b><span>profile</span></div><div><b>{essays}</b><span>essays ready</span></div>
        <div><b>{applied.length}</b><span>submitted</span></div><div><b>{money(appliedCents) || "$0"}</b><span>applied for</span></div>
        {won ? <div className="win"><b>{money(won)}</b><span>won</span></div> : null}
      </div>
      {next.length ? (
        <section className="sc-box"><h2>Coming up</h2>
          <ul className="aw-list">{next.slice(0, 6).map((a) => (
            <li key={a.id}><button type="button" className="aw-link" onClick={() => go("kit", a.id)}>{a.title}</button>
              <span className={urgent({ deadline: a.deadline }) ? "aw-hot" : "sc-small"}>{dueLabel({ deadline: a.deadline, deadline_kind: (a.deadline_kind as "date") || "varies" })}</span></li>
          ))}</ul>
        </section>
      ) : null}
    </>
  );
}

/* ---------------- 1. Profile ---------------- */
function ProfileView({ me, run, next }: { me: Me; run: <T>(fn: string, b: Record<string, unknown>) => Promise<T | null>; next: () => void }) {
  const [p, setP] = useState<Profile>(() => {
    const a = me.account as Record<string, string | number | null>;
    const base: Profile = { ...me.profile };
    for (const k of ["first_name", "last_name", "school", "level", "state", "phone"]) if (!str(base, k) && a[k]) base[k] = String(a[k]);
    if (!str(base, "grad_year") && a.grad_year) base.grad_year = String(a.grad_year);
    return base;
  });
  const [state, setState] = useState<"saved" | "saving" | "edited">("saved");
  const [open, setOpen] = useState<string>("you");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(p);

  const save = useCallback(async () => {
    setState("saving");
    const r = await run("eff_raw_profile_save", { p: latest.current });
    setState(r ? "saved" : "edited");
  }, [run]);
  function set(patch: Profile) {
    setP((cur) => { const n = { ...cur, ...patch }; latest.current = n; return n; });
    setState("edited");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 1200);
  }
  useEffect(() => () => { if (timer.current) { clearTimeout(timer.current); save(); } }, [save]);

  const input = (f: Field, val: string, onVal: (v: string) => void) => {
    if (f.type === "select") return <select value={val} onChange={(e) => onVal(e.target.value)}><option value="">Choose</option>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>;
    if (f.type === "textarea") return <textarea value={val} onChange={(e) => onVal(e.target.value)} rows={3} />;
    if (f.type === "yesno") return <div className="sc-pills">{[["yes", "Yes"], ["no", "No"]].map(([v, l]) => <button key={v} type="button" className={`sc-pill${val === v ? " on" : ""}`} aria-pressed={val === v} onClick={() => onVal(val === v ? "" : v)}>{l}</button>)}</div>;
    return <input type={f.type || "text"} value={val} onChange={(e) => onVal(e.target.value)} />;
  };

  return (
    <>
      <p className="aw-intro">Fill this in once and every application gets easier. It saves as you type. Skip anything you don&rsquo;t want to share.</p>
      <div className="aw-bar"><span style={{ width: `${completeness(p)}%` }} /></div>
      <p className="sc-small aw-save">{completeness(p)}% complete · {state === "saving" ? "Saving…" : state === "edited" ? "Not saved yet" : "Saved"}</p>
      {SECTIONS.map((sec) => {
        const isOpen = open === sec.key;
        const list = sec.list;
        const items = list ? rows(p, list.key) : [];
        return (
          <section key={sec.key} className={`aw-sec${isOpen ? " open" : ""}`}>
            <button type="button" className="aw-sechead" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : sec.key)}>
              <span><b>{sec.title}</b><small>{sec.line}</small></span>
              <i>{list ? `${items.length} added` : `${(sec.fields || []).filter((f) => str(p, f.key)).length}/${(sec.fields || []).length}`}</i>
            </button>
            {isOpen ? (
              <div className="aw-secbody">
                {sec.fields ? (
                  <div className="aw-grid">
                    {sec.fields.map((f) => (
                      <label key={f.key} className={`sc-field${f.wide ? " grow aw-wide" : ""}`}><span>{f.label}</span>
                        {input(f, str(p, f.key), (v) => set({ [f.key]: v }))}{f.hint ? <small>{f.hint}</small> : null}</label>
                    ))}
                  </div>
                ) : null}
                {sec.key === "background" ? (
                  <div className="aw-ids"><span className="sc-small">Tap any that are true for you. Many scholarships are made for these students.</span>
                    <div className="sc-pills">{IDENTITY.map((i) => {
                      const on = (p.identity || []).includes(i.v);
                      return <button key={i.v} type="button" className={`sc-pill${on ? " on" : ""}`} aria-pressed={on}
                        onClick={() => set({ identity: on ? (p.identity || []).filter((x) => x !== i.v) : [...(p.identity || []), i.v] })}>{i.l}</button>;
                    })}</div>
                  </div>
                ) : null}
                {list ? (
                  <>
                    <p className="sc-small">{list.hint}</p>
                    {items.map((r, i) => (
                      <div key={i} className="aw-item">
                        <div className="aw-grid">{list.fields.map((f) => (
                          <label key={f.key} className={`sc-field${f.wide ? " grow aw-wide" : ""}`}><span>{f.label}</span>
                            {input(f, r[f.key] || "", (v) => set({ [list.key]: items.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)) }))}</label>
                        ))}</div>
                        <button type="button" className="aw-link" onClick={() => set({ [list.key]: items.filter((_, j) => j !== i) })}>Take this {list.one} out</button>
                      </div>
                    ))}
                    {items.length < 20 ? <button type="button" className="sc-btn ghost sm" onClick={() => set({ [list.key]: [...items, {} as Row] })}>+ Add {items.length ? "another" : "a"} {list.one}</button> : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
      <div className="sc-acts aw-foot"><button type="button" className="sc-btn" onClick={() => { save(); next(); }}>Next: tell your story</button></div>
    </>
  );
}

/* ---------------- 2. Essay bank ---------------- */
function EssaysView({ me, run, next }: { me: Me; run: <T>(fn: string, b: Record<string, unknown>) => Promise<T | null>; next: () => void }) {
  const [openKind, setOpenKind] = useState<Kind | null>(null);
  const byKind = (k: Kind) => me.essays.find((e) => e.kind === k);
  if (openKind) return <Interview kind={openKind} essay={byKind(openKind)} run={run} close={() => setOpenKind(null)} />;
  return (
    <>
      <p className="aw-intro">Scholarships ask the same few questions in different words. Answer each one once, like you&rsquo;re talking to someone who&rsquo;s rooting for you. REACH puts your answers in a strong order as a first draft. Then you make it sound like you.</p>
      <div className="aw-essays">
        {TYPES.map((t) => {
          const e = byKind(t.kind);
          const w = e ? words(e.body) : 0;
          return (
            <article key={t.kind} className={`aw-ecard${w >= 120 ? " ready" : ""}`}>
              <h2>{t.title}</h2><p>{t.line}</p>
              <span className="sc-small">{w >= 120 ? `Draft ready · ${w} words` : e ? `${answered(t.kind, e.answers)} of 5 answered` : "Not started"}</span>
              <button type="button" className="sc-btn sm" onClick={() => setOpenKind(t.kind)}>{e ? "Open" : "Start"}</button>
            </article>
          );
        })}
      </div>
      <p className="sc-small">Start with <b>My story</b>. It answers more prompts than any other essay.</p>
      <div className="sc-acts aw-foot"><button type="button" className="sc-btn" onClick={next}>Next: find my matches</button></div>
    </>
  );
}

function Interview({ kind, essay, run, close }: { kind: Kind; essay?: Essay; run: <T>(fn: string, b: Record<string, unknown>) => Promise<T | null>; close: () => void }) {
  const t = TYPE[kind];
  const [answers, setAnswers] = useState<Record<string, string>>(essay?.answers || {});
  const [body, setBody] = useState(essay?.body || "");
  const [id, setId] = useState(essay?.id || "");
  const [msg, setMsg] = useState("");
  const n = answered(kind, answers);

  async function save(b = body) {
    const r = await run<{ id: string }>("eff_raw_essay_save", { p: { id: id || undefined, kind, title: t.title, answers, body: b } });
    if (r?.id) { setId(r.id); setMsg("Saved to your essay bank."); setTimeout(() => setMsg(""), 2500); }
  }
  function build() {
    if (body.trim() && body !== draft(kind, essay?.answers || {}) && !confirm("Build a new draft from your answers? This replaces the edits you made to the draft below.")) return;
    const d = draft(kind, answers); setBody(d); save(d);
  }
  return (
    <>
      <button type="button" className="aw-link" onClick={() => { if (n || body) save(); close(); }}>← Essay bank</button>
      <h2 className="aw-h2">{t.title}</h2>
      <p className="aw-intro">{t.line} Write the way you&rsquo;d say it. Full sentences, real details, your real voice. Two or three sentences each is plenty.</p>
      {t.qs.map((q, i) => (
        <label key={q.key} className="aw-q"><span><b>{i + 1}</b>{q.ask}</span>
          <textarea rows={4} value={answers[q.key] || ""} onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })} onBlur={() => (n ? save() : undefined)} placeholder={q.hint} />
        </label>
      ))}
      <div className="sc-acts"><button type="button" className="sc-btn coral" disabled={n < 3} onClick={build}>{n < 3 ? `Answer at least 3 to build a draft (${n}/5)` : "Build my draft"}</button></div>
      {body ? (
        <section className="aw-draft">
          <div className="aw-drafthead"><h3>Your draft</h3><span className="sc-small">{words(body)} words</span></div>
          <p className="sc-small">This is your words, put in order. Read it out loud. Fix anything that doesn&rsquo;t sound like you, add a detail only you would know, and make the first sentence pull someone in.</p>
          <textarea rows={16} value={body} onChange={(e) => setBody(e.target.value)} onBlur={() => save()} />
          <div className="sc-acts"><button type="button" className="sc-btn" onClick={() => save()}>Save</button><Copy text={body} label="Copy essay" />{msg ? <span className="aw-ok">{msg}</span> : null}</div>
        </section>
      ) : null}
    </>
  );
}

/* ---------------- 3. Matches ---------------- */
function MatchesView({ me, run, openKit }: { me: Me; run: <T>(fn: string, b: Record<string, unknown>) => Promise<T | null>; openKit: (id: string) => void }) {
  const [res, setRes] = useState<Match[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [own, setOwn] = useState({ title: "", url: "", deadline: "" });
  const mine = useMemo(() => new Set(me.apps.map((a) => a.slug).filter(Boolean)), [me.apps]);
  const mp = matchProfile(me.profile);

  async function find() {
    if (!mp.level) { setErr("Add where you are in school (Your profile → School) so REACH can match you."); return; }
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/scholarships/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mp) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Try again in a minute.");
      setRes(j.matches);
    } catch (e) { setErr(e instanceof Error ? e.message : "Try again in a minute."); }
    setBusy(false);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (mp.level) find(); }, []);

  async function add(slug: string) {
    const r = await run<{ id: string }>("eff_raw_app_save", { p: { slug } });
    if (r?.id) openKit(r.id);
  }
  async function addOwn(e: React.FormEvent) {
    e.preventDefault();
    const r = await run<{ id: string }>("eff_raw_app_save", { p: own });
    if (r?.id) { setOwn({ title: "", url: "", deadline: "" }); openKit(r.id); }
  }
  return (
    <>
      <p className="aw-intro">Sorted from your profile: where you are in school, your state, major, GPA and who you are. Tap <b>Apply With Me</b> and REACH builds that scholarship&rsquo;s kit.</p>
      {err ? <p className="aw-err">{err}</p> : null}
      {busy ? <p className="sc-small">Sorting every open scholarship for you…</p> : null}
      {res ? (
        res.length ? (
          <div className="aw-matches">
            {res.slice(0, 40).map((m) => (
              <article key={m.item.slug} className="aw-mcard">
                <span className={`aw-conf ${m.confidence}`}>{m.confidence === "strong" ? "Strong match" : m.confidence === "possible" ? "Possible match" : "Worth a look"}</span>
                <h3><a href={`/scholarships/${m.item.slug}`} target="_blank" rel="noreferrer">{m.item.title}</a></h3>
                <p className="sc-small">{[m.item.sponsor, m.item.amount].filter(Boolean).join(" · ")}</p>
                <p className={urgent(m.item) ? "aw-hot" : "sc-small"}>{dueLabel(m.item)}</p>
                <ul className="aw-why">{m.reasons.slice(0, 2).map((r) => <li key={r}>{r}</li>)}{m.cautions.slice(0, 1).map((c) => <li key={c} className="c">{c}</li>)}</ul>
                {mine.has(m.item.slug) ? <button type="button" className="sc-btn ghost sm" onClick={() => openKit(me.apps.find((a) => a.slug === m.item.slug)!.id)}>Open my kit</button>
                  : <button type="button" className="sc-btn sm" onClick={() => add(m.item.slug)}>Apply With Me</button>}
              </article>
            ))}
          </div>
        ) : <p className="sc-box">Nothing fits your profile closely right now. <Link href="/scholarships">Browse all scholarships</Link>; new ones arrive every morning.</p>
      ) : null}
      <form className="sc-box aw-own" onSubmit={addOwn}>
        <h2>Found one somewhere else?</h2>
        <p className="sc-small">Your school, your church, your job, a flyer. Add it and get the same kit.</p>
        <div className="aw-grid">
          <label className="sc-field grow"><span>Scholarship name</span><input required value={own.title} onChange={(e) => setOwn({ ...own, title: e.target.value })} /></label>
          <label className="sc-field grow"><span>Link to apply (https://)</span><input type="url" value={own.url} onChange={(e) => setOwn({ ...own, url: e.target.value })} /></label>
          <label className="sc-field"><span>Deadline</span><input type="date" value={own.deadline} onChange={(e) => setOwn({ ...own, deadline: e.target.value })} /></label>
        </div>
        <div className="sc-acts"><button className="sc-btn ghost sm">Add it</button></div>
      </form>
    </>
  );
}

/* ---------------- 4–5. The kit ---------------- */
const FILES = [
  ["transcript", "Transcript (unofficial is often fine; check)"], ["resume", "Resume"], ["letters", "Letters of recommendation (ask 2 weeks ahead)"],
  ["photo", "A clear photo of you"], ["aid", "Financial aid award letter or FAFSA Submission Summary"], ["id", "Proof of enrollment"],
];
function KitView({ me, run, id, pick, back, tracker }: { me: Me; run: <T>(fn: string, b: Record<string, unknown>) => Promise<T | null>; id: string | null; pick: (id: string) => void; back: () => void; tracker: () => void }) {
  const app = me.apps.find((a) => a.id === id);
  const open = me.apps.filter((a) => ["saved", "working"].includes(a.status));
  const [prompt, setPrompt] = useState(app?.prompt || "");
  const [limit, setLimit] = useState(app?.word_limit ? String(app.word_limit) : "");
  const [essayId, setEssayId] = useState(app?.essay_id || "");
  const [why, setWhy] = useState(app?.why_line || "");
  const [body, setBody] = useState(app?.essay_body || "");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(`reach-aw-files:${id}`) || "{}"); } catch { return {}; }
  });
  const filesKey = `reach-aw-files:${id}`;


  if (!app) return (
    <>
      <p className="aw-intro">Pick a scholarship from your list, or find one in Matches.</p>
      {open.length ? <ul className="aw-list">{open.map((a) => <li key={a.id}><button type="button" className="aw-link" onClick={() => pick(a.id)}>{a.title}</button><span className="sc-small">{dueLabel({ deadline: a.deadline, deadline_kind: (a.deadline_kind as "date") || "varies" })}</span></li>)}</ul>
        : <button type="button" className="sc-btn" onClick={back}>Find my matches</button>}
    </>
  );

  const essays = me.essays.filter((e) => words(e.body) >= 40);
  const suggested = prompt.trim() ? suggestKind(prompt) : null;
  const chosen = me.essays.find((e) => e.id === essayId) || (suggested ? me.essays.find((e) => e.kind === suggested) : undefined);
  const lim = Number(limit) || 0;
  const w = words(body);
  const save = (p: Record<string, unknown>) => run("eff_raw_app_save", { p: { id: app.id, ...p } });

  const cur = app;
  function tailor() {
    if (!chosen) return;
    const ranks = chosen.kind !== "custom" ? draftParas(chosen.kind as Kind, chosen.answers).map((x) => x.rank) : undefined;
    const paras = chosen.body.split(/\n\s*\n/);
    const usesDraftShape = ranks && ranks.length === paras.length;
    let text = chosen.body.trim();
    let r = usesDraftShape ? ranks : undefined;
    if (why.trim()) { text += `\n\n${why.trim()}`; r = r ? [...r, 1] : undefined; }
    const out = lim ? fit(text, lim, r) : { text, cut: 0 };
    setBody(out.text);
    setNote(out.cut ? `Trimmed ${out.cut} words to fit ${lim}. Read it through: make sure it still flows and answers their question.` : "Ready. Read it through and make sure it answers their exact question.");
    save({ prompt, word_limit: limit, essay_id: chosen.id, why_line: why, essay_body: out.text, status: cur.status === "saved" ? "working" : cur.status });
  }

  const answers = kitRows(me.profile, me.email);
  return (
    <>
      <button type="button" className="aw-link" onClick={back}>← Matches</button>
      <section className="aw-kithead">
        <div>
          <h2>{app.title}</h2>
          <p className="sc-small">{[app.sponsor, app.amount].filter(Boolean).join(" · ")}</p>
          <p className={urgent({ deadline: app.deadline }) ? "aw-hot" : "sc-small"}>{dueLabel({ deadline: app.deadline, deadline_kind: (app.deadline_kind as "date") || "varies" })}</p>
          {app.listing_live === false ? <p className="aw-err">This listing was taken down from REACH. Check the provider&rsquo;s page before you spend time on it.</p> : null}
        </div>
        {app.url ? <a className="sc-btn coral" href={app.url} target="_blank" rel="noreferrer">Open the application ↗</a> : null}
      </section>

      <ol className="aw-kit">
        <li>
          <h3>Their essay question</h3>
          <p className="sc-small">Open the application, copy their question (and the word limit), and paste it here.</p>
          <label className="sc-field grow"><span>The question</span>
            <textarea rows={3} value={prompt} onChange={(e) => { setPrompt(e.target.value); const l = wordLimitIn(e.target.value); if (l && !limit) setLimit(String(l)); }} onBlur={() => save({ prompt, word_limit: limit })} placeholder="e.g. In 500 words or less, describe a challenge you've overcome and what it taught you." /></label>
          <div className="aw-grid">
            <label className="sc-field"><span>Word limit</span><input inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} onBlur={() => save({ word_limit: limit })} placeholder="e.g. 500" /></label>
            <label className="sc-field grow"><span>Use this essay{suggested ? ` (REACH suggests ${TYPE[suggested].title})` : ""}</span>
              <select value={chosen?.id || ""} onChange={(e) => setEssayId(e.target.value)}>
                <option value="">Choose from your bank</option>
                {essays.map((e) => <option key={e.id} value={e.id}>{e.title || "Essay"} · {words(e.body)} words</option>)}
              </select></label>
          </div>
          {!essays.length ? <p className="aw-err">Your essay bank is empty. Build &ldquo;My story&rdquo; first in step 2.</p> : null}
          <label className="sc-field grow"><span>Why this scholarship? (one or two sentences, optional but powerful)</span>
            <textarea rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder={`e.g. ${app.sponsor || "Your organization"}'s work with first-generation students is why I'm applying: …`} /></label>
          <div className="sc-acts"><button type="button" className="sc-btn" disabled={!chosen} onClick={tailor}>Fit my essay to this question</button></div>
          {body ? (
            <div className="aw-draft">
              <div className="aw-drafthead"><h3>Your essay for {app.title}</h3><span className={lim && w > lim ? "aw-hot" : "sc-small"}>{w}{lim ? ` / ${lim}` : ""} words</span></div>
              {note ? <p className="sc-small">{note}</p> : null}
              <textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} onBlur={() => save({ essay_body: body })} />
              <div className="sc-acts"><Copy text={body} label="Copy essay" /></div>
            </div>
          ) : null}
        </li>
        <li>
          <h3>Every answer, ready to paste</h3>
          <p className="sc-small">Go field by field in their form. Copy here, paste there. Something missing? <b>Add it in your profile</b> once and it&rsquo;s here for every scholarship.</p>
          <div className="aw-answers">
            {answers.map((r) => (
              <div key={r.label} className="aw-ans"><span>{r.label}</span><p>{r.value}</p><Copy text={r.value} /></div>
            ))}
          </div>
          {answers.length < 12 ? <p className="aw-err">Your profile is thin. Finish it in step 1 and this list fills in.</p> : null}
        </li>
        <li>
          <h3>Files they might ask for</h3>
          <p className="sc-small">Check their page for exactly what they want. Tick each one when it&rsquo;s ready.</p>
          <div className="aw-files">{FILES.map(([k, l]) => (
            <label key={k}><input type="checkbox" checked={!!files[k]} onChange={(e) => { const n = { ...files, [k]: e.target.checked }; setFiles(n); try { localStorage.setItem(filesKey, JSON.stringify(n)); } catch { /* private */ } }} />{l}</label>
          ))}</div>
        </li>
        <li>
          <h3>You click submit</h3>
          <p>Read every answer one more time on their page. Make sure every word is true and sounds like you: you&rsquo;re promising them it&rsquo;s yours. Then press submit.</p>
          <div className="sc-acts">
            {app.url ? <a className="sc-btn ghost" href={app.url} target="_blank" rel="noreferrer">Open the application ↗</a> : null}
            <button type="button" className="sc-btn coral" onClick={async () => { await save({ status: "applied" }); tracker(); }}>I submitted it 🎉</button>
            <button type="button" className="aw-link" onClick={async () => { await save({ status: "skipped" }); back(); }}>Skip this one</button>
          </div>
        </li>
      </ol>
    </>
  );
}

/* ---------------- 6. Tracker ---------------- */
function TrackerView({ me, run, openKit, find }: { me: Me; run: <T>(fn: string, b: Record<string, unknown>) => Promise<T | null>; openKit: (id: string) => void; find: () => void }) {
  const list = [...me.apps].filter((a) => a.status !== "skipped").sort((a, b) => {
    const order = ["working", "saved", "applied", "won", "not_selected"];
    return order.indexOf(a.status) - order.indexOf(b.status) || (a.deadline || "9999").localeCompare(b.deadline || "9999");
  });
  const applied = me.apps.filter((a) => ["applied", "won", "not_selected"].includes(a.status));
  const won = me.apps.filter((a) => a.status === "won");
  const wonC = won.reduce((n, a) => n + (a.award_cents || a.amount_cents || 0), 0);
  return (
    <>
      <div className="aw-stats">
        <div><b>{applied.length}</b><span>submitted</span></div>
        <div><b>{money(applied.reduce((n, a) => n + (a.amount_cents || 0), 0)) || "$0"}</b><span>applied for</span></div>
        <div className={wonC ? "win" : ""}><b>{money(wonC) || "$0"}</b><span>won</span></div>
        <div><b>{list.filter((a) => ["saved", "working"].includes(a.status)).length}</b><span>still to do</span></div>
      </div>
      {!list.length ? <p className="sc-box">Nothing on your list yet. <button type="button" className="aw-link" onClick={find}>Find your matches</button></p> : (
        <div className="aw-track">
          {list.map((a) => (
            <div key={a.id} className={`aw-trow s-${a.status}`}>
              <div><b>{a.title}</b><span className="sc-small">{[a.sponsor, a.amount, dueLabel({ deadline: a.deadline, deadline_kind: (a.deadline_kind as "date") || "varies" })].filter(Boolean).join(" · ")}</span></div>
              <select aria-label={`Status of ${a.title}`} value={a.status} onChange={(e) => run("eff_raw_app_save", { p: { id: a.id, status: e.target.value } })}>
                {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {a.status === "won" ? (
                <label className="aw-award">Award $<input inputMode="numeric" defaultValue={a.award_cents ? String(Math.round(a.award_cents / 100)) : ""}
                  onBlur={(e) => run("eff_raw_app_save", { p: { id: a.id, award_cents: e.target.value.replace(/\D/g, "") ? String(Number(e.target.value.replace(/\D/g, "")) * 100) : "" } })} /></label>
              ) : ["saved", "working"].includes(a.status) ? <button type="button" className="sc-btn sm" onClick={() => openKit(a.id)}>Open kit</button> : <span />}
            </div>
          ))}
        </div>
      )}
      {won.length ? <p className="aw-promise">You won. Tell EFF: <a href="mailto:info@estherfundsfoundation.org?subject=I%20won%20a%20scholarship">info@estherfundsfoundation.org</a>. We&rsquo;d love to celebrate you (only if you say yes).</p> : null}
      <p className="sc-small">REACH emails you a week and two days before each deadline on your list, and asks how it went about six weeks after you submit.</p>
    </>
  );
}
