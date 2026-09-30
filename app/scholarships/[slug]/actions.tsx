"use client";

import { useState } from "react";
import { downloadIcs, rpc, type Card } from "../lib";

export function CalendarButton({ item }: { item: Pick<Card, "slug" | "title" | "sponsor" | "deadline"> }) {
  return <button type="button" className="sc-btn ghost" onClick={() => downloadIcs([item], `${item.slug}.ics`)}>Add to my calendar</button>;
}

const REASONS = [
  { v: "broken_link", label: "The link is broken" },
  { v: "expired", label: "It's already closed" },
  { v: "incorrect_information", label: "Something's wrong (amount, date…)" },
  { v: "suspicious", label: "It asks for money or looks like a scam" },
  { v: "other", label: "Something else" },
];

export function ReportProblem({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("broken_link");
  const [detail, setDetail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  if (state === "done") return <p className="sc-note">Thank you. EFF will check it. If it looks like a scam, don&rsquo;t send anything.</p>;
  if (!open) return <button type="button" className="sc-btn ghost sm" onClick={() => setOpen(true)}>Something wrong with this one?</button>;
  return (
    <form className="sc-box" onSubmit={async (e) => {
      e.preventDefault(); setState("busy");
      try { await rpc("eff_scholarship_report", { p_slug: slug, p_reason: reason, p_detail: detail || null, p_website: hp || null }); setState("done"); }
      catch { setState("error"); }
    }}>
      <h2>Tell EFF what&rsquo;s wrong</h2>
      <label className="sc-field">What happened<select value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}</select></label>
      <label className="sc-field" style={{ marginTop: 10 }}>More detail (optional)<textarea value={detail} maxLength={600} onChange={(e) => setDetail(e.target.value)} placeholder="Don't include your name or contact details." /></label>
      <label style={{ position: "absolute", left: -9999 }} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
      {state === "error" ? <p style={{ color: "#b3123a", fontWeight: 600 }}>That didn&rsquo;t send. Try again in a moment.</p> : null}
      <div className="sc-acts" style={{ marginTop: 12 }}>
        <button className="sc-btn sm" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send"}</button>
        <button type="button" className="sc-btn ghost sm" onClick={() => setOpen(false)}>Never mind</button>
      </div>
    </form>
  );
}
