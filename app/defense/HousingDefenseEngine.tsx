"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Clipboard, ExternalLink, FileCheck2, HeartHandshake, Home, Mail, ShieldAlert } from "lucide-react";

type HousingScenario = "off_campus_eviction" | "dorm_lockout" | "unhoused_couch" | "unsafe_lease_break";

const VERIFIED_HOUSING_AUTHORITY = {
  eviction_defense: {
    statute: "State and local landlord-tenant law; URLTA only where adopted",
    officialSummary: "Eviction procedure, notice, lockout rules, and cure periods depend on the state, locality, lease, and housing program. Many jurisdictions prohibit landlord self-help removal.",
    primaryActionUrl: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-aid",
    actionLabel: "Legal Services Corporation — find free legal aid",
    escalationUrl: "https://nlihc.org/",
    escalationLabel: "National Low Income Housing Coalition",
    requiredDocs: ["Current signed residential lease", "Notice to pay, notice to vacate, eviction complaint, or lockout message", "Rent ledger and payment receipts", "Dated log of lockout, utility, entry, or removal threats"],
  },
  dorm_emergency: {
    statute: "Campus housing contract, residence-life procedures, and student emergency-retention policies",
    officialSummary: "Campus housing remedies are institution-specific. A Dean of Students or CARE Team may coordinate emergency lodging or a temporary review, but availability is not guaranteed.",
    primaryActionUrl: "https://schoolhouseconnection.org",
    actionLabel: "SchoolHouse Connection higher-education support",
    escalationUrl: "https://www.211.org",
    escalationLabel: "211 local housing and coordinated-entry support",
    requiredDocs: ["Campus housing lockout notice or warning", "Itemized campus ledger showing housing charges", "Enrollment verification and current class schedule", "Campus housing contract or handbook section"],
  },
  homeless_liaison: {
    statute: "FAFSA Simplification Act homeless-youth provisions and applicable state/campus basic-needs rules",
    officialSummary: "Unaccompanied homeless youth and students at risk of homelessness may qualify for federal-aid status determinations and campus or community referrals. Housing itself is not guaranteed.",
    primaryActionUrl: "https://www.hudexchange.info/housing-and-homeless-assistance/",
    actionLabel: "HUD housing and homeless-assistance directory",
    escalationUrl: "https://studentaid.gov/help/unusual-circumstances",
    escalationLabel: "Federal Student Aid unusual-circumstances guidance",
    requiredDocs: ["Any available liaison, shelter, case-manager, counselor, or service-provider statement", "Current FAFSA Submission Summary or aid-status page", "Enrollment verification", "Safe contact method and immediate lodging dates needed"],
  },
  safe_housing_break: {
    statute: "VAWA protections for covered housing plus applicable state safe-housing law",
    officialSummary: "VAWA housing protections apply to covered federal housing programs; private-lease termination rights depend heavily on state law. Survivors should use confidential safety planning and local legal advice.",
    primaryActionUrl: "https://www.thehotline.org/",
    actionLabel: "National Domestic Violence Hotline — confidential support",
    escalationUrl: "https://www.womenslaw.org/",
    escalationLabel: "WomensLaw state-by-state legal information",
    requiredDocs: ["Only the documentation permitted by the applicable program or state law", "Lease and any HUD/VAWA notice received", "Written safety-related request using a safe contact method", "Protective order, professional statement, or police record only when available and legally appropriate"],
  },
} as const;

const HOUSING_SCENARIOS: Array<{ id: HousingScenario; tag: string; title: string; text: string }> = [
  { id: "off_campus_eviction", tag: "NOTICE OR LOCKOUT", title: "Off-campus eviction defense", text: "Document the notice, check for self-help tactics, and contact local legal aid immediately." },
  { id: "dorm_lockout", tag: "CAMPUS HOUSING", title: "Dorm lockout or balance", text: "Request coordinated review and temporary bridge occupancy before displacement." },
  { id: "unhoused_couch", tag: "NO STABLE PLACE", title: "Couch-surfing or unhoused", text: "Build a campus basic-needs and community coordinated-entry request." },
  { id: "unsafe_lease_break", tag: "SAFETY FIRST", title: "Unsafe housing or survivor support", text: "Use confidential safety planning and verify VAWA or state lease protections." },
];

export default function HousingDefenseEngine() {
  const [scenario, setScenario] = useState<HousingScenario>("off_campus_eviction");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [deanEmail, setDeanEmail] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [amount, setAmount] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [facts, setFacts] = useState("");
  const [hudCovered, setHudCovered] = useState("unknown");
  const [lockoutFlags, setLockoutFlags] = useState<string[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const authorityKey = scenario === "off_campus_eviction" ? "eviction_defense" : scenario === "dorm_lockout" ? "dorm_emergency" : scenario === "unhoused_couch" ? "homeless_liaison" : "safe_housing_break";
  const authority = VERIFIED_HOUSING_AUTHORITY[authorityKey];
  const title = HOUSING_SCENARIOS.find((item) => item.id === scenario)?.title ?? "Housing review";
  const lockoutWarning = scenario === "off_campus_eviction" && lockoutFlags.length > 0;
  const request = useMemo(() => {
    if (scenario === "off_campus_eviction") return "I dispute any removal, lock change, utility interruption, or physical exclusion that occurs outside the lawful process applicable in this jurisdiction. I request the exact notice, court status, cure amount, hearing information, and a written pause while I contact local legal aid and explore eviction-diversion options.";
    if (scenario === "dorm_lockout") return "I request an immediate Dean of Students / CARE Team review and any temporary bridge occupancy, emergency lodging, short administrative hold, or documented payment-review process available under campus policy.";
    if (scenario === "unhoused_couch") return "I do not currently have stable, fixed, and adequate nighttime housing. I request immediate campus basic-needs intake, safe temporary-lodging options, a homeless-youth or unusual-circumstances financial-aid determination if applicable, and referral to local coordinated entry.";
    return `I am requesting confidential safety-related housing assistance. ${hudCovered === "yes" ? "I believe this housing may be covered by a federal housing program and request the applicable VAWA notice, confidential process, and emergency-transfer or lease-bifurcation options." : hudCovered === "no" ? "This appears to be private housing; I request the state-specific safe-housing procedure and will verify it with local legal aid before relying on a lease termination right." : "Please identify whether this is a VAWA-covered housing program and which federal, state, or local protections apply."}`;
  }, [hudCovered, scenario]);

  const memo = `FORMAL HOUSING SAFETY AND ADMINISTRATIVE NOTICE\n\nTO: ${scenario === "dorm_lockout" || scenario === "unhoused_couch" ? "Residence Life / Dean of Students" : "Housing Provider / Property Manager"}\nFROM: ${name || "[student or tenant name]"}\nDATE: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}\nPROPERTY / CAMPUS ADDRESS: ${address || "[address or residence hall]"}\nINSTITUTION: ${school || "[college or university]"}\nFORMAL CLASSIFICATION: ${title}\nGOVERNING FRAMEWORK: ${authority.statute}\nNOTICE RECEIVED: ${noticeDate || "[date]"}\nDEADLINE: ${deadline || "[date and time]"}\nAMOUNT SHOWN: ${amount ? formatMoney(amount) : "[amount, if applicable]"}\n\nNOTICE AND REQUEST\n\n${request}\n\nFACTUAL RECORD\n${facts || "[List only dated facts: the notice received, what was said, who was contacted, current housing status, and the immediate safety or enrollment consequence.]"}\n\nREQUESTED WRITTEN RESPONSE\nPlease confirm the controlling lease, policy, statute, notice period, decision-maker, appeal or hearing process, and any emergency bridge or diversion option before ${deadline || "the stated deadline"}. Preserve all account, access, communication, and notice records.\n\nThis notice does not concede the accuracy of a balance, waive any defense, or claim that one model law applies in every state. I am seeking state- and program-specific review. For safety-related matters, communicate only through the safe contact method I have provided.\n\nRespectfully,\n${name || "[name]"}`;

  const subject = `${scenario === "unsafe_lease_break" ? "CONFIDENTIAL SAFETY REQUEST" : "URGENT HOUSING REVIEW"}: ${title} — ${name || "Student"}`;
  const mailto = `mailto:${encodeURIComponent(recipientEmail)}?${deanEmail ? `cc=${encodeURIComponent(deanEmail)}&` : ""}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(memo)}`;

  async function copyMemo() { try { await navigator.clipboard.writeText(memo); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); } }
  function selectScenario(next: HousingScenario) { setScenario(next); setCheckedDocs([]); setLockoutFlags([]); }

  return <article className="overflow-hidden bg-[#0B0F17] text-slate-100">
    <header className="border-b border-slate-800 bg-[radial-gradient(circle_at_82%_0%,rgba(244,63,94,.22),transparent_38%),linear-gradient(135deg,#0B0F17,#190C14)] px-5 py-9 sm:px-8 lg:px-12"><span className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-[11px] font-black tracking-[.16em] text-rose-300"><Home size={15} />PRIVATE HOUSING DEFENSE WORKSPACE</span><h2 className="mt-5 max-w-5xl font-serif text-4xl leading-none text-white sm:text-6xl">Emergency Housing Defense &amp; Eviction Protection</h2><p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">Create a factual housing record, find the correct local authority, and request protection before displacement disrupts enrollment.</p></header>
    <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(500px,.92fr)]">
      <section className="border-b border-slate-800 p-5 sm:p-8 xl:border-b-0 xl:border-r xl:p-10">
        <div className="mb-6 rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100"><strong>If you are in immediate danger, call 911.</strong> For confidential domestic-violence support, contact the National Domestic Violence Hotline at 800-799-SAFE or visit TheHotline.org using a safe device.</div>
        <div className="grid gap-3 sm:grid-cols-2">{HOUSING_SCENARIOS.map((item) => <button key={item.id} type="button" onClick={() => selectScenario(item.id)} aria-pressed={scenario === item.id} className={`rounded-xl border p-4 text-left ${scenario === item.id ? "border-rose-400 bg-rose-400/10 shadow-[0_0_0_1px_#FB7185]" : "border-slate-700 bg-slate-900"}`}><span className="text-[10px] font-black tracking-[.14em] text-rose-300">{item.tag}</span><strong className="mt-3 block text-sm text-white">{item.title}</strong><span className="mt-2 block text-xs leading-5 text-slate-400">{item.text}</span></button>)}</div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2"><HousingField label="Student or tenant name" value={name} setValue={setName} placeholder="Full name" /><HousingField label="College or university" value={school} setValue={setSchool} placeholder="Institution" /><HousingField label="Housing-provider or campus email" value={recipientEmail} setValue={setRecipientEmail} placeholder="Recipient email" type="email" /><HousingField label="Dean of Students email (optional)" value={deanEmail} setValue={setDeanEmail} placeholder="CC email" type="email" /><HousingField label="Property address or residence hall" value={address} setValue={setAddress} placeholder="Address" /><HousingField label="State" value={state} setValue={setState} placeholder="Rules vary by state" /><HousingField label="Rent or housing amount shown" value={amount} setValue={setAmount} placeholder="Numbers only" /><HousingField label="Notice date" value={noticeDate} setValue={setNoticeDate} placeholder="Date received" /><HousingField label="Move-out, lockout, or response deadline" value={deadline} setValue={setDeadline} placeholder="Date and time" />{scenario === "unsafe_lease_break" && <label className="grid gap-2 text-xs font-bold text-slate-200"><span>HUD-assisted or federally covered housing?</span><select value={hudCovered} onChange={(event) => setHudCovered(event.target.value)} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm"><option value="unknown">I do not know</option><option value="yes">Yes</option><option value="no">No / private lease</option></select></label>}<label className="grid gap-2 text-xs font-bold text-slate-200 sm:col-span-2"><span>Dated factual timeline</span><textarea value={facts} onChange={(event) => setFacts(event.target.value)} className="min-h-28 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm leading-6 outline-none focus:border-rose-400" placeholder="Date · notice or event · person contacted · response" /></label></div>

        {scenario === "off_campus_eviction" && <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-[10px] font-black tracking-[.16em] text-rose-300">SELF-HELP LOCKOUT RIGHTS AUDIT</p><div className="mt-4 grid gap-3">{["Threatened or changed locks without a completed court process","Threatened or shut off water, power, heat, or another essential utility","Entered the unit without the notice required by the lease or local law","Removed doors, windows, belongings, or access devices"].map((label) => <HousingCheck key={label} label={label} checked={lockoutFlags.includes(label)} onChange={() => setLockoutFlags((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label])} />)}</div>{lockoutWarning && <div className="mt-4 flex gap-3 rounded-lg border border-rose-400 bg-rose-500/20 p-4 text-sm leading-6 text-rose-100"><ShieldAlert className="shrink-0" /><p><strong>POTENTIAL UNLAWFUL LOCKOUT WARNING:</strong> Self-help removal is prohibited in many jurisdictions, but the exact rule and enforcement process are state- and locality-specific. Do not physically confront anyone. Contact local legal aid, the court clerk, or emergency services if access, utilities, or safety are threatened.</p></div>}</section>}

        <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-5"><div className="flex gap-3"><FileCheck2 className="shrink-0 text-emerald-400" /><div><p className="text-[10px] font-black tracking-[.16em] text-emerald-300">DOCUMENTARY EVIDENCE CHECKLIST</p><h3 className="mt-2 font-serif text-2xl">Prepare only what is safe and relevant.</h3></div></div><div className="mt-4 grid gap-3">{authority.requiredDocs.map((doc, index) => <HousingCheck key={doc} label={doc} checked={checkedDocs.includes(index)} onChange={() => setCheckedDocs((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} />)}</div></section>
      </section>

      <section className="bg-[#070A10] p-5 sm:p-8 xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto xl:p-10"><div className="rounded-xl border border-slate-700 bg-[#F8F7F2] text-slate-950 shadow-2xl"><header className="border-b border-slate-300 p-6"><div className="flex justify-between gap-5"><div><p className="text-[9px] font-black tracking-[.2em] text-rose-800">EFF · REACH HOUSING DEFENSE</p><h3 className="mt-2 font-serif text-2xl">Formal Housing Notice</h3></div><Home className="text-rose-800" /></div><span className="mt-4 inline-flex rounded-full border border-rose-800 px-3 py-1 text-[9px] font-black">GOVERNING FRAMEWORK: {authority.statute}</span></header><pre className="max-h-[650px] overflow-auto whitespace-pre-wrap p-6 font-serif text-[12px] leading-6">{memo}</pre></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={copyMemo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-black text-slate-950"><Clipboard size={17} />{copied ? "Copied to clipboard" : "Copy formal notice"}</button><a href={mailto} onClick={(event) => { if (!recipientEmail) event.preventDefault(); }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-center text-sm font-black ${recipientEmail ? "bg-rose-400 text-slate-950" : "cursor-not-allowed border border-slate-700 text-slate-500"}`}><Mail size={17} />Open in email client</a></div>
        <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-[10px] font-black tracking-[.16em] text-amber-300">INDEPENDENT LEGAL &amp; SAFETY ESCAPES</p><p className="mt-3 text-sm leading-6 text-slate-300">{authority.officialSummary}</p><div className="mt-4 grid gap-3"><HousingLink href={authority.primaryActionUrl} label={authority.actionLabel} /><HousingLink href={authority.escalationUrl} label={authority.escalationLabel} /><HousingLink href="https://www.211.org" label="211 local emergency housing and coordinated entry" /><HousingLink href="https://www.thehotline.org/" label="National Domestic Violence Hotline" /><HousingLink href="https://www.hud.gov/vawa" label="HUD VAWA housing protections" /></div></section>
      </section>
    </div>
  </article>;
}

function formatMoney(value: string) { const amount = Number(value.replace(/[^0-9.]/g, "")); return Number.isFinite(amount) ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount) : "$0.00"; }
function HousingField({ label, value, setValue, placeholder, type = "text" }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; type?: string }) { return <label className="grid gap-2 text-xs font-bold text-slate-200"><span>{label}</span><input value={value} onChange={(event) => setValue(event.target.value)} type={type} placeholder={placeholder} className="min-h-12 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-rose-400" /></label>; }
function HousingCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) { return <button type="button" onClick={onChange} aria-pressed={checked} className={`flex items-start gap-3 rounded-lg border p-3 text-left text-xs leading-5 ${checked ? "border-emerald-400 bg-emerald-400/10 text-emerald-100" : "border-slate-700 bg-slate-950 text-slate-300"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-slate-600"}`}>{checked && <Check size={14} />}</span>{label}</button>; }
function HousingLink({ href, label }: { href: string; label: string }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm font-bold text-rose-300 hover:border-rose-400"><span>{label}</span><ExternalLink size={16} /></a>; }
