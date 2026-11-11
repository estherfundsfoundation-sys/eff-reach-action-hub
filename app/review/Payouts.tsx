"use client";

import { useCallback, useEffect, useState } from "react";
import { rpc } from "../scholarships/lib";

/* Awards & payouts (Shayna, 11 Nov 2026: "a section on reach internal with reviews where we keep track of how much money we
   have given and who so our team can see it and i can check that i paid them out"). Everyone on the program's committee sees
   the fund, every award and whether it has been paid. Only EFF National admins tick "paid" (eff_review_payout_mark), which
   also writes the money-out line in Budget & books. Nothing is erased: a payment is undone with a reason. */

type Pay = { id: string; amount_cents: number; method: string; payee: string; reference: string | null; paid_on: string; note: string | null };
type Award = { id: string; number: string; name: string | null; school: string | null; store: string | null; email: string | null; award_cents: number; paid_cents: number; decided_at: string | null; decided_by: string; payments: Pay[] };
type Data = { program: { key: string; name: string }; can_pay: boolean; fund_cents: number | null; awarded_cents: number; paid_cents: number; declined: number; waiting: number; awards: Award[] };

const money = (c: number | null | undefined) => `$${((c || 0) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const day = (s: string | null) => (s ? new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }) : "");
const METHODS: [string, string][] = [["gift_card", "Gift card"], ["zelle", "Zelle"], ["card", "Card"], ["check", "Check"], ["bank_transfer", "Bank transfer"], ["other", "Other"]];

export default function Payouts({ pass, program, back, say }: { pass: string; program: string; back: () => void; say: (m: string, bad?: boolean) => void }) {
  const [d, setD] = useState<Data | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ payee: "", method: "gift_card", reference: "", note: "", tell: true });

  const load = useCallback(() => {
    rpc<Data>("eff_review_payouts", { p_token: pass, p_program: program }, 0).then(setD).catch((e) => say(e instanceof Error ? e.message : "That didn't load.", true));
  }, [pass, program, say]);
  useEffect(load, [load]);

  if (!d) return <p className="tiny">Loading…</p>;
  const left = d.fund_cents != null ? d.fund_cents - d.awarded_cents : null;
  const owed = d.awarded_cents - d.paid_cents;

  function start(a: Award) {
    setOpen(open === a.id ? null : a.id);
    setF({ payee: a.store ? `${a.store} gift card` : "Grocery gift card", method: "gift_card", reference: "", note: "", tell: true });
  }
  async function mark(a: Award) {
    setBusy(true);
    try {
      await rpc("eff_review_payout_mark", { p_token: pass, p_id: a.id, p: { payee_name: f.payee, method: f.method, reference: f.reference, note: f.note, payee_kind: "student", tell_student: f.tell } }, 0);
      if (f.tell) fetch("https://my.estherfundsfoundation.org/api/email/flush", { mode: "no-cors" }).catch(() => {});
      say(`${a.name || a.number} is marked paid.`); setOpen(null); load();
    } catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
    setBusy(false);
  }
  async function undo(p: Pay) {
    const why = window.prompt("Why are you taking this payment back? (10+ characters)");
    if (!why) return;
    try { await rpc("eff_review_payout_undo", { p_token: pass, p_payment: p.id, p_reason: why }, 0); say("Payment taken back."); load(); }
    catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
  }
  function sheet() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Number", "Name", "School", "Store", "Awarded", "Paid", "Paid on", "How", "Reference", "Decided by", "Decided"],
      ...d!.awards.map((a) => [a.number, a.name, a.school, a.store, a.award_cents / 100, a.paid_cents / 100, a.payments.map((p) => p.paid_on).join("; "),
        a.payments.map((p) => p.payee).join("; "), a.payments.map((p) => p.reference || "").join("; "), a.decided_by, day(a.decided_at)])];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
    const u = URL.createObjectURL(blob); const l = document.createElement("a"); l.href = u; l.download = `${d!.program.key}-awards.csv`; l.click(); URL.revokeObjectURL(u);
  }

  return (
    <>
      <button className="btn o sm" onClick={back}>← {d.program.name}</button>
      <h1>Awards &amp; payouts</h1>
      <p className="sub">{d.program.name}. Everyone on the committee sees this page.{d.can_pay ? " You can mark awards paid." : " EFF National marks awards paid."}</p>
      <div className="rv-money">
        {d.fund_cents != null ? <div><span className="tiny">In the fund</span><b>{money(d.fund_cents)}</b></div> : null}
        <div><span className="tiny">Awarded</span><b>{money(d.awarded_cents)}</b><span className="tiny">{d.awards.length} student{d.awards.length === 1 ? "" : "s"}</span></div>
        <div><span className="tiny">Paid out</span><b>{money(d.paid_cents)}</b><span className="tiny">{d.awards.filter((a) => a.paid_cents >= a.award_cents).length} paid</span></div>
        <div className={owed > 0 ? "due" : ""}><span className="tiny">Still to pay</span><b>{money(owed)}</b></div>
        {left != null ? <div><span className="tiny">Left to award</span><b>{money(left)}</b></div> : null}
      </div>
      <p className="tiny">{d.waiting} still waiting · {d.declined} not selected</p>
      <h2>Who we awarded ({d.awards.length})</h2>
      {!d.awards.length ? <p className="tiny">Nobody has been awarded yet. Awards show here the moment they&rsquo;re made.</p> : (
        <div className="rv-list">
          {d.awards.map((a) => {
            const paid = a.paid_cents >= a.award_cents;
            return (
              <div key={a.id} className="rv-payrow">
                <div className="rv-payhead">
                  <span><b>{a.name || a.number}</b> <span className="tiny">{a.number}{a.school ? ` · ${a.school}` : ""}{a.store ? ` · wants ${a.store}` : ""}</span>
                    <span className="tiny" style={{ display: "block" }}>Awarded {day(a.decided_at)} by {a.decided_by}{a.email ? ` · ${a.email}` : ""}</span></span>
                  <span className="rv-tags">
                    <span className="rv-pill">{money(a.award_cents)}</span>
                    {paid ? <span className="rv-pill ok">✓ paid {day(a.payments[a.payments.length - 1]?.paid_on || null)}</span> : <span className="rv-pill soon">not paid yet</span>}
                    {d.can_pay && !paid ? <button className="btn p sm" onClick={() => start(a)}>{open === a.id ? "Close" : "Mark paid"}</button> : null}
                  </span>
                </div>
                {a.payments.map((p) => (
                  <p key={p.id} className="tiny" style={{ margin: "4px 0 0" }}>{money(p.amount_cents)} · {p.payee} · {day(p.paid_on)}{p.reference ? ` · ${p.reference}` : ""}{p.note ? ` · ${p.note}` : ""}
                    {d.can_pay ? <> · <button className="rv-link" onClick={() => undo(p)}>Undo</button></> : null}</p>
                ))}
                {open === a.id ? (
                  <div className="rv-payform">
                    <input className="ffield" placeholder="What was sent (e.g. Walmart gift card)" value={f.payee} onChange={(e) => setF({ ...f, payee: e.target.value })} />
                    <select className="ffield" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })} aria-label="How it was paid">{METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                    <input className="ffield" placeholder="Order or confirmation number (optional)" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} />
                    <input className="ffield" placeholder="Note for the team (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
                    <label className="rv-check"><input type="checkbox" checked={f.tell} onChange={(e) => setF({ ...f, tell: e.target.checked })} /> Email the student that it was sent</label>
                    {f.tell ? <p className="tiny">They&rsquo;ll read: &ldquo;EFF sent your {money(a.award_cents - a.paid_cents)} {f.payee || "…"} for the {d.program.name}. Keep this email. If it hasn&rsquo;t reached you in a few days, reply and we&rsquo;ll check on it.&rdquo;</p> : null}
                    <button className="btn p sm" disabled={busy || f.payee.trim().length < 2} onClick={() => mark(a)}>Yes, I paid {money(a.award_cents - a.paid_cents)}</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      {d.awards.length ? <p><button className="btn o sm" onClick={sheet}>Download sheet</button></p> : null}
    </>
  );
}
