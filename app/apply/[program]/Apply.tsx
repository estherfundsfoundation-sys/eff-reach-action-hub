"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { call, readPass, startCode, upload, SignedOut, STATUS_WORDS, type App, type Me, type Program, type Question } from "../../myreach/pass";
import { SiteTop, SiteFoot } from "../../myreach/ui";
import { SignIn } from "../../account/SignIn";

/* One EFF program: what it is, then the application. Drafts save as you go
   (eff_reach_application_save); documents upload straight to the private bucket;
   Send checks every required answer and file (eff_reach_application_submit). */
export default function Apply({ programKey }: { programKey: string }) {
  const [prog, setProg] = useState<Program | null | undefined>(undefined);
  const [me, setMe] = useState<Me | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [app, setApp] = useState<App | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [state, setState] = useState<"idle" | "saving" | "saved" | "sending">("idle");
  const [err, setErr] = useState("");
  const [upBusy, setUpBusy] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load() {
    const p = await call<Program | null>("eff_reach_program", { p_key: programKey }).catch(() => null);
    setProg(p);
    const pass = readPass();
    if (!pass) { setSignedIn(false); return; }
    try {
      const m = await call<Me>("eff_reach_me", { p_token: pass.token });
      setMe(m); setSignedIn(true);
      const mine = m.applications.find((a) => a.program === programKey && (a.cycle || "") === (p?.cycle || ""));
      if (mine) { setApp(mine); setAnswers(mine.answers || {}); }
    } catch (e) { if (e instanceof SignedOut) setSignedIn(false); }
  }
  useEffect(() => { load(); }, [programKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const editable = !app || ["draft", "more_info"].includes(app.status);

  async function save(next: Record<string, unknown>) {
    const pass = readPass(); if (!pass) return null;
    setState("saving");
    try {
      const a = await call<App>("eff_reach_application_save", { p_token: pass.token, p_program: programKey, p_answers: next });
      setApp((cur) => ({ ...(cur || {}), ...a })); setState("saved"); setErr("");
      return a;
    } catch (e) { setErr(e instanceof Error ? e.message : "That didn't save."); setState("idle"); return null; }
  }
  function change(key: string, value: unknown) {
    const next = { ...answers, [key]: value };
    setAnswers(next); setState("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 900);
  }
  async function attach(key: string, file: File) {
    const pass = readPass(); if (!pass) return;
    setUpBusy(key); setErr("");
    try {
      const a = app?.id ? app : await save(answers);
      if (!a) throw new Error("Save your answers first.");
      const next = await upload(pass.token, a.id, key, file);
      setApp((cur) => ({ ...(cur || {}), ...next }));
    } catch (e) { setErr(e instanceof Error ? e.message : "The upload didn't finish."); }
    setUpBusy("");
  }
  async function removeDoc(key: string) {
    const pass = readPass(); if (!pass || !app) return;
    try { const a = await call<App>("eff_reach_doc_remove", { p_token: pass.token, p_id: app.id, p_key: key }); setApp((cur) => ({ ...(cur || {}), ...a })); }
    catch (e) { setErr(e instanceof Error ? e.message : "That didn't work."); }
  }
  async function send() {
    const pass = readPass(); if (!pass) return;
    setState("sending"); setErr("");
    try {
      if (timer.current) clearTimeout(timer.current);
      const saved = await save(answers);
      if (!saved) { setState("idle"); return; }
      const a = await call<App>("eff_reach_application_submit", { p_token: pass.token, p_id: saved.id });
      setApp((cur) => ({ ...(cur || {}), ...a })); setState("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) { setErr(e instanceof Error ? e.message : "That didn't send."); setState("idle"); }
  }

  const field = (q: Question) => {
    const v = answers[q.key];
    const dis = !editable;
    switch (q.kind) {
      case "long": return <textarea rows={6} maxLength={q.max || 5000} value={String(v ?? "")} disabled={dis} onChange={(e) => change(q.key, e.target.value)} />;
      case "choice": return <select value={String(v ?? "")} disabled={dis} onChange={(e) => change(q.key, e.target.value)}><option value="">Pick one</option>{(q.options || []).map((o) => <option key={o}>{o}</option>)}</select>;
      case "yesno": return <select value={String(v ?? "")} disabled={dis} onChange={(e) => change(q.key, e.target.value)}><option value="">Pick one</option><option>Yes</option><option>No</option></select>;
      case "checkboxes": {
        const arr = Array.isArray(v) ? (v as string[]) : [];
        return <div className="sc-pills">{(q.options || []).map((o) => <button type="button" key={o} disabled={dis} className={`sc-pill${arr.includes(o) ? " on" : ""}`} aria-pressed={arr.includes(o)} onClick={() => change(q.key, arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o])}>{o}</button>)}</div>;
      }
      case "number": return <input inputMode="decimal" value={String(v ?? "")} disabled={dis} onChange={(e) => change(q.key, e.target.value)} />;
      case "date": return <input type="date" value={String(v ?? "")} disabled={dis} onChange={(e) => change(q.key, e.target.value)} />;
      default: return <input value={String(v ?? "")} maxLength={q.max || 300} disabled={dis} onChange={(e) => change(q.key, e.target.value)} />;
    }
  };

  if (prog === undefined) return <main className="sc"><SiteTop on="/apply" /><p className="sc-wrap sc-small" style={{ padding: 40 }}>Loading…</p></main>;
  if (!prog) return <main className="sc"><SiteTop on="/apply" /><div className="sc-wrap sc-section"><div className="sc-empty" style={{ marginTop: 30 }}><h2>That program isn&rsquo;t here.</h2><p><Link href="/apply">See what EFF has open</Link>.</p></div></div><SiteFoot /></main>;

  const w = app ? STATUS_WORDS[app.status] : null;
  return (
    <main className="sc">
      <SiteTop on="/apply" />
      <div className="sc-wrap">
        <article className="sc-detail">
          <Link className="sc-back" href="/apply">← Apply to EFF</Link>
          <div><span className={`sc-due${prog.open ? " hot" : ""}`}>{prog.open ? (prog.rolling ? "Open: apply anytime" : prog.closes_at ? `Closes ${new Date(prog.closes_at).toLocaleString("en-US", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })} ET` : "Open") : "Closed for now"}</span></div>
          <h1>{prog.name}</h1>
          {prog.amount ? <div className="sc-bigamt">{prog.amount}</div> : null}
          <p style={{ fontSize: 18, lineHeight: 1.55 }}>{prog.summary}</p>
          {prog.who ? <p className="sc-chip" style={{ display: "inline-block" }}>{prog.who}</p> : null}
          {prog.audience === "members" ? <p className="sc-note">For EFF members. Sign in with the email you joined EFF with.</p> : null}
          {prog.description ? prog.description.split(/\n\s*\n/).map((para, i) => <p key={i} style={{ lineHeight: 1.6 }}>{para}</p>) : null}

          {app && w ? (
            <section className="sc-box" style={{ borderColor: app.status === "awarded" ? "#1f8a5b" : undefined }}>
              <h2>{w.label} · {app.number}</h2>
              <p style={{ margin: 0 }}>{w.line}</p>
              {app.more_info ? <p className="sc-note"><b>EFF asked:</b> {app.more_info}</p> : null}
              {app.decision_note ? <p className="sc-note">{app.decision_note}</p> : null}
            </section>
          ) : null}

          {!prog.open && !app ? (
            <div className="sc-empty"><p>Applications aren&rsquo;t open right now. {signedIn ? "It will show on My REACH the day it opens." : "Make your free account so you're ready the day it opens."}</p>{!signedIn ? <Link className="sc-btn" href="/account">Make my account</Link> : null}</div>
          ) : signedIn === false ? (
            <SignIn onIn={load} startCode={startCode} title={<>Sign in to <em>apply.</em></>} />
          ) : signedIn && (prog.open || app) ? (
            <form onSubmit={(e) => { e.preventDefault(); send(); }}>
              {!me?.profile.first_name ? <p className="sc-note">Add your name on <Link href="/account">My REACH</Link> so EFF knows who you are.</p> : null}
              {(prog.questions || []).map((q) => (
                <section className="sc-step" key={q.key}>
                  <label className="sc-field" style={{ color: "var(--i)", fontSize: 16 }}>
                    <span style={{ fontWeight: 700 }}>{q.label}{q.required ? " *" : ""}</span>
                    {q.help ? <span className="sc-small" style={{ fontWeight: 400 }}>{q.help}</span> : null}
                    {field(q)}
                  </label>
                  {q.kind === "long" && q.max ? <p className="sc-small" style={{ margin: "4px 0 0", textAlign: "right" }}>{String(answers[q.key] ?? "").length} / {q.max}</p> : null}
                </section>
              ))}
              {(prog.documents || []).length ? (
                <section className="sc-step">
                  <h2>Documents</h2>
                  <p className="sc-small" style={{ marginTop: 0 }}>PDF, photo or Word, up to 10 MB each. Private: only EFF National can open them. Never upload your Social Security card or bank details.</p>
                  {(prog.documents || []).map((d) => {
                    const have = app?.documents?.find((x) => x.key === d.key);
                    return (
                      <div key={d.key} style={{ padding: "12px 0", borderTop: "1px solid var(--b)" }}>
                        <b>{d.label}{d.required ? " *" : ""}</b>{d.help ? <div className="sc-small">{d.help}</div> : null}
                        {have ? <p style={{ margin: "6px 0" }}>✓ {have.name}{editable ? <> · <button type="button" className="sc-link" style={{ background: "none", border: 0, color: "var(--p)", textDecoration: "underline", cursor: "pointer", minHeight: 44 }} onClick={() => removeDoc(d.key)}>Remove</button></> : null}</p> : null}
                        {editable ? (
                          <label className="sc-btn ghost sm" style={{ marginTop: 6 }}>
                            {upBusy === d.key ? "Uploading…" : have ? "Replace file" : "Choose file"}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.doc,.docx,application/pdf,image/*" style={{ display: "none" }} disabled={Boolean(upBusy)} onChange={(e) => { const f = e.target.files?.[0]; if (f) attach(d.key, f); e.target.value = ""; }} />
                          </label>
                        ) : null}
                      </div>
                    );
                  })}
                </section>
              ) : null}
              {err ? <p className="sc-note" style={{ color: "#b3123a", fontWeight: 600 }}>{err}</p> : null}
              {editable ? (
                <div className="sc-acts" style={{ margin: "18px 0 40px" }}>
                  <button className="sc-btn coral" style={{ minHeight: 56, fontSize: 18 }} disabled={state === "sending"}>{state === "sending" ? "Sending…" : app?.status === "more_info" ? "Send it again" : "Send my application"}</button>
                  <span className="sc-small">{state === "saving" ? "Saving…" : state === "saved" ? "Draft saved on My REACH" : app ? "Your draft saves as you type" : ""}</span>
                </div>
              ) : <p className="sc-note">Sent. You can follow it on <Link href="/account">My REACH</Link>.</p>}
            </form>
          ) : null}
        </article>
      </div>
      <SiteFoot />
    </main>
  );
}
