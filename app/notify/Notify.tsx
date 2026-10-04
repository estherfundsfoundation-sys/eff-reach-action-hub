"use client";

/* REACH alerts (4 Oct 2026, Shayna: "students [can] create account and be notified via email when eff emergency
   grant opens and future scholarships for 2027"). The link for the graphic: reach.estherfundsfoundation.org/notify.
   Pick what to hear about, type an email, type the 6-digit code: that makes the My REACH account
   (eff_reach_code_verify) and saves the alerts (eff_reach_alerts_set, which emails "You're on the list.").
   When National opens a program in MyEFF, everyone who asked gets one email (eff_program_alert_trg).
   ?stop=<code> from any of those emails turns them off (eff_reach_alert_stop). Nothing else is stored. */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { call, readPass, startCode, writePass, MYEFF, SignedOut } from "../myreach/pass";
import { SiteTop, SiteFoot } from "../myreach/ui";

type Alerts = { emergency: boolean; scholarships: boolean; since?: string };
type Got = { email: string; alerts: Alerts; open: Array<{ key: string; name: string; kind: string }> };

const knock = () => { try { fetch(`${MYEFF}/api/email/flush`, { method: "POST", mode: "no-cors", keepalive: true }).catch(() => {}); } catch { /* offline */ } };

export default function Notify() {
  const q = useSearchParams();
  const stop = q.get("stop");
  const [emergency, setEmergency] = useState(true);
  const [scholarships, setScholarships] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [session, setSession] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [me, setMe] = useState<Got | null>(null);
  const [done, setDone] = useState(false);
  const [stopped, setStopped] = useState<"" | "ok" | "bad">("");

  const load = useCallback(async () => {
    const p = readPass(); if (!p) { setMe(null); return; }
    try {
      const g = await call<Got>("eff_reach_alerts_get", { p_token: p.token });
      setMe(g);
      if (g.alerts.emergency || g.alerts.scholarships) { setEmergency(g.alerts.emergency); setScholarships(g.alerts.scholarships); setDone(true); }
    } catch (e) { if (e instanceof SignedOut) setMe(null); }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!stop) return;
    call("eff_reach_alert_stop", { p_code: stop }).then(() => { setStopped("ok"); setDone(false); setEmergency(false); setScholarships(false); }).catch(() => setStopped("bad"));
  }, [stop]);

  async function save(token: string) {
    const a = await call<Alerts>("eff_reach_alerts_set", { p_token: token, p_emergency: emergency, p_scholarships: scholarships, p_first_name: name.trim() || null });
    knock();
    setDone(a.emergency || a.scholarships);
    await load();
    if (a.emergency || a.scholarships) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!emergency && !scholarships) { setErr("Pick at least one thing to hear about."); return; }
    setBusy(true);
    try { const r = await startCode(email.trim(), hp); setSession(r.session); }
    catch (x) { setErr(x instanceof Error ? x.message : "The code didn't send."); }
    setBusy(false);
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await call<{ token: string; email: string }>("eff_reach_code_verify", { p_session: session, p_code: code });
      writePass({ token: r.token, email: r.email });
      await save(r.token);
    } catch (x) { setErr(x instanceof Error ? x.message : "That didn't work."); }
    setBusy(false);
  }
  async function update() {
    const p = readPass(); if (!p) return;
    setErr(""); setBusy(true);
    try { await save(p.token); } catch (x) { setErr(x instanceof Error ? x.message : "That didn't save."); }
    setBusy(false);
  }

  const signedIn = Boolean(me);
  const both = emergency && scholarships;

  return (
    <div className="sc nt">
      <SiteTop />

      {/* the moment */}
      <section className="nt-stage" aria-labelledby="nt-title">
        <div className="nt-glow" aria-hidden="true" />
        <div className="nt-env" aria-hidden="true">
          <div className="nt-env-back" />
          <div className="nt-letter"><b>It&rsquo;s open.</b><span>Apply now &rarr;</span></div>
          <div className="nt-env-front" />
          <div className="nt-env-flap" />
          <div className="nt-ping" />
        </div>
        <div className="sc-wrap nt-copy">
          <span className="nt-kick">REACH alerts · free · no password</span>
          {done ? (
            <>
              <h1 id="nt-title" className="nt-h">You&rsquo;re on <em>the list.</em></h1>
              <p className="nt-sub">
                We&rsquo;ll email <b>{me?.email || email}</b> the day {both ? "the EFF Emergency Grant opens, and the day each of EFF’s 2027 scholarships opens" : emergency ? "the EFF Emergency Grant opens" : "each of EFF’s 2027 scholarships opens"}. One email, with the link to apply. Nothing else.
              </p>
            </>
          ) : (
            <>
              <h1 id="nt-title" className="nt-h">Be first <em>to know.</em></h1>
              <p className="nt-sub">The <b>EFF Emergency Grant</b> and EFF&rsquo;s <b>2027 scholarships</b> are coming. Make a free REACH account and we&rsquo;ll email you the day they open.</p>
              <a className="sc-btn coral nt-jump" href="#nt-form">Notify me</a>
            </>
          )}
        </div>
      </section>

      <main className="sc-wrap nt-main">
        {stopped === "ok" ? <p className="nt-note" role="status">Done. You won&rsquo;t get REACH alerts any more. Changed your mind? Turn them back on below.</p> : null}
        {stopped === "bad" ? <p className="nt-note bad" role="status">That stop link didn&rsquo;t work. Sign in below and switch your alerts off here.</p> : null}

        <form id="nt-form" className="nt-card" onSubmit={signedIn ? (e) => { e.preventDefault(); update(); } : session ? verify : sendCode}>
          <h2>{signedIn ? "Your alerts" : "What should we tell you about?"}</h2>
          <div className="nt-picks">
            <label className={`nt-pick${emergency ? " on" : ""}`}>
              <input type="checkbox" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} />
              <span className="nt-ico" aria-hidden="true">
                <svg viewBox="0 0 48 48"><path d="M24 41s-15-8.6-15-20a8.5 8.5 0 0 1 15-5.5A8.5 8.5 0 0 1 39 21c0 11.4-15 20-15 20Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><path d="M14 24h6l2.5-5 4 10 2.5-5h5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span><b>The EFF Emergency Grant</b><small>Help when a sudden cost could stop your education.</small></span>
              <span className="nt-tick" aria-hidden="true" />
            </label>
            <label className={`nt-pick${scholarships ? " on" : ""}`}>
              <input type="checkbox" checked={scholarships} onChange={(e) => setScholarships(e.target.checked)} />
              <span className="nt-ico" aria-hidden="true">
                <svg viewBox="0 0 48 48"><path d="M4 18 24 9l20 9-20 9Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><path d="M12 22v9c0 3 5.4 6 12 6s12-3 12-6v-9M44 18v11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
              </span>
              <span><b>EFF&rsquo;s 2027 scholarships</b><small>Every EFF scholarship, the day each one opens.</small></span>
              <span className="nt-tick" aria-hidden="true" />
            </label>
          </div>

          {signedIn ? (
            <>
              <p className="sc-small">Signed in as <b>{me!.email}</b>.</p>
              {err ? <p className="nt-err">{err}</p> : null}
              <div className="sc-acts">
                <button className="sc-btn coral" disabled={busy}>{busy ? "Saving…" : !emergency && !scholarships ? "Turn off my alerts" : done ? "Save changes" : "Notify me"}</button>
                <Link className="sc-btn ghost sm" href="/account">My REACH</Link>
              </div>
            </>
          ) : !session ? (
            <>
              <div className="nt-row">
                <label className="sc-field"><span>First name (optional)</span><input autoComplete="given-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></label>
                <label className="sc-field"><span>Your email</span><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" /></label>
              </div>
              <label style={{ position: "absolute", left: -9999 }} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
              {err ? <p className="nt-err">{err}</p> : null}
              <div className="sc-acts"><button className="sc-btn coral" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button></div>
              <p className="sc-small">We&rsquo;ll send a 6-digit code to prove it&rsquo;s you. That makes your free REACH account, which you&rsquo;ll use to apply. It isn&rsquo;t EFF membership, and EFF never charges you to apply.</p>
            </>
          ) : (
            <>
              <p>We sent a 6-digit code to <b>{email}</b>. It works for 15 minutes. Check spam if it&rsquo;s not there.</p>
              <label className="sc-field"><span>Code</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={7} required autoFocus value={code} onChange={(e) => setCode(e.target.value)} className="nt-code" /></label>
              {err ? <p className="nt-err">{err}</p> : null}
              <div className="sc-acts">
                <button className="sc-btn coral" disabled={busy}>{busy ? "Checking…" : "Notify me"}</button>
                <button type="button" className="sc-btn ghost sm" onClick={() => { setSession(null); setCode(""); }}>Use a different email</button>
              </div>
            </>
          )}
        </form>

        {me?.open?.length ? (
          <section className="nt-card nt-open">
            <h2>Open right now</h2>
            {me.open.map((p) => <p key={p.key}><Link href={`/apply/${p.key}`}><b>{p.name}</b> &rarr; apply</Link></p>)}
          </section>
        ) : null}

        <section className="nt-while">
          <h2>While you wait</h2>
          <div className="nt-doors">
            <Link href="/scholarships"><b>Scholarships open now</b><span>Thousands from across the country, sorted by deadline.</span></Link>
            <Link href="/get-help"><b>Need help today?</b><span>Food, rent, a hold on your account: help near your campus.</span></Link>
            <Link href="/apply"><b>Every EFF program</b><span>What EFF offers and when each one opens.</span></Link>
          </div>
          <p className="sc-small">In crisis? Call or text <a href="tel:988">988</a>. In danger, call 911.</p>
        </section>
      </main>
      <SiteFoot />
    </div>
  );
}
