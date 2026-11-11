"use client";

import { useEffect, useMemo, useState } from "react";
import type { App, Board } from "./Review";

/* Review many at once, for deciders (Shayna, 11 Nov 2026: "i need a way of like a mass review through my review account ...
   this one by one takes forever especially since we are emergency aid and we need that 24-48 hour review and response").
   Every waiting application on one screen, strongest automatic score first: the facts as chips, what they wrote, the flags
   in words, and a tick box. One message and one press awards, declines or asks for more from every ticked student through
   the same /api/review "decide" call the single view uses, so the fund, the most-per-student and never-your-own rules still
   hold and each student gets the usual email. Nothing is decided automatically. */

const MYEFF = "https://my.estherfundsfoundation.org";
const money = (c: number | null | undefined) => `$${((c || 0) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const fullName = (a: App) => [a.answers?.first_name, a.answers?.last_name].filter(Boolean).join(" ") || a.name || a.number;
const SKIP = /name|email|phone|address|student_id|birth|dob|confirm|agree|consent|signature/i;
/* Flags that mean "can't be awarded as it stands". */
const HARD = /required document|not enrolled|not an undergraduate|duplicate/i;
const quickKey = (k: string) => `reach-review-quick:${k}`;

type Pile = "all" | "strong" | "check" | "missing" | "ticked";

export default function Mass({ pass, board, quickStart, back, say }: { pass: string; board: Board; quickStart: string; back: (changed: boolean) => void; say: (m: string, bad?: boolean) => void }) {
  const p = board.program;
  const [gone, setGone] = useState<Record<string, string>>({});
  const [tick, setTick] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [pile, setPile] = useState<Pile>("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(40);
  const [mode, setMode] = useState<"" | "award" | "no" | "more">("");
  const [amount, setAmount] = useState(p.max_award_cents ? String(p.max_award_cents / 100) : "");
  const [awardNote, setAwardNote] = useState("");
  const [noNote, setNoNote] = useState(quickStart);
  const [moreNote, setMoreNote] = useState("");
  const [run, setRun] = useState<{ done: number; total: number; failed: string[] } | null>(null);
  const [topN, setTopN] = useState("");
  /* Emergency programs are first complete, first funded (Shayna, 11 Nov 2026), so they open oldest first. */
  const [sort, setSort] = useState<"high" | "low" | "old">(board.program.kind === "emergency" ? "old" : "high");
  const [paid, setPaid] = useState(0);

  useEffect(() => { try { const v = localStorage.getItem(quickKey(p.key)); if (v != null) setNoNote(v); } catch { /* private window */ } }, [p.key]);

  const facts = useMemo(() => p.questions.filter((x) => x.kind !== "long" && x.kind !== "text" && !SKIP.test(x.key)), [p.questions]);
  const longs = useMemo(() => p.questions.filter((x) => x.kind === "long"), [p.questions]);
  const waiting = useMemo(() => board.applications.filter((a) => ["submitted", "reviewing"].includes(a.status) && !gone[a.id]).sort((x, y) => (y.auto_score ?? -1) - (x.auto_score ?? -1)), [board.applications, gone]);
  const kind = (a: App): Pile => (a.auto_flags?.some((f) => HARD.test(f)) ? "missing" : a.auto_flags?.length ? "check" : "strong");
  const counts = useMemo(() => ({ all: waiting.length, strong: waiting.filter((a) => kind(a) === "strong").length, check: waiting.filter((a) => kind(a) === "check").length, missing: waiting.filter((a) => kind(a) === "missing").length }), [waiting]);
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hay = (a: App) => [fullName(a), a.number, a.school, ...Object.values(a.answers || {}).map((v) => (Array.isArray(v) ? v.join(" ") : String(v ?? "")))].join(" ").toLowerCase();
  const order = (x: App, y: App) => sort === "low" ? (x.auto_score ?? -1) - (y.auto_score ?? -1) : sort === "old" ? (x.submitted_at || "").localeCompare(y.submitted_at || "") : 0;
  const list = waiting.filter((a) => (pile === "all" || (pile === "ticked" ? tick[a.id] : kind(a) === pile)) && words.every((w) => hay(a).includes(w))).sort(order);
  /* One press for a whole pile: tick everyone showing and open the decision. Nothing is sent until the confirm in the dock. */
  const whole = (m: "award" | "no" | "more") => { setTick(Object.fromEntries(list.map((a) => [a.id, true]))); setMode(m); };
  const ticked = waiting.filter((a) => tick[a.id]);
  const cents = Math.round((Number(amount.replace(/[^0-9.]/g, "")) || 0) * 100);
  const fundLeft = p.fund_left_cents != null ? p.fund_left_cents - paid : null;
  const over = mode === "award" && fundLeft != null && cents * ticked.length > fundLeft;

  const setMany = (ids: string[], on: boolean) => setTick((t) => { const n = { ...t }; ids.forEach((id) => { if (on) n[id] = true; else delete n[id]; }); return n; });
  function pickTop() {
    const n = Math.max(0, Math.min(200, Number(topN) || 0));
    if (!n) return;
    setTick(Object.fromEntries(waiting.filter((a) => kind(a) === "strong").slice(0, n).map((a) => [a.id, true])));
    setPile("ticked");
  }  /* Lowest automatic scores first, flagged ones included: the pile to look at for "not this time". */
  function pickLow() {
    const n = Math.max(0, Math.min(200, Number(topN) || 0));
    if (!n) return;
    setTick(Object.fromEntries([...waiting].sort((a, b) => (a.auto_score ?? -1) - (b.auto_score ?? -1)).slice(0, n).map((a) => [a.id, true])));
    setPile("ticked");
  }


  async function go() {
    const status = mode === "award" ? "awarded" : mode === "no" ? "not_selected" : "more_info";
    const note = (mode === "award" ? awardNote : mode === "no" ? noNote : moreNote).trim();
    if (mode !== "award" && note.length < 10) { say("Write the message they'll read first (10+ characters).", true); return; }
    if (mode === "award" && cents <= 0) { say("Type the amount each student gets.", true); return; }
    const who = ticked;
    const verb = mode === "award" ? `Award ${money(cents)} each to` : mode === "no" ? "Say not this time to" : "Ask for more from";
    if (!window.confirm(`${verb} ${who.length} student${who.length === 1 ? "" : "s"}? Each one is emailed now.`)) return;
    if (mode === "no") { try { localStorage.setItem(quickKey(p.key), note); } catch { /* private window */ } }
    const failed: string[] = [];
    setRun({ done: 0, total: who.length, failed });
    for (let i = 0; i < who.length; i++) {
      const a = who[i];
      try {
        const r = await fetch(`${MYEFF}/api/review`, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pass, action: "decide", id: a.id, status, note: note || null, amount: mode === "award" ? cents / 100 : null }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "didn't save");
        setGone((g) => ({ ...g, [a.id]: status }));
        if (mode === "award") setPaid((x) => x + cents);
        if (!d.emailed) failed.push(`${fullName(a)}: saved, but the email didn't send`);
      } catch (e) { failed.push(`${fullName(a)}: ${e instanceof Error ? e.message : "didn't save"}`); }
      setRun({ done: i + 1, total: who.length, failed: [...failed] });
    }
    setTick({}); setMode(""); setPile("all");
    say(failed.length ? `Done, with ${failed.length} to look at (listed at the top).` : `Done. ${who.length} student${who.length === 1 ? " was" : "s were"} emailed.`, failed.length > 0);
  }

  const busy = !!run && run.done < run.total;
  const changed = Object.keys(gone).length > 0;

  return (
    <div className="rv-mass">
      <button className="btn o sm" onClick={() => back(changed)}>← {p.name}</button>
      <h1>Review many at once</h1>
      <p className="sub">{waiting.length} waiting, sorted into piles by the automatic check. Decide a whole pile with one press, or tick students yourself. Each one still gets their own email.
        {p.max_award_cents != null ? ` Most per student: ${money(p.max_award_cents)}.` : ""}{fundLeft != null ? ` Left in the fund: ${money(fundLeft)}.` : ""}</p>
      {run ? <div className={`rv-banner ${run.failed.length ? "late" : ""}`}><b>{busy ? `Working: ${run.done} of ${run.total}…` : `Finished ${run.total}.`}</b>{run.failed.length ? <span>{run.failed.join(" · ")}</span> : <span>{busy ? "Keep this page open." : "Everyone was emailed."}</span>}</div> : null}

      <div className="rv-mbar">
        {(["all", "strong", "check", "missing"] as Pile[]).map((k) => (
          <button key={k} className={`rv-chip${pile === k ? " on" : ""}`} onClick={() => { setPile(k); setShown(40); }}>
            {k === "all" ? "Everyone" : k === "strong" ? "Ready" : k === "check" ? "Needs a person" : "Not eligible or incomplete"} <b>{counts[k as "all"]}</b>
          </button>
        ))}
        <button className={`rv-chip${pile === "ticked" ? " on" : ""}`} onClick={() => setPile("ticked")}>Ticked <b>{ticked.length}</b></button>
      </div>
      {pile !== "all" && pile !== "ticked" && list.length > 0 && !busy ? (
        <div className="rv-banner">
          <b>{pile === "strong" ? `${list.length} ready: nothing missing and no flags.` : pile === "missing" ? `${list.length} not eligible or incomplete.` : `${list.length} need a person to look.`}</b>
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pile === "strong" ? <button className="btn p sm" onClick={() => whole("award")}>Approve all {list.length}…</button> : null}
            {pile === "missing" ? <button className="btn p sm" onClick={() => whole("more")}>Ask all {list.length} for what&rsquo;s missing…</button> : null}
            <button className="btn o sm" onClick={() => whole("no")}>Not this time for all {list.length}…</button>
          </span>
        </div>
      ) : null}
      <div className="rv-mbar">
        <input className="ffield" style={{ flex: 2, minWidth: 180 }} type="search" placeholder="Search name, school, or anything they wrote" value={q} onChange={(e) => { setQ(e.target.value); setShown(40); }} />
        <span className="rv-top-n"><input className="ffield" inputMode="numeric" placeholder="7" value={topN} onChange={(e) => setTopN(e.target.value.replace(/\D/g, "").slice(0, 3))} aria-label="How many" /><button className="btn o sm" onClick={pickTop} disabled={!topN}>Tick the strongest</button><button className="btn o sm" onClick={pickLow} disabled={!topN}>Tick the lowest</button></span>
        <select className="ffield" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value as "high" | "low" | "old")} aria-label="Order">
          <option value="high">Highest score first</option><option value="low">Lowest score first</option><option value="old">Applied first</option>
        </select>
        <button className="btn o sm" onClick={() => setMany(list.map((a) => a.id), true)} disabled={!list.length}>Tick all {list.length} here</button>
        <button className="btn o sm" onClick={() => setTick({})} disabled={!ticked.length}>Clear</button>
      </div>

      {!list.length ? <p className="tiny">{waiting.length ? "Nobody in this pile." : "Nothing waiting. Thank you."}</p> : (
        <div className="rv-list">
          {list.slice(0, shown).map((a) => {
            const on = !!tick[a.id]; const open = openId === a.id; const k = kind(a);
            const story = longs.map((x) => (a.answers?.[x.key] ? String(a.answers[x.key]) : "")).filter(Boolean);
            return (
              <div key={a.id} className={`rv-mrow${on ? " on" : ""}`}>
                <label className="rv-mtick"><input type="checkbox" checked={on} onChange={(e) => setMany([a.id], e.target.checked)} aria-label={`Tick ${fullName(a)}`} /></label>
                <div className="rv-mbody">
                  <div className="rv-payhead">
                    <span><b>{fullName(a)}</b> <span className="tiny">{a.number}{a.school ? ` · ${a.school}` : ""}</span></span>
                    <span className="rv-tags">
                      {a.auto_score != null ? <span className="rv-pill ok">score {a.auto_score}</span> : null}
                      {k !== "strong" ? <span className={`rv-pill ${k === "missing" ? "late" : "soon"}`}>⚑ {a.auto_flags?.length}</span> : null}
                      {a.requested_cents ? <span className="rv-pill">asks {money(a.requested_cents)}</span> : null}
                    </span>
                  </div>
                  {a.auto_flags?.length ? a.auto_flags.map((f) => <p key={f} className="tiny rv-flag">⚑ {f}</p>) : null}
                  <div className="rv-facts">{facts.map((x) => { const v = a.answers?.[x.key]; const s = Array.isArray(v) ? v.join(", ") : v == null || v === "" ? "" : String(v); return s ? <span key={x.key} title={x.label}><i>{x.label.length > 34 ? `${x.label.slice(0, 32)}…` : x.label}</i> {s}</span> : null; })}</div>
                  {story.length ? <p className={`rv-story${open ? " open" : ""}`}>{open ? story.join("\n\n") : `${story[0].slice(0, 260)}${story[0].length > 260 || story.length > 1 ? "…" : ""}`}</p> : null}
                  {story.join("").length > 260 || story.length > 1 ? <button className="rv-link" onClick={() => setOpenId(open ? null : a.id)}>{open ? "Show less" : "Read all of it"}</button> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {list.length > shown ? <p><button className="btn o sm" onClick={() => setShown(shown + 40)}>Show 40 more ({list.length - shown} left)</button></p> : null}

      {ticked.length ? (
        <div className="rv-dock">
          <div className="rv-dock-in">
            <b>{ticked.length} ticked</b>
            {!mode ? (
              <span className="rv-btns">
                <button className="btn p sm" disabled={busy} onClick={() => setMode("award")}>Award…</button>
                <button className="btn o sm" disabled={busy} onClick={() => setMode("no")}>Not this time…</button>
                <button className="btn o sm" disabled={busy} onClick={() => setMode("more")}>Ask for more…</button>
              </span>
            ) : (
              <div className="rv-dock-form">
                {mode === "award" ? <>
                  <input className="ffield" inputMode="decimal" placeholder="Dollars each (e.g. 100)" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <textarea className="ffield" rows={2} placeholder="Note they read with the award (optional)" value={awardNote} onChange={(e) => setAwardNote(e.target.value)} />
                  <p className="tiny">{ticked.length} × {money(cents)} = <b>{money(cents * ticked.length)}</b>{fundLeft != null ? ` · ${money(fundLeft)} left in the fund` : ""}{over ? " · That is more than the fund has. Untick some or lower the amount." : ""}</p>
                </> : mode === "no" ? <textarea className="ffield" rows={4} placeholder="The message every ticked student reads" value={noNote} onChange={(e) => setNoNote(e.target.value)} />
                  : <textarea className="ffield" rows={3} placeholder="What do you need from them? Every ticked student reads this." value={moreNote} onChange={(e) => setMoreNote(e.target.value)} />}
                <span className="rv-btns">
                  <button className="btn p sm" disabled={busy || over} onClick={go}>{mode === "award" ? `Award ${ticked.length}` : mode === "no" ? `Send to ${ticked.length}` : `Ask ${ticked.length}`}</button>
                  <button className="btn o sm" disabled={busy} onClick={() => setMode("")}>Back</button>
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
