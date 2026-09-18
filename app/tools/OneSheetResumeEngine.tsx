"use client";

import { useState } from "react";
import {
  createResumeDraft,
  validateResume,
  type ResumeDraft,
  type ResumeEntry,
  type ResumeInput,
  type ResumeProject,
} from "./resume-engine";
import "./resume.css";

const blankEntry = (): ResumeEntry => ({ role: "", organization: "", location: "", dates: "", rawInput: "", proof: "" });
const blankProject = (): ResumeProject => ({ title: "", context: "", dates: "", rawInput: "", proof: "" });
const initial: ResumeInput = {
  personal: { fullName: "", email: "", phone: "", location: "", linkedIn: "" },
  education: { institution: "", degree: "", graduationDate: "", gpa: "", honors: "", relevantCoursework: "" },
  experience: [blankEntry()],
  projects: [],
  skills: { technical: "", languages: "", certifications: "" },
};

function Field({ label, value, onChange, placeholder = "", wide = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; wide?: boolean }) {
  return <label className={`resume-field${wide ? " wide" : ""}`}><span>{label}</span><input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function Notes({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="resume-field wide"><span>{label}</span><textarea rows={3} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function ResumePaper({ input, draft, editBullet }: { input: ResumeInput; draft: ResumeDraft; editBullet: (section: "experience" | "projects", entry: number, bullet: number, value: string) => void }) {
  const p = input.personal;
  const e = input.education;
  const skills = [
    input.skills.technical.trim() && `Technical: ${input.skills.technical.trim()}`,
    input.skills.languages.trim() && `Languages: ${input.skills.languages.trim()}`,
    input.skills.certifications.trim() && `Certifications: ${input.skills.certifications.trim()}`,
  ].filter(Boolean);
  return <div className="resume-paper" aria-label="Editable one-page résumé preview">
    <header><h3>{p.fullName.trim() || "Your name"}</h3><p>{[p.location, p.phone, p.email, p.linkedIn].map(v => v.trim()).filter(Boolean).join("  ·  ")}</p></header>
    <section><h4>EDUCATION</h4><div className="resume-paper-row"><b>{e.institution}</b><span>{e.graduationDate}</span></div><p>{e.degree}{e.gpa.trim() ? ` · GPA: ${e.gpa.trim()}` : ""}</p>{e.honors.trim() && <p>Honors: {e.honors}</p>}{e.relevantCoursework.trim() && <p>Relevant Coursework: {e.relevantCoursework}</p>}</section>
    {!!draft.experience.length && <section><h4>EXPERIENCE</h4>{draft.experience.map((item, index) => <div className="resume-paper-entry" key={`e-${index}`}><div className="resume-paper-row"><b>{item.heading}</b><span>{item.subheading}</span></div>{item.bullets.map((bullet, bulletIndex) => <label className="resume-bullet-edit" key={bulletIndex}><span aria-hidden="true">•</span><textarea aria-label={`Experience ${index + 1}, bullet ${bulletIndex + 1}`} rows={2} value={bullet.text} onChange={event => editBullet("experience", index, bulletIndex, event.target.value)} /></label>)}</div>)}</section>}
    {!!draft.projects.length && <section><h4>LEADERSHIP &amp; PROJECTS</h4>{draft.projects.map((item, index) => <div className="resume-paper-entry" key={`p-${index}`}><div className="resume-paper-row"><b>{item.heading}</b><span>{item.subheading}</span></div>{item.bullets.map((bullet, bulletIndex) => <label className="resume-bullet-edit" key={bulletIndex}><span aria-hidden="true">•</span><textarea aria-label={`Project ${index + 1}, bullet ${bulletIndex + 1}`} rows={2} value={bullet.text} onChange={event => editBullet("projects", index, bulletIndex, event.target.value)} /></label>)}</div>)}</section>}
    {!!skills.length && <section><h4>SKILLS &amp; CERTIFICATIONS</h4>{skills.map((item, index) => <p key={index}>{item}</p>)}</section>}
  </div>;
}

async function saveResume(input: ResumeInput, draft: ResumeDraft) {
  const { jsPDF } = await import("jspdf");
  const clean = (value: string) => value.trim().replace(/\s+/g, " ");
  const p = input.personal;
  const e = input.education;
  for (const size of [9.6, 9.1, 8.6]) {
    const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
    const left = 48;
    const width = 516;
    let y = 47;
    const line = size + 3.1;
    const write = (value: string, bold = false, indent = 0) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      const rows = pdf.splitTextToSize(clean(value), width - indent) as string[];
      for (const row of rows) { pdf.text(row, left + indent, y); y += line; }
    };
    const heading = (value: string) => { y += 8; pdf.setDrawColor(45); pdf.setLineWidth(0.5); pdf.line(left, y - 2, left + width, y - 2); write(value, true); y += 1; };
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(17); pdf.text(clean(p.fullName).toUpperCase(), left, y); y += 18;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(size);
    const contact = [p.location, p.phone, p.email, p.linkedIn].map(clean).filter(Boolean).join("  |  ");
    const contacts = pdf.splitTextToSize(contact, width) as string[];
    for (const row of contacts) { pdf.text(row, left, y); y += line; }
    heading("EDUCATION");
    write([e.institution, e.graduationDate].map(clean).filter(Boolean).join("  |  "), true);
    write([e.degree, e.gpa.trim() ? `GPA: ${e.gpa.trim()}` : ""].filter(Boolean).join("  |  "));
    if (e.honors.trim()) write(`Honors: ${e.honors}`);
    if (e.relevantCoursework.trim()) write(`Relevant Coursework: ${e.relevantCoursework}`);
    const section = (title: string, entries: ResumeDraft["experience"]) => {
      if (!entries.length) return;
      heading(title);
      for (const item of entries) {
        write([item.heading, item.subheading].filter(Boolean).join("  |  "), true);
        for (const bullet of item.bullets) write(`- ${bullet.text}`, false, 10);
        y += 3;
      }
    };
    section("EXPERIENCE", draft.experience);
    section("LEADERSHIP & PROJECTS", draft.projects);
    const skills = [
      input.skills.technical.trim() && `Technical: ${input.skills.technical.trim()}`,
      input.skills.languages.trim() && `Languages: ${input.skills.languages.trim()}`,
      input.skills.certifications.trim() && `Certifications: ${input.skills.certifications.trim()}`,
    ].filter(Boolean) as string[];
    if (skills.length) { heading("SKILLS & CERTIFICATIONS"); skills.forEach(item => write(item)); }
    if (y <= 748) {
      const name = clean(p.fullName).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "student";
      pdf.save(`EFF-One-Sheet-Resume-${name}.pdf`);
      return;
    }
  }
  throw new Error("This résumé needs a little less text to fit on one page. Shorten a few bullets and try again.");
}

export default function OneSheetResumeEngine() {
  const [input, setInput] = useState<ResumeInput>(initial);
  const [draft, setDraft] = useState<ResumeDraft | null>(null);
  const [message, setMessage] = useState("");
  const update = (next: ResumeInput) => { setInput(next); setDraft(null); setMessage(""); };
  const updatePersonal = (key: keyof ResumeInput["personal"], value: string) => update({ ...input, personal: { ...input.personal, [key]: value } });
  const updateEducation = (key: keyof ResumeInput["education"], value: string) => update({ ...input, education: { ...input.education, [key]: value } });
  const updateSkills = (key: keyof ResumeInput["skills"], value: string) => update({ ...input, skills: { ...input.skills, [key]: value } });
  const updateExperience = (index: number, key: keyof ResumeEntry, value: string) => update({ ...input, experience: input.experience.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  const updateProject = (index: number, key: keyof ResumeProject, value: string) => update({ ...input, projects: input.projects.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  const editBullet = (section: "experience" | "projects", entry: number, bullet: number, value: string) => setDraft(current => current && ({ ...current, [section]: current[section].map((item, i) => i === entry ? { ...item, bullets: item.bullets.map((line, j) => j === bullet ? { ...line, text: value } : line) } : item) }));
  const generate = () => {
    const result = createResumeDraft(input);
    const problems = validateResume(input, result);
    if (problems.length) { setMessage(problems.join(" ")); setDraft(null); return; }
    setDraft(result);
    setMessage(result.proofCount ? `${result.proofCount} bullet${result.proofCount === 1 ? "" : "s"} have no measurable proof yet. Add a real number if you know one; never guess.` : "Review every bullet before downloading. Only submit claims you can explain.");
    window.setTimeout(() => document.getElementById("resume-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }), 70);
  };
  const download = async () => {
    if (!draft) return;
    const problems = validateResume(input, draft);
    if (problems.length) { setMessage(problems.join(" ")); return; }
    try { await saveResume(input, draft); setMessage("Your one-page PDF is downloaded. Read it once more before applying."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not create the PDF. Please try again."); }
  };

  return <section className="resume-engine" aria-labelledby="resume-title">
    <header className="resume-engine-head"><div><p>FREE EFF CAREER RESOURCE</p><h2 id="resume-title">Your story.<br/><em>One strong page.</em></h2><span>Turn work, school, service, and projects into a résumé you can actually send.</span></div><div className="resume-engine-mark" aria-hidden="true">EFF<span>REACH</span></div></header>
    <p className="resume-privacy">Private by design: your answers stay in this browser. Nothing you type here is sent to EFF. This tool does not invent jobs, results, or numbers.</p>
    <div className="resume-form">
      <div className="resume-step"><span>01</span><h3>Contact</h3><p>Use the contact details you want an employer to see. A home address is not needed.</p></div>
      <div className="resume-grid"><Field label="Full name" value={input.personal.fullName} onChange={v => updatePersonal("fullName", v)} placeholder="Jordan Taylor"/><Field label="Email" value={input.personal.email} onChange={v => updatePersonal("email", v)} placeholder="jordan@university.edu"/><Field label="Phone" value={input.personal.phone} onChange={v => updatePersonal("phone", v)} placeholder="(555) 123-4567"/><Field label="City, state" value={input.personal.location} onChange={v => updatePersonal("location", v)} placeholder="Atlanta, GA"/><Field label="LinkedIn URL (optional)" value={input.personal.linkedIn} onChange={v => updatePersonal("linkedIn", v)} placeholder="linkedin.com/in/jordan" wide/></div>
      <div className="resume-step"><span>02</span><h3>Education</h3><p>Coursework and class projects count, especially when you are building your first résumé.</p></div>
      <div className="resume-grid"><Field label="College or university" value={input.education.institution} onChange={v => updateEducation("institution", v)} placeholder="Georgia State University"/><Field label="Degree or program" value={input.education.degree} onChange={v => updateEducation("degree", v)} placeholder="B.S. in Psychology"/><Field label="Graduation month and year" value={input.education.graduationDate} onChange={v => updateEducation("graduationDate", v)} placeholder="May 2027"/><Field label="GPA (optional)" value={input.education.gpa} onChange={v => updateEducation("gpa", v)} placeholder="3.6"/><Field label="Honors (optional)" value={input.education.honors} onChange={v => updateEducation("honors", v)} placeholder="Dean’s List, First-Generation Scholar" wide/><Field label="Relevant coursework (optional)" value={input.education.relevantCoursework} onChange={v => updateEducation("relevantCoursework", v)} placeholder="Research Methods, Statistics" wide/></div>
      <div className="resume-step"><span>03</span><h3>Experience</h3><p>Retail, childcare, food service, campus jobs, and paid work all belong here. Use everyday words; you can polish the draft below.</p></div>
      {input.experience.map((item, index) => <fieldset className="resume-entry-form" key={index}><legend>Experience {index + 1}</legend><div className="resume-grid"><Field label="Role" value={item.role} onChange={v => updateExperience(index, "role", v)} placeholder="Shift Lead / Barista"/><Field label="Organization" value={item.organization} onChange={v => updateExperience(index, "organization", v)} placeholder="Starbucks"/><Field label="Location" value={item.location} onChange={v => updateExperience(index, "location", v)} placeholder="Atlanta, GA"/><Field label="Dates" value={item.dates} onChange={v => updateExperience(index, "dates", v)} placeholder="Aug 2025 – Present"/><Notes label="What did you actually do?" value={item.rawInput} onChange={v => updateExperience(index, "rawInput", v)} placeholder="I opened the store, handled the rush, ran the cash drawer, and trained 2 new teammates."/><Field label="A real result or number you can confirm (optional)" value={item.proof} onChange={v => updateExperience(index, "proof", v)} placeholder="2 teammates trained" wide/></div>{input.experience.length > 1 && <button type="button" className="resume-text-button" onClick={() => update({ ...input, experience: input.experience.filter((_, i) => i !== index) })}>Remove this experience</button>}</fieldset>)}
      {input.experience.length < 3 && <button type="button" className="resume-add" onClick={() => update({ ...input, experience: [...input.experience, blankEntry()] })}>+ Add another experience</button>}
      <div className="resume-step"><span>04</span><h3>Leadership &amp; projects</h3><p>Class projects, research, clubs, and service can show what you built or learned. Add up to two.</p></div>
      {input.projects.map((item, index) => <fieldset className="resume-entry-form" key={index}><legend>Project {index + 1}</legend><div className="resume-grid"><Field label="Project title" value={item.title} onChange={v => updateProject(index, "title", v)} placeholder="Community Nutrition Survey"/><Field label="Class, club, or program" value={item.context} onChange={v => updateProject(index, "context", v)} placeholder="Independent Research Project"/><Field label="Dates" value={item.dates} onChange={v => updateProject(index, "dates", v)} placeholder="Spring 2026"/><Field label="Confirmed scope or result (optional)" value={item.proof} onChange={v => updateProject(index, "proof", v)} placeholder="120 student responses"/><Notes label="What did you create or study?" value={item.rawInput} onChange={v => updateProject(index, "rawInput", v)} placeholder="Surveyed 120 students about food security and built Excel charts for student council."/></div><button type="button" className="resume-text-button" onClick={() => update({ ...input, projects: input.projects.filter((_, i) => i !== index) })}>Remove this project</button></fieldset>)}
      {input.projects.length < 2 && <button type="button" className="resume-add" onClick={() => update({ ...input, projects: [...input.projects, blankProject()] })}>+ Add a project</button>}
      <div className="resume-step"><span>05</span><h3>Skills</h3><p>List only tools, languages, and certifications you really have.</p></div>
      <div className="resume-grid"><Field label="Technical tools" value={input.skills.technical} onChange={v => updateSkills("technical", v)} placeholder="Excel, Qualtrics, Google Workspace" wide/><Field label="Languages" value={input.skills.languages} onChange={v => updateSkills("languages", v)} placeholder="Spanish (conversational)"/><Field label="Certifications" value={input.skills.certifications} onChange={v => updateSkills("certifications", v)} placeholder="CPR / First Aid"/></div>
      <div className="resume-create"><button type="button" onClick={generate}>Build my one-sheet résumé →</button><p>We draft from your words. You review and edit before downloading.</p></div>
    </div>
    <p className="resume-status" role="status" aria-live="polite">{message}</p>
    {draft && <div id="resume-preview" className="resume-preview"><div className="resume-preview-heading"><div><p>EDIT BEFORE YOU EXPORT</p><h3>Your résumé draft</h3><span>Click a bullet to correct the wording. Keep every number and claim accurate.</span></div><button type="button" onClick={download}>Download one-page PDF ↓</button></div><ResumePaper input={input} draft={draft} editBullet={editBullet}/><p className="resume-preview-note">EFF prepared this free resource; EFF has not independently verified the experiences or endorsed the applicant to an employer.</p></div>}
  </section>;
}
