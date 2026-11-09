"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { App, Program, Question } from "../../myreach/pass";

/* The EFF Emergency Grant, one small screen at a time (after Beam's emergency-aid flow:
   bybeam.co). The questions and their keys are the program's own (eff_programs.questions);
   this only groups them into steps, so National can still edit the questions. A question
   whose key is not in a group lands in "Anything else". Nothing here saves on its own:
   Apply.tsx autosaves every change and sends through eff_reach_application_submit. */

const GROUPS: Array<{ key: string; title: string; line: string; keys: string[] }> = [
  { key: "you", title: "Can you apply?", line: "Two quick questions first.", keys: ["us_enrolled", "undergrad"] },
  { key: "school", title: "Your school", line: "So we know where you are.", keys: ["school", "state", "enrollment"] },
  { key: "what", title: "What happened", line: "In your own words. A few sentences is enough.", keys: ["category", "what_happened", "school_impact"] },
  { key: "bill", title: "The bill", line: "EFF pays the bill itself, never cash to you, so you don't have to front it.", keys: ["amount", "due_date", "pay_to", "vendor_name", "vendor_contact", "account_ref"] },
  { key: "proof", title: "Proof", line: "A phone photo or a screenshot is fine.", keys: [] },
  { key: "aid", title: "Money you've already tried", line: "So we know what's left. A parent's PLUS denial can open more federal loan money in your name: reach.estherfundsfoundation.org/aid-moves#plus-denied", keys: ["parent_plus", "plus_unsub", "tried"] },
  { key: "more", title: "Anything else", line: "Optional, but it helps us help you.", keys: ["anything_else"] },
  { key: "send", title: "Check it and send", line: "Read it over once. Then it's on its way to a real person at EFF.", keys: ["truth"] },
];

type Props = {
  prog: Program; app: App | null; answers: Record<string, unknown>;
  field: (q: Question) => ReactNode; docs: ReactNode; send: () => void;
  sending: boolean; saveState: string; err: string;
};

function filled(q: Question, v: unknown) {
  if (Array.isArray(v)) return v.length > 0;
  return String(v ?? "").trim() !== "";
}

export default function Wizard({ prog, app, answers, field, docs, send, sending, saveState, err }: Props) {
  const qs = prog.questions || [];
  const known = new Set(GROUPS.flatMap((g) => g.keys));
  const steps = GROUPS.map((g) => ({
    ...g,
    qs: g.key === "more" ? [...qs.filter((q) => g.keys.includes(q.key)), ...qs.filter((q) => !known.has(q.key))] : qs.filter((q) => g.keys.includes(q.key)),
  })).filter((g) => g.key === "proof" ? (prog.documents || []).length > 0 : g.qs.length > 0);

  const [i, setI] = useState(0);
  const [warn, setWarn] = useState("");
  useEffect(() => { setWarn(""); }, [i]);

  const step = steps[Math.min(i, steps.length - 1)];
  const docsMissing = (prog.documents || []).filter((d) => d.required && !app?.documents?.find((x) => x.key === d.key));
  const blocked = step.qs.find((q) => q.must && filled(q, answers[q.key]) && String(answers[q.key]) !== q.must);

  function next() {
    const miss = step.qs.filter((q) => q.required && !filled(q, answers[q.key]));
    if (miss.length) { setWarn(`Answer ${miss.length === 1 ? "this one" : "these"} to keep going: ${miss.map((q) => q.label.replace(/\?$/, "")).join("; ")}.`); return; }
    if (step.key === "proof" && docsMissing.length) { setWarn(`Add ${docsMissing.map((d) => d.label.toLowerCase()).join(" and ")} to keep going.`); return; }
    if (blocked) return;
    setI((n) => Math.min(n + 1, steps.length - 1));
    window.scrollTo({ top: document.getElementById("em-wiz")?.offsetTop ? (document.getElementById("em-wiz")!.offsetTop - 80) : 0, behavior: "smooth" });
  }

  const amt = Number(String(answers.amount ?? "").replace(/[^0-9.]/g, ""));
  const over = step.key === "bill" && prog.max_award && amt > Number(prog.max_award);
  const pct = Math.round(((i + 1) / steps.length) * 100);

  return (
    <section className="em-wiz" id="em-wiz" aria-label="Your emergency grant request">
      <div className="em-top">
        <span className="em-count">Step {i + 1} of {steps.length}</span>
        <span className="em-save">{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}</span>
      </div>
      <div className="em-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
      <ol className="em-dots" aria-hidden="true">{steps.map((s, n) => <li key={s.key} className={n < i ? "done" : n === i ? "on" : ""}>{s.title}</li>)}</ol>

      <div className="em-card" key={step.key}>
        <h2>{step.title}</h2>
        <p className="em-line">{step.line}</p>

        {step.key === "proof" ? docs : step.qs.map((q) => (
          <div className="em-q" key={q.key}>
            <label className="sc-field" style={{ color: "var(--i)", fontSize: 17 }}>
              <span style={{ fontWeight: 700 }}>{q.label}{q.required ? "" : <em className="em-opt"> (optional)</em>}</span>
              {q.help ? <span className="sc-small" style={{ fontWeight: 400 }}>{q.help}</span> : null}
              {field(q)}
            </label>
            {q.must && filled(q, answers[q.key]) && String(answers[q.key]) !== q.must ? (
              <div className="ap-must" role="alert">
                {q.must_note || "This grant isn't open to you based on this answer."}
                <div style={{ marginTop: 8, fontWeight: 400 }}>You still have options: <Link href="/emergency">REACH Emergency</Link> builds a plan for what you&rsquo;re facing tonight.</div>
              </div>
            ) : null}
            {q.kind === "long" && q.max ? <p className="sc-small" style={{ margin: "4px 0 0", textAlign: "right" }}>{String(answers[q.key] ?? "").length} / {q.max}</p> : null}
          </div>
        ))}

        {over ? <p className="sc-note">EFF can give up to <b>${Number(prog.max_award).toLocaleString()}</b> right now. You can still ask; if it&rsquo;s more, tell us in &ldquo;Anything else&rdquo; how the rest will be covered.</p> : null}

        {step.key === "send" ? (
          <dl className="em-review">
            {steps.filter((s) => s.key !== "send").map((s, n) => (
              <div key={s.key}>
                <dt>{s.title} <button type="button" className="em-edit" onClick={() => setI(n)}>Edit</button></dt>
                <dd>
                  {s.key === "proof"
                    ? (app?.documents || []).map((d) => d.name).join(", ") || "No files yet"
                    : s.qs.filter((q) => filled(q, answers[q.key])).map((q) => {
                        const v = answers[q.key];
                        const t = Array.isArray(v) ? v.join(", ") : String(v);
                        return <span key={q.key}>{q.key === "amount" ? `$${t}` : t.length > 140 ? t.slice(0, 140) + "…" : t}</span>;
                      })}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {warn ? <p className="sc-note" role="alert" style={{ color: "#b3123a", fontWeight: 600 }}>{warn}</p> : null}
        {err ? <p className="sc-note" role="alert" style={{ color: "#b3123a", fontWeight: 600 }}>{err}</p> : null}

        <div className="em-nav">
          {i > 0 ? <button type="button" className="sc-btn ghost" onClick={() => setI(i - 1)}>Back</button> : <span />}
          {step.key === "send"
            ? <button type="button" className="sc-btn coral em-go" disabled={sending || step.qs.some((q) => q.must && String(answers[q.key] ?? "") !== q.must)} onClick={send}>{sending ? "Sending…" : app?.status === "more_info" ? "Send it again" : "Send my request"}</button>
            : <button type="button" className="sc-btn em-go" disabled={Boolean(blocked)} onClick={next}>Next</button>}
        </div>
      </div>
      <p className="sc-small em-foot">Your answers save as you go. Close this and come back anytime on <Link href="/account">My REACH</Link>.</p>
    </section>
  );
}

/* Where the request is, Beam-style: four stops, lit as it moves. */
export function Tracker({ app, prog, clock }: { app: App; prog: Program; clock: string | null }) {
  const paid = (app.payments || []).length > 0;
  const stop = paid ? 4 : ["awarded", "not_selected"].includes(app.status) ? 3 : ["reviewing", "more_info"].includes(app.status) ? 2 : ["submitted"].includes(app.status) ? 1 : 0;
  const stops = [
    { t: "Sent", s: app.submitted_at ? new Date(app.submitted_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET" : "" },
    { t: app.status === "more_info" ? "EFF needs something" : "Being read", s: app.status === "more_info" ? "Add it below and send again" : "A real person at EFF" },
    { t: app.status === "not_selected" ? "Decided" : "Approved", s: app.status === "not_selected" ? "Not this time" : app.award_amount ? `$${Number(app.award_amount).toLocaleString()}` : prog.turnaround_hours ? `Within ${prog.turnaround_hours} weekday hours` : "" },
    { t: "Paid", s: paid ? `to ${app.payments![0].to}` : "Straight to the bill" },
  ];
  if (stop === 0 || app.status === "withdrawn") return null;
  return (
    <div className="em-track" aria-label="Where your request is">
      <ol>{stops.map((x, n) => (
        <li key={x.t} className={n + 1 < stop ? "done" : n + 1 === stop ? (app.status === "more_info" || app.status === "not_selected" ? "warn" : "on") : ""}>
          <i aria-hidden="true">{n + 1 < stop || (n + 1 === stop && stop === 4) ? "✓" : n + 1}</i><b>{x.t}</b><span>{x.s}</span>
        </li>
      ))}</ol>
      {clock ? <p className="ap-clock">{clock}</p> : null}
    </div>
  );
}

/* While she waits: help that doesn't wait on EFF. Every link is a page that already exists. */
export function WhileYouWait() {
  const M = "https://my.estherfundsfoundation.org";
  const items = [
    { h: "/emergency", t: "REACH Emergency", d: "A step-by-step plan for tonight, with your campus emergency fund first." },
    { h: `${M}/kit/benefits`, t: "Benefits Check", d: "SNAP, Medicaid, phone and internet help you may already qualify for." },
    { h: `${M}/kit/food`, t: "Food tonight", d: "Pantries, meals and grocery help near your campus." },
    { h: "/holdup", t: "HOLD UP", d: "Paste your school bill and see your real balance before a hold." },
    { h: `${M}/lighthouse`, t: "Talk to a person", d: "Ask EFF National for help privately through the Lighthouse." },
  ];
  return (
    <section className="em-wait">
      <h2>While you wait</h2>
      <p className="sc-small" style={{ marginTop: 0 }}>You don&rsquo;t have to sit still. These don&rsquo;t change your request.</p>
      <div className="em-wait-grid">{items.map((x) => <a key={x.t} href={x.h}><b>{x.t}</b><span>{x.d}</span></a>)}</div>
      <p className="sc-small">In danger, or thinking about hurting yourself? Call or text <a href="tel:988">988</a>, or call <a href="tel:911">911</a>.</p>
    </section>
  );
}

/* Before sign-in: are you eligible? Thirty seconds, nothing saved but this tab. */
export function PreCheck({ prog, onPass }: { prog: Program; onPass: (a: Record<string, string>) => void }) {
  const qs = (prog.questions || []).filter((q) => q.must && GROUPS[0].keys.includes(q.key));
  const [a, setA] = useState<Record<string, string>>({});
  const no = qs.find((q) => a[q.key] && a[q.key] !== q.must);
  const done = qs.length > 0 && qs.every((q) => a[q.key] === q.must);
  if (!qs.length) { return null; }
  return (
    <section className="em-pre">
      <span className="em-count">30 seconds</span>
      <h2>First, can you apply?</h2>
      {qs.map((q) => (
        <div className="em-q" key={q.key}>
          <p style={{ fontWeight: 700, margin: "0 0 8px" }}>{q.label}</p>
          <div className="sc-pills">{["Yes", "No"].map((o) => <button type="button" key={o} className={`sc-pill${a[q.key] === o ? " on" : ""}`} aria-pressed={a[q.key] === o} onClick={() => setA({ ...a, [q.key]: o })}>{o}</button>)}</div>
        </div>
      ))}
      {no ? <div className="ap-must" role="alert">{no.must_note || "This grant isn't open to you based on this answer."}<div style={{ marginTop: 8, fontWeight: 400 }}>You still have options: <Link href="/emergency">REACH Emergency</Link> builds a plan for what you&rsquo;re facing.</div></div> : null}
      {done ? <div className="em-nav"><span /><button type="button" className="sc-btn em-go" onClick={() => onPass(a)}>You can apply. Start</button></div> : null}
    </section>
  );
}
