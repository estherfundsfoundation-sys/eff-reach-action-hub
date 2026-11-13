"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { call, readPass, startCode, MYEFF, SignedOut } from "../myreach/pass";
import { rpc } from "../scholarships/lib";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { SignIn } from "../account/SignIn";
import { PRE, FULL, DOCS, ROUTE_LABEL, routeFor, movesFor, type Q, type Route } from "./questions";

/* REACH Balance Screening (13 Nov 2026, Shayna). Step 1, the pre-screening: about fifteen questions, no documents,
   worked out right here in the browser (kept in localStorage reach-screen-pre). It gives a route and the moves to try
   now. Step 2, the full screening: signed in with the My REACH code, her details, what she has tried and her documents
   (MyEFF /api/reach/case-upload into a private bucket), saved through eff_bal_save. A person at EFF reviews every case
   and writes back a plan she reads here (eff_bal_me). EFF is not her school's financial aid office. */

type A = Record<string, unknown>;
type Doc = { id: string; kind: string; name: string; size: number; at: string };
type Case = { id: string; case_no: string; status: string; urgent: boolean; route: string | null; pre: A; full: A; docs: Doc[]; reply_note: string | null; plan_steps: string[]; submitted_at: string | null; replied_at: string | null };
type Me = { email: string; account: { first_name: string | null; last_name: string | null; phone: string | null; school: string | null; institution_id: string | null }; cases: Case[] };
type School = { id: string; name: string; city: string; state: string };

const PRE_KEY = "reach-screen-pre";
const STATUS: Record<string, { label: string; line: string }> = {
  draft: { label: "Not sent yet", line: "Finish your screening and send it to EFF." },
  submitted: { label: "With EFF", line: "A person at EFF is reading your case. We'll email you." },
  reviewing: { label: "Being reviewed", line: "EFF is working on your case now." },
  need_info: { label: "EFF needs one more thing", line: "Read the note below, then add what we asked for." },
  plan_sent: { label: "Your plan is ready", line: "Read your plan below. Write back anytime." },
  closed: { label: "Closed", line: "This case is closed. You can start a new screening anytime." },
};
const read = (): A => { try { return JSON.parse(localStorage.getItem(PRE_KEY) || "{}"); } catch { return {}; } };
const keep = (a: A) => { try { localStorage.setItem(PRE_KEY, JSON.stringify(a)); } catch { /* private mode */ } };
const visible = (qs: Q[], a: A) => qs.filter((q) => !q.show || q.show(a));

export default function Screening() {
  const [stage, setStage] = useState<"intro" | "pre" | "result" | "signin" | "full" | "case">("intro");
  const [pre, setPre] = useState<A>({});
  const [step, setStep] = useState(0);
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const p = readPass(); if (!p) { setMe(null); return null; }
    try { const m = await call<Me>("eff_bal_me", { p_token: p.token }); setMe(m); return m; }
    catch (e) { if (e instanceof SignedOut) setMe(null); return null; }
  }, []);
  useEffect(() => {
    setPre(read());
    load().then((m) => { if (m?.cases.some((c) => c.status !== "draft")) setStage("case"); });
  }, [load]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [stage, step]);

  const qs = visible(PRE, pre);
  const set = (k: string, v: unknown) => { const n = { ...pre, [k]: v }; setPre(n); keep(n); };
  const route = routeFor(pre);

  return (
    <main className="sc bs">
      <SiteTop on="/screening" />
      <div className="sc-wrap bs-wrap">
        {stage === "intro" ? (
          <section className="bs-intro">
            <span className="sc-kick"><span className="dot" aria-hidden="true" />REACH Balance Screening · free</span>
            <h1>Got a balance? <em>Let&rsquo;s look at it together.</em></h1>
            <p>If a balance, a hold or a bill is standing between you and your classes, start here. First a two-minute pre-screening with no documents. You get your first moves right away. Then, if you want, a full screening: you send us your details and screenshots, and a person at EFF reviews your whole case and writes you a plan.</p>
            <div className="bs-promise">
              <div><b>We&rsquo;re not your school&rsquo;s financial aid office.</b><span>We can&rsquo;t change your aid or promise money. We read your case like an aid advisor would and help you find every option.</span></div>
              <div><b>We never ask for your SSN, FSA ID or passwords.</b><span>Not ours, not your school&rsquo;s. If anyone asks, it isn&rsquo;t us.</span></div>
              <div><b>Free, always.</b><span>Nobody should ever charge you to help with your aid.</span></div>
            </div>
            <div className="sc-acts"><button className="sc-btn coral" onClick={() => { setStep(0); setStage("pre"); }}>{Object.keys(pre).length ? "Continue my pre-screening" : "Start my pre-screening"}</button>
              {me?.cases.length ? <button className="sc-btn ghost" onClick={() => setStage("case")}>My screenings</button> : null}</div>
            <p className="sc-small">In danger or thinking about hurting yourself? Call or text <a href="tel:988">988</a>, or call <a href="tel:911">911</a>.</p>
          </section>
        ) : null}

        {stage === "pre" ? (() => {
          const q = qs[Math.min(step, qs.length - 1)];
          const last = step >= qs.length - 1;
          return (
            <section className="bs-card">
              <div className="bs-bar" aria-hidden="true"><i style={{ width: `${((step + 1) / qs.length) * 100}%` }} /></div>
              <small className="bs-count">Pre-screening · {step + 1} of {qs.length}</small>
              <Field q={q} a={pre} set={set} big />
              <div className="bs-nav">
                <button className="sc-btn ghost" onClick={() => (step ? setStep(step - 1) : setStage("intro"))}>← Back</button>
                <button className="sc-btn coral" onClick={() => { if (last) { set("route", route); setStage("result"); } else setStep(step + 1); }}>{last ? "See my next moves" : "Next →"}</button>
              </div>
              <p className="sc-small">Not sure? Skip it. &ldquo;I don&rsquo;t know&rdquo; is a real answer.</p>
            </section>
          );
        })() : null}

        {stage === "result" ? (
          <section className="bs-card">
            <span className={`bs-route r-${route}`}>{ROUTE_LABEL[route]}</span>
            <h2>{route === "urgent" ? "This is urgent. Let's move fast." : route === "campus" ? "Your campus may cover this." : route === "self" ? "Start with these. They often fix it." : "You need a person on this. Let's open your case."}</h2>
            {(Array.isArray(pre.today) ? (pre.today as string[]) : []).includes("safety") ? (
              <div className="bs-alert"><b>Your safety comes first.</b> Call or text <a href="tel:988">988</a> any time, or call <a href="tel:911">911</a> if you&rsquo;re in danger.</div>) : null}
            {(Array.isArray(pre.today) ? (pre.today as string[]) : []).some((x) => ["housing", "food", "utilities"].includes(x)) ? (
              <div className="bs-alert soft">For housing, food or a shutoff today, open <Link href="/emergency">REACH Emergency</Link> or call <a href="tel:211">211</a> while we work on the balance.</div>) : null}
            <h3>Your moves, in order</h3>
            <ol className="bs-moves">{movesFor(pre).map((m) => <li key={m}>{m}</li>)}</ol>
            <div className="bs-next">
              <h3>Want EFF to review your whole case?</h3>
              <p>Open your full screening. You&rsquo;ll tell us more and add screenshots of your balance, your aid and your hold. A person at EFF reads everything and writes you a plan. It takes about 10 minutes.</p>
              <div className="sc-acts"><button className="sc-btn coral" onClick={() => setStage(readPass() ? "full" : "signin")}>Open my full screening</button>
                <button className="sc-btn ghost" onClick={() => { setStep(0); setStage("pre"); }}>Change my answers</button></div>
            </div>
          </section>
        ) : null}

        {stage === "signin" ? <SignIn onIn={async () => { await load(); setStage("full"); }} startCode={startCode} title={<>Sign in to open <em>your case.</em></>} /> : null}

        {stage === "full" ? <Full pre={pre} me={me} reload={load} done={() => { setStage("case"); }} back={() => setStage("result")} setErr={setErr} /> : null}

        {stage === "case" ? <Cases me={me} reload={load} startNew={() => { setStep(0); setStage("intro"); }} addMore={() => setStage("full")} /> : null}
        {err ? <p className="bs-err">{err}</p> : null}
      </div>
      <SiteFoot />
    </main>
  );
}

function Field({ q, a, set, big }: { q: Q; a: A; set: (k: string, v: unknown) => void; big?: boolean }) {
  const v = a[q.key];
  const arr = Array.isArray(v) ? (v as string[]) : [];
  return (
    <div className={`bs-q${big ? " big" : ""}`}>
      <label className="bs-label" htmlFor={`q-${q.key}`}>{q.label}</label>
      {q.help ? <small className="bs-help">{q.help}</small> : null}
      {q.kind === "one" ? <div className="bs-opts" role="radiogroup">{q.opts!.map((o) => (
        <button type="button" key={o.v} role="radio" aria-checked={v === o.v} className={v === o.v ? "on" : ""} onClick={() => set(q.key, v === o.v ? null : o.v)}>{o.l}</button>))}</div>
      : q.kind === "many" ? <div className="bs-opts">{q.opts!.map((o) => (
        <button type="button" key={o.v} aria-pressed={arr.includes(o.v)} className={arr.includes(o.v) ? "on" : ""} onClick={() => set(q.key, arr.includes(o.v) ? arr.filter((x) => x !== o.v) : o.v === "none" || o.v === "nothing" ? [o.v] : [...arr.filter((x) => x !== "none" && x !== "nothing"), o.v])}>{o.l}</button>))}</div>
      : q.kind === "school" ? <SchoolPick a={a} set={set} />
      : q.kind === "long" ? <textarea id={`q-${q.key}`} rows={4} value={String(v ?? "")} onChange={(e) => set(q.key, e.target.value)} maxLength={4000} />
      : <input id={`q-${q.key}`} type={q.kind === "date" ? "date" : q.kind === "number" || q.kind === "money" ? "number" : "text"} inputMode={q.kind === "money" || q.kind === "number" ? "decimal" : undefined}
          min={q.kind === "money" || q.kind === "number" ? 0 : undefined} value={String(v ?? "")} onChange={(e) => set(q.key, e.target.value)} maxLength={200} />}
    </div>
  );
}

function SchoolPick({ a, set }: { a: A; set: (k: string, v: unknown) => void }) {
  const [q, setQ] = useState(String(a.school || ""));
  const [list, setList] = useState<School[]>([]);
  useEffect(() => {
    if (q.length < 2 || q === a.school) { setList([]); return; }
    const t = setTimeout(() => rpc<School[]>("eff_search_institutions", { p_query: q, p_limit: 6 }).then(setList).catch(() => setList([])), 220);
    return () => clearTimeout(t);
  }, [q, a.school]);
  return (
    <div className="bs-school">
      <input id="q-school" value={q} placeholder="Start typing your college" onChange={(e) => { setQ(e.target.value); set("school", e.target.value); set("institution_id", null); }} autoComplete="off" />
      {list.length ? <ul>{list.map((s) => <li key={s.id}><button type="button" onClick={() => { setQ(s.name); set("school", s.name); set("institution_id", s.id); setList([]); }}>{s.name}<small>{s.city}, {s.state}</small></button></li>)}</ul> : null}
    </div>
  );
}

function Full({ pre, me, reload, done, back, setErr }: { pre: A; me: Me | null; reload: () => Promise<Me | null>; done: () => void; back: () => void; setErr: (s: string) => void }) {
  const p = readPass();
  const draft = me?.cases.find((c) => c.status === "draft" || c.status === "need_info");
  const [c, setC] = useState<Case | null>(draft || null);
  const [a, setA] = useState<A>(() => ({ name: [me?.account.first_name, me?.account.last_name].filter(Boolean).join(" "), phone: me?.account.phone || "", ...(draft?.full || {}) }));
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const pages = [...FULL.map((s) => s.title), "Your documents", "Send it"];
  const save = useCallback(async (submit = false) => {
    if (!p) return null;
    const out = await call<Case>("eff_bal_save", { p_token: p.token, p: { id: c?.id || null, pre: { ...pre, route: routeFor(pre) }, full: { ...a, school: a.school || pre.school, institution_id: pre.institution_id }, submit } });
    setC(out); return out;
  }, [p, c?.id, pre, a]);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; if (!c) save().catch((e) => setErr(e.message)); } }, [c, save, setErr]);
  const go = async (n: number) => { setMsg(""); try { await save(); setI(n); window.scrollTo({ top: 0 }); } catch (e) { setMsg(e instanceof Error ? e.message : "That didn't save."); } };
  const set = (k: string, v: unknown) => setA((x) => ({ ...x, [k]: v }));
  if (!p) return <p>Sign in first.</p>;

  return (
    <section className="bs-card">
      <div className="bs-steps">{pages.map((t, n) => <button key={t} className={n === i ? "on" : n < i ? "done" : ""} onClick={() => go(n)}>{n + 1}. {t}</button>)}</div>
      {c ? <small className="bs-count">Screening {c.case_no} · saved as you go</small> : null}
      {c?.status === "need_info" && c.reply_note ? <div className="bs-alert soft"><b>EFF asked:</b> {c.reply_note}</div> : null}
      {i < FULL.length ? (
        <>
          <h2>{FULL[i].title}</h2>
          {FULL[i].qs.map((q) => <Field key={q.key} q={q} a={a} set={set} />)}
        </>
      ) : i === FULL.length ? (
        <Docs c={c} token={p.token} onC={setC} a={a} set={set} />
      ) : (
        <>
          <h2>Before you send</h2>
          <label className="bs-tick"><input type="checkbox" checked={!!a.ok_not_aid} onChange={(e) => set("ok_not_aid", e.target.checked)} /> I understand EFF is not my school&rsquo;s financial aid office. EFF can&rsquo;t change my aid or promise money. EFF reviews my case and helps me find options.</label>
          <label className="bs-tick"><input type="checkbox" checked={!!a.ok_no_secrets} onChange={(e) => set("ok_no_secrets", e.target.checked)} /> I didn&rsquo;t share my Social Security number, FSA ID or any password, and I covered them on my screenshots.</label>
          <label className="bs-tick"><input type="checkbox" checked={!!a.ok_true} onChange={(e) => set("ok_true", e.target.checked)} /> What I shared is true to the best of my knowledge, and EFF may contact me about it.</label>
          {msg ? <p className="bs-err">{msg}</p> : null}
          <button className="sc-btn coral" disabled={busy} onClick={async () => { setBusy(true); setMsg(""); try { await save(true); await reload(); done(); } catch (e) { setMsg(e instanceof Error ? e.message : "It didn't send."); } setBusy(false); }}>{busy ? "Sending…" : "Send my screening to EFF"}</button>
        </>
      )}
      {msg && i < pages.length - 1 ? <p className="bs-err">{msg}</p> : null}
      <div className="bs-nav">
        <button className="sc-btn ghost" onClick={() => (i ? go(i - 1) : back())}>← Back</button>
        {i < pages.length - 1 ? <button className="sc-btn coral" onClick={() => go(i + 1)}>Next →</button> : null}
      </div>
    </section>
  );
}

function Docs({ c, token, onC, a, set }: { c: Case | null; token: string; onC: (c: Case) => void; a: A; set: (k: string, v: unknown) => void }) {
  const [kind, setKind] = useState("statement");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const add = async (f: File | undefined) => {
    if (!f || !c) return; setBusy(true); setMsg("");
    try {
      const r = await fetch(`${MYEFF}/api/reach/case-upload`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, case: c.id, kind, name: f.name, type: f.type || "image/jpeg", size: f.size }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      const put = await fetch(d.url, { method: "PUT", headers: { "Content-Type": f.type || "image/jpeg", "x-upsert": "true" }, body: f });
      if (!put.ok) throw new Error("The upload didn't finish. Check your connection and try again.");
      onC(await call<Case>("eff_bal_doc_attach", { p_token: token, p_case: c.id, p_kind: kind, p_path: d.path, p_name: f.name }));
    } catch (e) { setMsg(e instanceof Error ? e.message : "That didn't upload."); }
    setBusy(false);
  };
  return (
    <>
      <h2>Your documents</h2>
      <p>Screenshots from your phone are perfect. The more we can see, the better we can help. <b>Cover your Social Security number, birthday and full ID numbers first.</b></p>
      <ul className="bs-doclist">{DOCS.map((d) => <li key={d.v} className={c?.docs.some((x) => x.kind === d.v) ? "have" : ""}>{d.l}</li>)}</ul>
      <div className="bs-up">
        <label className="sc-field"><span>What is it?</span><select value={kind} onChange={(e) => setKind(e.target.value)}>{DOCS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}</select></label>
        <label className={`sc-btn${busy ? " ghost" : ""}`}>{busy ? "Uploading…" : "Add a screenshot or PDF"}<input type="file" accept="image/*,application/pdf" hidden disabled={busy} onChange={(e) => { add(e.target.files?.[0]); e.target.value = ""; }} /></label>
      </div>
      {msg ? <p className="bs-err">{msg}</p> : null}
      {c?.docs.length ? <ul className="bs-have">{c.docs.map((d) => <li key={d.id}>✓ {DOCS.find((x) => x.v === d.kind)?.l || d.kind} <small>{d.name}</small>
        {c.status === "draft" || c.status === "need_info" ? <button onClick={async () => onC(await call<Case>("eff_bal_doc_remove", { p_token: token, p_case: c.id, p_doc: d.id }))}>Remove</button> : null}</li>)}</ul> : null}
      <label className="bs-tick"><input type="checkbox" checked={!!a.no_docs} onChange={(e) => set("no_docs", e.target.checked)} /> I can&rsquo;t get to my documents right now. I&rsquo;ll send them when EFF asks.</label>
    </>
  );
}

function Cases({ me, reload, startNew, addMore }: { me: Me | null; reload: () => Promise<Me | null>; startNew: () => void; addMore: () => void }) {
  const p = readPass();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const sent = (me?.cases || []).filter((c) => c.status !== "draft");
  if (!me) return <SignIn onIn={reload} startCode={startCode} title={<>See <em>your screening.</em></>} />;
  return (
    <section className="bs-cases">
      <h1>My screenings</h1>
      {sent.map((c) => (
        <article key={c.id} className="bs-card">
          <small className="bs-count">{c.case_no} · sent {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""}</small>
          <h2>{STATUS[c.status]?.label || c.status}</h2>
          <p>{STATUS[c.status]?.line}</p>
          {c.reply_note ? <div className="bs-plan"><h3>From EFF</h3><p>{c.reply_note}</p>{c.plan_steps?.length ? <ol>{c.plan_steps.map((s, i) => <li key={i}>{s}</li>)}</ol> : null}</div> : null}
          {c.status === "need_info" ? <button className="sc-btn coral" onClick={addMore}>Add what EFF asked for</button> : null}
          {c.status !== "closed" && p ? (
            <div className="bs-write">
              <label className="sc-field"><span>Write to EFF about this case</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="An update, a question, what your school said…" /></label>
              <button className="sc-btn" disabled={busy || note.trim().length < 5} onClick={async () => { setBusy(true); setMsg(""); try { await call("eff_bal_message", { p_token: p.token, p_case: c.id, p_note: note }); setNote(""); setMsg("Sent. EFF will read it."); await reload(); } catch (e) { setMsg(e instanceof Error ? e.message : "It didn't send."); } setBusy(false); }}>Send</button>
              {msg ? <p className="sc-small">{msg}</p> : null}
            </div>) : null}
        </article>
      ))}
      <div className="sc-acts"><button className="sc-btn ghost" onClick={startNew}>Start a new screening</button></div>
    </section>
  );
}
