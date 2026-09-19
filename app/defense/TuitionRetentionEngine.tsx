"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

type ScenarioId = "drop_threat" | "reg_hold" | "senior_completion" | "prior_debt" | "ledger_scrub";
type TranscriptPurpose = "education transfer" | "employment" | "military service" | "reenrollment";
type FeeId = "insurance" | "late" | "transit" | "courseware";

const SCENARIOS: Array<{
  id: ScenarioId;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof AlertTriangle;
}> = [
  { id: "drop_threat", eyebrow: "24–72 HOUR RISK", title: "Active course-drop warning", description: "A payment deadline or automated purge could remove your current classes.", icon: AlertTriangle },
  { id: "reg_hold", eyebrow: "NEXT-TERM BLOCK", title: "Registration hold", description: "A past-due balance is preventing registration for the next term.", icon: ShieldCheck },
  { id: "senior_completion", eyebrow: "WITHIN 30 CREDITS", title: "Senior completion gap", description: "A balance could interrupt your final year or delay graduation.", icon: GraduationCap },
  { id: "prior_debt", eyebrow: "RETURN OR TRANSFER", title: "Prior-term debt or transcript hold", description: "An old balance is blocking a transcript, reenrollment, or transfer.", icon: FileText },
  { id: "ledger_scrub", eyebrow: "QUESTION THE BILL", title: "Micro-balance or unexplained fees", description: "Your ledger includes charges that need an itemized policy review.", icon: Scale },
];

const FEE_OPTIONS: Array<{ id: FeeId; label: string; amount: number; question: string }> = [
  { id: "insurance", label: "Student health-insurance charge", amount: 1200, question: "Ask whether proof of private or Medicaid coverage qualifies for a waiver and whether the waiver deadline remains open." },
  { id: "late", label: "Late fee during an aid delay", amount: 150, question: "Ask for a one-time reversal review if documented aid processing—not student inaction—caused the fee." },
  { id: "transit", label: "Transit or transportation fee", amount: 250, question: "Ask whether remote, commuter, or off-campus enrollment changes the mandatory-fee rule." },
  { id: "courseware", label: "Inclusive-access courseware", amount: 180, question: "Ask for the published opt-out policy, deadline, and effect on access to required coursework." },
];

const scenarioAuthority: Record<ScenarioId, { badge: string; request: string; subject: string }> = {
  drop_threat: {
    badge: "Authority: published billing, enrollment, and emergency-deferment policies",
    request: "an immediate temporary administrative pause on course cancellation while the account is reviewed, plus written consideration of any emergency deferment, short-term promissory note, pending-aid memo credit, or payment arrangement available under institutional policy",
    subject: "URGENT: Request to Pause Course Cancellation Pending Account Review",
  },
  reg_hold: {
    badge: "Authority: published hold, payment-plan, and student-support policies",
    request: "a written itemization of the hold and review of the smallest available resolution, including a temporary registration exception, approved payment arrangement, emergency grant, or hardship process",
    subject: "Request for Registration-Hold Review and Enrollment Protection",
  },
  senior_completion: {
    badge: "Authority: institutional completion-grant and graduation-clearance policies",
    request: "expedited review for a completion grant, graduation-balance waiver, emergency retention award, temporary registration protection, or documented payment arrangement available to students near degree completion",
    subject: "Senior Completion Review — Request to Protect Degree Progress",
  },
  prior_debt: {
    badge: "Federal baseline: 34 CFR § 668.14(b)(33)–(34)",
    request: "a payment-period-by-payment-period transcript review, identification of any balance caused by institutional Title IV error or misconduct, and release of credits that meet the federal transcript requirements or are covered by a current repayment agreement",
    subject: "Request for Written Transcript-Release Review Under 34 CFR § 668.14",
  },
  ledger_scrub: {
    badge: "Authority: published institutional fee, waiver, and opt-out policies",
    request: "a written, itemized review of each questioned charge, including the policy authorizing it, whether it is mandatory for this enrollment type, and every available waiver, opt-out, correction, or appeal process",
    subject: "Request for Itemized Ledger and Fee-Policy Review",
  },
};

function money(value: string | number) {
  const parsed = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parsed) : "$0.00";
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
}

export default function TuitionRetentionEngine() {
  const [scenario, setScenario] = useState<ScenarioId>("drop_threat");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [bursarEmail, setBursarEmail] = useState("");
  const [deanEmail, setDeanEmail] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [creditsRemaining, setCreditsRemaining] = useState("");
  const [transcriptPurpose, setTranscriptPurpose] = useState<TranscriptPurpose>("education transfer");
  const [selectedFees, setSelectedFees] = useState<FeeId[]>([]);
  const [copied, setCopied] = useState(false);

  const authority = scenarioAuthority[scenario];
  const activeScenario = SCENARIOS.find((item) => item.id === scenario) ?? SCENARIOS[0];
  const selectedFeeRows = FEE_OPTIONS.filter((item) => selectedFees.includes(item.id));
  const reviewTotal = selectedFeeRows.reduce((total, item) => total + item.amount, 0);
  const balance = Number(currentBalance.replace(/[^0-9.]/g, "")) || 0;
  const estimatedBalance = Math.max(balance - reviewTotal, 0);

  const context = useMemo(() => {
    if (scenario === "senior_completion") return `I am within ${creditsRemaining || "[number]"} credits of completing my degree, and an interruption at this stage may delay graduation.`;
    if (scenario === "prior_debt") return `I need my academic record for ${transcriptPurpose}. I understand that federal transcript protections are limited and may apply only to qualifying payment periods, balances caused by institutional Title IV error or misconduct, or charges covered by a current repayment agreement.`;
    if (scenario === "ledger_scrub") return "I am requesting clarification before assuming that any charge is invalid or waivable.";
    if (scenario === "reg_hold") return "The current hold is preventing me from registering for the next term and continuing on schedule.";
    return "I received notice that my current course schedule may be cancelled before the account and pending options are fully reviewed.";
  }, [creditsRemaining, scenario, transcriptPurpose]);

  const feeSection = selectedFeeRows.length
    ? `\nQUESTIONED LEDGER ITEMS FOR POLICY REVIEW\n${selectedFeeRows.map((item) => `• ${item.label} — ${money(item.amount)} example estimate; ${item.question}`).join("\n")}\n\nThese figures are planning estimates, not promises of a waiver or a statement that the charges are unlawful. Please provide the actual account amount and controlling policy in writing.\n`
    : "";

  const memo = `MEMORANDUM\n\nTO: Student Accounts / Bursar, ${institutionName || "[institution]"}\nCC: ${deanEmail || "Dean of Students or Student CARE Team, if appropriate"}\nFROM: ${studentName || "[student name]"}\nDATE: ${todayLabel()}\nRE: ${authority.subject}\nSTUDENT ID: ${studentId || "[student ID]"}\nACCOUNT BALANCE SHOWN: ${currentBalance ? money(currentBalance) : "[amount]"}\nDEADLINE OR DROP DATE: ${deadlineDate || "[date and time, including time zone]"}\nAUTHORITY FOR REVIEW: ${authority.badge}\n\nREQUEST FOR IMMEDIATE ADMINISTRATIVE REVIEW\n\nI am requesting prompt, written review of my student account and enrollment status at ${institutionName || "[institution]"}. ${context}\n\nI respectfully request ${authority.request}. Please also confirm in writing: (1) the exact balance and itemized charges; (2) whether accepted or pending aid is reflected; (3) the date and time any registration, course, housing, graduation, or transcript action is scheduled; (4) the published policy controlling that action; and (5) the name and title of the person authorized to approve an exception or temporary pause.\n${feeSection}\nFor transcript matters, I request review under 34 CFR § 668.14(b)(33)–(34). Those provisions do not erase a valid debt or require release of every credit in every circumstance. They restrict negative action for balances caused by institutional Title IV error or misconduct and require qualifying transcript credits to be provided for certain paid payment periods, including when charges are covered by a current repayment agreement.\n\nPlease preserve my enrollment and academic progress while this time-sensitive review is pending if institutional policy permits. I am not authorizing a payment, accepting a repayment agreement, or conceding the accuracy of a charge through this request. Please send all available options, terms, deadlines, and consequences in writing.\n\nRespectfully,\n${studentName || "[student name]"}\n${studentId ? `Student ID: ${studentId}` : "[student ID]"}`;

  const mailSubject = `${authority.subject} — ${studentName || "Student"}${studentId ? ` — ID ${studentId}` : ""}`;
  const mailto = `mailto:${encodeURIComponent(bursarEmail)}?${deanEmail ? `cc=${encodeURIComponent(deanEmail)}&` : ""}subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(memo)}`;

  function toggleFee(id: FeeId) {
    setSelectedFees((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function copyMemo() {
    try {
      await navigator.clipboard.writeText(memo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="overflow-hidden bg-[#0B0F17] text-slate-100">
      <header className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.18),transparent_35%),linear-gradient(135deg,#0B0F17,#111827)] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex max-w-6xl flex-col gap-6">
          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black tracking-[.18em] text-emerald-300">
            <ShieldCheck size={14} aria-hidden="true" /> PRIVATE · CLIENT-SIDE · NO ACCOUNT REQUIRED
          </div>
          <div className="max-w-4xl">
            <p className="mb-3 text-xs font-black tracking-[.2em] text-amber-300">TUITION, BALANCES &amp; ENROLLMENT STATUS</p>
            <h2 className="font-serif text-4xl leading-none tracking-tight text-white sm:text-6xl">Protect the semester before a balance becomes a dropout.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">Diagnose the exact administrative barrier, audit common fee categories, build a formal petition, and escalate it to the office with authority—without waiting for outside funding.</p>
          </div>
        </div>
      </header>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(520px,.9fr)]">
        <section className="border-b border-slate-800 p-5 sm:p-8 xl:border-b-0 xl:border-r xl:p-10">
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={20} aria-hidden="true" />
            <p><strong>Do not wait for the generated letter if a drop deadline is today.</strong> Call and visit Student Accounts, Financial Aid, and the Dean of Students now, then send the written request to create a record.</p>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-300">STEP 1 · NAME THE THREAT</p>
            <h3 className="mt-2 font-serif text-3xl text-white">What is the school blocking?</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SCENARIOS.map((item) => {
                const Icon = item.icon;
                const active = item.id === scenario;
                return <button key={item.id} type="button" onClick={() => setScenario(item.id)} aria-pressed={active} className={`group rounded-xl border p-4 text-left transition ${active ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_0_1px_#10B981]" : "border-slate-700 bg-slate-900 hover:border-slate-500"}`}>
                  <div className="flex items-center justify-between gap-3"><span className={`text-[9px] font-black tracking-[.14em] ${active ? "text-emerald-300" : "text-slate-400"}`}>{item.eyebrow}</span><Icon size={18} className={active ? "text-emerald-300" : "text-slate-500"} aria-hidden="true" /></div>
                  <strong className="mt-4 block text-sm text-white">{item.title}</strong>
                  <span className="mt-2 block text-xs leading-5 text-slate-400">{item.description}</span>
                </button>;
              })}
            </div>
          </div>

          <div className="mt-10">
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-300">STEP 2 · BUILD THE RECORD</p>
            <h3 className="mt-2 font-serif text-3xl text-white">Only enter what the school needs.</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DarkField label="Student name" value={studentName} setValue={setStudentName} placeholder="Full name" />
              <DarkField label="Student ID" value={studentId} setValue={setStudentId} placeholder="Never enter an SSN" />
              <DarkField label="College or university" value={institutionName} setValue={setInstitutionName} placeholder="Institution name" />
              <DarkField label="Balance shown" value={currentBalance} setValue={setCurrentBalance} placeholder="Example: 486.25" inputMode="decimal" />
              <DarkField label="Bursar or Student Accounts email" value={bursarEmail} setValue={setBursarEmail} placeholder="studentaccounts@school.edu" type="email" />
              <DarkField label="Dean of Students / CARE email (optional)" value={deanEmail} setValue={setDeanEmail} placeholder="deanofstudents@school.edu" type="email" />
              <DarkField label="Deadline or scheduled drop date" value={deadlineDate} setValue={setDeadlineDate} placeholder="Include date, time, and time zone" />
              {scenario === "senior_completion" && <DarkField label="Credits remaining to graduate" value={creditsRemaining} setValue={setCreditsRemaining} placeholder="30 or fewer" inputMode="numeric" />}
              {scenario === "prior_debt" && <label className="grid gap-2 text-xs font-bold text-slate-200"><span>Why you need the transcript</span><select value={transcriptPurpose} onChange={(event) => setTranscriptPurpose(event.target.value as TranscriptPurpose)} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-emerald-400"><option value="education transfer">Education transfer</option><option value="employment">Employment</option><option value="military service">Military service</option><option value="reenrollment">Reenrollment</option></select></label>}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Nothing entered here is saved by REACH. On a shared device, close the tab when finished. Do not enter an SSN, password, bank number, or full payment-card number.</p>
          </div>

          <div className="mt-10">
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-300">STEP 3 · SCRUB THE LEDGER</p>
            <h3 className="mt-2 font-serif text-3xl text-white">Which charges deserve a policy review?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">Select only charges that actually appear on the bill. Example amounts are planning estimates—not guaranteed savings.</p>
            <div className="mt-5 grid gap-3">
              {FEE_OPTIONS.map((item) => {
                const active = selectedFees.includes(item.id);
                return <button key={item.id} type="button" onClick={() => toggleFee(item.id)} aria-pressed={active} className={`flex items-start gap-4 rounded-xl border p-4 text-left ${active ? "border-emerald-400 bg-emerald-400/10" : "border-slate-700 bg-slate-900"}`}>
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border ${active ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-slate-600"}`}>{active && <Check size={16} aria-hidden="true" />}</span>
                  <span className="flex-1"><strong className="block text-sm text-white">{item.label}</strong><span className="mt-1 block text-xs leading-5 text-slate-400">{item.question}</span></span>
                  <strong className="text-sm text-amber-300">{money(item.amount)}</strong>
                </button>;
              })}
            </div>
            <div className="mt-4 grid gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5 sm:grid-cols-3">
              <Metric label="Current balance" value={currentBalance ? money(currentBalance) : "—"} />
              <Metric label="Review candidates" value={reviewTotal ? `−${money(reviewTotal)}` : "$0.00"} />
              <Metric label="Estimated balance if approved" value={currentBalance ? money(estimatedBalance) : "—"} />
            </div>
          </div>
        </section>

        <section className="bg-[#070A10] p-5 sm:p-8 xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto xl:p-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-black tracking-[.18em] text-sky-300">LIVE ADMINISTRATIVE PETITION</p><h3 className="mt-1 font-serif text-2xl text-white">Review before sending.</h3></div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-[10px] font-bold text-sky-200"><Scale size={13} aria-hidden="true" />{authority.badge}</span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-[#F8F5EE] text-slate-950 shadow-2xl">
            <div className="border-b border-slate-300 p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4"><div><span className="text-[9px] font-black tracking-[.22em] text-emerald-800">ESTHER FUNDS FOUNDATION · REACH</span><h4 className="mt-2 font-serif text-2xl">Student Administrative Defense Memorandum</h4></div><Building2 className="text-emerald-800" size={32} aria-hidden="true" /></div>
            </div>
            <pre className="max-h-[680px] overflow-auto whitespace-pre-wrap p-5 font-serif text-[12px] leading-6 sm:p-7 sm:text-[13px]">{memo}</pre>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={copyMemo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-black text-slate-950 hover:bg-emerald-400"><Clipboard size={17} aria-hidden="true" />{copied ? "Copied to clipboard" : "Copy formal petition"}</button>
            <a href={mailto} aria-disabled={!bursarEmail} onClick={(event) => { if (!bursarEmail) event.preventDefault(); }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 text-center text-sm font-black ${bursarEmail ? "border-amber-300 bg-amber-300 text-slate-950 hover:bg-amber-200" : "cursor-not-allowed border-slate-700 bg-slate-900 text-slate-500"}`}><Mail size={17} aria-hidden="true" />Open in campus mail (.edu)</a>
          </div>
          {!bursarEmail && <p className="mt-2 text-xs text-amber-200">Enter the campus Student Accounts or Bursar email to activate the mail button.</p>}

          <section className="mt-8">
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-300">IF THE FIRST ANSWER IS “NO”</p>
            <h3 className="mt-2 font-serif text-3xl text-white">Escalate to authority—not volume.</h3>
            <div className="mt-5 grid gap-3">
              <EscalationStep number="01" title="Front-desk cashier" text="Confirm the exact balance, deadline, policy, and name of the supervisor authorized to review exceptions." />
              <EscalationStep number="02" title="Bursar operations supervisor" text="Request the documented deferment, correction, payment-plan, or temporary-hold review and ask for the decision in writing." />
              <EscalationStep number="03" title="Dean of Students or CARE Team" text="Explain the specific enrollment consequence and request coordinated retention intervention across offices." />
              <EscalationStep number="04" title="Campus ombudsperson" text="Ask for neutral process guidance or mediation when offices conflict or a documented review remains unresolved." />
            </div>
          </section>

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-5 text-xs leading-6 text-slate-300">
            <strong className="flex items-center gap-2 text-sm text-white"><Scale size={17} className="text-sky-300" aria-hidden="true" />Important federal transcript limit</strong>
            <p className="mt-2">34 CFR § 668.14(b)(33)–(34) does not cancel a valid student debt or require release of every transcript credit. It addresses institutional Title IV error or misconduct and qualifying paid payment periods, including certain current repayment agreements.</p>
            <a className="mt-3 inline-flex items-center gap-2 font-black text-sky-300" href="https://fsapartners.ed.gov/knowledge-center/fsa-handbook/2024-2025/vol2/ch3-fsa-administrative-and-related-requirements" target="_blank" rel="noopener noreferrer">Verify with Federal Student Aid <ExternalLink size={14} aria-hidden="true" /></a>
          </div>
        </section>
      </div>
    </article>
  );
}

function DarkField({ label, value, setValue, placeholder, type = "text", inputMode }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; type?: string; inputMode?: "decimal" | "numeric" }) {
  return <label className="grid gap-2 text-xs font-bold text-slate-200"><span>{label}</span><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} type={type} inputMode={inputMode} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400" /></label>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-[9px] font-black tracking-[.14em] text-emerald-200">{label.toUpperCase()}</span><strong className="mt-2 block font-serif text-2xl text-white">{value}</strong></div>;
}

function EscalationStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="grid grid-cols-[42px_1fr_auto] items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-[10px] font-black text-emerald-300">{number}</span><div><strong className="text-sm text-white">{title}</strong><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div><ArrowRight size={17} className="mt-1 text-slate-600" aria-hidden="true" /></div>;
}
