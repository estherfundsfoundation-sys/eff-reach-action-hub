"use client";

import { useState } from "react";
import { call, writePass } from "../myreach/pass";

/* Sign in or make an account: one screen, no password. */
export function SignIn({ onIn, startCode, title }: { onIn: () => void; startCode: (email: string, website?: string) => Promise<{ session: string; returning: boolean }>; title?: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [session, setSession] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try { const r = await startCode(email.trim(), hp); setSession(r.session); }
    catch (x) { setErr(x instanceof Error ? x.message : "The code didn't send."); }
    setBusy(false);
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await call<{ token: string; email: string }>("eff_reach_code_verify", { p_session: session, p_code: code });
      writePass({ token: r.token, email: r.email }); onIn();
    } catch (x) { setErr(x instanceof Error ? x.message : "That didn't work."); }
    setBusy(false);
  }

  return (
    <section className="sc-hero" style={{ maxWidth: 640 }}>
      <span className="sc-kick"><span className="dot" aria-hidden="true" />My REACH · no password needed</span>
      <h1>{title || <>Your seat is <em>saved.</em></>}</h1>
      <p>Sign in with your email to apply for EFF scholarships and funding and follow every application. New here? The same two steps make your account.</p>
      {!session ? (
        <form onSubmit={send} className="sc-box" style={{ position: "relative" }}>
          <label className="sc-field"><span>Your email</span><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" /></label>
          <label style={{ position: "absolute", left: -9999 }} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
          {err ? <p style={{ color: "#b3123a", fontWeight: 600 }}>{err}</p> : null}
          <div className="sc-acts" style={{ marginTop: 12 }}><button className="sc-btn coral" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button></div>
          <p className="sc-small" style={{ marginBottom: 0 }}>Use an email you check. A REACH account is free, separate from EFF membership, and EFF never charges you to apply.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="sc-box">
          <p style={{ marginTop: 0 }}>We sent a 6-digit code to <b>{email}</b>. It works for 15 minutes. Check spam if it&rsquo;s not there.</p>
          <label className="sc-field"><span>Code</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={7} required value={code} onChange={(e) => setCode(e.target.value)} style={{ fontSize: 28, letterSpacing: ".3em", fontWeight: 800 }} /></label>
          {err ? <p style={{ color: "#b3123a", fontWeight: 600 }}>{err}</p> : null}
          <div className="sc-acts" style={{ marginTop: 12 }}>
            <button className="sc-btn coral" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
            <button type="button" className="sc-btn ghost sm" onClick={() => { setSession(null); setCode(""); }}>Use a different email</button>
          </div>
        </form>
      )}
    </section>
  );
}
