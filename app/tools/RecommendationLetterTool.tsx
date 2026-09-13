"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { sanitizeScholarName, screenRecommendationDetails } from "./recommendation-content-policy";

type LetterDetails = {
  studentName: string; school: string; major: string; gpa: string;
  opportunity: string; organization: string; effConnection: string;
  strengths: string; achievement: string; challenge: string; futureGoal: string;
  pronouns: "she" | "he" | "they";
};

const initialDetails: LetterDetails = {
  studentName:"", school:"", major:"", gpa:"", opportunity:"", organization:"",
  effConnection:"", strengths:"", achievement:"", challenge:"", futureGoal:"", pronouns:"they",
};

const clean = (value: string, fallback: string) => value.trim() || `[${fallback}]`;

export default function RecommendationLetterTool() {
  const [details, setDetails] = useState(initialDetails);
  const [attested, setAttested] = useState(false);
  const [copied, setCopied] = useState(false);
  const update = (field: keyof LetterDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setAttested(false);
    setCopied(false);
  };

  const student = clean(sanitizeScholarName(details.studentName), "student name");
  const firstName = details.studentName.trim().split(/\s+/)[0] || "the student";
  const recipient = details.organization.trim() ? `${details.organization.trim()} Selection Committee` : "Selection Committee";
  const subject = clean(details.opportunity, "scholarship");
  const pronoun = details.pronouns === "she" ? { s:"she", o:"her", p:"her", S:"She" } : details.pronouns === "he" ? { s:"he", o:"him", p:"his", S:"He" } : { s:"they", o:"them", p:"their", S:"They" };
  const issuedDate = new Intl.DateTimeFormat("en-US", { month:"long", day:"numeric", year:"numeric" }).format(new Date());
  const essentials = [details.studentName, details.school, details.major, details.opportunity, details.organization, details.effConnection, details.strengths, details.achievement, details.futureGoal];
  const filled = essentials.filter((value) => value.trim()).length;
  const safetyIssues = useMemo(() => screenRecommendationDetails(details), [details]);
  const blocked = safetyIssues.length > 0;
  const blockedFields = [...new Set(safetyIssues.map((issue) => issue.field))];
  const ready = filled === essentials.length && attested && !blocked;

  const letter = useMemo(() => {
    const school = clean(details.school, "college or university");
    const major = clean(details.major, "major or program");
    const connection = clean(details.effConnection, "EFF program, chapter, service, or other connection");
    const strengths = clean(details.strengths, "qualities demonstrated");
    const achievement = clean(details.achievement, "specific achievement, leadership, or service example");
    const goal = clean(details.futureGoal, "education or career goal");
    const gpa = details.gpa.trim() ? ` and reports a cumulative GPA of ${details.gpa.trim()}` : "";
    const challenge = details.challenge.trim() ? ` ${pronoun.S} also shared that ${details.challenge.trim()}, demonstrating persistence while continuing ${pronoun.p} education.` : "";
    return `${issuedDate}\n\nSCHOLARSHIP USE ONLY\n${recipient}\n\nDear Selection Committee:\n\nOn behalf of Esther Funds Foundation, I am pleased to recommend ${student} for the ${subject}. Esther Funds Foundation works to prevent college dropouts and help underrepresented students remain enrolled, graduate, and move into purpose-filled careers.\n\n${firstName} attends ${school}, where ${pronoun.s} studies ${major}${gpa}. In the information submitted to EFF, ${firstName} described ${pronoun.p} connection to our work through ${connection}. ${firstName} identified ${strengths} as qualities reflected in ${pronoun.p} academic, leadership, and service journey.\n\nOne example ${firstName} shared is ${achievement}.${challenge} These experiences reflect initiative, resilience, and a commitment to using opportunity with purpose.\n\n${firstName} is working toward ${goal}. We believe support through the ${subject} would help ${pronoun.o} continue that work and move closer to graduation. Esther Funds Foundation is honored to recommend ${firstName} for your thoughtful consideration.\n\nAUTHORIZED USE: This letter is issued solely for ${student}'s application to the ${subject}. It may be submitted only for scholarship consideration and may not be reused, altered, or presented for employment, admission, immigration, housing, legal, credit, identity-verification, or any other purpose.\n\nSincerely,\n\nShayna Vincent\nFounder & Executive Director\nEsther Funds Foundation\nFaith-Based 501(c)(3) Public Charity · EIN 93-4917509\nnationals@estherfundsinc.org · 352-999-3232\nestherfundsfoundation.org`;
  }, [details, firstName, issuedDate, pronoun.S, pronoun.o, pronoun.p, pronoun.s, recipient, student, subject]);

  const copy = async () => { if (!ready) return; try { await navigator.clipboard.writeText(letter); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } };
  const printLetter = () => { if (!ready) return; document.body.classList.add("print-recommendation"); window.print(); window.setTimeout(() => document.body.classList.remove("print-recommendation"), 250); };
  const downloadPdf = async () => {
    if (!ready) return;
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
    pdf.text("OFFICIAL SCHOLARSHIP RECOMMENDATION · EVERY FUTURE FULFILLED", 130, 68);
    pdf.setTextColor("#FFFFFF");
    pdf.setFontSize(8);
    pdf.text("AUTHORIZED USE: SCHOLARSHIP APPLICATION ONLY", 130, 84);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    const bodyBottom = pageHeight - 96;
    const unsignedLetter = letter.replace(/\n\nSincerely,[\s\S]*$/, "");
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
      pdf.text("SCHOLARSHIP USE ONLY · NOT VALID FOR ANY OTHER PURPOSE", pageWidth / 2, pageHeight - 22, { align: "center", maxWidth: contentWidth });
    }
    const safeName = (sanitizeScholarName(details.studentName) || "student").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    pdf.save(`EFF-Recommendation-${safeName}.pdf`);
  };
  const requestHref = `mailto:nationals@estherfundsinc.org?subject=${encodeURIComponent("Request for another type of EFF recommendation letter")}&body=${encodeURIComponent(`Hello EFF National Office,\n\nI would like to request another type of recommendation letter.\n\nStudent name: ${sanitizeScholarName(details.studentName)}\nPurpose or opportunity: ${details.opportunity.trim()}\nDeadline: \nSpecial requirements: \n\nThank you.`)}`;

  return <section className="recommendation-engine">
    <header className="recommendation-heading">
      <div><p className="kicker">ESTHER FUNDS FOUNDATION · SCHOLARSHIP LETTER TOOL</p><h2>The 60-Second<br/><em>EFF Scholarship Recommendation</em></h2><p>Submit truthful scholarship details once. The letter is personalized from the information provided and signed by Founder &amp; Executive Director Shayna Vincent.</p></div>
      <aside><strong>{filled}/9</strong><span>essential facts added</span><b>{blocked ? "CONTENT BLOCKED" : ready ? "LETTER READY" : "COMPLETE + ATTEST"}</b></aside>
    </header>

    <div className="recommendation-steps" aria-label="How the tool works"><span><b>1</b> Submit your facts</span><span><b>2</b> EFF builds the letter</span><span><b>3</b> Confirm accuracy</span><span><b>4</b> Save the signed PDF</span></div>

    <section className="recommendation-form">
      <div className="recommendation-form-heading"><p className="kicker">60-SECOND INTAKE</p><h3>Tell EFF what the scholarship letter should say.</h3><p>Use complete, truthful details. This automated letter is for scholarship applications only.</p></div>
      <div className="recommendation-grid">
        <RecField label="Student’s full name" value={details.studentName} set={(value) => update("studentName", value)} placeholder="First and last name"/>
        <RecField label="College or university" value={details.school} set={(value) => update("school", value)} placeholder="Official school name"/>
        <RecField label="Major or program" value={details.major} set={(value) => update("major", value)} placeholder="Example: Public Health"/>
        <RecField label="Cumulative GPA (optional)" value={details.gpa} set={(value) => update("gpa", value)} placeholder="Example: 3.42"/>
        <RecField label="Scholarship name" value={details.opportunity} set={(value) => update("opportunity", value)} placeholder="Official scholarship name"/>
        <RecField label="Scholarship organization" value={details.organization} set={(value) => update("organization", value)} placeholder="Scholarship sponsor or foundation"/>
        <label className="recommendation-field"><span>Pronouns used in the letter</span><select value={details.pronouns} onChange={(event) => update("pronouns", event.target.value)}><option value="she">She / her</option><option value="he">He / him</option><option value="they">They / them</option></select></label>
        <RecField label="Connection to EFF" value={details.effConnection} set={(value) => update("effConnection", value)} placeholder="Program, chapter, service, ambassador, or resource"/>
        <RecField wide area label="Strengths the letter should highlight" value={details.strengths} set={(value) => update("strengths", value)} placeholder="Example: resilient leadership, compassion, and academic discipline"/>
        <RecField wide area label="One specific achievement, leadership, or service example" value={details.achievement} set={(value) => update("achievement", value)} placeholder="Include what happened and the measurable result."/>
        <RecField wide area label="Challenge overcome (optional)" value={details.challenge} set={(value) => update("challenge", value)} placeholder="Use respectful facts and share only what belongs in the letter."/>
        <RecField wide area label="Education, service, or career goal" value={details.futureGoal} set={(value) => update("futureGoal", value)} placeholder="Explain the future this opportunity will help make possible."/>
      </div>
      <div className={`recommendation-safety${blocked ? " blocked" : ""}`} role={blocked ? "alert" : "note"}>
        <b>{blocked ? "This submission cannot generate an EFF letter." : "Protected scholarship-letter intake"}</b>
        <p>{blocked ? `Remove prohibited or inappropriate content from: ${blockedFields.join(", ")}. Automated letters cannot include profanity, hate speech, threats, illegal-activity admissions, accusations against EFF, false-verification language, instruction manipulation, or non-scholarship uses.` : "The tool screens every field for profanity, hate speech, threats, illegal or accusatory claims, false-verification language, instruction manipulation, and non-scholarship uses. A blocked submission is not issued or downloaded."}</p>
      </div>
      <label className="recommendation-attestation"><input type="checkbox" checked={attested} disabled={blocked} onChange={(event) => setAttested(event.target.checked)}/><span>I confirm that the information I submitted is truthful, appropriate, and authorized for inclusion. I will use this letter only for the scholarship named above. I understand that EFF may reject or revoke any letter containing false, prohibited, altered, or misused content.</span></label>
    </section>

    <section className="recommendation-output">
      <div className="recommendation-output-heading"><div><p className="kicker">OFFICIAL EFF SCHOLARSHIP LETTER</p><h3>{blocked ? "Prohibited content must be removed." : ready ? "Signed and ready to save." : "Complete the intake to issue."}</h3></div><span className={ready ? "ready" : "incomplete"}>{blocked ? "NOT AUTHORIZED" : ready ? "SCHOLARSHIP USE ONLY" : `${9 - filled} essential fact${9 - filled === 1 ? "" : "s"} still needed`}</span></div>
      <div className={`recommendation-letter${ready ? " issued" : ""}`} aria-label="Generated Esther Funds Foundation recommendation letter">
        <div className="letter-brand"><Image src="/eff-recommendation-letter-logo.png" alt="Esther Funds Foundation logo" width={82} height={82}/><div><span>ESTHER FUNDS FOUNDATION</span><strong>Scholarship Recommendation</strong><small>SCHOLARSHIP USE ONLY · EVERY FUTURE FULFILLED.</small></div></div>
        <pre>{letter}</pre>
        <div className="letter-signature-block"><span className="letter-signature">Shayna Vincent</span><b>Shayna Vincent</b><small>Founder &amp; Executive Director · Esther Funds Foundation</small><small>Faith-Based 501(c)(3) Public Charity · EIN 93-4917509</small><small>nationals@estherfundsinc.org · 352-999-3232 · estherfundsfoundation.org</small><em>Electronically signed through the authorized EFF letter workflow · {issuedDate}</em></div>
        <p><b>Scholarship use only.</b> This letter is personalized from information submitted to Esther Funds Foundation by the applicant. It does not independently certify a GPA, title, award, or activity unless EFF separately confirms it, and it is not valid for any non-scholarship purpose.</p>
      </div>
      <div className="recommendation-actions"><button type="button" disabled={!ready} onClick={copy}>{copied ? "Copied ✓" : "Copy scholarship letter"}</button><button type="button" disabled={!ready} onClick={downloadPdf}>{ready ? "Download signed PDF" : blocked ? "Remove prohibited content" : "Complete + attest to download"}</button><button type="button" disabled={!ready} onClick={printLetter}>Print letter</button><a href={requestHref}>Request another type of letter ↗</a></div>
    </section>
  </section>;
}

function RecField({ label, value, set, placeholder, wide = false, area = false }: { label: string; value: string; set: (value: string) => void; placeholder: string; wide?: boolean; area?: boolean }) {
  const maxLength = area ? 700 : 160;
  return <label className={`recommendation-field${wide ? " wide" : ""}`}><span>{label}</span>{area ? <textarea value={value} maxLength={maxLength} onChange={(event) => set(event.target.value)} placeholder={placeholder}/> : <input value={value} maxLength={maxLength} onChange={(event) => set(event.target.value)} placeholder={placeholder}/>}</label>;
}
