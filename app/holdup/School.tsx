"use client";

import { useEffect, useState } from "react";
import { usd } from "./parse";

/* HOLD UP's school pieces (26 Oct 2026). The Purge Clock reads only deadlines National has opened
   the source for (eff_campus_deadlines_public, MyEFF). The fee ledger is opt-in: she ticks a box and
   only fee names and amounts, her school and the term go to MyEFF (eff_campus_fees_share). Never her
   name, email, balance or aid. */

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

export type School = { id: string; name: string; city?: string | null; state?: string | null };
export type Deadline = { term: string; kind: string; date: string; threshold_cents: number | null; amount_cents: number | null; note: string | null; source_url: string; verified_at: string | null };
export type Fee = { name: string; typical_cents: number; shares: number };
export type CampusInfo = { school: string; deadlines: Deadline[]; fees: Fee[] };

export const DEADLINE_LABEL: Record<string, string> = {
  payment_due: "Payment due",
  late_fee: "Late fee charged",
  purge: "Dropped for non-payment",
  registration_opens: "Registration opens",
  insurance_waiver: "Health insurance waiver due",
};

export const fmtDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });

export function useCampus(school: School | null) {
  const [info, setInfo] = useState<CampusInfo | null>(null);
  useEffect(() => {
    if (!school) { setInfo(null); return; }
    let on = true;
    rpc<CampusInfo>("eff_campus_deadlines_public", { p_institution: school.id }).then((d) => { if (on) setInfo(d); }).catch(() => { if (on) setInfo(null); });
    return () => { on = false; };
  }, [school]);
  return [info, setInfo] as const;
}

export function SchoolPick({ school, onPick }: { school: School | null; onPick: (s: School | null) => void }) {
  const [q, setQ] = useState(school?.name || "");
  const [list, setList] = useState<School[]>([]);
  useEffect(() => {
    if (school && q === school.name) { setList([]); return; }
    const v = q.trim();
    if (v.length < 2) { setList([]); return; }
    const t = setTimeout(() => rpc<School[]>("eff_search_institutions", { p_query: v, p_limit: 6 }).then(setList).catch(() => setList([])), 220);
    return () => clearTimeout(t);
  }, [q, school]);
  return (
    <div className="hu-school">
      <label className="hu-label" htmlFor="hu-school">Your school <small>(optional)</small></label>
      <div className="hu-due">
        <input id="hu-school" className="hu-in" value={q} placeholder="Start typing your school" autoComplete="off"
          onChange={(e) => { setQ(e.target.value); if (school) onPick(null); }} />
        {school ? <button type="button" className="hu-link" onClick={() => { onPick(null); setQ(""); }}>Change</button> : null}
      </div>
      {list.length ? (
        <ul className="hu-pick" role="listbox">
          {list.map((s) => (
            <li key={s.id}><button type="button" onClick={() => { onPick(s); setQ(s.name); setList([]); }}>
              {s.name}{s.city ? <span> · {s.city}{s.state ? `, ${s.state}` : ""}</span> : null}
            </button></li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function SchoolFees({ info, has, add }: { info: CampusInfo | null; has: (label: string) => boolean; add: (label: string, amount: number) => void }) {
  if (!info?.fees?.length) return null;
  return (
    <div className="hu-miss">
      <h3>Students at {info.school} also often pay…</h3>
      <p className="hu-sub">Shared by other students at your school, names left out. Add any that aren&rsquo;t on your bill yet, then fix the amount.</p>
      <div className="hu-chips">
        {info.fees.map((f) => (
          <button key={f.name} type="button" className={`hu-chip${has(f.name) ? " on" : ""}`} disabled={has(f.name)}
            title={`Usually about ${usd(f.typical_cents / 100)} (${f.shares} students)`} onClick={() => add(f.name, f.typical_cents / 100)}>
            {has(f.name) ? "✓ " : "+ "}{f.name} <small>~{usd(f.typical_cents / 100)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SchoolDeadlines({ info, due, setDue, onAll }: { info: CampusInfo | null; due: string; setDue: (d: string) => void; onAll: (d: Deadline[]) => void }) {
  if (!info) return null;
  if (!info.deadlines.length) {
    return <p className="hu-sub">EFF hasn&rsquo;t checked {info.school}&rsquo;s deadlines yet. Type yours in from your school&rsquo;s academic calendar or bursar page.</p>;
  }
  return (
    <div className="hu-dl">
      <p className="hu-sub"><b>{info.school}&rsquo;s deadlines</b>, checked by EFF against the school&rsquo;s own page. Always confirm on that page; dates can change.</p>
      <ul>
        {info.deadlines.map((d, i) => (
          <li key={`${d.kind}-${d.date}-${i}`} className={d.kind === "purge" ? "hot" : ""}>
            <div>
              <b>{DEADLINE_LABEL[d.kind] || d.kind}</b> · {d.term}
              <span>{fmtDay(d.date)}{d.amount_cents ? ` · ${usd(d.amount_cents / 100)}` : ""}{d.threshold_cents ? ` · balances over ${usd(d.threshold_cents / 100)}` : ""}</span>
              {d.note ? <small>{d.note}</small> : null}
              <a href={d.source_url} target="_blank" rel="noopener noreferrer">Your school&rsquo;s page ↗</a>
            </div>
            {d.kind === "payment_due" || d.kind === "purge" ? (
              <button type="button" className={`sc-btn ghost sm${due === d.date ? " on" : ""}`} onClick={() => setDue(d.date)}>{due === d.date ? "Using this ✓" : "Use this date"}</button>
            ) : null}
          </li>
        ))}
      </ul>
      <button type="button" className="sc-btn ghost sm" onClick={() => onAll(info.deadlines)}>Add all of them to my calendar</button>
    </div>
  );
}

function terms(): string[] {
  const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
  const list = m >= 7 ? [`Fall ${y}`, `Spring ${y + 1}`, `Summer ${y + 1}`, `Fall ${y + 1}`] : [`Spring ${y}`, `Summer ${y}`, `Fall ${y}`, `Spring ${y + 1}`];
  return list;
}

export function ShareFees({ school, lines, onShared }: { school: School | null; lines: { label: string; amount: number }[]; onShared: (fees: Fee[]) => void }) {
  const opts = terms();
  const [term, setTerm] = useState(opts[0]);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const fees = lines.filter((l) => l.label.trim() && l.amount >= 1);
  if (!fees.length) return null;
  async function share() {
    if (!school) return;
    setBusy(true); setErr("");
    try {
      const r = await rpc<{ shared: number; fees: Fee[] }>("eff_campus_fees_share", {
        p_institution: school.id, p_term: term, p_lines: fees.map((f) => ({ name: f.label.trim().slice(0, 80), amount: Math.round(f.amount * 100) / 100 })),
      });
      setDone(r.shared); onShared(r.fees || []);
    } catch (e) { setErr(e instanceof Error ? e.message : "That didn't go through."); }
    setBusy(false);
  }
  return (
    <div className="hu-card hu-share">
      <h3>Help the next student at your school</h3>
      {done !== null ? (
        <p>Thank you. {done} fee {done === 1 ? "line was" : "lines were"} shared, with no name attached. The next student at your school will see what to expect.</p>
      ) : (
        <>
          <p className="hu-sub">Share only your school&rsquo;s fee names and amounts, for example &ldquo;Technology Fee, $387&rdquo;. Never your name, email, balance or aid. Once three students share the same fee, HOLD UP shows it to others at your school.</p>
          {!school ? <p className="hu-sub"><b>Pick your school above first.</b></p> : null}
          <div className="hu-due">
            <select className="hu-in" aria-label="Term" value={term} onChange={(e) => setTerm(e.target.value)}>
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <label className="hu-tick">
            <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
            <span>Share my school&rsquo;s fee lines ({fees.length}), not my name.</span>
          </label>
          <details className="hu-tip"><summary>Exactly what gets sent</summary>
            <ul>{fees.map((f, i) => <li key={i}>{f.label.trim()}: {usd(f.amount)}</li>)}</ul>
            <p className="hu-sub">Plus {school ? school.name : "your school"} and {term}. Lines that look like aid, payments or ID numbers are left out by EFF.</p>
          </details>
          {err ? <p className="hu-note" role="alert">{err}</p> : null}
          <button type="button" className="sc-btn" disabled={!ok || !school || busy} onClick={share}>{busy ? "Sharing…" : "Share fee lines"}</button>
        </>
      )}
    </div>
  );
}
