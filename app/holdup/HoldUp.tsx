"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFoot, SiteTop } from "../myreach/ui";
import { KIND_LABEL, OFTEN_MISSING, parseBill, totals, usd, type Kind, type Line } from "./parse";

/* HOLD UP (reach.estherfundsfoundation.org/holdup), 26 Oct 2026, Shayna: know your real number
   before your school puts a hold on you. Built with plain code, no AI and nothing sent anywhere:
   she pastes (or types) her student account summary, checks every line, and gets three numbers
   and a plan in order. Kept on this phone only (localStorage "reach-holdup", with Erase). */

type Ans = { changed?: boolean; plus?: boolean };
type Saved = { lines: Line[]; shown: number | null; due: string; ans: Ans; step: Step };
type Step = "open" | "paste" | "check" | "result";
const KEY = "reach-holdup";
const KINDS: Kind[] = ["charge", "aid", "coming", "payment", "offer", "skip"];

const SAMPLE = `Fall 2026	Charge	Payment
Tuition - Undergraduate In-State	$3,000.00
Comprehensive Fee	$1,615.00
Technology Fee	$387.00
Housing - Double Room	$3,215.00
Meal Plan	$2,215.00
Federal Pell Grant		$3,697.50
Federal Direct Unsubsidized Loan		$2,722.00
Online Payment		$500.00
Federal SEOG (Anticipated)	$500.00
Balance Due	$3,512.50`;

function load(): Saved | null {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) as Saved : null; } catch { return null; }
}

function daysUntil(d: string): number | null {
  if (!d) return null;
  const t = new Date(`${d}T12:00:00`).getTime();
  if (!Number.isFinite(t)) return null;
  const now = new Date(); now.setHours(12, 0, 0, 0);
  return Math.round((t - now.getTime()) / 86400000);
}

function ics(due: string, gap: number) {
  const d = due.replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const alarm = (days: number) => `BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:HOLD UP: ${days} days until your payment deadline\r\nTRIGGER:-P${days}D\r\nEND:VALARM`;
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//REACH//HOLD UP//EN", "BEGIN:VEVENT",
    `UID:holdup-${d}-${Math.random().toString(36).slice(2)}@reach.estherfundsfoundation.org`,
    `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`,
    `SUMMARY:HOLD UP: payment deadline${gap > 0 ? ` (gap ${usd(gap)})` : ""}`,
    "DESCRIPTION:Check your student account before this date so a hold doesn't stop your registration. reach.estherfundsfoundation.org/holdup",
    alarm(14), alarm(7), alarm(2), "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a"); a.href = url; a.download = "hold-up-deadline.ics"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="sc-btn ghost sm" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2200); } catch { /* fine */ }
    }}>{ok ? "Copied ✓" : "Copy what to say"}</button>
  );
}

type PlanStep = { key: string; title: string; body: string; say?: string; link?: { href: string; label: string } };

function buildPlan(t: ReturnType<typeof totals>, ans: Ans, due: string): PlanStep[] {
  const gap = t.afterComing;
  const steps: PlanStep[] = [];
  const by = due ? ` before ${new Date(`${due}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : " before the payment deadline";
  if (t.coming > 0) steps.push({
    key: "coming", title: "Make sure the aid on the way actually pays in",
    body: `You have ${usd(t.coming)} listed as anticipated or pending. That isn't money yet. Aid gets stuck when verification isn't finished, a document is missing, you dropped below the credits it needs, or you haven't accepted it in your aid portal.`,
    say: `Hi, I have ${usd(t.coming)} in anticipated aid on my account. Is there anything I still need to do so it pays in${by}?`,
  });
  if (gap > 0 && t.offers > 0) steps.push({
    key: "loans", title: "Decide on the loans you haven't accepted",
    body: `You were offered ${usd(t.offers)} you haven't accepted. Accepting only what you need could ${t.afterLoans <= 0 ? "cover the rest of your balance" : `bring your gap down to ${usd(t.afterLoans)}`}. A loan is borrowed money, so take the smallest amount that keeps you enrolled.`,
  });
  if (gap > 0) steps.push({
    key: "plan", title: "Ask Student Accounts for a payment plan",
    body: "Most schools let you split a balance into monthly payments, and being on a plan often counts as being cleared, so the hold comes off.",
    say: `Hi, I have a balance of ${usd(gap)} and registration is coming up. Do you have a payment plan where I can split it into monthly payments? If I enroll in a plan today, can my hold be lifted so I can register?`,
  });
  if (gap > 0 && ans.changed) steps.push({
    key: "sc", title: "Ask for a special circumstance review",
    body: "Your aid was based on your family's income from two years ago. If someone lost a job, lost benefits, separated, passed away or had big medical bills, financial aid can look at what your family makes now. That can mean more grant money.",
    say: "Hi, my family's financial situation has changed since I filed my FAFSA. Can I request a special circumstance review? What form and documents do you need from me?",
  });
  if (gap > 0 && ans.plus) steps.push({
    key: "plus", title: "Ask about the extra loan when Parent PLUS isn't an option",
    body: "If you're a dependent student and your parent was denied a Parent PLUS loan, you can usually get extra federal loan money in your own name. Ask exactly how to show the denial.",
    say: "Hi, my parent isn't able to get a Parent PLUS loan. Am I eligible for the additional unsubsidized loan, and what do I need to do?",
  });
  if (gap > 0) steps.push({
    key: "release", title: "Ask if the hold can wait while this gets fixed",
    body: "If your aid is still processing or you're setting up a plan, ask whether they can release the hold long enough for you to register. Get the answer in writing, even an email.",
    say: "Hi, I'm working on my balance (my aid is processing / I'm setting up a payment plan). Can my hold be released or delayed so I can register for next semester while this is being handled?",
  });
  if (gap > 0) steps.push({
    key: "emergency", title: "Ask your school about emergency or completion grants",
    body: "A lot of schools keep money for students who are close to being dropped and don't advertise it. Ask the Dean of Students office, financial aid, or your first-gen or TRIO office.",
    say: "Hi, I'm a student with a balance that's keeping me from registering. Does the school have emergency funds or completion grants I could apply for, and who handles them?",
    link: { href: "/emergency", label: "Make a REACH Emergency plan" },
  });
  if (gap > 0) steps.push({
    key: "more", title: "Keep money coming in",
    body: "Look for scholarships that are open right now, and get a heads-up when EFF's Emergency Grant opens.",
    link: { href: "/scholarships", label: "Open scholarships" },
  });
  return steps;
}

export default function HoldUp() {
  const [step, setStep] = useState<Step>("open");
  const [text, setText] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [shown, setShown] = useState<number | null>(null);
  const [due, setDue] = useState("");
  const [ans, setAns] = useState<Ans>({});
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState("");
  const next = useRef(1);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = load();
    if (s && s.lines?.length) {
      setLines(s.lines); setShown(s.shown ?? null); setDue(s.due || ""); setAns(s.ans || {}); setStep(s.step === "open" ? "check" : s.step);
      next.current = Math.max(0, ...s.lines.map((l) => l.id)) + 1;
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      if (!lines.length) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify({ lines, shown, due, ans, step } satisfies Saved));
    } catch { /* fine */ }
  }, [lines, shown, due, ans, step, ready]);

  const go = (s: Step) => { setStep(s); requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  const t = useMemo(() => totals(lines), [lines]);
  const plan = useMemo(() => buildPlan(t, ans, due), [t, ans, due]);
  const left = daysUntil(due);
  const mismatch = shown !== null && Math.abs(shown - t.owedNow) > 1;

  function read() {
    const p = parseBill(text, next.current);
    if (!p.lines.length) { setNote("I couldn't find any amounts in that. Try copying the whole account page again, or type the lines in yourself."); return; }
    next.current += p.lines.length;
    setLines(p.lines); setShown(p.shownBalance); setNote(""); go("check");
  }
  const add = (label = "", kind: Kind = "charge") => {
    const id = next.current++;
    setLines((ls) => [...ls, { id, label, amount: 0, kind }]);
  };
  const edit = (id: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch, guessed: false } : l)));
  const drop = (id: number) => setLines((ls) => ls.filter((l) => l.id !== id));
  function erase() {
    setLines([]); setShown(null); setDue(""); setAns({}); setText(""); setStep("open");
    try { localStorage.removeItem(KEY); } catch { /* fine */ }
  }

  const missingAdded = (label: string) => lines.some((l) => l.label === label);

  return (
    <div className="sc hu">
      <SiteTop />
      <main>
        <section className="hu-open" aria-labelledby="hu-title">
          <div className="sc-wrap">
            <p className="hu-kick">Before the bursar does</p>
            <h1 id="hu-title" className="hu-title"><span>HOLD</span> <span>UP.</span></h1>
            <p className="hu-lede">Do you know what you&rsquo;ll owe before registration? Paste your student account and get your real number in two minutes. Before a hold stops you.</p>
            {step === "open" ? (
              <div className="sc-acts">
                <button type="button" className="hu-cta" onClick={() => go("paste")}>Check my number</button>
              </div>
            ) : null}
            <p className="hu-promise">Free. No sign-in. Nothing you paste leaves your phone.</p>
          </div>
        </section>

        <div ref={top} className="hu-anchor" />

        {step === "open" ? (
          <section className="sc-wrap hu-how" aria-label="How it works">
            <ol>
              <li><b>Copy your account.</b> Open your school portal&rsquo;s Student Account or Account Summary and copy the whole page.</li>
              <li><b>Paste and check.</b> HOLD UP sorts every line into charges, aid, aid on the way and payments. You fix anything that&rsquo;s off.</li>
              <li><b>Get your number and a plan.</b> What you owe now, what&rsquo;s still coming, your real gap, and exactly what to ask, in order.</li>
            </ol>
          </section>
        ) : null}

        {step === "paste" ? (
          <section className="sc-wrap hu-card" aria-labelledby="hu-paste">
            <h2 id="hu-paste">Paste your student account</h2>
            <details className="hu-tip">
              <summary>How do I copy it?</summary>
              <ol>
                <li>Sign in to your school portal (Self-Service, Banner, PeopleSoft, Workday or your school&rsquo;s app).</li>
                <li>Open <b>Student Account</b>, <b>Account Summary</b>, <b>Account Summary by Term</b>, or <b>View my bill</b>.</li>
                <li>On a phone, press and hold the page and tap <b>Select All</b>, then <b>Copy</b>. On a computer, press Ctrl+A (or ⌘A) and Ctrl+C.</li>
                <li>Come back here and paste. Extra words are fine; HOLD UP only reads the lines with amounts.</li>
              </ol>
            </details>
            <label className="hu-label" htmlFor="hu-text">Your account summary</label>
            <textarea id="hu-text" className="hu-text" rows={10} value={text} onChange={(e) => setText(e.target.value)}
              placeholder={"Tuition - Undergraduate    $3,000.00\nTechnology Fee    $387.00\nFederal Pell Grant    ($3,697.50)\n…"} />
            {note ? <p className="hu-note" role="alert">{note}</p> : null}
            <div className="sc-acts">
              <button type="button" className="sc-btn" disabled={!text.trim()} onClick={read}>Read my bill</button>
              <button type="button" className="sc-btn ghost" onClick={() => { setLines([]); setShown(null); add(); go("check"); }}>Type it in instead</button>
              <button type="button" className="hu-link" onClick={() => setText(SAMPLE)}>Try a sample bill</button>
            </div>
          </section>
        ) : null}

        {step === "check" ? (
          <section className="sc-wrap hu-card" aria-labelledby="hu-check">
            <h2 id="hu-check">Check every line</h2>
            <p className="hu-sub">HOLD UP made its best guess. Fix the type or the amount if anything is off. Nothing counts until you say it&rsquo;s right.</p>
            <div className="hu-lines" role="list">
              {lines.map((l) => (
                <div key={l.id} className={`hu-line k-${l.kind}`} role="listitem">
                  <input className="hu-in hu-name" aria-label="What it is" value={l.label} placeholder="What it is (e.g. Tuition)"
                    onChange={(e) => edit(l.id, { label: e.target.value })} />
                  <div className="hu-row2">
                    <span className="hu-dollar">$</span>
                    <input className="hu-in hu-amt" aria-label={`Amount for ${l.label || "this line"}`} inputMode="decimal"
                      value={l.amount ? String(l.amount) : ""} placeholder="0.00"
                      onChange={(e) => edit(l.id, { amount: Math.abs(Number(e.target.value.replace(/[^\d.]/g, "")) || 0) })} />
                    <select className="hu-in hu-kind" aria-label="Type" value={l.kind} onChange={(e) => edit(l.id, { kind: e.target.value as Kind })}>
                      {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                    </select>
                    <button type="button" className="hu-x" aria-label={`Remove ${l.label || "line"}`} onClick={() => drop(l.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="sc-acts">
              <button type="button" className="sc-btn ghost sm" onClick={() => add()}>+ Add a line</button>
              <button type="button" className="sc-btn ghost sm" onClick={() => add("Loan offered (not accepted)", "offer")}>+ A loan I haven&rsquo;t accepted</button>
            </div>

            <div className="hu-miss">
              <h3>Often not on the bill yet</h3>
              <p className="hu-sub">These show up later at a lot of schools. Add any you expect, with your best guess.</p>
              <div className="hu-chips">
                {OFTEN_MISSING.map((m) => (
                  <button key={m.label} type="button" className={`hu-chip${missingAdded(m.label) ? " on" : ""}`} title={m.why}
                    disabled={missingAdded(m.label)} onClick={() => add(m.label, "charge")}>
                    {missingAdded(m.label) ? "✓ " : "+ "}{m.label}
                  </button>
                ))}
              </div>
            </div>

            {mismatch ? (
              <p className="hu-warn">Your bill says you owe <b>{usd(shown!)}</b>, and these lines add up to <b>{usd(t.owedNow)}</b>. Check that every line has the right type, or add anything that&rsquo;s missing.</p>
            ) : null}

            <div className="sc-acts hu-end">
              <button type="button" className="sc-btn coral" disabled={!lines.some((l) => l.amount > 0)} onClick={() => go("result")}>That&rsquo;s right. Show my number</button>
              <button type="button" className="hu-link" onClick={() => go("paste")}>Paste again</button>
            </div>
          </section>
        ) : null}

        {step === "result" ? (
          <section className="sc-wrap hu-result" aria-labelledby="hu-num">
            <h2 id="hu-num" className="hu-h">Your number</h2>
            <div className="hu-nums">
              <div className="hu-num">
                <span>What you owe right now</span>
                <b className={t.owedNow > 0 ? "due" : "ok"}>{t.owedNow > 0 ? usd(t.owedNow) : usd(0)}</b>
                <small>Charges {usd(t.charges)} − aid paid in {usd(t.aid)} − payments {usd(t.payments)}</small>
              </div>
              <div className="hu-num">
                <span>Still on the way</span>
                <b className="mid">{usd(t.coming)}</b>
                <small>Aid listed as anticipated or pending. Not money yet.</small>
              </div>
              <div className="hu-num big">
                <span>Your real gap</span>
                <b className={t.afterComing > 0 ? "due" : "ok"}>{t.afterComing > 0 ? usd(t.afterComing) : "$0"}</b>
                <small>{t.afterComing > 0 ? "What's left if your aid on the way pays in." : t.afterComing < 0 ? `You may get about ${usd(-t.afterComing)} back as a refund.` : "You're even."}</small>
              </div>
            </div>

            {t.afterComing <= 0 ? (
              <div className="hu-clear">
                <h3>You&rsquo;re clear, for now.</h3>
                <p>{t.coming > 0 ? "That depends on your aid on the way actually paying in, so make sure it does (below). " : ""}Check again when next semester&rsquo;s bill posts, because housing, insurance and fees often show up later.{t.afterComing < 0 ? " If part of a refund comes from a loan, it's borrowed money. Federal loans can be returned within 120 days of when they pay in, with no interest or fees." : ""}</p>
              </div>
            ) : null}

            <div className="hu-card hu-qs">
              <h3>Two quick questions</h3>
              <div className="hu-q">
                <p>Did your family&rsquo;s money change since you filed your FAFSA? (a job loss, lost benefits, a separation, a death, big medical bills)</p>
                <div className="hu-yn">
                  <button type="button" className={ans.changed === true ? "on" : ""} onClick={() => setAns({ ...ans, changed: true })}>Yes</button>
                  <button type="button" className={ans.changed === false ? "on" : ""} onClick={() => setAns({ ...ans, changed: false })}>No</button>
                </div>
              </div>
              <div className="hu-q">
                <p>Was a parent denied a Parent PLUS loan, or can&rsquo;t take one out?</p>
                <div className="hu-yn">
                  <button type="button" className={ans.plus === true ? "on" : ""} onClick={() => setAns({ ...ans, plus: true })}>Yes</button>
                  <button type="button" className={ans.plus === false ? "on" : ""} onClick={() => setAns({ ...ans, plus: false })}>No</button>
                </div>
              </div>
              <div className="hu-q">
                <p>When is your payment due, or the day unpaid students get dropped? <small>(It&rsquo;s on your school&rsquo;s academic calendar or bursar page.)</small></p>
                <div className="hu-due">
                  <input type="date" className="hu-in" aria-label="Payment deadline" value={due} onChange={(e) => setDue(e.target.value)} />
                  {left !== null ? (
                    <span className={`hu-clock${left <= 7 ? " hot" : ""}`}>{left > 1 ? `${left} days left` : left === 1 ? "Tomorrow" : left === 0 ? "Today" : "This date has passed"}</span>
                  ) : null}
                  {due ? <button type="button" className="sc-btn ghost sm" onClick={() => ics(due, t.afterComing)}>Remind me (14, 7 and 2 days before)</button> : null}
                </div>
              </div>
            </div>

            {plan.length ? (
              <div className="hu-plan">
                <h2 className="hu-h">Your plan, in order</h2>
                <ol>
                  {plan.map((p) => (
                    <li key={p.key} className="hu-step">
                      <h3>{p.title}</h3>
                      <p>{p.body}</p>
                      {p.say ? <blockquote>&ldquo;{p.say}&rdquo;</blockquote> : null}
                      <div className="sc-acts">
                        {p.say ? <Copy text={p.say} /> : null}
                        {p.link ? <Link className="sc-btn sm" href={p.link.href}>{p.link.label}</Link> : null}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="hu-sub">Want a heads-up when EFF&rsquo;s Emergency Grant opens? <Link href="/notify">Get notified</Link>. In crisis, call or text <a href="tel:988">988</a>.</p>
              </div>
            ) : null}

            <div className="sc-acts hu-end">
              <button type="button" className="sc-btn ghost" onClick={() => go("check")}>Edit my lines</button>
              <button type="button" className="sc-btn ghost" onClick={() => window.print()}>Print my plan</button>
              <button type="button" className="hu-link" onClick={erase}>Erase everything</button>
            </div>
            <p className="hu-fine">HOLD UP is an estimate from what you entered. Your school&rsquo;s student account is the official number. Saved only on this phone until you erase it.</p>
          </section>
        ) : null}
      </main>
      <SiteFoot />
    </div>
  );
}
