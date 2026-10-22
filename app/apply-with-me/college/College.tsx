"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { call, readPass, startCode, writePass, SignedOut, type Pass } from "../../myreach/pass";
import { SiteTop, SiteFoot } from "../../myreach/ui";
import { SignIn } from "../../account/SignIn";
import { fit, words, wordLimitIn } from "../essays";
import {
  ACTIVITY_TYPES, CHECKS, DEADLINES, DECISIONS, GRADES, HONOR_LEVELS, LIMITS, PLATFORMS, PROMPTS, PS_LIMIT, PS_MIN, PS_QS, WHY_QS,
  counselorEmail, over, teacherEmail, type CProfile, type CRow,
} from "./college";

/* Apply With Me · College. A high school senior builds her college application once with EFF: the
   Common App style profile (activities, honors, recommenders), her personal statement from an interview
   in her own words, her college list from the College Scorecard, and a kit per college with every answer
   and supplement ready to paste. She submits on the college's own portal. Saves to her My REACH account
   (eff_raw_profiles.profile.college, eff_raw_essays, eff_raw_apps with kind 'college'). */

type Essay = { id: string; kind: string; title: string; answers: Record<string, string>; body: string };
type Supp = { q: string; limit: string; body: string };
type Details = {
  unitid?: number; city?: string; state?: string; hbcu?: boolean; platform?: string; deadline_type?: string;
  fee?: string; checks?: Record<string, boolean>; supps?: Supp[]; decision?: string; portal?: string;
};
type App = { id: string; kind?: string; title: string; sponsor: string | null; url: string | null; deadline: string | null; status: string; notes: string | null; details: Details };
type Me = { email: string; account: Record<string, unknown>; profile: Record<string, unknown>; essays: Essay[]; apps: App[] };
type View = "start" | "profile" | "statement" | "list" | "kit" | "tracker";
type Run = <T>(fn: string, b: Record<string, unknown>) => Promise<T | null>;
type Facts = { name: string; city: string; state: string; hbcu: boolean; url: string | null; grad_rate: number | null; net_price: number | null; net_price_url: string | null; pell_share: number | null; chapter: { name: string; slug: string } | null };

const STEPS: Array<{ v: View; n: string; label: string }> = [
  { v: "profile", n: "1", label: "Your profile" }, { v: "statement", n: "2", label: "Personal statement" },
  { v: "list", n: "3", label: "College list" }, { v: "kit", n: "4", label: "College kit" }, { v: "tracker", n: "5", label: "Submit & track" },
];
const PS_TITLE = "Personal statement (college)";
const pct = (n: number | null) => (n == null ? "" : `${Math.round(n <= 1 ? n * 100 : n)}%`);
const dollars = (n: number | null) => (n == null ? "" : `$${Math.round(n).toLocaleString()}`);
const fmtDay = (d: string | null) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "No date yet");
const daysTo = (d: string | null) => (d ? Math.round((new Date(`${d}T12:00:00`).getTime() - Date.now()) / 86400000) : null);
const httpsOf = (u: string | null) => (!u ? null : u.startsWith("http") ? u.replace(/^http:/, "https:") : `https://${u}`);
const cleanS = (s: string) => { let t = (s || "").replace(/\s+/g, " ").trim(); if (!t) return ""; t = t[0].toUpperCase() + t.slice(1); return /[.!?"”’)]$/.test(t) ? t : `${t}.`; };
const onlyCollege = (m: Me): Me => ({ ...m, apps: (m.apps || []).filter((a) => a.kind === "college") });

function Copy({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function go() {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    setDone(true); setTimeout(() => setDone(false), 1600);
  }
  return <button type="button" className={`aw-copy${done ? " done" : ""}`} onClick={go} aria-live="polite">{done ? "Copied ✓" : label}</button>;
}

export default function College() {
  const [pass, setPass] = useState<Pass | null>(null);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [view, setView] = useState<View>("start");
  const [kitId, setKitId] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async (p: Pass | null) => {
    if (!p) { setMe(null); return; }
    try { setMe(onlyCollege(await call<Me>("eff_raw_me", { p_token: p.token }))); }
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

  const run: Run = useCallback(async <T,>(fn: string, body: Record<string, unknown>): Promise<T | null> => {
    if (!pass) return null;
    setErr("");
    try { const r = await call<T & Me>(fn, { p_token: pass.token, ...body }); if (r && (r as Me).apps) setMe(onlyCollege(r as Me)); return r; }
    catch (e) { if (!(e instanceof SignedOut)) setErr(e instanceof Error ? e.message : "That didn't save."); return null; }
  }, [pass]) as Run;

  function go(v: View, id?: string) {
    setView(v); if (id !== undefined) setKitId(id);
    const k = id ?? kitId;
    history.replaceState(null, "", v === "kit" && k ? `${location.pathname}?kit=${k}` : v === "tracker" ? `${location.pathname}#tracker` : location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) return <main className="sc aw"><SiteTop on="/scholarships" /><div className="sc-wrap aw-pad" /></main>;
  if (!pass) return (
    <main className="sc aw awc">
      <SiteTop on="/scholarships" />
      <Landing />
      <div className="sc-wrap" id="start">
        <SignIn onIn={() => { const p = readPass(); setPass(p); load(p); setView("profile"); }} startCode={startCode}
          title={<>Let&rsquo;s get you <em>in.</em></>} />
      </div>
      <SiteFoot />
    </main>
  );

  const cp = ((me?.profile?.college as CProfile) || {}) as CProfile;
  const ps = me?.essays.find((e) => e.title === PS_TITLE);
  const apps = me?.apps || [];
  const sent = apps.filter((a) => ["applied", "won", "not_selected"].includes(a.status));
  const doneP = Boolean(cp.hs && cp.grad_year && cp.gpa && (cp.activities || []).some((a) => a.org));
  const done: Record<View, boolean> = { start: true, profile: doneP, statement: words(ps?.body || "") >= PS_MIN, list: apps.length > 0, kit: apps.some((a) => Object.values(a.details?.checks || {}).some(Boolean)), tracker: sent.length > 0 };
  const name = String((me?.profile?.preferred_name as string) || (me?.profile?.first_name as string) || (me?.account?.first_name as string) || "");

  return (
    <main className="sc aw awc">
      <SiteTop on="/scholarships" />
      <header className="aw-head">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />Apply With Me · College</span>
          <h1>{view === "start" ? <>{name ? `${name}, let's` : "Let's"} get you <em>into college.</em></> : STEPS.find((s) => s.v === view)?.label}</h1>
          <nav className="aw-steps" aria-label="College application steps">
            {STEPS.map((s) => (
              <button key={s.v} type="button" className={`${view === s.v ? "on " : ""}${done[s.v] ? "ok" : ""}`} aria-current={view === s.v ? "step" : undefined}
                onClick={() => go(s.v, s.v === "kit" ? (kitId || apps.find((a) => ["saved", "working"].includes(a.status))?.id || undefined) : undefined)}>
                <b>{done[s.v] ? "✓" : s.n}</b><span>{s.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <div className="sc-wrap aw-pad">
        {err ? <p className="aw-err" role="alert">{err}</p> : null}
        {!me ? <p className="sc-small">Loading your application…</p>
          : view === "start" ? <Home me={me} cp={cp} ps={ps} go={go} />
          : view === "profile" ? <ProfileView me={me} run={run} next={() => go("statement")} />
          : view === "statement" ? <Statement ps={ps} run={run} next={() => go("list")} />
          : view === "list" ? <ListView me={me} run={run} openKit={(id) => go("kit", id)} />
          : view === "kit" ? <KitView key={kitId || "none"} me={me} cp={cp} ps={ps} run={run} id={kitId} pick={(id) => go("kit", id)} back={() => go("list")} tracker={() => go("tracker")} />
          : <TrackerView me={me} run={run} openKit={(id) => go("kit", id)} find={() => go("list")} />}
        <p className="sc-small aw-out">
          Signed in as {pass.email}. Applying for scholarships too? <Link href="/apply-with-me">Scholarship Apply With Me</Link> uses the same account.{" "}
          <button type="button" className="aw-link" onClick={() => { call("eff_reach_sign_out", { p_token: pass.token }).catch(() => {}); writePass(null); setPass(null); setMe(null); }}>Sign out</button>
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
          <span className="sc-kick"><span className="dot" aria-hidden="true" />Apply With Me · College · free · for high school students</span>
          <h1>Let us apply for <em>college</em> with you.</h1>
          <p className="aw-lede">First in your family? Nobody at home who&rsquo;s done this? EFF walks you through every college application: your activities, your personal statement, your college list and every supplement. <b>You read it through and click submit.</b></p>
          <div className="sc-acts"><a className="sc-btn coral" href="#start">Start my college application</a><Link className="sc-btn ghost" href="/apply-with-me">Scholarships instead</Link></div>
        </div>
      </section>
      <section className="sc-wrap aw-how">
        {[
          ["1", "Your profile, once", "High school, GPA, classes, up to 10 activities and 5 honors, written to the Common App's exact character limits."],
          ["2", "Your personal statement", "Pick a Common App prompt, answer five questions out loud in your own words, and REACH builds your first draft under 650 words."],
          ["3", "Your college list", "Search every college. See graduation rates, what students really pay, and HBCUs, from the U.S. Education Department's data."],
          ["4", "A kit for each college", "Deadline type, platform, fee waiver, supplements fitted to their word limit, and emails to your counselor and teachers, written for you."],
          ["5", "You click submit", "On the college's own portal. Every application asks you to promise it's your work, so it always is."],
          ["6", "Track every decision", "Reminders a week and two days before each deadline, then admitted, waitlisted or deferred, all in one place."],
        ].map(([n, h, p]) => <article key={n} className="aw-howcard"><b>{n}</b><h2>{h}</h2><p>{p}</p></article>)}
      </section>
      <section className="sc-wrap"><p className="aw-promise">Free, always. EFF never submits an application for you, never asks for your Social Security number or passwords, and never charges you. If application fees are hard for your family, ask your counselor about fee waivers: many students qualify.</p></section>
    </>
  );
}

/* ---------------- Home ---------------- */
function Home({ me, cp, ps, go }: { me: Me; cp: CProfile; ps?: Essay; go: (v: View, id?: string) => void }) {
  const open = me.apps.filter((a) => ["saved", "working"].includes(a.status)).sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const admitted = me.apps.filter((a) => a.status === "won").length;
  const sent = me.apps.filter((a) => ["applied", "won", "not_selected"].includes(a.status)).length;
  const psw = words(ps?.body || "");
  const step = !(cp.hs && cp.gpa && (cp.activities || []).some((a) => a.org)) ? { v: "profile" as View, t: "Build your college profile", p: "Your high school, GPA, classes and activities. About 20 minutes, and every college uses it." }
    : psw < PS_MIN ? { v: "statement" as View, t: "Write your personal statement", p: "Pick a prompt, answer five questions in your own words, and get your first draft." }
    : !me.apps.length ? { v: "list" as View, t: "Build your college list", p: "Find colleges that fit: a few reaches, a few targets, a few you're sure of." }
    : open.length ? { v: "kit" as View, t: `Finish ${open[0].title}`, p: `${fmtDay(open[0].deadline)}. Your kit is ready.`, id: open[0].id }
    : { v: "tracker" as View, t: "Track your decisions", p: "Update each college when you hear back." };
  return (
    <>
      <section className="aw-next">
        <span>Your next step</span><h2>{step.t}</h2><p>{step.p}</p>
        <button type="button" className="sc-btn coral" onClick={() => go(step.v, (step as { id?: string }).id)}>Let&rsquo;s go</button>
      </section>
      <div className="aw-stats">
        <div><b>{(cp.activities || []).filter((a) => a.org).length}/10</b><span>activities</span></div>
        <div><b>{psw}</b><span>statement words</span></div>
        <div><b>{me.apps.length}</b><span>colleges</span></div>
        <div><b>{sent}</b><span>submitted</span></div>
        {admitted ? <div className="win"><b>{admitted}</b><span>admitted</span></div> : null}
      </div>
      {open.length ? (
        <section className="sc-box"><h2>Coming up</h2>
          <ul className="aw-list">{open.slice(0, 8).map((a) => {
            const d = daysTo(a.deadline);
            return <li key={a.id}><button type="button" className="aw-link" onClick={() => go("kit", a.id)}>{a.title}</button>
              <span className={d !== null && d <= 14 ? "aw-hot" : "sc-small"}>{DEADLINES.find((x) => x.v === a.details?.deadline_type)?.l || "Deadline"} · {fmtDay(a.deadline)}</span></li>;
          })}</ul>
        </section>
      ) : null}
      <section className="sc-box awc-fafsa">
        <h2>Don&rsquo;t forget the money</h2>
        <p>Admission is half of it. File the <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noreferrer">FAFSA</a> (it&rsquo;s free; never pay anyone to file it) and list every college on your list. Some colleges also ask for the <a href="https://cssprofile.collegeboard.org/" target="_blank" rel="noreferrer">CSS Profile</a>, which has fee waivers too. Then use <Link href="/apply-with-me">scholarship Apply With Me</Link> with the same account.</p>
      </section>
    </>
  );
}

/* ---------------- 1. Profile ---------------- */
function useCollegeSave(me: Me, run: Run) {
  const [cp, setCp] = useState<CProfile>(() => {
    const base = { ...((me.profile.college as CProfile) || {}) };
    const p = me.profile as Record<string, unknown>;
    if (!base.hs && typeof p.high_school === "string") base.hs = p.high_school;
    if (!base.gpa && typeof p.gpa === "string") base.gpa = p.gpa;
    if (!base.gpa_scale && typeof p.gpa_scale === "string") base.gpa_scale = p.gpa_scale;
    if (!base.grad_year && typeof p.hs_grad_year === "string") base.grad_year = p.hs_grad_year;
    if (!base.major && typeof p.major === "string") base.major = p.major;
    if (!base.first_gen && typeof p.first_gen === "string") base.first_gen = p.first_gen;
    if (!base.activities && Array.isArray(p.activities)) base.activities = (p.activities as CRow[]).slice(0, 10).map((a) => ({ org: a.name || "", position: a.role || "", describe: a.what || "", hours: a.hours || "" }));
    if (!base.honors && Array.isArray(p.awards)) base.honors = (p.awards as CRow[]).slice(0, 5).map((a) => ({ title: a.name || "" }));
    return base;
  });
  const [state, setState] = useState<"saved" | "saving" | "edited">("saved");
  const latest = useRef(cp);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const save = useCallback(async () => {
    setState("saving");
    const r = await run("eff_raw_profile_save", { p: { ...me.profile, college: latest.current } });
    setState(r ? "saved" : "edited");
  }, [run, me.profile]);
  function set(patch: Partial<CProfile>) {
    setCp((cur) => { const n = { ...cur, ...patch }; latest.current = n; return n; });
    setState("edited");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 1200);
  }
  useEffect(() => () => { if (timer.current) { clearTimeout(timer.current); save(); } }, [save]);
  return { cp, set, state, save };
}

function F({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`sc-field${wide ? " grow aw-wide" : ""}`}><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}
function Count({ s, n }: { s?: string; n: number }) {
  return <small className={over(s, n) ? "aw-hot" : ""}>{(s || "").length}/{n} characters</small>;
}

function ProfileView({ me, run, next }: { me: Me; run: Run; next: () => void }) {
  const { cp, set, state, save } = useCollegeSave(me, run);
  const [open, setOpen] = useState("school");
  const txt = (k: keyof CProfile, props: { type?: string; placeholder?: string } = {}) =>
    <input type={props.type || "text"} placeholder={props.placeholder} value={(cp[k] as string) || ""} onChange={(e) => set({ [k]: e.target.value } as Partial<CProfile>)} />;
  const yn = (k: keyof CProfile) => (
    <div className="sc-pills">{[["yes", "Yes"], ["no", "No"]].map(([v, l]) => <button key={v} type="button" className={`sc-pill${cp[k] === v ? " on" : ""}`} aria-pressed={cp[k] === v} onClick={() => set({ [k]: cp[k] === v ? "" : v } as Partial<CProfile>)}>{l}</button>)}</div>
  );
  const acts = cp.activities || [];
  const honors = cp.honors || [];
  const teachers = cp.teachers || [];
  const setRow = (key: "activities" | "honors" | "teachers", list: CRow[], i: number, patch: CRow) => set({ [key]: list.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const sec = (key: string, title: string, line: string, count: string, body: React.ReactNode) => (
    <section className={`aw-sec${open === key ? " open" : ""}`}>
      <button type="button" className="aw-sechead" aria-expanded={open === key} onClick={() => setOpen(open === key ? "" : key)}>
        <span><b>{title}</b><small>{line}</small></span><i>{count}</i>
      </button>
      {open === key ? <div className="aw-secbody">{body}</div> : null}
    </section>
  );
  return (
    <>
      <p className="aw-intro">Colleges ask for the same things. Fill them in once, here, in the Common App&rsquo;s exact limits, and copy them into every application. It saves as you type. Your name, address and phone come from <Link href="/apply-with-me">your Apply With Me profile</Link>.</p>
      <p className="sc-small aw-save">{state === "saving" ? "Saving…" : state === "edited" ? "Not saved yet" : "Saved"}</p>
      {sec("school", "High school & grades", "Ask your counselor for anything you don't know.", cp.hs ? "Started" : "0", (
        <div className="aw-grid">
          <F label="High school" wide>{txt("hs")}</F>
          <F label="City">{txt("hs_city")}</F><F label="State">{txt("hs_state", { placeholder: "GA" })}</F>
          <F label="School code (CEEB, optional)" hint="Your counselor or the Common App can find it.">{txt("ceeb")}</F>
          <F label="Graduation year">{txt("grad_year", { placeholder: "2027" })}</F>
          <F label="GPA (unweighted)">{txt("gpa", { placeholder: "3.4" })}</F>
          <F label="GPA scale">{txt("gpa_scale", { placeholder: "4.0" })}</F>
          <F label="Weighted GPA (if your school has one)">{txt("gpa_weighted")}</F>
          <F label="Class rank (only if your school reports it)">{txt("rank")}</F>
          <F label="Senior-year classes" wide hint="One per line, e.g. AP English Literature."><textarea rows={4} value={cp.senior_courses || ""} onChange={(e) => set({ senior_courses: e.target.value })} /></F>
          <F label="SAT / ACT (optional)" wide hint="Many colleges are test-optional. Check each college's page; send scores only where they help.">{txt("tests")}</F>
          <F label="AP / IB / dual enrollment (optional)" wide>{txt("ap")}</F>
          <F label="Intended major">{txt("major")}</F><F label="Second choice major">{txt("major2")}</F>
          <F label="First in your family to go to college?">{yn("first_gen")}</F>
          <F label="Do you get free or reduced lunch, or think you qualify for fee waivers?" hint="If yes, ask your counselor about application fee waivers.">{yn("waiver")}</F>
        </div>
      ))}
      {sec("acts", "Activities", "Up to 10. Order them by what matters most to you. Family responsibilities and jobs count.", `${acts.filter((a) => a.org).length}/10`, (
        <>
          {acts.map((a, i) => (
            <div key={i} className="aw-item">
              <div className="aw-grid">
                <F label={`${i + 1}. Activity type`}><select value={a.type || ""} onChange={(e) => setRow("activities", acts, i, { type: e.target.value })}><option value="">Choose</option>{ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></F>
                <F label="Position or leadership"><input value={a.position || ""} onChange={(e) => setRow("activities", acts, i, { position: e.target.value })} /><Count s={a.position} n={LIMITS.position} /></F>
                <F label="Organization name" wide><input value={a.org || ""} onChange={(e) => setRow("activities", acts, i, { org: e.target.value })} /><Count s={a.org} n={LIMITS.org} /></F>
                <F label="What you did, and what came of it" wide hint="Start with strong verbs. Numbers help: people, hours, money, members."><textarea rows={2} value={a.describe || ""} onChange={(e) => setRow("activities", acts, i, { describe: e.target.value })} /><Count s={a.describe} n={LIMITS.describe} /></F>
                <F label="Grades"><input value={a.grades || ""} placeholder="10, 11, 12" onChange={(e) => setRow("activities", acts, i, { grades: e.target.value })} /></F>
                <F label="Hours per week"><input inputMode="numeric" value={a.hours || ""} onChange={(e) => setRow("activities", acts, i, { hours: e.target.value })} /></F>
                <F label="Weeks per year"><input inputMode="numeric" value={a.weeks || ""} onChange={(e) => setRow("activities", acts, i, { weeks: e.target.value })} /></F>
              </div>
              <button type="button" className="aw-link" onClick={() => set({ activities: acts.filter((_, j) => j !== i) })}>Take this activity out</button>
            </div>
          ))}
          {acts.length < 10 ? <button type="button" className="sc-btn ghost sm" onClick={() => set({ activities: [...acts, {}] })}>+ Add {acts.length ? "another" : "an"} activity</button> : null}
          <p className="sc-small">Grades go in as {GRADES.join(", ")}.</p>
        </>
      ))}
      {sec("honors", "Honors", "Up to 5. Honor roll, awards, competitions, certificates.", `${honors.filter((h) => h.title).length}/5`, (
        <>
          {honors.map((h, i) => (
            <div key={i} className="aw-item"><div className="aw-grid">
              <F label={`${i + 1}. Honor`} wide><input value={h.title || ""} onChange={(e) => setRow("honors", honors, i, { title: e.target.value })} /><Count s={h.title} n={LIMITS.honor} /></F>
              <F label="Grade"><input value={h.grades || ""} onChange={(e) => setRow("honors", honors, i, { grades: e.target.value })} /></F>
              <F label="Level"><select value={h.level || ""} onChange={(e) => setRow("honors", honors, i, { level: e.target.value })}><option value="">Choose</option>{HONOR_LEVELS.map((l) => <option key={l}>{l}</option>)}</select></F>
            </div><button type="button" className="aw-link" onClick={() => set({ honors: honors.filter((_, j) => j !== i) })}>Take this honor out</button></div>
          ))}
          {honors.length < 5 ? <button type="button" className="sc-btn ghost sm" onClick={() => set({ honors: [...honors, {}] })}>+ Add {honors.length ? "another" : "an"} honor</button> : null}
        </>
      ))}
      {sec("people", "Counselor & recommenders", "Ask early: at least three weeks before your first deadline.", `${teachers.filter((t) => t.name).length} teachers`, (
        <>
          <div className="aw-grid">
            <F label="School counselor">{txt("counselor")}</F><F label="Counselor's email">{txt("counselor_email", { type: "email" })}</F>
            <F label="Parent or guardian (optional)">{txt("parent")}</F><F label="Their email (optional)">{txt("parent_email", { type: "email" })}</F>
          </div>
          <p className="sc-small">Most colleges want one or two teachers from junior or senior year, in core subjects.</p>
          {teachers.map((t, i) => (
            <div key={i} className="aw-item"><div className="aw-grid">
              <F label="Teacher"><input value={t.name || ""} onChange={(e) => setRow("teachers", teachers, i, { name: e.target.value })} /></F>
              <F label="Subject"><input value={t.subject || ""} onChange={(e) => setRow("teachers", teachers, i, { subject: e.target.value })} /></F>
              <F label="Email"><input type="email" value={t.email || ""} onChange={(e) => setRow("teachers", teachers, i, { email: e.target.value })} /></F>
              <F label="A moment from their class you remember (optional)" wide><input value={t.why || ""} placeholder="the debate unit, when you stayed after school to help me…" onChange={(e) => setRow("teachers", teachers, i, { why: e.target.value })} /></F>
              <F label="They said yes?"><select value={t.asked || ""} onChange={(e) => setRow("teachers", teachers, i, { asked: e.target.value })}><option value="">Not asked yet</option><option value="asked">Asked, waiting</option><option value="yes">Yes!</option></select></F>
            </div><button type="button" className="aw-link" onClick={() => set({ teachers: teachers.filter((_, j) => j !== i) })}>Take this teacher out</button></div>
          ))}
          {teachers.length < 4 ? <button type="button" className="sc-btn ghost sm" onClick={() => set({ teachers: [...teachers, {}] })}>+ Add a teacher</button> : null}
        </>
      ))}
      <div className="sc-acts aw-foot"><button type="button" className="sc-btn" onClick={() => { save(); next(); }}>Next: personal statement</button></div>
    </>
  );
}

/* ---------------- 2. Personal statement ---------------- */
function buildFrom(qs: typeof PS_QS, answers: Record<string, string>) {
  const paras = qs.map((q) => ({ t: cleanS(answers[q.key] || ""), r: q.rank })).filter((p) => p.t);
  return { text: paras.map((p) => p.t).join("\n\n"), ranks: paras.map((p) => p.r) };
}

function Statement({ ps, run, next }: { ps?: Essay; run: Run; next: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>(ps?.answers || {});
  const [body, setBody] = useState(ps?.body || "");
  const [id, setId] = useState(ps?.id || "");
  const [msg, setMsg] = useState("");
  const prompt = Number(answers.prompt || "0");
  const n = PS_QS.filter((q) => (answers[q.key] || "").trim().length >= 15).length;
  const w = words(body);

  async function save(b = body, a = answers) {
    const r = await run<{ id: string }>("eff_raw_essay_save", { p: { id: id || undefined, kind: "custom", title: PS_TITLE, answers: a, body: b } });
    if (r?.id) { setId(r.id); setMsg("Saved."); setTimeout(() => setMsg(""), 2000); }
  }
  function build() {
    if (body.trim() && !confirm("Build a new draft from your answers? This replaces the edits you made below.")) return;
    const d = buildFrom(PS_QS, answers);
    const out = fit(d.text, PS_LIMIT, d.ranks);
    setBody(out.text); save(out.text);
    setMsg(out.cut ? `Trimmed ${out.cut} words to fit 650.` : "");
  }
  return (
    <>
      <p className="aw-intro">The personal statement is the one essay every Common App college reads. It isn&rsquo;t a list of what you did: it&rsquo;s one story that shows who you are. Up to {PS_LIMIT} words. Pick the prompt that fits your story (they all work), then talk it out below.</p>
      <div className="awc-prompts">
        {PROMPTS.map((p, i) => (
          <button key={i} type="button" className={`awc-prompt${prompt === i + 1 ? " on" : ""}`} aria-pressed={prompt === i + 1}
            onClick={() => { const a = { ...answers, prompt: String(i + 1) }; setAnswers(a); save(body, a); }}><b>{i + 1}</b>{p}</button>
        ))}
      </div>
      <p className="sc-small">These are the Common App prompts. Confirm this year&rsquo;s list on <a href="https://www.commonapp.org/" target="_blank" rel="noreferrer">commonapp.org</a> before you submit.</p>
      {PS_QS.map((q, i) => (
        <label key={q.key} className="aw-q"><span><b>{i + 1}</b>{q.ask}</span>
          <textarea rows={4} value={answers[q.key] || ""} onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })} onBlur={() => (n ? save() : undefined)} placeholder={q.hint} />
        </label>
      ))}
      <div className="sc-acts"><button type="button" className="sc-btn coral" disabled={n < 3} onClick={build}>{n < 3 ? `Answer at least 3 to build a draft (${n}/5)` : "Build my draft"}</button></div>
      {body ? (
        <section className="aw-draft">
          <div className="aw-drafthead"><h3>Your personal statement</h3><span className={w > PS_LIMIT || w < PS_MIN ? "aw-hot" : "sc-small"}>{w} / {PS_LIMIT} words{w < PS_MIN ? ` (at least ${PS_MIN})` : ""}</span></div>
          <p className="sc-small">These are your words, in order. Read it out loud. Add the details only you would know, cut anything that sounds like everyone else, and ask a teacher or counselor to read it once. {msg}</p>
          <textarea rows={18} value={body} onChange={(e) => setBody(e.target.value)} onBlur={() => save()} />
          <div className="sc-acts"><button type="button" className="sc-btn" onClick={() => save()}>Save</button><Copy text={body} label="Copy statement" /></div>
        </section>
      ) : null}
      <div className="sc-acts aw-foot"><button type="button" className="sc-btn" onClick={next}>Next: my college list</button></div>
    </>
  );
}

/* ---------------- 3. College list ---------------- */
function ListView({ me, run, openKit }: { me: Me; run: Run; openKit: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [res, setRes] = useState<Array<{ unitid: number; name: string; city: string; state: string; hbcu: boolean }>>([]);
  const [facts, setFacts] = useState<Record<number, Facts>>({});
  const [own, setOwn] = useState({ title: "", url: "" });
  const mine = new Map(me.apps.map((a) => [a.details?.unitid, a.id]));

  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); return; }
    const t = setTimeout(async () => {
      try { setRes(await call("eff_college_search", { p_q: q, p_state: state || null })); } catch { setRes([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, state]);

  async function peek(unitid: number) {
    if (facts[unitid]) return;
    try { const f = await call<Facts>("eff_college_profile", { p_unitid: unitid }); setFacts((x) => ({ ...x, [unitid]: f })); } catch { /* fine */ }
  }
  async function add(c: { unitid: number; name: string; city: string; state: string; hbcu: boolean }) {
    let f = facts[c.unitid];
    if (!f) { try { f = await call<Facts>("eff_college_profile", { p_unitid: c.unitid }); } catch { /* fine */ } }
    const r = await run<{ id: string }>("eff_raw_app_save", { p: { kind: "college", title: c.name, sponsor: `${c.city}, ${c.state}`, url: httpsOf(f?.url || null) || "",
      details: { unitid: c.unitid, city: c.city, state: c.state, hbcu: c.hbcu, platform: c.hbcu ? "" : "common", checks: {}, supps: [] } } });
    if (r?.id) openKit(r.id);
  }
  async function addOwn(e: React.FormEvent) {
    e.preventDefault();
    const r = await run<{ id: string }>("eff_raw_app_save", { p: { kind: "college", title: own.title, url: own.url, details: { checks: {}, supps: [] } } });
    if (r?.id) { setOwn({ title: "", url: "" }); openKit(r.id); }
  }
  return (
    <>
      <p className="aw-intro">A good list has a few <b>reaches</b> (a stretch), a few <b>targets</b> (you fit their usual students) and at least two <b>likelies</b> you&rsquo;d be happy at and could afford. Search any college to see how its students do. Your counselor can help you sort them.</p>
      <div className="aw-grid">
        <F label="Search colleges" wide><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Florida A&M, Spelman, Georgia State…" /></F>
        <F label="State (optional)"><input value={state} maxLength={2} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder="GA" /></F>
      </div>
      {res.length ? (
        <div className="aw-matches">
          {res.map((c) => {
            const f = facts[c.unitid];
            return (
              <article key={c.unitid} className="aw-mcard" onMouseEnter={() => peek(c.unitid)} onFocus={() => peek(c.unitid)}>
                {c.hbcu ? <span className="aw-conf strong">HBCU</span> : null}
                <h3>{c.name}</h3>
                <p className="sc-small">{c.city}, {c.state}</p>
                {f ? <ul className="aw-why">
                  {f.grad_rate != null ? <li>{pct(f.grad_rate)} graduate</li> : null}
                  {f.net_price != null ? <li>Students pay about {dollars(f.net_price)} a year after aid</li> : null}
                  {f.chapter ? <li>Has an EFF chapter</li> : null}
                </ul> : <button type="button" className="aw-link" onClick={() => peek(c.unitid)}>How do students do here?</button>}
                {mine.has(c.unitid) ? <button type="button" className="sc-btn ghost sm" onClick={() => openKit(mine.get(c.unitid)!)}>Open my kit</button>
                  : <button type="button" className="sc-btn sm" onClick={() => add(c)}>Add to my list</button>}
              </article>
            );
          })}
        </div>
      ) : q.trim().length >= 2 ? <p className="sc-small">No college by that name. Try a shorter name, or add it yourself below.</p> : null}
      {me.apps.length ? (
        <section className="sc-box"><h2>My list · {me.apps.length}</h2>
          <ul className="aw-list">{me.apps.map((a) => <li key={a.id}><button type="button" className="aw-link" onClick={() => openKit(a.id)}>{a.title}</button><span className="sc-small">{a.details?.hbcu ? "HBCU · " : ""}{fmtDay(a.deadline)}</span></li>)}</ul>
        </section>
      ) : null}
      <form className="sc-box aw-own" onSubmit={addOwn}>
        <h2>Not finding it?</h2>
        <div className="aw-grid">
          <F label="College name" wide><input required value={own.title} onChange={(e) => setOwn({ ...own, title: e.target.value })} /></F>
          <F label="Admissions page (https://)" wide><input type="url" value={own.url} onChange={(e) => setOwn({ ...own, url: e.target.value })} /></F>
        </div>
        <div className="sc-acts"><button className="sc-btn ghost sm">Add it</button></div>
      </form>
      <p className="sc-small">Graduation rates and prices are from the U.S. Department of Education&rsquo;s College Scorecard. See the full picture for any college in <a href="https://my.estherfundsfoundation.org/kit/school" target="_blank" rel="noreferrer">My School, Honestly</a>.</p>
    </>
  );
}

/* ---------------- 4. The college kit ---------------- */
function KitView({ me, cp, ps, run, id, pick, back, tracker }: { me: Me; cp: CProfile; ps?: Essay; run: Run; id: string | null; pick: (id: string) => void; back: () => void; tracker: () => void }) {
  const app = me.apps.find((a) => a.id === id);
  const [d, setD] = useState<Details>(app?.details || {});
  const [deadline, setDeadline] = useState(app?.deadline || "");
  const [url, setUrl] = useState(app?.url || "");
  const [why, setWhy] = useState<Record<string, string>>({});
  const [whyFor, setWhyFor] = useState<number | null>(null);
  const open = me.apps.filter((a) => ["saved", "working"].includes(a.status));

  if (!app) return (
    <>
      <p className="aw-intro">Pick a college from your list.</p>
      {open.length ? <ul className="aw-list">{open.map((a) => <li key={a.id}><button type="button" className="aw-link" onClick={() => pick(a.id)}>{a.title}</button><span className="sc-small">{fmtDay(a.deadline)}</span></li>)}</ul>
        : <button type="button" className="sc-btn" onClick={back}>Build my college list</button>}
    </>
  );
  const save = (p: Record<string, unknown>) => run("eff_raw_app_save", { p: { id: app.id, ...p } });
  const saveD = (n: Details) => { setD(n); save({ details: n, status: app.status === "saved" ? "working" : app.status }); };
  const platform = PLATFORMS.find((p) => p.v === d.platform);
  const dl = DEADLINES.find((x) => x.v === d.deadline_type);
  const supps = d.supps || [];
  const name = [me.profile.first_name, me.profile.last_name].filter(Boolean).join(" ") || "[Your name]";
  const listNames = me.apps.map((a) => a.title);
  const first = me.apps.filter((a) => a.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!))[0]?.deadline || "";
  const acts = (cp.activities || []).filter((a) => a.org);
  const honors = (cp.honors || []).filter((h) => h.title);
  const checks = d.checks || {};
  const doneN = CHECKS.filter((c) => checks[c.k]).length;

  function setSupp(i: number, patch: Partial<Supp>, persist = false) {
    const n = { ...d, supps: supps.map((s, j) => (j === i ? { ...s, ...patch } : s)) };
    if (persist) saveD(n); else setD(n);
  }
  function fitStatement(i: number) {
    const s = supps[i]; const lim = Number(s.limit) || 0;
    if (!ps?.body) return;
    setSupp(i, { body: lim ? fit(ps.body, lim).text : ps.body }, true);
  }
  function buildWhy(i: number) {
    const parts = WHY_QS.map((q) => ({ t: cleanS(why[q.key] || ""), r: q.rank })).filter((p) => p.t);
    const text = parts.map((p) => p.t).join("\n\n");
    const lim = Number(supps[i].limit) || 0;
    setSupp(i, { body: lim ? fit(text, lim, parts.map((p) => p.r)).text : text }, true);
    setWhyFor(null);
  }
  const answers: Array<{ label: string; value: string }> = [
    { label: "High school", value: [cp.hs, [cp.hs_city, cp.hs_state].filter(Boolean).join(", ")].filter(Boolean).join(", ") },
    { label: "School code (CEEB)", value: cp.ceeb || "" }, { label: "Graduation year", value: cp.grad_year || "" },
    { label: "GPA", value: cp.gpa ? `${cp.gpa}${cp.gpa_scale ? ` on a ${cp.gpa_scale} scale` : ""}${cp.gpa_weighted ? ` (weighted ${cp.gpa_weighted})` : ""}` : "" },
    { label: "Class rank", value: cp.rank || "" }, { label: "Senior-year classes", value: cp.senior_courses || "" },
    { label: "Test scores", value: cp.tests || "" }, { label: "AP / IB / dual enrollment", value: cp.ap || "" },
    { label: "Intended major", value: [cp.major, cp.major2].filter(Boolean).join(" · second choice: ") },
    { label: "First-generation", value: cp.first_gen === "yes" ? "Yes" : cp.first_gen === "no" ? "No" : "" },
    { label: "Counselor", value: [cp.counselor, cp.counselor_email].filter(Boolean).join(" · ") },
  ].filter((r) => r.value);

  return (
    <>
      <button type="button" className="aw-link" onClick={back}>← College list</button>
      <section className="aw-kithead">
        <div>
          <h2>{app.title}</h2>
          <p className="sc-small">{[app.sponsor, d.hbcu ? "HBCU" : ""].filter(Boolean).join(" · ")}</p>
          <p className={(daysTo(app.deadline) ?? 99) <= 14 ? "aw-hot" : "sc-small"}>{dl?.l || "Deadline"} · {fmtDay(app.deadline)}</p>
        </div>
        {url ? <a className="sc-btn coral" href={url} target="_blank" rel="noreferrer">Admissions page ↗</a> : null}
      </section>

      <ol className="aw-kit">
        <li>
          <h3>How and when you apply</h3>
          <p className="sc-small">Find these on the college&rsquo;s admissions page. Dates change every year, so never guess.</p>
          <div className="aw-grid">
            <F label="Deadline type"><select value={d.deadline_type || ""} onChange={(e) => saveD({ ...d, deadline_type: e.target.value })}><option value="">Choose</option>{DEADLINES.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}</select></F>
            <F label="Deadline"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} onBlur={() => save({ deadline })} /></F>
            <F label="Where you apply"><select value={d.platform || ""} onChange={(e) => saveD({ ...d, platform: e.target.value })}><option value="">Choose</option>{PLATFORMS.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}</select></F>
            <F label="Admissions page (https://)" wide><input type="url" value={url} onChange={(e) => setUrl(e.target.value)} onBlur={() => save({ url })} /></F>
            <F label="Application fee"><select value={d.fee || ""} onChange={(e) => saveD({ ...d, fee: e.target.value })}><option value="">Not sure yet</option><option value="free">No fee</option><option value="waiver">Fee waiver</option><option value="pay">I'll pay it</option></select></F>
          </div>
          {dl?.note ? <p className="aw-promise">{dl.note}</p> : null}
          {platform?.url ? <p className="sc-small">Apply through <a href={platform.url} target="_blank" rel="noreferrer">{platform.l} ↗</a>.</p> : null}
          {d.fee === "waiver" || cp.waiver === "yes" ? <p className="sc-small">Fee waivers: the Common App asks about eligibility in its profile section, and your counselor can confirm it. Many colleges waive fees for first-generation or low-income students; ask their admissions office.</p> : null}
        </li>
        <li>
          <h3>Your personal statement</h3>
          {ps?.body ? <div className="aw-draft"><div className="aw-drafthead"><span className="sc-small">{words(ps.body)} words</span></div><p className="awc-pre">{ps.body.slice(0, 400)}{ps.body.length > 400 ? "…" : ""}</p><Copy text={ps.body} label="Copy statement" /></div>
            : <p className="aw-err">Write your personal statement first (step 2).</p>}
        </li>
        <li>
          <h3>Supplements</h3>
          <p className="sc-small">Many colleges ask extra questions. Paste each one with its word limit. &ldquo;Why us?&rdquo; gets its own interview; anything else can start from your statement.</p>
          {supps.map((s, i) => (
            <div key={i} className="aw-item">
              <F label={`Question ${i + 1}`} wide><textarea rows={2} value={s.q} onChange={(e) => { const l = wordLimitIn(e.target.value); setSupp(i, { q: e.target.value, ...(l && !s.limit ? { limit: String(l) } : {}) }); }} onBlur={() => saveD(d)} /></F>
              <div className="aw-grid">
                <F label="Word limit"><input inputMode="numeric" value={s.limit} onChange={(e) => setSupp(i, { limit: e.target.value.replace(/\D/g, "") })} onBlur={() => saveD(d)} /></F>
              </div>
              <div className="sc-acts">
                <button type="button" className="sc-btn sm" onClick={() => setWhyFor(i)}>Build a &ldquo;Why us?&rdquo; answer</button>
                <button type="button" className="sc-btn ghost sm" disabled={!ps?.body} onClick={() => fitStatement(i)}>Start from my statement</button>
              </div>
              {whyFor === i ? (
                <div className="awc-why">
                  {WHY_QS.map((q, k) => (
                    <label key={q.key} className="aw-q"><span><b>{k + 1}</b>{q.ask}</span>
                      <textarea rows={3} value={why[q.key] || ""} placeholder={q.hint} onChange={(e) => setWhy({ ...why, [q.key]: e.target.value })} /></label>
                  ))}
                  <div className="sc-acts"><button type="button" className="sc-btn coral sm" onClick={() => buildWhy(i)}>Build my answer</button></div>
                </div>
              ) : null}
              {s.body ? (
                <div className="aw-draft">
                  <div className="aw-drafthead"><h3>Your answer</h3><span className={Number(s.limit) && words(s.body) > Number(s.limit) ? "aw-hot" : "sc-small"}>{words(s.body)}{s.limit ? ` / ${s.limit}` : ""} words</span></div>
                  <textarea rows={8} value={s.body} onChange={(e) => setSupp(i, { body: e.target.value })} onBlur={() => saveD(d)} />
                  <div className="sc-acts"><Copy text={s.body} label="Copy answer" /></div>
                </div>
              ) : null}
              <button type="button" className="aw-link" onClick={() => saveD({ ...d, supps: supps.filter((_, j) => j !== i) })}>Take this question out</button>
            </div>
          ))}
          {supps.length < 8 ? <button type="button" className="sc-btn ghost sm" onClick={() => setD({ ...d, supps: [...supps, { q: "", limit: "", body: "" }] })}>+ Add a supplement question</button> : null}
        </li>
        <li>
          <h3>Every answer, ready to paste</h3>
          <div className="aw-answers">
            {answers.map((r) => <div key={r.label} className="aw-ans"><span>{r.label}</span><p>{r.value}</p><Copy text={r.value} /></div>)}
            {acts.map((a, i) => {
              const line = `${a.position || ""}${a.position && a.org ? ", " : ""}${a.org}\n${a.describe || ""}`;
              return <div key={`a${i}`} className="aw-ans"><span>Activity {i + 1}{a.type ? ` · ${a.type}` : ""}</span><p>{line}{a.hours ? `\n${a.hours} hrs/week${a.weeks ? `, ${a.weeks} weeks/year` : ""}${a.grades ? ` · grades ${a.grades}` : ""}` : ""}</p><Copy text={line} /></div>;
            })}
            {honors.map((h, i) => <div key={`h${i}`} className="aw-ans"><span>Honor {i + 1}</span><p>{[h.title, h.grades && `grade ${h.grades}`, h.level].filter(Boolean).join(" · ")}</p><Copy text={h.title} /></div>)}
          </div>
          {!acts.length ? <p className="aw-err">Add your activities in step 1 and they appear here.</p> : null}
          <p className="sc-small">Name, address, phone and email are in your <Link href="/apply-with-me">scholarship profile</Link> kit.</p>
        </li>
        <li>
          <h3>Ask for help, in writing</h3>
          <p className="sc-small">Send these from your own email. Ask at least three weeks before your first deadline, and thank them after.</p>
          <div className="aw-ans"><span>To your counselor{cp.counselor_email ? ` · ${cp.counselor_email}` : ""}</span><p className="awc-pre">{counselorEmail(cp, name, listNames)}</p><Copy text={counselorEmail(cp, name, listNames)} label="Copy email" /></div>
          {(cp.teachers || []).filter((t) => t.name).map((t, i) => {
            const m = teacherEmail(t, cp, name, listNames, first ? fmtDay(first) : "");
            return <div key={i} className="aw-ans"><span>To {t.name}{t.email ? ` · ${t.email}` : ""}</span><p className="awc-pre">{m}</p><Copy text={m} label="Copy email" /></div>;
          })}
        </li>
        <li>
          <h3>Checklist · {doneN}/{CHECKS.length}</h3>
          <p className="sc-small">Every college is a little different. Tick what applies; skip what doesn&rsquo;t.</p>
          <div className="aw-files">{CHECKS.map((c) => (
            <label key={c.k}><input type="checkbox" checked={!!checks[c.k]} onChange={(e) => saveD({ ...d, checks: { ...checks, [c.k]: e.target.checked } })} />{c.l}{c.who !== "you" ? <em className="sc-small"> · {c.who}</em> : null}</label>
          ))}</div>
        </li>
        <li>
          <h3>You click submit</h3>
          <p>Preview the whole application on their portal and read every word. You&rsquo;re promising it&rsquo;s yours and it&rsquo;s true. Then press submit, and save the confirmation email.</p>
          <div className="sc-acts">
            {url ? <a className="sc-btn ghost" href={url} target="_blank" rel="noreferrer">Admissions page ↗</a> : null}
            <button type="button" className="sc-btn coral" onClick={async () => { await save({ status: "applied", details: d }); tracker(); }}>I submitted it 🎉</button>
            <button type="button" className="aw-link" onClick={async () => { await save({ status: "skipped" }); back(); }}>Not applying here</button>
          </div>
          <p className="sc-small">After you submit, the college emails you a link to its applicant portal. Log in every week: missing documents show up there.</p>
        </li>
      </ol>
    </>
  );
}

/* ---------------- 5. Tracker ---------------- */
function TrackerView({ me, run, openKit, find }: { me: Me; run: Run; openKit: (id: string) => void; find: () => void }) {
  const list = [...me.apps].filter((a) => a.status !== "skipped").sort((a, b) => {
    const order = ["working", "saved", "applied", "won", "not_selected"];
    return order.indexOf(a.status) - order.indexOf(b.status) || (a.deadline || "9999").localeCompare(b.deadline || "9999");
  });
  const sent = me.apps.filter((a) => ["applied", "won", "not_selected"].includes(a.status)).length;
  const admitted = me.apps.filter((a) => a.status === "won");
  function decide(a: App, v: string) {
    const status = v === "admitted" ? "won" : v === "denied" ? "not_selected" : v ? "applied" : a.status === "saved" || a.status === "working" ? a.status : "applied";
    run("eff_raw_app_save", { p: { id: a.id, status, details: { ...(a.details || {}), decision: v } } });
  }
  return (
    <>
      <div className="aw-stats">
        <div><b>{sent}</b><span>submitted</span></div>
        <div className={admitted.length ? "win" : ""}><b>{admitted.length}</b><span>admitted</span></div>
        <div><b>{list.filter((a) => ["saved", "working"].includes(a.status)).length}</b><span>still to do</span></div>
      </div>
      {!list.length ? <p className="sc-box">No colleges on your list yet. <button type="button" className="aw-link" onClick={find}>Build your list</button></p> : (
        <div className="aw-track">
          {list.map((a) => (
            <div key={a.id} className={`aw-trow s-${a.status}`}>
              <div><b>{a.title}</b><span className="sc-small">{[DEADLINES.find((x) => x.v === a.details?.deadline_type)?.l, fmtDay(a.deadline)].filter(Boolean).join(" · ")}</span></div>
              {["saved", "working"].includes(a.status) ? <button type="button" className="sc-btn sm" onClick={() => openKit(a.id)}>Open kit</button> : (
                <select aria-label={`Decision from ${a.title}`} value={a.details?.decision || ""} onChange={(e) => decide(a, e.target.value)}>
                  {DECISIONS.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
                </select>
              )}
              <span />
            </div>
          ))}
        </div>
      )}
      {admitted.length ? <p className="aw-promise">You got in. Compare financial aid offers before you decide (most colleges ask by May 1), and tell EFF: <a href="mailto:info@estherfundsfoundation.org?subject=I%20got%20into%20college">info@estherfundsfoundation.org</a>. We&rsquo;d love to celebrate you, only if you say yes.</p> : null}
      <p className="sc-small">REACH emails you a week and two days before each deadline on your list. Waitlisted or deferred? Ask your counselor about a letter of continued interest.</p>
    </>
  );
}
