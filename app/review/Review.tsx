"use client";

import { useCallback, useEffect, useState } from "react";
import { rpc } from "../scholarships/lib";
import Payouts from "./Payouts";
import "./review.css";

/* reach.estherfundsfoundation.org/review (Shayna, 10 Nov 2026: "i want reach.estherfundsfoundation.org to have its own sign in to review").
   The same review committee page as MyEFF's /review, on REACH: sign in with an emailed code, score and decide. Everything lives in
   MyEFF: the eff_review_* functions with the public key, and MyEFF's /api/review and /api/review/code (CORS for REACH). */
const MYEFF = "https://my.estherfundsfoundation.org";
const effRpc = <T,>(fn: string, _token: string, body: Record<string, unknown>) => rpc<T>(fn, body, 0);

/* /review: EFF's review committees (24 Oct 2026, Shayna: "how can my volunteers and committee go and review and
   award?"). Volunteers never need a MyEFF account: National adds their email in Programs, they sign in here with
   an emailed code (/api/review/code → eff_service_code_verify, pass in localStorage eff-review-pass), sign the
   confidentiality pledge once, and see only the programs they were added to. Scorers score with the rubric;
   deciders also ask for more, award or say not this time (through /api/review, which emails the student).
   Money stays with National, who pays every award. Scoped to body.eff-review (with eff-console for its tool styles). */

const KEY = "eff-review-pass";
type Prog = { key: string; name: string; kind: string; role: "scorer" | "decider"; turnaround_hours: number | null; has_rubric: boolean; waiting: number; to_score: number };
type Me = { email: string; name: string | null; pledged: boolean; programs: Prog[] };
type R = { key: string; label: string; max: number; guide?: string };
type Q = { key: string; label: string; kind: string };
type Doc = { key: string; label: string };
type App = {
  id: string; number: string; status: string; submitted_at: string | null; due_by: string | null; answers: Record<string, unknown>;
  requested_cents: number | null; award_amount: number | null; more_info: string | null; decision_note: string | null; decided_at: string | null;
  documents: { key: string; name: string }[]; name: string | null; school: string | null; level: string | null; state: string | null;
  mine: { scores: Record<string, number>; total: number; note: string | null } | null; score_avg: number | null; score_count: number;
  others: { name: string; total: number; note: string | null }[] | null;
  auto_score?: number | null; auto_flags?: string[] | null;
  auto_detail?: { lines?: Array<{ label: string; got: number; max: number }>; student?: { school?: string | null; domain?: string | null; edu?: boolean } } | null;
};
const fullName = (a: App) => [a.answers?.first_name, a.answers?.last_name].filter(Boolean).join(" ") || a.name || a.number;
type Board = { role: "scorer" | "decider"; program: { key: string; name: string; kind: string; rubric: R[]; questions: Q[]; documents: Doc[]; turnaround_hours: number | null; max_award_cents: number | null; fund_left_cents: number | null }; applications: App[] };

const STATUS: Record<string, string> = { submitted: "New", reviewing: "Reviewing", more_info: "Waiting on student", awarded: "Awarded", not_selected: "Not selected" };
const when = (s: string | null) => (s ? new Date(s).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");
const money = (c: number | null | undefined) => `$${((c || 0) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
function clock(due: string | null) {
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  const h = Math.floor(Math.abs(ms) / 3600000), m = Math.floor((Math.abs(ms) % 3600000) / 60000);
  const t = h ? `${h}h ${m}m` : `${m}m`;
  return ms < 0 ? { cls: "late", text: `${t} past the promise` } : { cls: ms < 6 * 3600000 ? "soon" : "", text: `${t} left` };
}

const PLEDGE = [
  "Everything a student shares stays with the committee. I won't copy, screenshot, forward or talk about any application outside EFF's review.",
  "I'll step aside from any student I know personally, using “I know this student.”",
  "I'll score fairly with the rubric. A student's GPA, background or story never counts against them.",
  "I won't contact any applicant. EFF National speaks to students for the committee.",
  "I'll sign out when I use a shared or public device.",
];

export default function Review() {
  const [pass, setPass] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [open, setOpen] = useState<App | null>(null);
  const [toast, setToast] = useState<{ m: string; bad?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState(false);

  useEffect(() => {
    try { setPass(localStorage.getItem(KEY) || ""); } catch { /* private window */ }
  }, []);
  const say = useCallback((m: string, bad?: boolean) => {
    setToast({ m, bad });
    window.setTimeout(() => setToast((t) => (t && t.m === m ? null : t)), bad ? 7000 : 3500);
  }, []);
  const signOut = useCallback(() => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } setPass(""); setMe(null); setBoard(null); setOpen(null); }, []);

  const loadMe = useCallback(() => {
    if (!pass) return;
    effRpc<Me>("eff_review_me", "", { p_token: pass }).then(setMe).catch((e) => { say(e instanceof Error ? e.message : "Sign in again.", true); signOut(); });
  }, [pass, say, signOut]);
  useEffect(loadMe, [loadMe]);

  const loadBoard = useCallback(async (key: string, keepOpen?: string) => {
    try {
      const b = await effRpc<Board>("eff_review_board", "", { p_token: pass, p_program: key });
      setBoard(b);
      if (keepOpen) setOpen(b.applications.find((a) => a.id === keepOpen) || null);
    } catch (e) { say(e instanceof Error ? e.message : "That didn't load.", true); }
  }, [pass, say]);

  return (
    <div className="rvp">
      <div className="top rv-top">
        <span className="logo">r.e.a.c.h. <small>review</small></span>
        {me ? <span className="rv-who">{me.name || me.email} · <button className="btn o sm" onClick={signOut}>Sign out</button></span> : null}
      </div>
      <main className="rvw">
        {!pass ? <SignIn onPass={(t) => { try { localStorage.setItem(KEY, t); } catch { /* ignore */ } setPass(t); }} say={say} />
          : !me ? <p className="tiny">Loading…</p>
          : !me.pledged ? <Pledge pass={pass} me={me} say={say} done={loadMe} />
          : open && board ? <AppView key={open.id} next={(id) => id ? loadBoard(board.program.key, id) : (setOpen(null), loadBoard(board.program.key), loadMe())} pass={pass} board={board} a={open} say={say} busy={busy} setBusy={setBusy} back={() => { setOpen(null); loadBoard(board.program.key); loadMe(); }} reload={(gone) => gone ? (setOpen(null), loadBoard(board.program.key), loadMe()) : loadBoard(board.program.key, open.id)} />
          : board && pay ? <Payouts pass={pass} program={board.program.key} say={say} back={() => { setPay(false); loadBoard(board.program.key); }} />
          : board ? <BoardView board={board} pick={setOpen} money={() => setPay(true)} back={() => { setBoard(null); loadMe(); }} />
          : (
            <>
              <h1>Welcome{me.name ? `, ${me.name.split(" ")[0]}` : ""}.</h1>
              <p className="sub">Thank you for giving your time to students who are close to not finishing. These are the programs you review.</p>
              {!me.programs.length ? <p>You aren&rsquo;t on a program right now. EFF National will add you when there&rsquo;s one to review.</p> : (
                <div className="rv-progs">
                  {me.programs.map((p) => (
                    <button key={p.key} className="card rv-prog" onClick={() => loadBoard(p.key)}>
                      <span className="tiny">{p.role === "decider" ? "You score and decide" : "You score"}{p.turnaround_hours ? ` · decided within ${p.turnaround_hours} weekday hours` : ""}</span>
                      <b>{p.name}</b>
                      <span>{p.waiting ? `${p.waiting} waiting` : "Nothing waiting"}{p.has_rubric && p.to_score ? ` · ${p.to_score} for you to score` : ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
      </main>
      {toast ? <div className={`toast${toast.bad ? " bad" : ""}`} role="status">{toast.m}</div> : null}
    </div>
  );
}

function SignIn({ onPass, say }: { onPass: (t: string) => void; say: (m: string, bad?: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    try {
      const r = await fetch(`${MYEFF}/api/review/code`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, site: "reach" }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Try again.");
      setSession(d.session); say("Check your email for a 6-digit code.");
    } catch (e) { say(e instanceof Error ? e.message : "Try again.", true); }
    setBusy(false);
  }
  async function verify() {
    setBusy(true);
    try { const d = await effRpc<{ token: string }>("eff_service_code_verify", "", { p_session: session, p_code: code }); onPass(d.token); }
    catch (e) { say(e instanceof Error ? e.message : "That code didn't work.", true); }
    setBusy(false);
  }
  return (
    <section className="card rv-sign">
      <h1>Sign in to review</h1>
      <p className="sub">Use the email EFF added to the committee. We&rsquo;ll send you a 6-digit code. No password needed.</p>
      {!session ? (
        <form onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input className="ffield" type="email" autoComplete="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn p" disabled={busy || !email}>Email me a code</button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
          <input className="ffield" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
          <button className="btn p" disabled={busy || code.length !== 6}>Sign in</button>
          <button type="button" className="btn o sm" onClick={() => { setSession(""); setCode(""); }}>Use a different email</button>
        </form>
      )}
    </section>
  );
}

function Pledge({ pass, me, say, done }: { pass: string; me: Me; say: (m: string, bad?: boolean) => void; done: () => void }) {
  const [name, setName] = useState(me.name || "");
  const [ok, setOk] = useState(false);
  async function sign() {
    try { await effRpc("eff_review_pledge", "", { p_token: pass, p_name: name }); say("Thank you. You're in."); done(); }
    catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
  }
  return (
    <section className="card rv-sign">
      <h1>Before you read anything</h1>
      <p className="sub">These are real students, many in the hardest week of their year. What they share with EFF is shared in trust.</p>
      <ol className="rv-pledge">{PLEDGE.map((l) => <li key={l}>{l}</li>)}</ol>
      <label className="rv-check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> I promise to keep these.</label>
      <input className="ffield" placeholder="Type your full name to sign" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="btn p" disabled={!ok || name.trim().length < 3} onClick={sign}>Sign and continue</button>
    </section>
  );
}

function BoardView({ board, pick, back, money: openMoney }: { board: Board; pick: (a: App) => void; back: () => void; money: () => void }) {
  const p = board.program;
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("auto");
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hay = (a: App) => [fullName(a), a.number, a.school, a.state, ...Object.values(a.answers || {}).map((v) => (Array.isArray(v) ? v.join(" ") : String(v ?? "")))].join(" ").toLowerCase();
  const key = (a: App) => sort === "unscored" ? (a.score_count ? 1 : 0) * 1000 - (a.auto_score ?? 0) : sort === "flags" ? (a.auto_flags?.length ? 0 : 1) * 1000 - (a.auto_score ?? 0) : sort === "oldest" ? Date.parse(a.submitted_at || "2999") : -(a.auto_score ?? -1);
  const list = board.applications.filter((a) => words.every((w) => hay(a).includes(w))).sort((x, y) => key(x) - key(y));
  const waiting = list.filter((a) => ["submitted", "reviewing"].includes(a.status));
  const rest = list.filter((a) => !["submitted", "reviewing"].includes(a.status));
  const story = p.questions.find((x) => x.kind === "long");
  const row = (a: App) => {
    const ck = ["submitted", "reviewing"].includes(a.status) ? clock(a.due_by) : null;
    const st = story && a.answers?.[story.key] ? String(a.answers[story.key]) : "";
    return (
      <button key={a.id} className="rv-row" onClick={() => pick(a)}>
        <span><b>{fullName(a)}</b> <span className="tiny">{a.number}{a.school ? ` · ${a.school}` : ""}</span>
          {st ? <span className="tiny" style={{ display: "block", opacity: 0.8, marginTop: 2 }}>&ldquo;{st.slice(0, 140)}{st.length > 140 ? "…" : ""}&rdquo;</span> : null}</span>
        <span className="rv-tags">
          {a.auto_score != null ? <span className="rv-pill ok">score {a.auto_score}</span> : null}
          {a.auto_flags?.length ? <span className="rv-pill late">⚑ {a.auto_flags.length}</span> : null}
          {a.requested_cents ? <span className="rv-pill">asks {money(a.requested_cents)}</span> : null}
          {a.mine ? <span className="rv-pill ok">you scored {a.mine.total}</span> : a.score_count ? <span className="rv-pill ok">scored{a.others?.[0]?.name ? ` by ${a.others[0].name.split(" ")[0]}` : ""}</span> : p.rubric.length ? <span className="rv-pill soon">needs a score</span> : null}
          {ck ? <span className={`rv-pill ${ck.cls}`}>{ck.text}</span> : <span className="rv-pill">{STATUS[a.status] || a.status}</span>}
        </span>
      </button>
    );
  };
  return (
    <>
      <button className="btn o sm" onClick={back}>← My programs</button>
      <h1>{p.name}</h1>
      <p className="sub">{board.role === "decider" ? "You score and decide." : "You score. A committee member who decides, or EFF National, makes the decision."}
        {p.max_award_cents != null ? ` Most per student: ${money(p.max_award_cents)}.` : ""}{p.fund_left_cents != null ? ` Left in the fund: ${money(p.fund_left_cents)}.` : ""}</p>
      <p><button className="btn p sm" onClick={openMoney}>Awards &amp; payouts →</button> <span className="tiny">Who we awarded, how much, and what has been paid.</span></p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
        <input className="ffield" style={{ flex: 3, minWidth: 220 }} type="search" placeholder="Search name, school, or anything they wrote" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="ffield" style={{ flex: 1, minWidth: 160 }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="auto">Highest score first</option><option value="unscored">Needs a score first</option><option value="flags">Flagged first</option><option value="oldest">First sent first</option>
        </select>
      </div>
      <h2>Waiting ({waiting.length})</h2>
      {waiting.length ? <div className="rv-list">{waiting.map(row)}</div> : <p className="tiny">{q ? "No matches." : "Nothing waiting right now. Thank you."}</p>}
      {rest.length ? <><h2>Decided or with the student ({rest.length})</h2><div className="rv-list">{rest.map(row)}</div></> : null}
    </>
  );
}

/* The saved "not this time" message, kept in this browser per program. Grocery Fund starts with the wording Shayna was shown on 11 Nov 2026. */
const QUICK_START: Record<string, string> = {
  "reach-grocery-fund": "Thank you for applying to the REACH Grocery Fund. We received far more requests than we had cards to give, and we weren't able to select your application this time. The EFF Emergency Grant opens in January. Join the waiting list at reach.estherfundsfoundation.org/notify and we'll email you the day it opens. For food help near your campus right now, visit reach.estherfundsfoundation.org.",
};
const quickKey = (k: string) => `reach-review-quick:${k}`;

function AppView({ pass, board, a, say, busy, setBusy, back, reload, next }: { next: (id: string | null) => void; pass: string; board: Board; a: App; say: (m: string, bad?: boolean) => void; busy: boolean; setBusy: (b: boolean) => void; back: () => void; reload: (gone?: boolean) => void }) {
  const p = board.program;
  const [sc, setSc] = useState<Record<string, number>>(a.mine?.scores || {});
  const [note, setNote] = useState(a.mine?.note || "");
  const [dec, setDec] = useState({ note: "", amount: a.requested_cents ? String(Math.min(a.requested_cents, p.max_award_cents ?? a.requested_cents) / 100) : "" });
  const total = p.rubric.reduce((t, r) => t + (Number(sc[r.key]) || 0), 0);
  const max = p.rubric.reduce((t, r) => t + r.max, 0);
  const ck = ["submitted", "reviewing"].includes(a.status) ? clock(a.due_by) : null;
  const open = !["awarded", "not_selected"].includes(a.status);
  const [quick, setQuick] = useState(QUICK_START[p.key] || "");
  const [editQuick, setEditQuick] = useState(false);
  useEffect(() => { try { const v = localStorage.getItem(quickKey(p.key)); if (v != null) setQuick(v); } catch { /* private window */ } }, [p.key]);
  const saveQuick = (v: string) => { setQuick(v); try { localStorage.setItem(quickKey(p.key), v); } catch { /* private window */ } };
  const nextId = board.applications.filter((x) => x.id !== a.id && ["submitted", "reviewing"].includes(x.status)).sort((x, y) => (y.auto_score ?? -1) - (x.auto_score ?? -1))[0]?.id || null;
  async function quickNo() {
    if (quick.trim().length < 10) { say("Write your message first (10+ characters).", true); setEditQuick(true); return; }
    setBusy(true);
    try {
      const r = await fetch(`${MYEFF}/api/review`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass, action: "decide", id: a.id, status: "not_selected", note: quick.trim(), amount: null }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      say(d.emailed ? `${fullName(a)} was emailed and is off your list.` : "Saved, but the email didn't send. EFF National will follow up.", !d.emailed);
      next(nextId);
    } catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
    setBusy(false);
  }

  async function file(key: string) {
    try {
      const r = await fetch(`${MYEFF}/api/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pass, action: "file", id: a.id, key }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      window.open(d.url, "_blank", "noopener");
    } catch (e) { say(e instanceof Error ? e.message : "That file couldn't open.", true); }
  }
  async function score() {
    setBusy(true);
    try { await effRpc("eff_review_score", "", { p_token: pass, p_id: a.id, p_scores: sc, p_note: note || null }); say("Your score is saved."); reload(); }
    catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
    setBusy(false);
  }
  async function decide(status: string) {
    if (status === "awarded" && !window.confirm(`Award ${fullName(a)} $${dec.amount}? They'll be emailed now, and EFF National pays it.`)) return;
    setBusy(true);
    try {
      const r = await fetch(`${MYEFF}/api/review`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass, action: "decide", id: a.id, status, note: dec.note, amount: status === "awarded" ? Number(dec.amount.replace(/[^0-9.]/g, "")) : null }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      say(status === "reviewing" ? "Marked reviewing." : d.emailed ? "Done. The student has been emailed." : "Saved, but the email didn't send. EFF National will follow up.", !d.emailed && status !== "reviewing");
      reload();
    } catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
    setBusy(false);
  }
  async function recuse() {
    if (!window.confirm("Step aside from this student? It moves off your list and the committee will know you stepped aside (not why).")) return;
    try { await effRpc("eff_review_recuse", "", { p_token: pass, p_id: a.id, p_reason: null }); say("You stepped aside. Thank you."); reload(true); }
    catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
  }

  return (
    <>
      <button className="btn o sm" onClick={back}>← {p.name}</button>
      <h1>{fullName(a)}</h1>
      <p className="sub">{a.number} · {STATUS[a.status] || a.status} · sent {when(a.submitted_at)}{a.school ? ` · ${a.school}` : ""}{a.level ? ` · ${a.level}` : ""}{a.state ? ` · ${a.state}` : ""}</p>
      {ck ? <div className={`rv-banner ${ck.cls}`}><b>{ck.cls === "late" ? "Past the promise" : ck.text}</b> <span>The student was told EFF decides by {when(a.due_by)} ET.</span></div> : null}
      {a.requested_cents ? <p><b>Asks for {money(a.requested_cents)}</b></p> : null}
      {a.auto_score != null || a.auto_flags?.length ? (
        <section className="card">
          <h2>Automatic score: {a.auto_score ?? "–"} / 100</h2>
          {a.auto_flags?.length ? a.auto_flags.map((f) => <p key={f} className="tiny" style={{ margin: "3px 0", color: "#9a3412" }}>⚑ {f}</p>) : <p className="tiny">No flags.</p>}
          {a.auto_detail?.student ? <p className="tiny">Student check: {a.auto_detail.student.school ? <>school email belongs to <b>{a.auto_detail.student.school}</b></> : a.auto_detail.student.edu ? <>.edu email ({a.auto_detail.student.domain}), college not on our list</> : <>no school email</>}</p> : null}
          {a.auto_detail?.lines?.length ? <div className="tiny">{a.auto_detail.lines.map((l) => <div key={l.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,.06)", padding: "2px 0" }}><span>{l.label}</span><b>{l.got} / {l.max}</b></div>)}</div> : null}
          <p className="tiny" style={{ opacity: 0.8 }}>The score ranks applications from their answers. You still decide.</p>
        </section>
      ) : null}
      <section className="card">
        <h2>Their answers</h2>
        {p.questions.map((q) => { const v = a.answers[q.key]; return <div key={q.key} className="rv-ans"><div className="tiny"><b>{q.label}</b></div><div>{Array.isArray(v) ? v.join(", ") : v ? String(v) : <span className="tiny">No answer</span>}</div></div>; })}
        {a.documents.length ? <><h3>Documents</h3>{a.documents.map((f) => <p key={f.key}><button className="btn o sm" onClick={() => file(f.key)}>Open</button> {p.documents.find((x) => x.key === f.key)?.label || f.key}: {f.name}</p>)}<p className="tiny">Files open for two minutes. Please don&rsquo;t download or save them.</p></> : null}
      </section>
      {p.rubric.length ? (
        <section className="card rv-score">
          <h2>Your score <span className="rv-total">{total}</span><span className="tiny"> / {max}</span></h2>
          {p.rubric.map((r) => (
            <div key={r.key} className="rv-srow">
              <div><b>{r.label}</b> <span className="tiny">out of {r.max}</span>{r.guide ? <div className="tiny">{r.guide}</div> : null}
                <input type="range" min={0} max={r.max} value={Number(sc[r.key] ?? 0)} onChange={(e) => setSc({ ...sc, [r.key]: Number(e.target.value) })} aria-label={r.label} /></div>
              <input className="ffield" inputMode="numeric" value={sc[r.key] ?? ""} placeholder={`0–${r.max}`} onChange={(e) => setSc({ ...sc, [r.key]: Math.min(r.max, Number(e.target.value.replace(/\D/g, "")) || 0) })} />
            </div>
          ))}
          <input className="ffield" placeholder="A note for the committee (optional, the student never sees it)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div><button className="btn p sm" disabled={busy} onClick={score}>{a.mine ? "Update my score" : "Save my score"}</button></div>
          {a.others ? (
            <div className="tiny">
              <p>Committee average: <b>{a.score_avg ?? "–"}</b> / {max} from {a.score_count} reviewer{a.score_count === 1 ? "" : "s"}.</p>
              {a.others.map((o, i) => <p key={i}>{o.name}: {o.total}{o.note ? ` · ${o.note}` : ""}</p>)}
            </div>
          ) : null}
          {a.score_count > 0 && !a.mine ? <p className="tiny">Already scored by the committee. You don&rsquo;t have to score it too; add yours only if you want to.</p> : null}
        </section>
      ) : null}
      {board.role === "decider" && open ? (
        <section className="card rv-dec">
          <h2>Not this time, in one tap</h2>
          {editQuick ? <textarea className="ffield" rows={5} value={quick} onChange={(e) => saveQuick(e.target.value)} aria-label="Your saved message" />
            : <p className="tiny" style={{ whiteSpace: "pre-wrap" }}>{quick ? <>&ldquo;{quick}&rdquo;</> : "No saved message yet."}</p>}
          <div className="rv-btns">
            <button className="btn p sm" disabled={busy} onClick={quickNo}>Send this &amp; go to the next one →</button>
            <button className="btn o sm" onClick={() => setEditQuick(!editQuick)}>{editQuick ? "Done" : "Change the message"}</button>
          </div>
          <p className="tiny" style={{ opacity: 0.8 }}>The student is emailed this message, and the application leaves your waiting list.{p.key === "reach-grocery-fund" ? " Their answers and files are wiped automatically 3 days later." : ""}</p>
        </section>
      ) : null}
      {board.role === "decider" && open ? (
        <section className="card rv-dec">
          <h2>Decide</h2>
          <textarea className="ffield" rows={3} placeholder="Note to the student. They read this. Required to ask for more or to say not this time." value={dec.note} onChange={(e) => setDec({ ...dec, note: e.target.value })} />
          <input className="ffield" placeholder="Award amount in dollars (e.g. 500)" value={dec.amount} onChange={(e) => setDec({ ...dec, amount: e.target.value })} />
          <p className="tiny">{p.max_award_cents != null ? `Most per student: ${money(p.max_award_cents)}. ` : ""}{p.fund_left_cents != null ? `Left in the fund: ${money(p.fund_left_cents)}. ` : ""}{p.fund_left_cents != null && Number(dec.amount) > 0 ? `After this award: ${money(p.fund_left_cents - Math.round(Number(dec.amount) * 100))}. ` : ""}EFF National pays every award, to the vendor when it can.</p>
          <div className="rv-btns">
            <button className="btn o sm" disabled={busy} onClick={() => decide("reviewing")}>Mark reviewing</button>
            <button className="btn o sm" disabled={busy} onClick={() => decide("more_info")}>Ask for more</button>
            <button className="btn p sm" disabled={busy} onClick={() => decide("awarded")}>Award</button>
            <button className="btn o sm" disabled={busy} onClick={() => decide("not_selected")}>Not this time</button>
          </div>
        </section>
      ) : null}
      {!open ? <section className="card"><p>{a.status === "awarded" ? `Awarded ${a.award_amount ? `$${a.award_amount}` : ""}` : "Not selected"} on {when(a.decided_at)}.</p>{a.decision_note ? <p className="tiny">Told the student: &ldquo;{a.decision_note}&rdquo;</p> : null}</section> : null}
      {a.more_info && a.status === "more_info" ? <p className="tiny">Asked the student: &ldquo;{a.more_info}&rdquo;</p> : null}
      <p><button className="btn o sm" onClick={recuse}>I know this student</button></p>
    </>
  );
}
