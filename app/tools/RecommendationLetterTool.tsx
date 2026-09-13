"use client";

import { useMemo, useState } from "react";

type LetterDetails = {
  studentName: string;
  schoolMajor: string;
  opportunity: string;
  organization: string;
  recommenderName: string;
  recommenderRole: string;
  relationship: string;
  strengths: string;
  example: string;
  futureGoal: string;
  deadline: string;
};

const initialDetails: LetterDetails = {
  studentName: "",
  schoolMajor: "",
  opportunity: "",
  organization: "",
  recommenderName: "",
  recommenderRole: "",
  relationship: "",
  strengths: "",
  example: "",
  futureGoal: "",
  deadline: "",
};

const clean = (value: string, fallback: string) => value.trim() || `[${fallback}]`;

export default function RecommendationLetterTool() {
  const [details, setDetails] = useState(initialDetails);
  const [copied, setCopied] = useState<"letter" | "request" | "">("");

  const update = (field: keyof LetterDetails, value: string) => setDetails((current) => ({ ...current, [field]: value }));
  const student = clean(details.studentName, "student name");
  const firstName = details.studentName.trim().split(/\s+/)[0] || "the student";
  const opportunity = clean(details.opportunity, "opportunity name");
  const recipient = details.organization.trim() ? `${details.organization.trim()} Selection Committee` : "Selection Committee";

  const letter = useMemo(() => {
    const schoolMajor = clean(details.schoolMajor, "school, major, or program");
    const relationship = clean(details.relationship, "how the recommender knows the student and for how long");
    const strengths = clean(details.strengths, "two or three qualities the recommender can personally verify");
    const example = clean(details.example, "one specific example the recommender personally observed");
    const goal = clean(details.futureGoal, "the student’s education or career goal");
    const signer = clean(details.recommenderName, "recommender name");
    const signerRole = clean(details.recommenderRole, "title and organization");

    return `${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date())}

${recipient}

Dear Selection Committee:

I am pleased to recommend ${student} for the ${opportunity}. ${firstName} is currently connected to ${schoolMajor}, and I have known ${firstName} through ${relationship}.

In my experience with ${firstName}, ${strengths} stand out most clearly. One example is ${example}. This moment demonstrates not only what ${firstName} has accomplished, but also the character, initiative, and follow-through brought to the work.

${firstName} is working toward ${goal}. I believe this opportunity would help ${firstName} continue that progress and expand the impact already being made. Based on what I can personally verify, I recommend ${firstName} for your consideration.

Thank you for reviewing ${firstName}’s application. Please contact me if additional information would be helpful.

Sincerely,

${signer}
${signerRole}
[recommender email or phone]`;
  }, [details, firstName, opportunity, recipient, student]);

  const requestEmail = useMemo(() => `Subject: Recommendation request for ${opportunity}

Hello ${details.recommenderName.trim() || "[recommender name]"},

Would you be comfortable writing a recommendation for my ${opportunity} application? The deadline is ${details.deadline.trim() || "[deadline and time zone]"}.

To make this easier, I prepared a starter draft and the facts you may want to reference. Please change anything that does not reflect your own experience with me, and only sign or submit a letter you have personally reviewed and can verify.

I can also send the official opportunity instructions, my résumé, and any required submission link. Thank you for considering my request.

Best,
${student}`, [details.deadline, details.recommenderName, opportunity, student]);

  const filled = [details.studentName, details.schoolMajor, details.opportunity, details.recommenderName, details.relationship, details.strengths, details.example, details.futureGoal].filter((value) => value.trim()).length;
  const ready = filled === 8;

  const copy = async (value: string, type: "letter" | "request") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const printLetter = () => {
    document.body.classList.add("print-recommendation");
    window.print();
    window.setTimeout(() => document.body.classList.remove("print-recommendation"), 250);
  };

  const reviewUrl = "https://portal.estherfundsfoundation.org/help-desk/open-case";

  return <section className="recommendation-engine">
    <header className="recommendation-heading">
      <div>
        <p className="kicker">REACH · OPPORTUNITY-READY</p>
        <h2>The 60-Second<br/><em>Recommendation Letter</em></h2>
        <p>Answer the prompts once. Get a polished starter letter and a ready-to-send request email—without inventing a single fact.</p>
      </div>
      <aside><strong>{filled}/8</strong><span>essential facts added</span><b>{ready ? "READY TO REVIEW" : "KEEP GOING"}</b></aside>
    </header>

    <div className="recommendation-steps" aria-label="How the tool works">
      <span><b>1</b> Add the facts</span><span><b>2</b> Build the draft</span><span><b>3</b> Recommender reviews</span><span><b>4</b> Recommender submits</span>
    </div>

    <section className="recommendation-form">
      <div className="recommendation-form-heading"><p className="kicker">QUICK INTAKE</p><h3>Give the recommender what they need.</h3><p>Short phrases are enough. Use only information the signer can truthfully confirm.</p></div>
      <div className="recommendation-grid">
        <RecField label="Student’s full name" value={details.studentName} set={(value) => update("studentName", value)} placeholder="First and last name"/>
        <RecField label="School + major, program, or role" value={details.schoolMajor} set={(value) => update("schoolMajor", value)} placeholder="Example: FAMU junior studying public health"/>
        <RecField label="Scholarship, internship, or opportunity" value={details.opportunity} set={(value) => update("opportunity", value)} placeholder="Official opportunity name"/>
        <RecField label="Organization receiving the letter" value={details.organization} set={(value) => update("organization", value)} placeholder="Optional"/>
        <RecField label="Recommender’s name" value={details.recommenderName} set={(value) => update("recommenderName", value)} placeholder="Person who will review and sign"/>
        <RecField label="Recommender’s title + organization" value={details.recommenderRole} set={(value) => update("recommenderRole", value)} placeholder="Example: Professor, Howard University"/>
        <RecField wide label="How do they know the student—and for how long?" value={details.relationship} set={(value) => update("relationship", value)} placeholder="Example: my student in two biology courses since August 2025"/>
        <RecField wide label="Two or three strengths they have personally seen" value={details.strengths} set={(value) => update("strengths", value)} placeholder="Example: dependable leadership, thoughtful problem-solving, and care for peers"/>
        <RecField wide area label="One specific moment or measurable example" value={details.example} set={(value) => update("example", value)} placeholder="Example: She organized a campus food drive, recruited 18 volunteers, and delivered 240 items to the pantry."/>
        <RecField wide label="Education, service, or career goal" value={details.futureGoal} set={(value) => update("futureGoal", value)} placeholder="Example: become a pediatric nurse serving rural communities"/>
        <RecField label="Deadline + time zone" value={details.deadline} set={(value) => update("deadline", value)} placeholder="Example: October 1 at 11:59 p.m. ET"/>
      </div>
    </section>

    <section className="recommendation-output">
      <div className="recommendation-output-heading">
        <div><p className="kicker">LIVE DRAFT</p><h3>A strong start—not a fake signature.</h3></div>
        <span className={ready ? "ready" : "incomplete"}>{ready ? "All essential facts included" : `${8 - filled} essential fact${8 - filled === 1 ? "" : "s"} still needed`}</span>
      </div>
      <div className="recommendation-letter" aria-label="Generated recommendation letter">
        <div className="letter-brand"><span>ESTHER FUNDS FOUNDATION</span><strong>REACH</strong><small>EVERY FUTURE FULFILLED.</small></div>
        <pre>{letter}</pre>
        <p>This draft is based on student-provided information. The recommender must review, edit, verify, sign, and submit it.</p>
      </div>
      <div className="recommendation-actions">
        <button type="button" onClick={() => copy(letter, "letter")}>{copied === "letter" ? "Copied ✓" : "Copy letter"}</button>
        <button type="button" onClick={printLetter}>Save / print letter</button>
      </div>
    </section>

    <section className="recommendation-request">
      <div><p className="kicker">ASK PROFESSIONALLY</p><h3>Your request email is ready, too.</h3><p>Send the official deadline, instructions, résumé, and draft together. Give the recommender enough time to make the letter their own.</p></div>
      <pre>{requestEmail}</pre>
      <div className="recommendation-actions"><button type="button" onClick={() => copy(requestEmail, "request")}>{copied === "request" ? "Copied ✓" : "Copy request email"}</button></div>
    </section>

    <section className="recommendation-guardrail">
      <div><b>Need an official EFF recommendation?</b><p>Submit the facts for National Office review. EFF may verify appropriate participation or service, but a branded letter, signature, seal, or endorsement is never issued automatically from unverified student input.</p></div>
      <a href={reviewUrl}>Open a secure EFF review case →</a>
    </section>
  </section>;
}

function RecField({ label, value, set, placeholder, wide = false, area = false }: { label: string; value: string; set: (value: string) => void; placeholder: string; wide?: boolean; area?: boolean }) {
  return <label className={`recommendation-field${wide ? " wide" : ""}`}><span>{label}</span>{area ? <textarea value={value} onChange={(event) => set(event.target.value)} placeholder={placeholder}/> : <input value={value} onChange={(event) => set(event.target.value)} placeholder={placeholder}/>}</label>;
}
