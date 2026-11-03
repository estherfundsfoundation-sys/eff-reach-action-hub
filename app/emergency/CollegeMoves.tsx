"use client";

import { useEffect, useState } from "react";
import { rpc } from "../scholarships/lib";

/* REACH Emergency, stronger (3 Nov 2026, Shayna): her college's own moves from its EFF college guide (the dossier), in
   order of how fast they help: tonight, then money in days, then everything else. She ticks steps off as she goes; that
   is kept only on her phone (localStorage reach-em-done). A fund the college says is closed is labelled closed. */
export type DItem = {
  id: string; title: string; office: string | null; summary: string | null; eligibility: string | null; amount_text: string | null; amount_max: number | null;
  steps: string[]; turnaround: string | null; deadline_text: string | null; college_wording: string | null; form_url: string | null;
  contact: { phone?: string; email?: string; location?: string; hours?: string }; source_url: string; last_verified_at: string | null; rechecking: boolean;
};
export type Dossier = { unitid: number; name: string; researched_at: string | null; sections: Array<{ key: string; label: string; items: DItem[]; move: string | null }> };

const SPEED: Record<string, string> = {
  friday_night: "Tonight", emergency_money: "Money, often within days", holds_balances: "Keep your classes", food: "Food", basic_needs: "Basic needs",
  housing_emergencies: "A place to stay", financial_aid: "Your aid, looked at again", health_mind: "Your health and mind", life_logistics: "Getting around and life",
  academic_survival: "Your classes",
};
const closedRe = /\b(closed|unavailable|not (currently )?accept|no longer accept|paused)\b/i;
// Rough days-to-decision from the college's own wording, to put the fastest money first.
function days(t: string | null) {
  if (!t) return 99;
  const s = t.toLowerCase();
  if (/same day|hour|on the spot|immediately/.test(s)) return 0;
  const m = s.match(/(\d+)\s*(?:to|–|-)?\s*(\d+)?\s*(business |working )?(day|week)/);
  if (m) { const n = Number(m[2] || m[1]); return /week/.test(m[4]) ? n * 7 : n; }
  return 50;
}
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const checked = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null);

export function CollegeMoves({ d }: { d: Dossier }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem("reach-em-done") || "{}")); } catch { /* private window */ } }, []);
  const toggle = (id: string) => setDone((x) => { const n = { ...x, [id]: !x[id] }; try { localStorage.setItem("reach-em-done", JSON.stringify(n)); } catch { /* ignore */ } return n; });
  return (
    <div className="em-col">
      <p className="em-col-kick">From EFF&rsquo;s guide to {d.name}{d.researched_at ? `, read on the college's own pages ${checked(d.researched_at)}` : ""}</p>
      {d.sections.map((s) => {
        const items = s.key === "emergency_money" ? [...s.items].sort((a, b) => Number(closedRe.test(a.summary || "")) - Number(closedRe.test(b.summary || "")) || days(a.turnaround) - days(b.turnaround)) : s.items;
        return (
          <div key={s.key} className="em-col-sec">
            <h4 className="em-col-h">{SPEED[s.key] || s.label}</h4>
            {items.length ? items.map((it) => {
              const closed = closedRe.test(`${it.summary || ""} ${it.title}`);
              return (
                <article key={it.id} className={`em-card em-col-card${done[it.id] ? " done" : ""}${closed ? " closed" : ""}`}>
                  <div className="em-tags">
                    {closed ? <span className="em-tag hot">The college says this is closed right now</span> : null}
                    {it.turnaround ? <span className="em-tag">{it.turnaround}</span> : null}
                    {it.amount_text ? <span className="em-tag">{it.amount_text}</span> : null}
                    {it.rechecking ? <span className="em-tag">Being re-checked</span> : null}
                  </div>
                  <h4>{it.title}</h4>
                  {it.summary ? <p>{it.summary}</p> : null}
                  {it.steps?.length ? <ol className="em-col-steps">{it.steps.map((x, i) => <li key={i}>{x}</li>)}</ol> : null}
                  {it.college_wording ? <blockquote className="em-col-q">&ldquo;{it.college_wording}&rdquo;</blockquote> : null}
                  <div className="em-acts">
                    {it.contact?.phone ? <a className="sc-btn sm" href={`tel:${it.contact.phone.replace(/[^0-9+]/g, "")}`}>{it.contact.phone}</a> : null}
                    {it.form_url ? <a className="sc-btn sm" href={it.form_url} target="_blank" rel="noopener noreferrer">Open the form ↗</a> : null}
                    <a className="sc-btn sm ghost" href={it.source_url} target="_blank" rel="noopener noreferrer">Their page ↗</a>
                    <button type="button" className={`sc-btn sm ${done[it.id] ? "" : "ghost"}`} onClick={() => toggle(it.id)}>{done[it.id] ? "✓ Done" : "Mark done"}</button>
                  </div>
                  <p className="em-col-src">Source: {host(it.source_url)}{it.last_verified_at ? ` · last checked ${checked(it.last_verified_at)}` : ""}</p>
                </article>
              );
            }) : <p className="em-col-move"><b>Not published — here&rsquo;s the move:</b> {s.move}</p>}
          </div>
        );
      })}
      <p className="em-sub"><a href={`/my-college/${d.unitid}`}>Everything EFF found at {d.name} →</a></p>
    </div>
  );
}

export function EmailPlan({ needs, institution, state }: { needs: string[]; institution: string | null; state: string | null }) {
  const [email, setEmail] = useState("");
  const [checkin, setCheckin] = useState(true);
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function send(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      await rpc("eff_emergency_plan_send", { p_email: email, p_needs: needs, p_institution: institution, p_state: state, p_checkin: checkin, p_website: trap });
      setMsg(checkin ? "Sent. Check your inbox (and spam). We'll check in with you in two days." : "Sent. Check your inbox (and spam).");
    } catch (x) { setMsg(x instanceof Error ? x.message : "That didn't send. Try again."); }
    finally { setBusy(false); }
  }
  return (
    <form className="em-mail" onSubmit={send}>
      <b>Email me this plan</b>
      <div className="em-mail-row">
        <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Your email" />
        <button className="sc-btn sm" disabled={busy}>{busy ? "Sending…" : "Send it"}</button>
      </div>
      <label className="em-mail-chk"><input type="checkbox" checked={checkin} onChange={(e) => setCheckin(e.target.checked)} /> Check in with me in 2 days to see if it worked</label>
      <input className="em-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} aria-hidden="true" />
      {msg ? <p className="em-sub" role="status">{msg}</p> : <p className="em-sub">EFF keeps your email only until the check-in goes out.</p>}
    </form>
  );
}
