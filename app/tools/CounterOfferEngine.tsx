"use client";

import { useMemo, useState } from "react";

type Offer = {
  id: "preferred" | "competing-one" | "competing-two";
  school: string;
  academicYear: string;
  housing: string;
  residency: string;
  costOfAttendance: string;
  tuitionFees: string;
  housingMeals: string;
  otherCosts: string;
  federalGrants: string;
  stateGrants: string;
  institutionalAid: string;
  outsideScholarships: string;
  loans: string;
  workStudy: string;
};

type ScorecardSchool = {
  id: number;
  name: string;
  state: string;
  netPrice: number | null;
  tuitionInState: number | null;
  tuitionOutOfState: number | null;
  pellRate: number | null;
};

const blankOffer = (id: Offer["id"]): Offer => ({
  id,
  school: "",
  academicYear: "2026–27",
  housing: "on-campus",
  residency: "in-state",
  costOfAttendance: "",
  tuitionFees: "",
  housingMeals: "",
  otherCosts: "",
  federalGrants: "",
  stateGrants: "",
  institutionalAid: "",
  outsideScholarships: "",
  loans: "",
  workStudy: "",
});

const number = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;
const currency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const amountFromLine = (line: string) => {
  const dollars = [...line.matchAll(/\$\s*(-?[\d,]+(?:\.\d{1,2})?)/g)].map((match) => Number(match[1].replaceAll(",", "")));
  if (dollars.length) return dollars.at(-1) || 0;
  const values = [...line.matchAll(/(?:^|\s)(-?[\d,]+\.\d{2})(?:\s|$)/g)].map((match) => Number(match[1].replaceAll(",", "")));
  return values.at(-1) || 0;
};

function parseOffer(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const sum = (include: RegExp, exclude: RegExp = /\btotal\b|estimated|cost of attendance|net price/i) => lines.filter((line) => include.test(line) && !exclude.test(line)).reduce((total, line) => total + amountFromLine(line), 0);
  const one = (include: RegExp) => amountFromLine(lines.find((line) => include.test(line)) || "");
  const federalGrants = sum(/pell|federal.*grant|seog/i, /\btotal\b|loan|work.?study|cost of attendance/i);
  const values = {
    costOfAttendance: one(/cost of attendance|estimated annual cost|total.*cost/i),
    tuitionFees: sum(/tuition|mandatory fee|required fee/i),
    housingMeals: sum(/housing|room and board|room\/board|meal plan|meals/i),
    federalGrants,
    stateGrants: sum(/state.*grant|state.*scholarship/i),
    institutionalAid: sum(/institutional|university.*grant|college.*grant|merit|institution.*scholarship/i),
    outsideScholarships: sum(/outside.*scholarship|private.*scholarship/i),
    loans: sum(/\bloan\b|subsidized|unsubsidized|parent plus|grad plus/i, /\btotal\b|loan fee/i),
    workStudy: sum(/work.?study/i),
  };
  return { values, found: Object.values(values).filter((value) => value > 0).length };
}

function totals(offer: Offer) {
  const itemized = number(offer.tuitionFees) + number(offer.housingMeals) + number(offer.otherCosts);
  const cost = number(offer.costOfAttendance) || itemized;
  const gift = number(offer.federalGrants) + number(offer.stateGrants) + number(offer.institutionalAid) + number(offer.outsideScholarships);
  const loans = number(offer.loans);
  return {
    cost,
    gift,
    loans,
    workStudy: number(offer.workStudy),
    netPrice: Math.max(cost - gift, 0),
    afterLoans: Math.max(cost - gift - loans, 0),
    giftShare: cost > 0 ? (gift / cost) * 100 : 0,
    loanToGift: gift > 0 ? loans / gift : loans > 0 ? Infinity : 0,
  };
}

async function readTextFile(file: File) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    let text = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      text += content.items.map((item) => "str" in item ? `${item.str}${item.hasEOL ? "\n" : " "}` : "").join("") + "\n";
    }
    return text;
  }
  return file.text();
}

export default function CounterOfferEngine() {
  const [offers, setOffers] = useState<Offer[]>([blankOffer("preferred"), blankOffer("competing-one"), blankOffer("competing-two")]);
  const [fileState, setFileState] = useState<Record<string, string>>({});
  const [student, setStudent] = useState({ firstName: "", reason: "cost difference", commitment: "I would be excited to enroll if the remaining cost becomes manageable.", circumstances: "", requestAmount: "", office: "Office of Financial Aid" });
  const [scorecardQuery, setScorecardQuery] = useState("");
  const [scorecardResults, setScorecardResults] = useState<ScorecardSchool[]>([]);
  const [scorecard, setScorecard] = useState<ScorecardSchool | null>(null);
  const [scorecardStatus, setScorecardStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const computed = useMemo(() => offers.map((offer) => ({ offer, ...totals(offer) })), [offers]);
  const preferred = computed[0];
  const competitors = computed.slice(1).filter((item) => item.offer.school && item.cost > 0);
  const bestCompetitor = competitors.sort((a, b) => a.netPrice - b.netPrice)[0];
  const competitiveGap = bestCompetitor ? Math.max(preferred.netPrice - bestCompetitor.netPrice, 0) : 0;
  const requestAmount = number(student.requestAmount) || competitiveGap;
  const comparable = Boolean(bestCompetitor && preferred.offer.academicYear === bestCompetitor.offer.academicYear && preferred.offer.housing === bestCompetitor.offer.housing);

  const updateOffer = (index: number, key: keyof Offer, value: string) => setOffers((current) => current.map((offer, offerIndex) => offerIndex === index ? { ...offer, [key]: value } : offer));

  const handleFile = async (index: number, file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setFileState((current) => ({ ...current, [offers[index].id]: "File is larger than 10 MB. Use a smaller PDF or enter the figures manually." }));
      return;
    }
    setFileState((current) => ({ ...current, [offers[index].id]: `Reading ${file.name} privately in this browser…` }));
    try {
      const text = await readTextFile(file);
      const parsed = parseOffer(text);
      setOffers((current) => current.map((offer, offerIndex) => {
        if (offerIndex !== index) return offer;
        const updates = Object.fromEntries(Object.entries(parsed.values).filter(([, value]) => value > 0).map(([key, value]) => [key, String(value)]));
        return { ...offer, ...updates };
      }));
      setFileState((current) => ({ ...current, [offers[index].id]: parsed.found ? `${parsed.found} possible totals found in ${file.name}. Review every field against the letter.` : `No reliable totals found in ${file.name}. Enter the figures manually.` }));
    } catch {
      setFileState((current) => ({ ...current, [offers[index].id]: `We could not read ${file.name}. It may be scanned or protected; enter the figures manually.` }));
    }
  };

  const searchScorecard = async () => {
    const query = scorecardQuery.trim() || preferred.offer.school.trim();
    if (query.length < 3) {
      setScorecardStatus("Enter at least three letters of the school name.");
      return;
    }
    setScorecardStatus("Searching official College Scorecard data…");
    setScorecardResults([]);
    try {
      const response = await fetch(`/api/scorecard?q=${encodeURIComponent(query)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Search unavailable");
      setScorecardResults(payload.results || []);
      setScorecardStatus(payload.results?.length ? "Choose the correct campus below." : "No close match found. Try the official school name.");
    } catch {
      setScorecardStatus("The federal data service is temporarily unavailable. You can finish the comparison without it.");
    }
  };

  const draft = useMemo(() => {
    const name = student.firstName || "[Your name]";
    const school = preferred.offer.school || "[preferred college]";
    const competitor = bestCompetitor?.offer.school || "[competing college]";
    const comparison = bestCompetitor
      ? `After reviewing the official offers on the same annual basis, my estimated net price at ${school} is ${currency(preferred.netPrice)}, compared with ${currency(bestCompetitor.netPrice)} at ${competitor}. This leaves a difference of approximately ${currency(competitiveGap)}.`
      : "I am attaching my current aid offer and a competing offer so the costs and non-loan aid can be reviewed together.";
    const circumstances = student.circumstances.trim() ? `\n\nI would also appreciate guidance on whether these documented circumstances qualify for a special-circumstances or professional-judgment review: ${student.circumstances.trim()}` : "";
    return `Subject: Request for Institutional Aid Reconsideration — ${name}\n\nDear ${student.office || "Office of Financial Aid"},\n\nMy name is ${name}, and I am writing to respectfully request a review of my financial aid offer for ${preferred.offer.academicYear || "the upcoming academic year"}. ${student.commitment.trim()}\n\n${comparison}\n\nI respectfully request consideration for approximately ${currency(requestAmount)} in additional institutional grant or scholarship aid, or the maximum amount available, to help close this difference. If an exact adjustment is not possible, please review my eligibility for institutional merit, need-based, retention, completion, or emergency funding and let me know what documentation or school-specific form is required.${circumstances}\n\nI understand that additional aid is not guaranteed and that the institution makes the final decision under its own policies. I would be grateful for a written review of the available options and next steps.\n\nThank you for your time and consideration.\n\nSincerely,\n${name}`;
  }, [bestCompetitor, competitiveGap, preferred, requestAmount, student]);

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="counter-offer-engine">
    <div className="panel-heading counter-heading">
      <p className="kicker">NEW · COMPARE BEFORE YOU COMMIT</p>
      <h2>Turn competing offers into a clear reconsideration request.</h2>
      <p>Compare the same year and living plan, separate gift aid from debt, check a federal net-price benchmark, and draft a respectful request for more institutional aid.</p>
    </div>

    <section className="privacy-banner"><span aria-hidden="true">◆</span><div><strong>Your award letters stay on this device.</strong><p>PDF text is read in your browser and is not uploaded to EFF. Remove Social Security numbers, student IDs, addresses, and account numbers. Scanned-image PDFs require manual entry.</p></div></section>

    <section className="counter-steps" aria-label="Counter-offer engine steps">
      <span><b>1</b> Add offers</span><span><b>2</b> Compare like for like</span><span><b>3</b> Check public data</span><span><b>4</b> Send your request</span>
    </section>

    <div className="offer-stack">
      {offers.map((offer, index) => <OfferEditor key={offer.id} offer={offer} index={index} status={fileState[offer.id]} update={updateOffer} upload={handleFile}/>) }
    </div>

    <section className="comparison-board">
      <header><div><p className="kicker">SIDE-BY-SIDE DECISION</p><h3>What each offer really covers</h3></div><small>Loans and work-study are not gift aid.</small></header>
      <div className="comparison-table-wrap"><table><thead><tr><th>Offer</th><th>Annual cost</th><th>Gift aid</th><th>Net price</th><th>Loans</th><th>After loans</th><th>Gift-aid share</th></tr></thead><tbody>{computed.map(({ offer, cost, gift, netPrice, loans, afterLoans, giftShare }) => <tr key={offer.id}><td><b>{offer.school || (offer.id === "preferred" ? "Preferred school" : "Competing offer")}</b></td><td>{currency(cost)}</td><td>{currency(gift)}</td><td><strong>{currency(netPrice)}</strong></td><td>{currency(loans)}</td><td>{currency(afterLoans)}</td><td>{giftShare.toFixed(0)}%</td></tr>)}</tbody></table></div>
      <div className="comparison-callouts">
        <article className="purple"><small>PREFERRED-SCHOOL NET PRICE</small><strong>{currency(preferred.netPrice)}</strong><span>Cost minus grants and scholarships</span></article>
        <article className="yellow"><small>LOWEST COMPETING NET PRICE</small><strong>{bestCompetitor ? currency(bestCompetitor.netPrice) : "Add an offer"}</strong><span>{bestCompetitor?.offer.school || "Enter one complete competing offer"}</span></article>
        <article className="pink"><small>POTENTIAL COMPARISON GAP</small><strong>{currency(competitiveGap)}</strong><span>Useful context—not promised aid</span></article>
      </div>
      {bestCompetitor && !comparable && <p className="comparison-warning"><b>Pause before sending:</b> these offers use a different academic year or housing plan. Make them match so the comparison is fair.</p>}
      <p className="decoder-note"><b>Why work-study is separate:</b> it is normally earned through paychecks after a student obtains and works an eligible job. It is not an upfront grant against the bill.</p>
    </section>

    <section className="scorecard-panel">
      <div><p className="kicker">OFFICIAL PUBLIC CONTEXT</p><h3>Check the College Scorecard benchmark</h3><p>Search the preferred school. The federal average net price is a historical student average—not a quote for you, a “discount rate,” or proof that money is available.</p></div>
      <div className="scorecard-search"><label><span>Preferred school name</span><input value={scorecardQuery} onChange={(event) => setScorecardQuery(event.target.value)} placeholder={preferred.offer.school || "Example: Florida A&M University"}/></label><button type="button" onClick={searchScorecard}>Search federal data</button></div>
      {scorecardStatus && <p className="scorecard-status" aria-live="polite">{scorecardStatus}</p>}
      {scorecardResults.length > 0 && <div className="scorecard-results">{scorecardResults.map((school) => <button type="button" key={school.id} onClick={() => { setScorecard(school); setScorecardResults([]); setScorecardStatus("Official benchmark selected."); }}><b>{school.name}</b><span>{school.state} · UNITID {school.id}</span></button>)}</div>}
      {scorecard && <article className="scorecard-card"><div><small>SELECTED INSTITUTION</small><strong>{scorecard.name}</strong><span>{scorecard.state} · Federal UNITID {scorecard.id}</span></div><div><small>AVERAGE NET PRICE</small><strong>{scorecard.netPrice === null ? "Not reported" : currency(scorecard.netPrice)}</strong><span>Historical overall average</span></div><div><small>LISTED TUITION</small><strong>{currency(preferred.offer.residency === "out-of-state" ? scorecard.tuitionOutOfState || 0 : scorecard.tuitionInState || 0)}</strong><span>{preferred.offer.residency === "out-of-state" ? "Out-of-state" : "In-state"} benchmark</span></div><div><small>PELL RECIPIENT SHARE</small><strong>{scorecard.pellRate === null ? "Not reported" : `${(scorecard.pellRate * 100).toFixed(0)}%`}</strong><span>Context only; not your eligibility</span></div></article>}
      <a className="official-data-link" href="https://collegescorecard.ed.gov/" target="_blank" rel="noreferrer">Verify the institution on College Scorecard ↗</a>
    </section>

    <section className="petition-builder">
      <header><p className="kicker">YOUR RECONSIDERATION REQUEST</p><h3>Make the request specific, honest, and easy to review.</h3></header>
      <div className="petition-fields">
        <TextField label="Your name" value={student.firstName} set={(value) => setStudent({ ...student, firstName: value })} placeholder="First and last name"/>
        <TextField label="Requested office" value={student.office} set={(value) => setStudent({ ...student, office: value })}/>
        <TextField label="Amount requested" value={student.requestAmount} set={(value) => setStudent({ ...student, requestAmount: value })} placeholder={competitiveGap ? String(competitiveGap) : "Optional"} money/>
        <TextField label="Why you want this school" value={student.commitment} set={(value) => setStudent({ ...student, commitment: value })} area/>
        <TextField label="Documented change or special circumstance (optional)" value={student.circumstances} set={(value) => setStudent({ ...student, circumstances: value })} placeholder="Example: Parent lost employment in May 2026. Do not include sensitive account numbers." area wide/>
      </div>
      <div className="petition-checklist"><b>Before sending, attach:</b><span>Preferred-school offer</span><span>Competing offer</span><span>School’s appeal form, if required</span><span>Only relevant supporting documents</span></div>
      <article className="petition-draft"><div className="draft-actions"><b>READY-TO-EDIT DRAFT</b><div><button type="button" onClick={copyDraft}>{copied ? "Copied ✓" : "Copy email"}</button><button type="button" onClick={() => window.print()}>Save / print</button></div></div><pre>{draft}</pre></article>
      <div className="petition-guardrail"><b>This is a request—not a promise or entitlement.</b><p>Schools use their own policies and make the final decision. Never invent an offer, hardship, deadline, or amount. A special-circumstances review concerns documented changes affecting FAFSA information; a competing-offer reconsideration may be handled under a different school policy.</p></div>
      <div className="resource-actions"><a href="https://studentaid.gov/articles/financial-aid-not-enough/" target="_blank" rel="noreferrer">Official “not enough aid” guidance ↗</a><a href="https://portal.estherfundsfoundation.org/resources" target="_blank" rel="noreferrer">Open the EFF Resource Portal ↗</a></div>
    </section>
  </div>;
}

function OfferEditor({ offer, index, status, update, upload }: { offer: Offer; index: number; status?: string; update: (index: number, key: keyof Offer, value: string) => void; upload: (index: number, file?: File) => void }) {
  const title = index === 0 ? "Preferred school" : `Competing offer ${index}`;
  return <details className={`offer-editor ${index === 0 ? "preferred" : ""}`} open={index < 2}>
    <summary><span>{String(index + 1).padStart(2, "0")}</span><div><small>{index === 0 ? "THE SCHOOL YOU WANT" : "YOUR LEVERAGE"}</small><strong>{offer.school || title}</strong></div><b>Open +</b></summary>
    <div className="offer-editor-body">
      <label className="counter-upload"><input type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={(event) => upload(index, event.target.files?.[0])}/><span>↑</span><b>Add this award-letter PDF</b><small>Text-based PDF or TXT · 10 MB maximum</small></label>
      {status && <p className="counter-file-status" aria-live="polite">{status}</p>}
      <div className="counter-field-grid">
        <TextField label="School" value={offer.school} set={(value) => update(index, "school", value)} placeholder={title}/>
        <TextField label="Academic year" value={offer.academicYear} set={(value) => update(index, "academicYear", value)} placeholder="2026–27"/>
        <SelectField label="Housing plan" value={offer.housing} set={(value) => update(index, "housing", value)} options={[["on-campus", "On campus"], ["off-campus", "Off campus"], ["with-family", "Living with family"]]}/>
        <SelectField label="Tuition status" value={offer.residency} set={(value) => update(index, "residency", value)} options={[["in-state", "In-state"], ["out-of-state", "Out-of-state"], ["private", "Private-school rate"]]}/>
        <TextField label="Total cost of attendance" value={offer.costOfAttendance} set={(value) => update(index, "costOfAttendance", value)} money/>
        <TextField label="Tuition + required fees" value={offer.tuitionFees} set={(value) => update(index, "tuitionFees", value)} money/>
        <TextField label="Housing + meals" value={offer.housingMeals} set={(value) => update(index, "housingMeals", value)} money/>
        <TextField label="Books, travel + other costs" value={offer.otherCosts} set={(value) => update(index, "otherCosts", value)} money/>
        <TextField label="Federal grants, including Pell" value={offer.federalGrants} set={(value) => update(index, "federalGrants", value)} money/>
        <TextField label="State/local grants" value={offer.stateGrants} set={(value) => update(index, "stateGrants", value)} money/>
        <TextField label="Institutional grants + scholarships" value={offer.institutionalAid} set={(value) => update(index, "institutionalAid", value)} money/>
        <TextField label="Outside scholarships" value={offer.outsideScholarships} set={(value) => update(index, "outsideScholarships", value)} money/>
        <TextField label="Loans you plan to accept" value={offer.loans} set={(value) => update(index, "loans", value)} money/>
        <TextField label="Work-study offered" value={offer.workStudy} set={(value) => update(index, "workStudy", value)} money/>
      </div>
      <p className="offer-note">Use the same academic year, enrollment level, housing plan, and residency status across offers. If a school’s cost of attendance is entered, the tool uses it instead of adding the itemized cost fields.</p>
    </div>
  </details>;
}

function TextField({ label, value, set, placeholder, money, area, wide }: { label: string; value: string; set: (value: string) => void; placeholder?: string; money?: boolean; area?: boolean; wide?: boolean }) {
  return <label className={`counter-field ${wide ? "wide" : ""}`}><span>{label}</span><div>{money && <b>$</b>}{area ? <textarea value={value} onChange={(event) => set(event.target.value)} placeholder={placeholder}/> : <input value={value} onChange={(event) => set(event.target.value)} placeholder={placeholder} inputMode={money ? "decimal" : undefined}/>}</div></label>;
}

function SelectField({ label, value, set, options }: { label: string; value: string; set: (value: string) => void; options: string[][] }) {
  return <label className="counter-field"><span>{label}</span><div><select value={value} onChange={(event) => set(event.target.value)}>{options.map(([optionValue, labelText]) => <option value={optionValue} key={optionValue}>{labelText}</option>)}</select></div></label>;
}
