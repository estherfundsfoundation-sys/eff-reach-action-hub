"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { call, readPass, writePass, startCode, SignedOut, STATUS_WORDS, type Me, type Program } from "../myreach/pass";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { SignIn } from "./SignIn";

/* My REACH: sign in (email + code), then your applications, what's open, and your details. */
const LEVELS = ["High school", "Community college", "Undergraduate", "Graduate", "Trade school"];

export default function Account() {
  const [me, setMe] = useState<Me | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [ready, setReady] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  async function load() {
    const p = readPass();
    call<Program[]>("eff_reach_programs", {}).then(setPrograms).catch(() => null);
    if (!p) { setMe(null); setReady(true); return; }
    try {
      const m = await call<Me>("eff_reach_me", { p_token: p.token });
      setMe(m);
      if (!m.profile.first_name) { setEdit(true); setForm({}); }
    } catch (e) { if (e instanceof SignedOut) setMe(null); }
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function saveProfile(f: Record<string, string>) {
    const p = readPass(); if (!p) return;
    if (!f.first_name?.trim()) { setMsg("Add your first name."); return; }
    try { setMe(await call<Me>("eff_reach_save_profile", { p_token: p.token, p: f })); setEdit(false); setMsg(""); }
    catch (e) { setMsg(e instanceof Error ? e.message : "That didn't save."); }
  }

  const open = programs.filter((p) => p.open);
  const name = me?.profile.preferred_name || me?.profile.first_name;

  return (
    <main className="sc">
      <SiteTop on="/account" />
      <div className="sc-wrap sc-section">
        {!ready ? <p className="sc-small" style={{ padding: 40 }}>Loading…</p> : !me ? (
          <SignIn onIn={load} startCode={startCode} />
        ) : (
          <>
            <section className="sc-hero" style={{ paddingBottom: 12 }}>
              <span className="sc-kick"><span className="dot" aria-hidden="true" />My REACH · {me.email}</span>
              <h1>{name ? <>Hey, <em>{name}.</em></> : <>Welcome to <em>REACH.</em></>}</h1>
              <p>Your applications to EFF, and what&rsquo;s open right now. Everything here is private to you and EFF National.</p>
            </section>

            {edit ? (
              <section className="sc-box">
                <h2>{me.profile.first_name ? "Your details" : "Tell EFF who you are"}</h2>
                <p className="sc-small" style={{ marginTop: 0 }}>Used on your applications. Nothing here is public.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[["first_name", "First name"], ["last_name", "Last name"], ["preferred_name", "Name you go by (optional)"], ["phone", "Phone (optional)"], ["school", "School"], ["grad_year", "Graduation year"], ["state", "State (2 letters)"]].map(([k, l]) => (
                    <label key={k} className="sc-field"><span>{l}</span><input value={form[k] ?? String((me.profile as Record<string, unknown>)[k] ?? "")} onChange={(e) => setForm({ ...form, [k]: e.target.value })} inputMode={k === "grad_year" ? "numeric" : k === "phone" ? "tel" : undefined} maxLength={k === "state" ? 2 : 160} /></label>
                  ))}
                  <label className="sc-field"><span>Where you are in school</span><select value={form.level ?? me.profile.level ?? ""} onChange={(e) => setForm({ ...form, level: e.target.value })}><option value="">Pick one</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
                </div>
                {msg ? <p style={{ color: "#b3123a", fontWeight: 600 }}>{msg}</p> : null}
                <div className="sc-acts" style={{ marginTop: 10 }}>
                  <button className="sc-btn" onClick={() => saveProfile({ ...Object.fromEntries(Object.entries(me.profile).map(([k, v]) => [k, v == null ? "" : String(v)])), ...form })}>Save</button>
                  {me.profile.first_name ? <button className="sc-btn ghost sm" onClick={() => setEdit(false)}>Cancel</button> : null}
                </div>
              </section>
            ) : null}

            <h2 className="sc-h2">Your applications</h2>
            {!me.applications.length ? (
              <div className="sc-empty"><p>No applications yet. {open.length ? "Something is open right now:" : "When EFF opens a scholarship or funding, it shows up below."} </p></div>
            ) : (
              <div className="sc-grid">
                {me.applications.map((a) => {
                  const w = STATUS_WORDS[a.status] || STATUS_WORDS.draft;
                  return (
                    <article className="sc-card" key={a.id}>
                      <span className={`sc-due${w.tone === "hot" ? " hot" : ""}`} style={w.tone === "win" ? { background: "#e2f6ec", color: "#1f6b46" } : undefined}>{w.label}</span>
                      <h3 style={{ margin: 0 }}><Link href={`/apply/${a.program}`}>{a.program_name}</Link></h3>
                      <p className="sc-by">{a.number}{a.cycle ? ` · ${a.cycle}` : ""}</p>
                      <p style={{ margin: 0, fontSize: 15 }}>{w.line}</p>
                      {a.more_info ? <p className="sc-note" style={{ margin: 0 }}><b>EFF asked:</b> {a.more_info}</p> : null}
                      {a.decision_note ? <p className="sc-note" style={{ margin: 0 }}>{a.decision_note}</p> : null}
                      {a.status === "awarded" && a.award_amount ? <div className="sc-amt">${Number(a.award_amount).toLocaleString()}</div> : null}
                      {["draft", "more_info"].includes(a.status) ? <Link className="sc-btn sm" style={{ position: "relative", zIndex: 2, alignSelf: "flex-start" }} href={`/apply/${a.program}`}>{a.status === "draft" ? "Finish it" : "Add what's needed"}</Link> : null}
                    </article>
                  );
                })}
              </div>
            )}

            <h2 className="sc-h2">Open now</h2>
            {open.length ? (
              <div className="sc-grid">
                {open.map((p) => (
                  <article className="sc-card" key={p.key}>
                    <span className="sc-due hot">{p.rolling ? "Open: apply anytime" : p.closes_at ? `Closes ${new Date(p.closes_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Open"}</span>
                    {p.amount ? <div className="sc-amt">{p.amount}</div> : null}
                    <h3><Link href={`/apply/${p.key}`}>{p.name}</Link></h3>
                    <p className="sc-by">{p.summary}</p>
                  </article>
                ))}
              </div>
            ) : <div className="sc-empty"><p>Nothing from EFF is open right now. We&rsquo;ll show it here the day it opens. Meanwhile, <Link href="/scholarships/match">thousands of other scholarships</Link> are.</p></div>}

            <div className="sc-acts" style={{ marginTop: 26 }}>
              {!edit ? <button className="sc-btn ghost sm" onClick={() => { setForm({}); setEdit(true); }}>Edit my details</button> : null}
              <Link className="sc-btn ghost sm" href="/scholarships/saved">My saved scholarships</Link>
              <button className="sc-btn ghost sm" onClick={async () => { const p = readPass(); if (p) await call("eff_reach_sign_out", { p_token: p.token }).catch(() => null); writePass(null); setMe(null); }}>Sign out</button>
            </div>
            {!me.is_member ? <p className="sc-note">Want more than applications? <a href="https://my.estherfundsfoundation.org/join">Join EFF</a> for a chapter, training and a national community of students who finish.</p> : null}
          </>
        )}
      </div>
      <SiteFoot />
    </main>
  );
}
