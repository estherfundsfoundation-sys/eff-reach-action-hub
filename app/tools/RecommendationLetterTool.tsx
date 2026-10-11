"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { sanitizeScholarName, screenRecommendationDetails } from "./recommendation-content-policy";

type LetterDetails = {
  studentName: string; school: string; major: string; gpa: string;
  studentEmail: string; studentPhone: string;
  opportunity: string; organization: string; effConnection: string;
  strengths: string; achievement: string; challenge: string; futureGoal: string;
  pronouns: "she" | "he" | "they";
};

const initialDetails: LetterDetails = {
  studentName:"", studentEmail:"", studentPhone:"", school:"", major:"", gpa:"", opportunity:"", organization:"",
  effConnection:"", strengths:"", achievement:"", challenge:"", futureGoal:"", pronouns:"they",
};

const clean = (value: string, fallback: string) => value.trim() || `[${fallback}]`;

/* Scholarship letters need no permission. Any other letter (a job, internship, graduate school,
   program, housing, an award) needs a code EFF National makes in MyEFF → National → Letters,
   tied to the student's email; MyEFF checks and spends it (eff_reach_rec_code_check, eff_reach_rec_issue). */
const ASK_FOR_CODE = "https://my.estherfundsfoundation.org/letters";
type CodeInfo = { student_name: string; purpose_label: string; organization: string | null; purpose_note: string | null; expires_at: string };

export default function RecommendationLetterTool() {
  const [details, setDetails] = useState(initialDetails);
  const [attested, setAttested] = useState(false);
  const [copied, setCopied] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issuanceReference, setIssuanceReference] = useState("");
  const [issuanceError, setIssuanceError] = useState("");
  const issuanceNonce = useRef("");
  const [kind, setKind] = useState<"scholarship" | "general">("scholarship");
  const [code, setCode] = useState("");
  const [addressee, setAddressee] = useState("");
  const [codeInfo, setCodeInfo] = useState<CodeInfo | null>(null);
  const [codeError, setCodeError] = useState("");
  const [checking, setChecking] = useState(false);
  const general = kind === "general";
  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get("code");
    if (fromLink && /^[A-Za-z0-9]{6,12}$/.test(fromLink)) { setKind("general"); setCode(fromLink.toUpperCase()); }
  }, []);
  const resetIssue = () => { setAttested(false); setCopied(false); setIssuanceReference(""); setIssuanceError(""); issuanceNonce.current = ""; };
  const chooseKind = (next: "scholarship" | "general") => { setKind(next); setCodeInfo(null); setCodeError(""); resetIssue(); };
  const checkCode = async () => {
    setChecking(true); setCodeError(""); setCodeInfo(null);
    try {
      const response = await fetch(`/api/recommendation-letters?code=${encodeURIComponent(code.trim())}&email=${encodeURIComponent(details.studentEmail.trim())}`, { cache: "no-store" });
      const result = await response.json().catch(() => ({})) as CodeInfo & { ok?: boolean; error?: string };
      if (!result.ok) throw new Error(result.error || "That code could not be checked.");
      setCodeInfo(result);
      setDetails((current) => ({ ...current, studentName: current.studentName || result.student_name, organization: current.organization || result.organization || "" }));
    } catch (error) { setCodeError(error instanceof Error ? error.message : "That code could not be checked."); }
    finally { setChecking(false); }
  };
  const update = (field: keyof LetterDetails, value: string) => {
    if (field === "studentEmail") setCodeInfo(null);
    setDetails((current) => ({ ...current, [field]: value }));
    setAttested(false);
    setCopied(false);
    setIssuanceReference("");
    setIssuanceError("");
    issuanceNonce.current = "";
  };

  const student = clean(sanitizeScholarName(details.studentName), "student name");
  const firstName = details.studentName.trim().split(/\s+/)[0] || "the student";
  const recipient = general
    ? (addressee.trim() || (details.organization.trim() ? `${details.organization.trim()}` : "To Whom It May Concern"))
    : details.organization.trim() ? `${details.organization.trim()} Selection Committee` : "Selection Committee";
  const subject = clean(details.opportunity, general ? "role or opportunity" : "scholarship");
  const useLine = general ? `AUTHORIZED USE: ${(codeInfo?.purpose_label || "the opportunity named below").toUpperCase()}` : "SCHOLARSHIP USE ONLY";
  const pronoun = details.pronouns === "she" ? { s:"she", o:"her", p:"her", S:"She" } : details.pronouns === "he" ? { s:"he", o:"him", p:"his", S:"He" } : { s:"they", o:"them", p:"their", S:"They" };
  const issuedDate = new Intl.DateTimeFormat("en-US", { month:"long", day:"numeric", year:"numeric" }).format(new Date());
  const essentials = [details.studentName, details.studentEmail, details.studentPhone, details.school, details.major, details.opportunity, details.organization, details.effConnection, details.strengths, details.achievement, details.futureGoal];
  const filled = essentials.filter((value) => value.trim()).length;
  const essentialCount = essentials.length;
  const contactValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.studentEmail.trim()) && details.studentPhone.replace(/\D/g, "").length >= 7;
  const safetyIssues = useMemo(() => screenRecommendationDetails(details, { general }), [details, general]);
  const blocked = safetyIssues.length > 0;
  const blockedFields = [...new Set(safetyIssues.map((issue) => issue.field))];
  const ready = filled === essentialCount && contactValid && attested && !blocked && (!general || !!codeInfo);

  const letter = useMemo(() => {
    const school = clean(details.school, "college or university");
    const major = clean(details.major, "major or program");
    const connection = clean(details.effConnection, "EFF program, chapter, service, or other connection");
    const strengths = clean(details.strengths, "qualities demonstrated");
    const achievement = clean(details.achievement, "specific achievement, leadership, or service example");
    const goal = clean(details.futureGoal, "education or career goal");
    const gpa = details.gpa.trim() ? ` and reports a cumulative GPA of ${details.gpa.trim()}` : "";
    const challenge = details.challenge.trim() ? ` ${pronoun.S} also shared that ${details.challenge.trim()}, demonstrating persistence while continuing ${pronoun.p} education.` : "";
    if (general) {
      const org = clean(details.organization, "organization");
      const greeting = addressee.trim() ? `Dear ${addressee.trim()}:` : "To Whom It May Concern:";
      return `${issuedDate}\n\n${useLine}\n${recipient}\n\n${greeting}\n\nOn behalf of Esther Funds Foundation, I am pleased to recommend ${student} for the ${subject} with ${org}. Esther Funds Foundation works to prevent college dropouts and help underrepresented students remain enrolled, graduate, and move into purpose-filled careers.\n\n${firstName} attends ${school}, where ${pronoun.s} studies ${major}${gpa}. In the information submitted to EFF, ${firstName} described ${pronoun.p} connection to our work through ${connection}. ${firstName} identified ${strengths} as qualities reflected in ${pronoun.p} academic, leadership, and service journey.\n\nOne example ${firstName} shared is ${achievement}.${challenge} These experiences reflect initiative, resilience, and a commitment to using opportunity with purpose.\n\n${firstName} is working toward ${goal}. We believe ${firstName} would bring that same commitment to ${org}, and Esther Funds Foundation is honored to recommend ${pronoun.o} for your thoughtful consideration.\n\nAUTHORIZED USE: Esther Funds Foundation approved this letter for ${student}'s application for the ${subject} with ${org}. It may not be reused, altered, or presented for any other purpose.\n\nSincerely,\n\nShayna Vincent\nFounder & Executive Director\nEsther Funds Foundation\nFaith-Based 501(c)(3) Public Charity · EIN 93-4917509\nnationals@estherfundsinc.org · 352-999-3232\nestherfundsfoundation.org`;
    }
    return `${issuedDate}\n\nSCHOLARSHIP USE ONLY\n${recipient}\n\nDear Selection Committee:\n\nOn behalf of Esther Funds Foundation, I am pleased to recommend ${student} for the ${subject}. Esther Funds Foundation works to prevent college dropouts and help underrepresented students remain enrolled, graduate, and move into purpose-filled careers.\n\n${firstName} attends ${school}, where ${pronoun.s} studies ${major}${gpa}. In the information submitted to EFF, ${firstName} described ${pronoun.p} connection to our work through ${connection}. ${firstName} identified ${strengths} as qualities reflected in ${pronoun.p} academic, leadership, and service journey.\n\nOne example ${firstName} shared is ${achievement}.${challenge} These experiences reflect initiative, resilience, and a commitment to using opportunity with purpose.\n\n${firstName} is working toward ${goal}. We believe support through the ${subject} would help ${pronoun.o} continue that work and move closer to graduation. Esther Funds Foundation is honored to recommend ${firstName} for your thoughtful consideration.\n\nAUTHORIZED USE: This letter is issued solely for ${student}'s application to the ${subject}. It may be submitted only for scholarship consideration and may not be reused, altered, or presented for employment, admission, immigration, housing, legal, credit, identity-verification, or any other purpose.\n\nSincerely,\n\nShayna Vincent\nFounder & Executive Director\nEsther Funds Foundation\nFaith-Based 501(c)(3) Public Charity · EIN 93-4917509\nnationals@estherfundsinc.org · 352-999-3232\nestherfundsfoundation.org`;
  }, [details, firstName, issuedDate, pronoun.S, pronoun.o, pronoun.p, pronoun.s, recipient, student, subject, general, useLine, addressee]);

  const withReference = (value: string, reference: string) => value.replace(
    `${useLine}\n`,
    `${useLine}\nEFF Reference: ${reference}\nVerify status: https://reach.estherfundsfoundation.org/recommendation/${reference}\n`,
  );

  const ensureIssued = async (action: "copy" | "download" | "print") => {
    if (!ready) return "";
    if (issuanceReference) return issuanceReference;
    setIssuing(true);
    setIssuanceError("");
    try {
      issuanceNonce.current ||= crypto.randomUUID();
      const response = await fetch("/api/recommendation-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, action, consent: true, clientNonce: issuanceNonce.current, kind, code: general ? code.trim().toUpperCase() : "", addressee: general ? addressee : "" }),
      });
      const result = await response.json().catch(() => ({})) as { reference?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "EFF could not record this letter.");
      setIssuanceReference(result.reference);
      return result.reference;
    } catch (error) {
      setIssuanceError(error instanceof Error ? error.message : "EFF could not record this letter. Please try again.");
      return "";
    } finally {
      setIssuing(false);
    }
  };

  const copy = async () => {
    const reference = await ensureIssued("copy");
    if (!reference) return;
    try { await navigator.clipboard.writeText(withReference(letter, reference)); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  const printLetter = async () => {
    const reference = await ensureIssued("print");
    if (!reference) return;
    window.setTimeout(() => {
      document.body.classList.add("print-recommendation");
      window.print();
      window.setTimeout(() => document.body.classList.remove("print-recommendation"), 250);
    }, 60);
  };
  const downloadPdf = async () => {
    const reference = await ensureIssued("download");
    if (!reference) return;
    const [{ jsPDF }, logoResponse] = await Promise.all([
      import("jspdf"),
      fetch("/eff-recommendation-letter-logo.png"),
    ]);
    const logoBlob = await logoResponse.blob();
    const logoData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(logoBlob);
    });
    const pdf = new jsPDF({ unit: "pt", format: "letter" });
    const purple = "#5B167D";
    const gold = "#D7A526";
    pdf.setFillColor(purple);
    pdf.rect(0, 0, 612, 106, "F");
    pdf.addImage(logoData, "PNG", 42, 17, 72, 72);
    pdf.setTextColor("#FFFFFF");
    pdf.setFont("times", "bold");
    pdf.setFontSize(19);
    pdf.text("ESTHER FUNDS FOUNDATION", 130, 48);
    pdf.setTextColor(gold);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(general ? "OFFICIAL RECOMMENDATION · EVERY FUTURE FULFILLED" : "OFFICIAL SCHOLARSHIP RECOMMENDATION · EVERY FUTURE FULFILLED", 130, 68);
    pdf.setTextColor("#FFFFFF");
    pdf.setFontSize(8);
    pdf.text(general ? `${useLine} · APPROVED BY EFF NATIONAL` : "AUTHORIZED USE: SCHOLARSHIP APPLICATION ONLY", 130, 84);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    const bodyBottom = pageHeight - 96;
    const issuedLetter = withReference(letter, reference);
    const unsignedLetter = issuedLetter.replace(/\n\nSincerely,[\s\S]*$/, "");
    const lines = pdf.splitTextToSize(unsignedLetter, contentWidth) as string[];
    pdf.setTextColor("#1E1723");
    pdf.setFont("times", "normal");
    pdf.setFontSize(10.5);
    let y = 134;
    for (const line of lines) {
      if (y + 14.5 > bodyBottom) {
        pdf.addPage();
        y = 54;
      }
      pdf.text(line, margin, y, { maxWidth: contentWidth });
      y += 14.5;
    }
    // Keep the full signature and organization contact block together.
    if (y + 138 > bodyBottom) {
      pdf.addPage();
      y = 60;
    }
    y += 22;
    pdf.setTextColor(purple);
    pdf.setFont("times", "italic");
    pdf.setFontSize(22);
    pdf.text("Shayna Vincent", margin, y, { maxWidth: contentWidth });
    y += 18;
    pdf.setTextColor("#1E1723");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    for (const line of pdf.splitTextToSize("Shayna Vincent · Founder & Executive Director", contentWidth) as string[]) {
      pdf.text(line, margin, y, { maxWidth: contentWidth });
      y += 13;
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    for (const contactLine of [
      "Esther Funds Foundation · Faith-Based 501(c)(3) Public Charity · EIN 93-4917509",
      "nationals@estherfundsinc.org · 352-999-3232 · estherfundsfoundation.org",
      `Verification: reach.estherfundsfoundation.org/recommendation/${reference}`,
    ]) {
      for (const line of pdf.splitTextToSize(contactLine, contentWidth) as string[]) {
        pdf.text(line, margin, y, { maxWidth: contentWidth });
        y += 13;
      }
    }
    pdf.setTextColor("#625B67");
    pdf.setFontSize(7.5);
    for (const line of pdf.splitTextToSize(`Electronically signed through the authorized EFF letter workflow · ${issuedDate}`, contentWidth) as string[]) {
      pdf.text(line, margin, y, { maxWidth: contentWidth });
      y += 11;
    }
    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      pdf.setDrawColor(purple);
      pdf.line(margin, pageHeight - 36, pageWidth - margin, pageHeight - 36);
      pdf.setTextColor(purple);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.text(general ? "APPROVED BY EFF NATIONAL FOR THE OPPORTUNITY NAMED · NOT VALID FOR ANY OTHER PURPOSE" : "SCHOLARSHIP USE ONLY · NOT VALID FOR ANY OTHER PURPOSE", pageWidth / 2, pageHeight - 22, { align: "center", maxWidth: contentWidth });
    }
    const safeName = (sanitizeScholarName(details.studentName) || "student").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    pdf.save(`EFF-Recommendation-${safeName}.pdf`);
  };
  const requestHref = ASK_FOR_CODE;

  return <section className="recommendation-engine">
    <header className="recommendation-heading">
      <div><p className="kicker">ESTHER FUNDS FOUNDATION · RECOMMENDATION LETTER TOOL</p><h2>The 60-Second<br/><em>EFF {general ? "Recommendation" : "Scholarship Recommendation"}</em></h2><p>Submit truthful details once. The letter is personalized from the information provided and signed by Founder &amp; Executive Director Shayna Vincent. Scholarship letters are open to every student; any other letter needs a code from EFF.</p></div>
      <aside><strong>{filled}/{essentialCount}</strong><span>essential facts added</span><b>{blocked ? "CONTENT BLOCKED" : ready ? "LETTER READY" : "COMPLETE + ATTEST"}</b></aside>
    </header>

    <div className="recommendation-steps" aria-label="How the tool works"><span><b>1</b> Submit your facts</span><span><b>2</b> EFF builds the letter</span><span><b>3</b> Confirm accuracy</span><span><b>4</b> Save the signed PDF</span></div>

    <section className="recommendation-form recommendation-kind">
      <div className="recommendation-form-heading"><p className="kicker">WHAT IS THE LETTER FOR?</p></div>
      <div className="recommendation-actions" role="radiogroup" aria-label="Letter type">
        <button type="button" role="radio" aria-checked={!general} className={!general ? "chosen" : ""} onClick={() => chooseKind("scholarship")}>{!general ? "✓ " : ""}A scholarship</button>
        <button type="button" role="radio" aria-checked={general} className={general ? "chosen" : ""} onClick={() => chooseKind("general")}>{general ? "✓ " : ""}Not a scholarship (needs a code from EFF)</button>
      </div>
      {general && <>
        <p>Jobs, internships, graduate school, programs, housing and awards need EFF&apos;s approval first. Ask EFF, and when National approves, you get a code by email that works only with that email address.</p>
        <div className="recommendation-grid">
          <RecField label="Your code from EFF" value={code} set={(value) => { setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setCodeInfo(null); setCodeError(""); resetIssue(); }} placeholder="8 letters and numbers"/>
          <RecField type="email" label="The email EFF sent it to" value={details.studentEmail} set={(value) => update("studentEmail", value)} placeholder="Same email as your code"/>
        </div>
        <div className="recommendation-actions"><button type="button" disabled={checking || code.length < 6 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.studentEmail.trim())} onClick={checkCode}>{checking ? "Checking…" : codeInfo ? "Code confirmed ✓" : "Check my code"}</button><a href={ASK_FOR_CODE}>Don&apos;t have a code? Ask EFF ↗</a></div>
        {codeError && <p className="recommendation-issuance-error" role="alert">{codeError}</p>}
        {codeInfo && <p className="recommendation-issuance-confirmation" role="status"><b>Approved by EFF:</b> a letter for {codeInfo.purpose_label}{codeInfo.organization ? ` (${codeInfo.organization})` : ""}. Good until {new Date(codeInfo.expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.{codeInfo.purpose_note ? ` Note from EFF: ${codeInfo.purpose_note}` : ""}</p>}
      </>}
    </section>

    <section className="recommendation-form">
      <div className="recommendation-form-heading"><p className="kicker">60-SECOND INTAKE</p><h3>Tell EFF what the {general ? "" : "scholarship "}letter should say.</h3><p>{general ? "Use complete, truthful details. This letter is only for the opportunity EFF approved." : "Use complete, truthful details. Without a code from EFF, this automated letter is for scholarship applications only."}</p></div>
      <div className="recommendation-grid">
        <RecField label="Student’s full name" value={details.studentName} set={(value) => update("studentName", value)} placeholder="First and last name"/>
        {!general && <RecField type="email" label="Student’s email" value={details.studentEmail} set={(value) => update("studentEmail", value)} placeholder="Student contact email"/>}
        <RecField type="tel" label="Student’s phone" value={details.studentPhone} set={(value) => update("studentPhone", value)} placeholder="Mobile number with area code"/>
        <RecField label="College or university" value={details.school} set={(value) => update("school", value)} placeholder="Official school name"/>
        <RecField label="Major or program" value={details.major} set={(value) => update("major", value)} placeholder="Example: Public Health"/>
        <RecField label="Cumulative GPA (optional)" value={details.gpa} set={(value) => update("gpa", value)} placeholder="Example: 3.42"/>
        <RecField label={general ? "Role, program or opportunity" : "Scholarship name"} value={details.opportunity} set={(value) => update("opportunity", value)} placeholder={general ? "Example: Summer Research Internship" : "Official scholarship name"}/>
        <RecField label={general ? "Organization or school" : "Scholarship organization"} value={details.organization} set={(value) => update("organization", value)} placeholder={general ? "Company, school or program" : "Scholarship sponsor or foundation"}/>
        {general && <RecField label="Addressed to (optional)" value={addressee} set={(value) => { setAddressee(value); resetIssue(); }} placeholder="Example: Hiring Committee"/>}
        <label className="recommendation-field"><span>Pronouns used in the letter</span><select value={details.pronouns} onChange={(event) => update("pronouns", event.target.value)}><option value="she">She / her</option><option value="he">He / him</option><option value="they">They / them</option></select></label>
        <RecField label="Connection to EFF" value={details.effConnection} set={(value) => update("effConnection", value)} placeholder="Program, chapter, service, ambassador, or resource"/>
        <RecField wide area label="Strengths the letter should highlight" value={details.strengths} set={(value) => update("strengths", value)} placeholder="Example: resilient leadership, compassion, and academic discipline"/>
        <RecField wide area label="One specific achievement, leadership, or service example" value={details.achievement} set={(value) => update("achievement", value)} placeholder="Include what happened and the measurable result."/>
        <RecField wide area label="Challenge overcome (optional)" value={details.challenge} set={(value) => update("challenge", value)} placeholder="Use respectful facts and share only what belongs in the letter."/>
        <RecField wide area label="Education, service, or career goal" value={details.futureGoal} set={(value) => update("futureGoal", value)} placeholder="Explain the future this opportunity will help make possible."/>
      </div>
      <div className={`recommendation-safety${blocked ? " blocked" : ""}`} role={blocked ? "alert" : "note"}>
        <b>{blocked ? "This submission cannot generate an EFF letter." : general ? "Protected letter intake" : "Protected scholarship-letter intake"}</b>
        <p>{blocked ? `Remove prohibited or inappropriate content from: ${blockedFields.join(", ")}. Automated letters cannot include profanity, hate speech, threats, illegal-activity admissions, accusations against EFF, false-verification language, instruction manipulation, or non-scholarship uses.` : "The tool screens every field for profanity, hate speech, threats, illegal or accusatory claims, false-verification language, instruction manipulation, and non-scholarship uses. A blocked submission is not issued or downloaded."}</p>
      </div>
      {!contactValid && (details.studentEmail || details.studentPhone) && <p className="recommendation-issuance-error">Enter a valid student email and phone number before issuing the letter.</p>}
      <label className="recommendation-attestation"><input type="checkbox" checked={attested} disabled={blocked} onChange={(event) => setAttested(event.target.checked)}/><span>I confirm that the information I submitted is truthful, appropriate, and authorized for inclusion. I consent to EFF securely recording these details and my contact information for review, verification, and possible revocation. I will use this letter only for the {general ? "opportunity" : "scholarship"} named above.</span></label>
    </section>

    <section className="recommendation-output">
      <div className="recommendation-output-heading"><div><p className="kicker">{general ? "OFFICIAL EFF RECOMMENDATION LETTER" : "OFFICIAL EFF SCHOLARSHIP LETTER"}</p><h3>{blocked ? "Prohibited content must be removed." : ready ? "Signed and ready to save." : "Complete the intake to issue."}</h3></div><span className={ready ? "ready" : "incomplete"}>{blocked ? "NOT AUTHORIZED" : ready ? (general ? "APPROVED BY EFF" : "SCHOLARSHIP USE ONLY") : general && !codeInfo ? "CHECK YOUR CODE FIRST" : `${essentialCount - filled} essential fact${essentialCount - filled === 1 ? "" : "s"} still needed`}</span></div>
      {issuanceError && <p className="recommendation-issuance-error" role="alert">{issuanceError}</p>}
      {issuanceReference && <p className="recommendation-issuance-confirmation" role="status"><b>EFF issuance recorded:</b> {issuanceReference}. The National Office can review or revoke this exact letter.</p>}
      <div className={`recommendation-letter${ready ? " issued" : ""}`} aria-label="Generated Esther Funds Foundation recommendation letter">
        <div className="letter-brand"><Image src="/eff-recommendation-letter-logo.png" alt="Esther Funds Foundation logo" width={82} height={82}/><div><span>ESTHER FUNDS FOUNDATION</span><strong>{general ? "Recommendation" : "Scholarship Recommendation"}</strong><small>{general ? "APPROVED BY EFF NATIONAL" : "SCHOLARSHIP USE ONLY"} · EVERY FUTURE FULFILLED.</small></div></div>
        <pre>{issuanceReference ? withReference(letter, issuanceReference) : letter}</pre>
        <div className="letter-signature-block"><span className="letter-signature">Shayna Vincent</span><b>Shayna Vincent</b><small>Founder &amp; Executive Director · Esther Funds Foundation</small><small>Faith-Based 501(c)(3) Public Charity · EIN 93-4917509</small><small>nationals@estherfundsinc.org · 352-999-3232 · estherfundsfoundation.org</small><em>Electronically signed through the authorized EFF letter workflow · {issuedDate}</em></div>
        <p><b>{general ? "Approved use only." : "Scholarship use only."}</b> This letter is personalized from information submitted to Esther Funds Foundation by the applicant. It does not independently certify a GPA, title, award, or activity unless EFF separately confirms it, and it is not valid for {general ? "any purpose other than the one EFF approved" : "any non-scholarship purpose"}.</p>
      </div>
      <div className="recommendation-actions"><button type="button" disabled={!ready || issuing} onClick={copy}>{issuing ? "Recording…" : copied ? "Copied ✓" : general ? "Copy letter" : "Copy scholarship letter"}</button><button type="button" disabled={!ready || issuing} onClick={downloadPdf}>{issuing ? "Recording…" : ready ? "Download signed PDF" : blocked ? "Remove prohibited content" : "Complete + attest to download"}</button><button type="button" disabled={!ready || issuing} onClick={printLetter}>{issuing ? "Recording…" : "Print letter"}</button>{!general && <a href={requestHref}>Need another type of letter? Ask EFF for a code ↗</a>}</div>
    </section>
  </section>;
}

function RecField({ label, value, set, placeholder, wide = false, area = false, type = "text" }: { label: string; value: string; set: (value: string) => void; placeholder: string; wide?: boolean; area?: boolean; type?: string }) {
  const maxLength = area ? 700 : 160;
  return <label className={`recommendation-field${wide ? " wide" : ""}`}><span>{label}</span>{area ? <textarea value={value} maxLength={maxLength} onChange={(event) => set(event.target.value)} placeholder={placeholder}/> : <input type={type} value={value} maxLength={maxLength} onChange={(event) => set(event.target.value)} placeholder={placeholder}/>}</label>;
}
