"use client";

import { useEffect, useMemo, useState } from "react";
import { Bus, Check, Clipboard, ExternalLink, FileCheck2, HeartHandshake, Home, Laptop, Mail, Scale, ShieldAlert, ShoppingBasket, WalletCards } from "lucide-react";
import TuitionRetentionEngine from "./TuitionRetentionEngine";
import FinancialAidRegulatoryEngine from "./FinancialAidRegulatoryEngine";
import HousingDefenseEngine from "./HousingDefenseEngine";

export type RetentionCategory = "tuition" | "financial_aid" | "housing" | "transportation" | "essentials" | "courseware" | "holistic";
type Category = RetentionCategory;

const UNIFIED_AUTHORITY_DATABASE = {
  tuition: { title: "Tuition, Balances & Enrollment Holds", statute: "34 CFR § 668.14(b)(33)–(34) and institutional retention policies", primaryUrl: "https://studentaid.gov/feedback-ombudsman/disputes/prepare", primaryLabel: "Federal Student Aid Ombudsman Dispute Portal", escalationUrl: "https://www.house.gov/representatives/find-your-representative", escalationLabel: "Congressional Casework Assistance", requiredDocs: ["Itemized student billing ledger showing the balance breakdown", "Current class schedule or degree audit", "Notice of pending schedule cancellation, registration hold, or deadline"] },
  financial_aid: { title: "Financial Aid Glitches & Processing Delays", statute: "34 CFR § 668.164 and HEA § 479A", primaryUrl: "https://studentaid.gov/plus-app/parent/landing", primaryLabel: "StudentAid.gov Parent PLUS Application and Status", secondaryUrl: "https://www.irs.gov/individuals/get-transcript", secondaryLabel: "Official IRS Transcript Portal", requiredDocs: ["Financial aid award page showing the current status", "Parent PLUS adverse-credit decision, when applicable", "Employer, income, tax, or special-circumstances documentation requested by the school"] },
  housing: { title: "Emergency Housing & Eviction Defense", statute: "State/local landlord-tenant law; VAWA for covered housing; campus housing policy", primaryUrl: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-aid", primaryLabel: "Legal Services Corporation — Find Free Legal Aid", secondaryUrl: "https://www.hudexchange.info/housing-and-homeless-assistance/", secondaryLabel: "HUD Housing and Homeless-Assistance Directory", safetyUrl: "https://www.thehotline.org/", safetyLabel: "National Domestic Violence Hotline", requiredDocs: ["Current signed lease or campus housing contract", "Written notice to vacate, lockout warning, or housing notice", "Rent or campus housing ledger and payment receipts"] },
  transportation: { title: "Commuter & Mobility Defense", statute: "IRC § 132(f) commuter-benefit framework and applicable campus transit policies", primaryUrl: "https://www.211.org", primaryLabel: "211 Local Transportation and Emergency Assistance", secondaryUrl: "https://www.workingcarsforworkingfamilies.org/", secondaryLabel: "Working Cars for Working Families", requiredDocs: ["Itemized repair estimate from a licensed mechanic, when applicable", "Class schedule showing required in-person attendance", "Work schedule or commuting requirement", "Transit route, fare, or pass documentation"] },
  essentials: { title: "Food Insecurity & Daily Material Needs", statute: "7 CFR § 273.5 student SNAP rules and applicable state eligibility rules", primaryUrl: "https://www.fns.usda.gov/snap/students", primaryLabel: "USDA Student SNAP Guidance", secondaryUrl: "https://swipehunger.org/campus-partners/", secondaryLabel: "Swipe Out Hunger Campus Partners", periodUrl: "https://allianceforperiodsupplies.org/find-programs/", periodLabel: "Alliance for Period Supplies", requiredDocs: ["Financial aid notice showing Federal Work-Study, if awarded", "Recent pay statements if using a work-hours student exemption", "Class schedule and campus dining balance", "Household and income records requested by the state SNAP agency"] },
  courseware: { title: "Books, Courseware & Hardware Access", statute: "HEOA § 133 textbook-information framework and institutional library/accessibility policies", primaryUrl: "https://openstax.org/subjects", primaryLabel: "OpenStax Free Peer-Reviewed Textbooks", secondaryUrl: "https://www.pcsforpeople.org/eligibility/", secondaryLabel: "PCs for People Eligibility", libraryUrl: "https://www.worldcat.org/", libraryLabel: "WorldCat and Interlibrary Loan Search", requiredDocs: ["Syllabus naming the required title, edition, access code, and due date", "Screenshot of the publisher-access barrier or price", "Pell or income documentation only when a hardware program requests it", "Campus library account or student ID for reserve requests"] },
  holistic: { title: "Academic Navigation & Crisis Lifelines", statute: "Federal Work-Study program rules, institutional academic-support policies, and the 988 Lifeline network", primaryUrl: "https://988lifeline.org/", primaryLabel: "988 Suicide & Crisis Lifeline", secondaryUrl: "https://www.crisistextline.org/", secondaryLabel: "Crisis Text Line", workStudyUrl: "https://studentaid.gov/understand-aid/types/work-study", workStudyLabel: "Federal Work-Study Overview", requiredDocs: ["Current resume and unofficial transcript for recommendation preparation", "Scholarship, internship, or program prompt and deadline", "Financial aid notice showing Federal Work-Study, when applicable", "A safe contact plan for urgent wellness support"] },
} as const;

const CATEGORIES: Array<{ id: Category; short: string; title: string; icon: typeof Scale; color: string }> = [
  { id: "tuition", short: "Tuition", title: "Balances, drops & holds", icon: Scale, color: "text-emerald-300" },
  { id: "financial_aid", short: "Financial Aid", title: "Delays, denials & verification", icon: WalletCards, color: "text-sky-300" },
  { id: "housing", short: "Housing", title: "Eviction, dorm & safety", icon: Home, color: "text-rose-300" },
  { id: "transportation", short: "Transportation", title: "Fuel, repair & transit", icon: Bus, color: "text-amber-300" },
  { id: "essentials", short: "Essentials", title: "Food, hygiene & period care", icon: ShoppingBasket, color: "text-emerald-300" },
  { id: "courseware", short: "Courseware", title: "Codes, books & devices", icon: Laptop, color: "text-sky-300" },
  { id: "holistic", short: "Whole Student", title: "Academic, work & crisis care", icon: HeartHandshake, color: "text-violet-300" },
];

const ACTION_PLANS: Record<"transportation" | "essentials" | "courseware" | "holistic", string[]> = {
  transportation: [
    "Ask the Dean of Students, basic-needs office, and campus transit office about emergency rides, gas support, passes, or commuter grants.",
    "Send the class schedule and commute documentation before an absence becomes an academic penalty.",
    "For a repair, get an itemized estimate and ask 211 or a local workforce agency about verified transportation partners.",
  ],
  essentials: [
    "Request the campus pantry, emergency meal swipes, hygiene closet, or basic-needs appointment for immediate relief.",
    "Use the USDA student guidance to screen for SNAP exemptions, then complete the official application through your state agency.",
    "For period products, check the campus health center and the Alliance for Period Supplies directory while longer-term help is reviewed.",
  ],
  courseware: [
    "Check the publisher account for an official grace period or temporary-access option; never use shared or pirated access codes.",
    "Ask the instructor and publisher support for a temporary code or assignment accommodation while payment is resolved.",
    "Request library course reserves, interlibrary loan, or an instructor-approved OpenStax/OER alternative.",
    "For a laptop or charger, ask the library, IT office, TRIO, and basic-needs office about loaners before purchasing.",
  ],
  holistic: [
    "For a recommendation, send a concise brag sheet, the opportunity prompt, submission instructions, and the real deadline.",
    "For work-study, ask financial aid and student employment for open roles, reassignment steps, and expected weekly hours.",
    "For immediate emotional crisis support, call or text 988; call 911 if there is imminent danger.",
  ],
};

export default function RetentionTerminal({ initialCategory = "tuition" }: { initialCategory?: RetentionCategory }) {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [triage, setTriage] = useState<"general" | "crisis">("crisis");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("category") as Category | null;
    if (requested && CATEGORIES.some((item) => item.id === requested)) queueMicrotask(() => setCategory(requested));
  }, []);

  const chooseCategory = (next: Category) => {
    setCategory(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tool", "tuition");
    url.searchParams.set("category", next);
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
  };

  return <article className="bg-[#0B0F17] text-slate-100">
    <div role="navigation" className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B0F17]/95 px-4 py-4 backdrop-blur-xl sm:px-7" aria-label="REACH retention categories">
      <div className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto pb-1">{CATEGORIES.map((item) => { const Icon = item.icon; const active = category === item.id; return <button type="button" key={item.id} onClick={() => chooseCategory(item.id)} aria-pressed={active} className={`min-w-[150px] rounded-xl border px-3 py-3 text-left transition ${active ? "border-white/40 bg-white/10" : "border-slate-800 bg-slate-950 hover:border-slate-600"}`}><span className="flex items-center gap-2"><Icon size={16} className={item.color} /><strong className="text-sm text-white">{item.short}</strong></span><span className="mt-1 block text-xs leading-4 text-slate-400">{item.title}</span></button>; })}</div>
    </div>

    <section className={`border-b px-5 py-5 sm:px-8 ${triage === "crisis" ? "border-rose-400/40 bg-rose-400/10" : "border-violet-400/30 bg-violet-400/10"}`}>
      <div className="mx-auto flex max-w-[1450px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3"><ShieldAlert className={triage === "crisis" ? "text-rose-300" : "text-violet-300"} /><div><p className="text-[10px] font-black tracking-[.18em]">EMERGENCY HARDSHIP VS. SOCIAL GIVEAWAY TRIAGE</p><h2 className="mt-1 font-serif text-2xl text-white">Tell REACH what kind of help you need.</h2>{triage === "crisis" && <p className="mt-1 text-sm text-slate-300">Urgent tools and administrative levers are prioritized. If safety is at risk, use emergency services first.</p>}</div></div>
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Support urgency"><button type="button" onClick={() => setTriage("general")} aria-pressed={triage === "general"} className={`rounded-lg border px-4 py-3 text-sm font-black ${triage === "general" ? "border-violet-300 bg-violet-300 text-slate-950" : "border-slate-700 bg-slate-950"}`}>General scholarship inquiry</button><button type="button" onClick={() => setTriage("crisis")} aria-pressed={triage === "crisis"} className={`rounded-lg border px-4 py-3 text-sm font-black ${triage === "crisis" ? "border-rose-300 bg-rose-300 text-slate-950" : "border-slate-700 bg-slate-950"}`}>Immediate academic / survival crisis</button></div>
      </div>
    </section>

    {category === "tuition" && <TuitionRetentionEngine />}
    {category === "financial_aid" && <FinancialAidRegulatoryEngine />}
    {category === "housing" && <HousingDefenseEngine />}
    {(category === "transportation" || category === "essentials" || category === "courseware" || category === "holistic") && <BasicNeedsEngine category={category} urgent={triage === "crisis"} />}
  </article>;
}

function BasicNeedsEngine({ category, urgent }: { category: "transportation" | "essentials" | "courseware" | "holistic"; urgent: boolean }) {
  const authority = UNIFIED_AUTHORITY_DATABASE[category];
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amount, setAmount] = useState("");
  const [facts, setFacts] = useState("");
  const [transportType, setTransportType] = useState("fuel");
  const [commute, setCommute] = useState("5");
  const [workStudy, setWorkStudy] = useState(false);
  const [work20, setWork20] = useState(false);
  const [singleParent, setSingleParent] = useState(false);
  const [needType, setNeedType] = useState("food and campus meals");
  const [platform, setPlatform] = useState("Pearson");
  const [course, setCourse] = useState("");
  const [supportType, setSupportType] = useState("recommendation package");
  const [professor, setProfessor] = useState("");
  const [grade, setGrade] = useState("");
  const [target, setTarget] = useState("");
  const [project, setProject] = useState("");
  const [checkedDocs, setCheckedDocs] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const snapSignal = [workStudy, work20, singleParent].filter(Boolean).length;
  const detail = useMemo(() => {
    if (category === "transportation") return `My barrier is ${transportType === "fuel" ? "fuel for a required commute" : transportType === "repair" ? "a vehicle repair affecting school access" : "a bus or train pass"}. I commute approximately ${commute || "[number]"} times per week. I request screening for campus emergency transportation, transit-pass, commuter-benefit, repair-referral, attendance-flexibility, or remote-access options. IRC § 132(f) describes certain qualified transportation benefits but does not require an employer or college to provide them.`;
    if (category === "essentials") return `I need support with ${needType}. SNAP student rules are complex and state-administered. My quick screener shows ${snapSignal ? "at least one potential student exemption signal" : "no selected exemption signal yet"}: ${workStudy ? "Federal Work-Study awarded; " : ""}${work20 ? "working approximately 20+ hours weekly; " : ""}${singleParent ? "single parent caring for a dependent child; " : ""}I request eligibility screening, a campus pantry or meal-swipe referral, and immediate essential-needs options while any application is pending.`;
    if (category === "courseware") return `The required platform or resource is ${platform}${course ? ` for ${course}` : ""}. I request an official temporary-access option from the publisher, library reserve or interlibrary-loan search, an open-resource equivalent approved by the instructor, and temporary assignment access while the barrier is resolved. I am not requesting a bypass of copyright, licensing, or course-integrity rules.`;
    return supportType === "recommendation package" ? `I am preparing a recommendation request for ${target || "[scholarship, internship, or program]"}. The recommender is ${professor || "[name]"}; relevant course or context: ${course || "[course]"}; grade or outcome: ${grade || "[outcome]"}; key project or evidence: ${project || "[project]"}. I request confirmation of willingness, submission instructions, and the deadline.` : supportType === "work-study reassignment" ? "My Federal Work-Study award has not resulted in usable earnings or a workable placement. I request available positions, reassignment steps, expected hours, and confirmation that an award is not guaranteed income until work is performed." : "I am seeking immediate wellness support. If there is imminent danger, I will call 911; for suicide or mental-health crisis support, I will call or text 988.";
  }, [category, commute, course, grade, needType, platform, professor, project, singleParent, snapSignal, supportType, target, transportType, work20, workStudy]);

  const subject = `${urgent ? "URGENT: " : ""}${authority.title} — ${name || "Student"}${studentId ? ` (ID: ${studentId})` : ""}`;
  const memo = `FORMAL STUDENT RETENTION MEMORANDUM\n\nTO: ${email || "[campus office or support contact]"}\nFROM: ${name || "[student name]"}\nDATE: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}\nRE: ${subject}\nSTUDENT ID: ${studentId || "[student ID]"}\nINSTITUTION: ${school || "[college or university]"}\nDEADLINE: ${deadline || "[date and time]"}\nAMOUNT OR COST BARRIER: ${amount ? formatMoney(amount) : "[amount, if applicable]"}\nINSTITUTIONAL REFERENCE: ${authority.statute}\n\nREQUEST FOR COORDINATED RETENTION SUPPORT\n\n${detail}\n\nFACTUAL RECORD\n${facts || "[Add dated facts, the exact barrier, offices already contacted, and the direct effect on attendance, coursework, employment, housing, or enrollment.]"}\n\nREQUESTED RESPONSE\nPlease identify the responsible office, written policy, available institutional and community options, documents required, decision timeline, and any safe temporary accommodation before ${deadline || "the stated deadline"}.\n\nThis request does not claim guaranteed eligibility or funding. It asks for a documented review and practical next step. Please respond in writing.\n\nRespectfully,\n${name || "[student name]"}`;
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(memo)}`;
  async function copy() { try { await navigator.clipboard.writeText(memo); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); } }

  return <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(500px,.92fr)]">
    <section className="border-b border-slate-800 p-5 sm:p-8 xl:border-b-0 xl:border-r xl:p-10"><p className="text-[10px] font-black tracking-[.18em] text-amber-300">{urgent ? "URGENT RETENTION PATH" : "GENERAL RESOURCE PATH"}</p><h2 className="mt-2 font-serif text-4xl text-white">{authority.title}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Complete only the fields that help the receiving office act. REACH does not save this information.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><TerminalField label="Student name" value={name} setValue={setName} placeholder="Full name" /><TerminalField label="Student ID" value={studentId} setValue={setStudentId} placeholder="Never enter an SSN" /><TerminalField label="Institution" value={school} setValue={setSchool} placeholder="College or university" /><TerminalField label="Recipient email" value={email} setValue={setEmail} placeholder="Campus office or support contact" type="email" /><TerminalField label="Deadline" value={deadline} setValue={setDeadline} placeholder="Date, time, and time zone" /><TerminalField label="Cost barrier, if any" value={amount} setValue={setAmount} placeholder="Numbers only" />
        {category === "transportation" && <><TerminalSelect label="Transportation barrier" value={transportType} setValue={setTransportType} options={[['fuel','Fuel'],['repair','Vehicle repair'],['transit','Bus or train pass']]} /><TerminalField label="Required commutes per week" value={commute} setValue={setCommute} placeholder="Example: 5" /></>}
        {category === "essentials" && <><TerminalSelect label="Immediate need" value={needType} setValue={setNeedType} options={[['food and campus meals','Food and campus meals'],['hygiene and laundry','Hygiene and laundry'],['period products','Period products']]} /><div className="grid gap-2 sm:col-span-2"><p className="text-xs font-bold text-slate-200">60-second SNAP student screener</p><TerminalCheck label="Federal Work-Study awarded" checked={workStudy} onChange={() => setWorkStudy(!workStudy)} /><TerminalCheck label="Working approximately 20+ hours per week" checked={work20} onChange={() => setWork20(!work20)} /><TerminalCheck label="Single parent caring for a dependent child" checked={singleParent} onChange={() => setSingleParent(!singleParent)} /><div className={`rounded-lg border p-3 text-sm ${snapSignal ? "border-emerald-400 bg-emerald-400/10 text-emerald-100" : "border-amber-400/40 bg-amber-400/10 text-amber-100"}`}>{snapSignal ? "Potential exemption signal found. This is not an eligibility decision—continue through your state SNAP agency." : "No signal selected. Other exemptions may still apply; use the official USDA guidance and state screening."}</div></div></>}
        {category === "courseware" && <><TerminalSelect label="Publisher or resource" value={platform} setValue={setPlatform} options={[['Pearson','Pearson'],['McGraw-Hill Connect','McGraw-Hill Connect'],['Cengage','Cengage'],['Textbook','Textbook'],['Laptop or charger','Laptop or charger']]} /><TerminalField label="Course and section" value={course} setValue={setCourse} placeholder="Example: BIO 101-03" /></>}
        {category === "holistic" && <><TerminalSelect label="Support request" value={supportType} setValue={setSupportType} options={[['recommendation package','Recommendation package'],['work-study reassignment','Work-study reassignment'],['mental-health crisis support','Mental-health crisis support']]} />{supportType === "recommendation package" && <><TerminalField label="Professor or recommender" value={professor} setValue={setProfessor} placeholder="Name and title" /><TerminalField label="Course or relationship" value={course} setValue={setCourse} placeholder="Course, role, or program" /><TerminalField label="Grade or outcome" value={grade} setValue={setGrade} placeholder="Truthful result" /><TerminalField label="Target opportunity" value={target} setValue={setTarget} placeholder="Scholarship or internship" /><TerminalField label="Key project or contribution" value={project} setValue={setProject} placeholder="One concrete example" /></>}</>}
        <label className="grid gap-2 text-xs font-bold text-slate-200 sm:col-span-2"><span>Dated factual timeline</span><textarea value={facts} onChange={(event) => setFacts(event.target.value)} className="min-h-28 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm leading-6 outline-none focus:border-amber-400" placeholder="Date · barrier · action already taken · direct academic consequence" /></label>
      </div>

      <section className="mt-8 rounded-xl border border-amber-300/30 bg-amber-300/10 p-5"><p className="text-xs font-black tracking-[.16em] text-amber-200">DO THESE NEXT</p><h3 className="mt-2 font-serif text-2xl text-white">Fast, lawful action plan</h3><ol className="mt-4 grid gap-3">{ACTION_PLANS[category].map((step, index) => <li key={step} className="flex gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-slate-200"><strong className="text-amber-300">{String(index + 1).padStart(2, "0")}</strong><span>{step}</span></li>)}</ol></section>

      <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-5"><div className="flex gap-3"><FileCheck2 className="text-emerald-400" /><div><p className="text-xs font-black tracking-[.16em] text-emerald-300">DOCUMENTARY EVIDENCE CHECKLIST</p><h3 className="mt-2 font-serif text-2xl">Prepare the proof the reviewer needs.</h3></div></div><div className="mt-4 grid gap-3">{authority.requiredDocs.map((doc, index) => <TerminalCheck key={doc} label={doc} checked={checkedDocs.includes(index)} onChange={() => setCheckedDocs((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} />)}</div></section>
    </section>

    <section className="bg-[#070A10] p-5 sm:p-8 xl:sticky xl:top-[90px] xl:max-h-[calc(100vh-90px)] xl:overflow-y-auto xl:p-10"><div className="rounded-xl border border-slate-700 bg-[#F8F7F2] text-slate-950 shadow-2xl"><header className="border-b border-slate-300 p-6"><p className="text-[9px] font-black tracking-[.2em] text-violet-800">EFF · REACH RETENTION TERMINAL</p><h3 className="mt-2 font-serif text-2xl">Formal Administrative Memorandum</h3><span className="mt-4 inline-flex rounded-full border border-violet-800 px-3 py-1 text-[9px] font-black">REFERENCE: {authority.statute}</span></header><pre className="max-h-[640px] overflow-auto whitespace-pre-wrap p-6 font-serif text-[12px] leading-6">{memo}</pre></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={copy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-black text-slate-950"><Clipboard size={17} />{copied ? "Copied to clipboard" : "Copy formal memorandum"}</button><a href={mailto} onClick={(event) => { if (!email) event.preventDefault(); }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-center text-sm font-black ${email ? "bg-violet-400 text-slate-950" : "cursor-not-allowed border border-slate-700 text-slate-500"}`}><Mail size={17} />Open in campus mail (.edu)</a></div>
      <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-[10px] font-black tracking-[.16em] text-sky-300">VERIFIED EXTERNAL ACTION LINKS</p><div className="mt-4 grid gap-3"><TerminalLink href={authority.primaryUrl} label={authority.primaryLabel} />{"secondaryUrl" in authority && <TerminalLink href={authority.secondaryUrl} label={authority.secondaryLabel} />}{"periodUrl" in authority && <TerminalLink href={authority.periodUrl} label={authority.periodLabel} />}{"libraryUrl" in authority && <TerminalLink href={authority.libraryUrl} label={authority.libraryLabel} />}{"workStudyUrl" in authority && <TerminalLink href={authority.workStudyUrl} label={authority.workStudyLabel} />}</div></section>
    </section>
  </div>;
}

function formatMoney(value: string) { const amount = Number(value.replace(/[^0-9.]/g, "")); return Number.isFinite(amount) ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount) : "$0.00"; }
function TerminalField({ label, value, setValue, placeholder, type = "text" }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; type?: string }) { return <label className="grid gap-2 text-xs font-bold text-slate-200"><span>{label}</span><input value={value} onChange={(event) => setValue(event.target.value)} type={type} placeholder={placeholder} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-amber-400" /></label>; }
function TerminalSelect({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: Array<[string, string]> }) { return <label className="grid gap-2 text-xs font-bold text-slate-200"><span>{label}</span><select value={value} onChange={(event) => setValue(event.target.value)} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-amber-400">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>; }
function TerminalCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) { return <button type="button" onClick={onChange} aria-pressed={checked} className={`flex items-start gap-3 rounded-lg border p-3 text-left text-xs leading-5 ${checked ? "border-emerald-400 bg-emerald-400/10 text-emerald-100" : "border-slate-700 bg-slate-950 text-slate-300"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-slate-600"}`}>{checked && <Check size={14} />}</span>{label}</button>; }
function TerminalLink({ href, label }: { href: string; label: string }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm font-bold text-sky-300 hover:border-sky-400"><span>{label}</span><ExternalLink size={16} /></a>; }
