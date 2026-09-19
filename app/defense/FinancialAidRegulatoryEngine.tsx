"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Clipboard, ExternalLink, FileCheck2, Landmark, Mail, Scale, ShieldCheck } from "lucide-react";

type AidScenario = "unposted_aid" | "plus_denial" | "pj_appeal" | "unusual_circumstances" | "verification_limbo" | "office_ghosting";

type AuthorityRecord = {
  statute: string;
  officialSummary: string;
  primaryActionUrl: string;
  actionLabel: string;
  escalationUrl: string;
  escalationLabel: string;
  requiredDocs: string[];
};

const VERIFIED_AUTHORITY_DATABASE: Record<AidScenario, AuthorityRecord> = {
  unposted_aid: {
    statute: "34 CFR § 668.164 (Title IV cash management and disbursement)",
    officialSummary: "Establishes federal cash-management and disbursement requirements. Timing depends on eligibility, authorization, payment period, and the school’s receipt of funds.",
    primaryActionUrl: "https://studentaid.gov/feedback-ombudsman/disputes/prepare",
    actionLabel: "Federal Student Aid Ombudsman dispute preparation",
    escalationUrl: "https://www.house.gov/representatives/find-your-representative",
    escalationLabel: "Find your U.S. Representative for constituent casework",
    requiredDocs: [
      "Financial aid portal award summary showing the current accepted or offered status",
      "Itemized tuition billing statement showing the unposted balance",
      "Loan requirements shown in StudentAid.gov or the school portal, including any MPN or counseling status",
    ],
  },
  plus_denial: {
    statute: "34 CFR § 685.203(c) and applicable Direct Loan limits",
    officialSummary: "A dependent undergraduate whose parent cannot obtain a PLUS Loan may be eligible for higher Direct Unsubsidized Loan limits. The school determines actual eligibility and amount.",
    primaryActionUrl: "https://studentaid.gov/plus-app/parent/landing",
    actionLabel: "StudentAid.gov Parent PLUS application and status",
    escalationUrl: "https://studentaid.gov/feedback-ombudsman",
    escalationLabel: "Federal Student Aid Feedback Center",
    requiredDocs: [
      "Official StudentAid.gov adverse-credit or PLUS denial notice",
      "School loan-adjustment or aid-reevaluation form, if required",
      "Parent PLUS application reference number",
    ],
  },
  pj_appeal: {
    statute: "Higher Education Act § 479A (professional judgment)",
    officialSummary: "Permits a financial aid administrator to make documented, case-by-case adjustments for qualifying special circumstances; it does not guarantee a particular aid result.",
    primaryActionUrl: "https://www.irs.gov/individuals/get-transcript",
    actionLabel: "Official IRS tax transcript portal",
    escalationUrl: "https://studentaid.gov/apply-for-aid/fafsa/review-and-correct",
    escalationLabel: "FAFSA review and correction guidance",
    requiredDocs: [
      "Employer termination notice or dated documentation of reduced hours",
      "Most recent year-to-date pay statement or unemployment-benefit statement",
      "IRS transcript or signed federal tax return requested by the school",
      "Itemized uninsured medical expenses, when medical costs are the basis of review",
    ],
  },
  unusual_circumstances: {
    statute: "HEA §§ 479A(c), 480(d)(9), as amended by the FAFSA Simplification Act",
    officialSummary: "Allows a case-by-case dependency-status determination for documented unusual circumstances such as abandonment, estrangement, trafficking, refugee status, or incarceration.",
    primaryActionUrl: "https://schoolhouseconnection.org",
    actionLabel: "SchoolHouse Connection higher-education support",
    escalationUrl: "https://studentaid.gov/help/unusual-circumstances",
    escalationLabel: "Federal Student Aid unusual-circumstances guidance",
    requiredDocs: [
      "A factual personal statement describing the unusual circumstances and current contact situation",
      "Third-party statement from a counselor, social worker, liaison, clinician, clergy member, attorney, or other knowledgeable professional",
      "Court, shelter, law-enforcement, incarceration, or agency records when available and safe to provide",
    ],
  },
  verification_limbo: {
    statute: "34 CFR Part 668, Subpart E and the current Federal Student Aid verification guide",
    officialSummary: "Schools must resolve required verification and conflicting information before disbursing affected aid. Acceptable documentation depends on the verification group and current award-year guidance.",
    primaryActionUrl: "https://studentaid.gov/complete-aid-process/verification",
    actionLabel: "Federal Student Aid verification overview",
    escalationUrl: "https://studentaid.gov/feedback-ombudsman/disputes/prepare",
    escalationLabel: "Prepare an FSA Feedback Center dispute",
    requiredDocs: [
      "Exact school verification request or portal checklist",
      "FAFSA Submission Summary for the correct award year",
      "Requested tax transcript, signed return, identity document, or statement of nonfiling—as specifically required by the school",
      "Upload receipts, confirmation numbers, and dated follow-up messages",
    ],
  },
  office_ghosting: {
    statute: "Published institutional service, complaint, and enrollment-escalation procedures",
    officialSummary: "A documented escalation can establish urgency and a clear record. Federal or congressional casework may request review but cannot guarantee a school’s decision.",
    primaryActionUrl: "https://studentaid.gov/feedback-ombudsman",
    actionLabel: "Federal Student Aid Feedback Center",
    escalationUrl: "https://www.house.gov/representatives/find-your-representative",
    escalationLabel: "Find your U.S. Representative for constituent casework",
    requiredDocs: [
      "Chronological contact log with dates, offices, names, and promised follow-up",
      "Copies of unresolved emails, portal messages, and ticket numbers",
      "Billing, award, verification, or enrollment notice showing the approaching consequence",
    ],
  },
};

const AID_SCENARIOS: Array<{ id: AidScenario; tag: string; title: string; text: string }> = [
  { id: "unposted_aid", tag: "AID ACCEPTED · BILL UNPAID", title: "Approved aid not disbursed", text: "Accepted aid has not reached the ledger and a drop deadline is approaching." },
  { id: "plus_denial", tag: "PARENT PLUS DENIED", title: "Additional unsubsidized loan review", text: "Request the higher dependent-student loan-limit review after a parent cannot obtain PLUS." },
  { id: "pj_appeal", tag: "INCOME CHANGED", title: "Special-circumstances appeal", text: "Ask a financial aid administrator to review current financial reality case by case." },
  { id: "unusual_circumstances", tag: "PARENT DATA UNSAFE", title: "Dependency-status review", text: "Document abandonment, estrangement, trafficking, refugee status, or incarceration." },
  { id: "verification_limbo", tag: "DOCUMENT FREEZE", title: "FAFSA verification deadlock", text: "Identify exactly what remains unresolved and request a written completion path." },
  { id: "office_ghosting", tag: "NO RESPONSE", title: "Institutional stonewalling", text: "Turn unanswered contacts into a dated escalation record before the deadline." },
];

const sourceLabels: Record<string, string> = { subsidized: "Direct Subsidized Loan", pell: "Federal Pell Grant", outside: "Outside scholarship", institutional: "Institutional grant" };

export default function FinancialAidRegulatoryEngine() {
  const [scenario, setScenario] = useState<AidScenario>("unposted_aid");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [aidEmail, setAidEmail] = useState("");
  const [bursarEmail, setBursarEmail] = useState("");
  const [deadline, setDeadline] = useState("");
  const [pendingBalance, setPendingBalance] = useState("");
  const [sources, setSources] = useState<string[]>(["pell"]);
  const [standing, setStanding] = useState("first_or_second");
  const [plusReference, setPlusReference] = useState("");
  const [hardship, setHardship] = useState("job loss or reduced wages");
  const [incomeReduction, setIncomeReduction] = useState("");
  const [daysElapsed, setDaysElapsed] = useState("5");
  const [attemptedOffices, setAttemptedOffices] = useState("");
  const [facts, setFacts] = useState("");
  const [checkedDocs, setCheckedDocs] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const authority = VERIFIED_AUTHORITY_DATABASE[scenario];
  const scenarioTitle = AID_SCENARIOS.find((item) => item.id === scenario)?.title ?? "Financial aid review";
  const additionalLimit = standing === "first_or_second" ? "$4,000" : "$5,000";
  const subject = scenario === "unposted_aid" ? `URGENT: Accepted Aid / Ledger Review Under 34 CFR § 668.164`
    : scenario === "plus_denial" ? `Request for Additional Direct Unsubsidized Loan Eligibility Review`
    : scenario === "pj_appeal" ? `Request for Professional Judgment Review Under HEA § 479A`
    : scenario === "unusual_circumstances" ? `Request for Unusual-Circumstances Dependency Review`
    : scenario === "verification_limbo" ? `Time-Sensitive FAFSA Verification Completion Review`
    : `Formal Escalation of Unresolved Financial Aid Case`;

  const scenarioFacts = useMemo(() => {
    if (scenario === "unposted_aid") return `The aid sources shown as pending or accepted are: ${sources.length ? sources.map((item) => sourceLabels[item]).join(", ") : "[select the affected aid]"}. The unresolved ledger amount is ${pendingBalance ? formatMoney(pendingBalance) : "[amount]"}. I request confirmation of each eligibility and disbursement condition still outstanding, the date funds were or will be posted, and consideration of any provisional memo credit or temporary enrollment hold permitted by school policy.`;
    if (scenario === "plus_denial") return `A parent PLUS application received an adverse-credit decision${plusReference ? ` under reference ${plusReference}` : ""}. Based on my ${standing === "first_or_second" ? "first- or second-year" : "third-year-or-beyond"} standing, I request a school determination of any additional Direct Unsubsidized Loan eligibility, which may be up to ${additionalLimit} above the standard dependent-student limit subject to cost of attendance, remaining eligibility, enrollment, and current federal limits.`;
    if (scenario === "pj_appeal") return `My FAFSA data no longer reflects my household’s present ability to pay because of ${hardship}. The estimated annual reduction is ${incomeReduction ? formatMoney(incomeReduction) : "[amount]"}. I request a documented, case-by-case professional judgment review of relevant FAFSA data elements and cost-of-attendance components.`;
    if (scenario === "unusual_circumstances") return "I cannot safely or reasonably obtain parental information because of documented unusual circumstances. I request the school’s dependency-status process, provisional treatment available under current federal guidance, the documentation it will accept, and a written decision within the applicable timeline after all requested materials are received.";
    if (scenario === "verification_limbo") return "My aid remains pending verification. Please identify the exact verification group, unresolved data element, acceptable document alternatives, date each item was received, responsible reviewer, and the earliest completion date. I also request review of any institution-based temporary enrollment protection while federal eligibility is determined.";
    return `I have sought resolution for approximately ${daysElapsed || "[number]"} business days through ${attemptedOffices || "[offices and ticket numbers]"} without a complete written response. I request immediate assignment to an accountable reviewer and a written status before the enrollment consequence occurs.`;
  }, [additionalLimit, attemptedOffices, daysElapsed, hardship, incomeReduction, pendingBalance, plusReference, scenario, sources, standing]);

  const memo = `FORMAL FINANCIAL AID REGULATORY MEMORANDUM\n\nTO: Financial Aid Office, ${institutionName || "[institution]"}\nCC: ${scenario === "unposted_aid" ? (bursarEmail || "Student Accounts / Bursar") : "Enrollment Management or Campus Ombudsperson, if needed"}\nFROM: ${studentName || "[student name]"}\nDATE: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}\nRE: ${subject}\nSTUDENT ID: ${studentId || "[student ID]"}\nREGULATORY CLASSIFICATION: ${authority.statute}\nDROP / DECISION DEADLINE: ${deadline || "[date, time, and time zone]"}\n\nREQUEST FOR DOCUMENTED ADMINISTRATIVE DETERMINATION\n\nI submit this memorandum to request an expedited, written determination concerning ${scenarioTitle.toLowerCase()}. ${scenarioFacts}\n\nGOVERNING FRAMEWORK\n${authority.officialSummary}\n\nFACTUAL RECORD\n${facts || "[Add a short chronology using dates, portal statuses, document receipts, and the exact consequence threatened. Do not speculate or exaggerate.]"}\n\nREQUESTED RESPONSE\nPlease provide: (1) the outstanding eligibility or processing requirement; (2) the rule or policy controlling the decision; (3) the documents already received and any specific deficiency; (4) the staff member or office with decision authority; (5) the expected determination date; and (6) any institution-based temporary protection available before ${deadline || "the stated deadline"}.\n\nThis memorandum requests review; it does not assert guaranteed eligibility, compel a particular award, or replace the school’s case-by-case determination. Please preserve the record and respond in writing.\n\nRespectfully,\n${studentName || "[student name]"}\n${studentId ? `Student ID: ${studentId}` : "[student ID]"}`;

  const cc = scenario === "unposted_aid" && bursarEmail ? bursarEmail : "";
  const mailto = `mailto:${encodeURIComponent(aidEmail)}?${cc ? `cc=${encodeURIComponent(cc)}&` : ""}subject=${encodeURIComponent(`${subject} — ${studentName || "Student"}${studentId ? ` — ID ${studentId}` : ""}`)}&body=${encodeURIComponent(memo)}`;

  async function copyMemo() {
    try { await navigator.clipboard.writeText(memo); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); }
  }

  function changeScenario(next: AidScenario) { setScenario(next); setCheckedDocs([]); }

  return <article className="overflow-hidden bg-[#0B0F17] text-slate-100">
    <header className="border-b border-slate-800 bg-[radial-gradient(circle_at_80%_0%,rgba(2,132,199,.22),transparent_38%),linear-gradient(135deg,#0B0F17,#0C1724)] px-5 py-9 sm:px-8 lg:px-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-[11px] font-black tracking-[.16em] text-sky-300"><ShieldCheck size={15} />PRIVATE REGULATORY WORKSPACE</span>
      <h2 className="mt-5 max-w-5xl font-serif text-4xl leading-none text-white sm:text-6xl">Financial Aid Regulatory Defense &amp; Glitch Resolution</h2>
      <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">Turn delayed aid, verification limbo, income changes, or office silence into a documented request with the right evidence and official escalation route.</p>
    </header>

    <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(500px,.92fr)]">
      <section className="border-b border-slate-800 p-5 sm:p-8 xl:border-b-0 xl:border-r xl:p-10">
        <p className="text-xs font-black tracking-[.16em] text-sky-300">1 · CHOOSE THE PROCESS FAILURE</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {AID_SCENARIOS.map((item) => <button type="button" key={item.id} onClick={() => changeScenario(item.id)} aria-pressed={scenario === item.id} className={`rounded-xl border p-4 text-left ${scenario === item.id ? "border-sky-400 bg-sky-400/10 shadow-[0_0_0_1px_#38BDF8]" : "border-slate-700 bg-slate-900 hover:border-slate-500"}`}><span className="text-[10px] font-black tracking-[.13em] text-sky-300">{item.tag}</span><strong className="mt-3 block text-sm text-white">{item.title}</strong><span className="mt-2 block text-xs leading-5 text-slate-400">{item.text}</span></button>)}
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <AidField label="Student name" value={studentName} setValue={setStudentName} placeholder="Full name" />
          <AidField label="Student ID" value={studentId} setValue={setStudentId} placeholder="Never enter an SSN" />
          <AidField label="Institution" value={institutionName} setValue={setInstitutionName} placeholder="College or university" />
          <AidField label="Financial Aid email" value={aidEmail} setValue={setAidEmail} placeholder="financialaid@school.edu" type="email" />
          <AidField label="Bursar email" value={bursarEmail} setValue={setBursarEmail} placeholder="Used as CC for unposted aid" type="email" />
          <AidField label="Drop or decision deadline" value={deadline} setValue={setDeadline} placeholder="Date, time, and time zone" />
          {scenario === "unposted_aid" && <><AidField label="Pending ledger amount" value={pendingBalance} setValue={setPendingBalance} placeholder="Numbers only" /><fieldset className="grid gap-2"><legend className="text-xs font-bold text-slate-200">Aid still missing from the ledger</legend>{Object.entries(sourceLabels).map(([id, label]) => <CheckRow key={id} label={label} checked={sources.includes(id)} onChange={() => setSources((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} />)}</fieldset></>}
          {scenario === "plus_denial" && <><label className="grid gap-2 text-xs font-bold text-slate-200"><span>Academic level</span><select value={standing} onChange={(event) => setStanding(event.target.value)} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm"><option value="first_or_second">First or second year · up to $4,000 additional</option><option value="third_plus">Third year or beyond · up to $5,000 additional</option></select></label><AidField label="PLUS application reference (optional)" value={plusReference} setValue={setPlusReference} placeholder="Reference number" /></>}
          {scenario === "pj_appeal" && <><label className="grid gap-2 text-xs font-bold text-slate-200"><span>Special circumstance</span><select value={hardship} onChange={(event) => setHardship(event.target.value)} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm"><option>job loss or reduced wages</option><option>catastrophic uninsured medical expenses</option><option>death of a primary contributor</option><option>divorce or separation</option><option>change in housing status</option></select></label><AidField label="Estimated annual income reduction" value={incomeReduction} setValue={setIncomeReduction} placeholder="Numbers only" /></>}
          {scenario === "office_ghosting" && <><AidField label="Business days without resolution" value={daysElapsed} setValue={setDaysElapsed} placeholder="Example: 8" /><AidField label="Offices already contacted" value={attemptedOffices} setValue={setAttemptedOffices} placeholder="Financial Aid, Bursar, Registrar" /></>}
          <label className="grid gap-2 text-xs font-bold text-slate-200 sm:col-span-2"><span>Dated factual timeline</span><textarea value={facts} onChange={(event) => setFacts(event.target.value)} placeholder="Example: Sept. 8 — uploaded tax transcript; Sept. 10 — portal marked received; Sept. 17 — class-drop warning received." className="min-h-28 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-sky-400" /></label>
        </div>

        <section className="mt-9 rounded-xl border border-slate-700 bg-slate-900 p-5">
          <div className="flex items-start gap-3"><FileCheck2 className="shrink-0 text-emerald-400" /><div><p className="text-[10px] font-black tracking-[.16em] text-emerald-300">REQUIRED ADMINISTRATIVE ATTACHMENTS</p><h3 className="mt-2 font-serif text-2xl text-white">Prepare the evidence before escalating.</h3><p className="mt-2 text-xs leading-5 text-slate-400">The school may accept alternatives. Redact SSNs, account numbers, passwords, and unrelated medical details.</p></div></div>
          <div className="mt-5 grid gap-3">{authority.requiredDocs.map((doc, index) => <CheckRow key={doc} label={doc} checked={checkedDocs.includes(index)} onChange={() => setCheckedDocs((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} />)}</div>
        </section>

        <section className="mt-6 rounded-xl border border-sky-400/30 bg-sky-400/10 p-5"><span className="inline-flex items-center gap-2 rounded-full bg-sky-300 px-3 py-1 text-[10px] font-black text-slate-950"><Scale size={13} />OFFICIAL STATUTORY CITATION</span><h3 className="mt-4 font-serif text-2xl text-white">{authority.statute}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{authority.officialSummary}</p></section>
      </section>

      <section className="bg-[#070A10] p-5 sm:p-8 xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto xl:p-10">
        <div className="rounded-xl border border-slate-700 bg-[#F8F7F2] text-slate-950 shadow-2xl"><header className="border-b border-slate-300 p-6"><div className="flex justify-between gap-5"><div><p className="text-[9px] font-black tracking-[.2em] text-sky-800">EFF · REACH REGULATORY DEFENSE</p><h3 className="mt-2 font-serif text-2xl">Formal Financial Aid Memorandum</h3></div><Landmark className="text-sky-800" /></div><span className="mt-4 inline-flex rounded-full border border-sky-800 px-3 py-1 text-[9px] font-black">GOVERNING LAW: {authority.statute}</span></header><pre className="max-h-[650px] overflow-auto whitespace-pre-wrap p-6 font-serif text-[12px] leading-6">{memo}</pre></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={copyMemo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-black text-slate-950"><Clipboard size={17} />{copied ? "Copied to clipboard" : "Copy formal memorandum"}</button><a href={mailto} onClick={(event) => { if (!aidEmail) event.preventDefault(); }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-center text-sm font-black ${aidEmail ? "bg-sky-400 text-slate-950" : "cursor-not-allowed border border-slate-700 text-slate-500"}`}><Mail size={17} />Open in campus mail (.edu)</a></div>
        {!aidEmail && <p className="mt-2 text-xs text-amber-200">Enter the campus Financial Aid email to activate the mail button.</p>}

        <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-[10px] font-black tracking-[.16em] text-rose-300">INDEPENDENT EXTERNAL OVERSIGHT &amp; LEGAL FALLBACKS</p><div className="mt-4 grid gap-3"><ExternalCard href={authority.primaryActionUrl} title={authority.actionLabel} /><ExternalCard href={authority.escalationUrl} title={authority.escalationLabel} /><ExternalCard href="https://studentaid.gov/feedback-ombudsman/disputes/prepare" title="U.S. Department of Education FSA Ombudsman" /><ExternalCard href="https://www.house.gov/representatives/find-your-representative" title="Find Your U.S. Representative" /><ExternalCard href="https://www.irs.gov/individuals/get-transcript" title="Official IRS Transcript Portal" /></div><p className="mt-4 text-xs leading-5 text-slate-400">External review and congressional constituent services can request information or facilitate communication; they do not guarantee aid, reverse a school decision automatically, or replace an appeal deadline.</p></section>
      </section>
    </div>
  </article>;
}

function formatMoney(value: string) { const amount = Number(value.replace(/[^0-9.]/g, "")); return Number.isFinite(amount) ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount) : "$0.00"; }
function AidField({ label, value, setValue, placeholder, type = "text" }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; type?: string }) { return <label className="grid gap-2 text-xs font-bold text-slate-200"><span>{label}</span><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} type={type} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-400" /></label>; }
function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) { return <button type="button" onClick={onChange} aria-pressed={checked} className={`flex items-start gap-3 rounded-lg border p-3 text-left text-xs leading-5 ${checked ? "border-emerald-400 bg-emerald-400/10 text-emerald-100" : "border-slate-700 bg-slate-950 text-slate-300"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-slate-600"}`}>{checked && <Check size={14} />}</span>{label}</button>; }
function ExternalCard({ href, title }: { href: string; title: string }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm font-bold text-sky-300 hover:border-sky-400"><span>{title}</span><ExternalLink size={16} className="shrink-0" /></a>; }
