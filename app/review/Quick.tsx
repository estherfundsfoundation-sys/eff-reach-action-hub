"use client";

import { useMemo, useState } from "react";
import { rpc } from "../scholarships/lib";
import type { App, Board } from "./Review";

/* Quick check (Shayna, 11 Nov 2026: "build so i can get this done"). The committee's fast lane: one application on the
   screen, a few boxes to tick, then Yes / Not sure / No, and the next one opens by itself. A check is advice, not a
   decision: it shows the decider what the committee thinks in Review many at once (eff_review_check). When the decider has
   shared the applications out (eff_review_split), a reviewer sees only their own share. */

const MYEFF = "https://my.estherfundsfoundation.org";
const fullName = (a: App) => [a.answers?.first_name, a.answers?.last_name].filter(Boolean).join(" ") || a.name || a.number;
const SKIP = /name|email|phone|address|student_id|birth|dob|confirm|agree|consent|signature/i;
const TICKS: Record<string, [string, string][]> = {
  emergency: [["enrolled", "Enrolled, and an undergraduate"], ["proof", "The bill or proof is real and readable"], ["vendor", "A company, landlord or school is named to pay"], ["amount", "The amount asked matches the proof"]],
  other: [["eligible", "They meet the requirements"], ["complete", "Nothing is missing"], ["need", "The need is clear from their answers"], ["honest", "The answers agree with each other"]],
};

export default function Quick({ pass, board, back, say }: { pass: string; board: Board; back: () => void; say: (m: string, bad?: boolean) => void }) {
  const p = board.program;
  const ticks = TICKS[p.kind === "emergency" ? "emergency" : "other"];
  const queue = useMemo(() => {
    const open = board.applications.filter((a) => ["submitted", "reviewing"].includes(a.status) && !a.my_check);
    const mine = open.filter((a) => a.assigned_me);
    return (mine.length ? mine : open.filter((a) => !a.assigned_to)).sort((x, y) => (y.auto_score ?? -1) - (x.auto_score ?? -1));
  }, [board.applications]);
  const [i, setI] = useState(0);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const a = queue[i];
  const facts = useMemo(() => p.questions.filter((x) => x.kind !== "long" && x.kind !== "text" && !SKIP.test(x.key)), [p.questions]);
  const longs = useMemo(() => p.questions.filter((x) => x.kind === "long"), [p.questions]);

  async function file(key: string) {
    try {
      const r = await fetch(`${MYEFF}/api/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pass, action: "file", id: a.id, key }) });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error(j.error || "That file didn't open.");
      window.open(j.url, "_blank", "noopener");
    } catch (e) { say(e instanceof Error ? e.message : "That file didn't open.", true); }
  }
  async function send(verdict: "yes" | "unsure" | "no") {
    if (verdict !== "yes" && note.trim().length < 5) { say("Add a few words on why, so the person deciding knows.", true); return; }
    setBusy(true);
    try {
      await rpc("eff_review_check", { p_token: pass, p_id: a.id, p_verdict: verdict, p_checks: on, p_note: note }, 0);
      setDone(done + 1); setOn({}); setNote(""); setI(i + 1); window.scrollTo({ top: 0 });
    } catch (e) { say(e instanceof Error ? e.message : "That didn't save.", true); }
    setBusy(false);
  }

  if (!a) return (
    <>
      <button className="btn o sm" onClick={back}>← {p.name}</button>
      <h1>{done ? "All done. Thank you." : "Nothing waiting for you."}</h1>
      <p className="sub">{done ? `You checked ${done} application${done === 1 ? "" : "s"}. The person deciding sees your answers right away.` : "Every application here has been checked, or is with another reviewer."}</p>
    </>
  );
  const story = longs.map((x) => (a.answers?.[x.key] ? String(a.answers[x.key]) : "")).filter(Boolean);
  return (
    <div className="rv-quick">
      <button className="btn o sm" onClick={back}>← {p.name}</button>
      <p className="tiny" style={{ margin: "10px 0 4px" }}>Quick check · {i + 1} of {queue.length}</p>
      <div className="rv-qbar"><i style={{ width: `${(i / queue.length) * 100}%` }} /></div>
      <h1 style={{ marginBottom: 2 }}>{fullName(a)}</h1>
      <p className="tiny">{a.number}{a.school ? ` · ${a.school}` : ""}{a.auto_score != null ? ` · automatic score ${a.auto_score}` : ""}</p>
      {a.auto_flags?.length ? a.auto_flags.map((f) => <p key={f} className="tiny rv-flag">⚑ {f}</p>) : null}
      <div className="rv-facts">{facts.map((x) => { const v = a.answers?.[x.key]; const s = Array.isArray(v) ? v.join(", ") : v == null || v === "" ? "" : String(v); return s ? <span key={x.key} title={x.label}><i>{x.label.length > 44 ? `${x.label.slice(0, 42)}…` : x.label}</i> {s}</span> : null; })}</div>
      {story.length ? <p className="rv-story open">{story.join("\n\n")}</p> : null}
      {a.documents.length ? <p>{a.documents.map((f) => <button key={f.key} className="btn o sm" style={{ marginRight: 6 }} onClick={() => file(f.key)}>Open {p.documents.find((x) => x.key === f.key)?.label || f.name}</button>)}</p> : null}
      <div className="rv-qticks">
        {ticks.map(([k, l]) => <label key={k} className="rv-check"><input type="checkbox" checked={!!on[k]} onChange={(e) => setOn({ ...on, [k]: e.target.checked })} /> {l}</label>)}
      </div>
      <input className="ffield" placeholder="A few words for the person deciding (needed for Not sure and No)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="rv-qgo">
        <button className="btn p" disabled={busy} onClick={() => send("yes")}>Yes, help this student</button>
        <button className="btn o" disabled={busy} onClick={() => send("unsure")}>Not sure</button>
        <button className="btn o" disabled={busy} onClick={() => send("no")}>No</button>
        <button className="rv-link" disabled={busy} onClick={() => { setOn({}); setNote(""); setI(i + 1); }}>Skip for now</button>
      </div>
      <p className="tiny">Your answer is advice. It doesn&rsquo;t email the student or decide anything.</p>
    </div>
  );
}
