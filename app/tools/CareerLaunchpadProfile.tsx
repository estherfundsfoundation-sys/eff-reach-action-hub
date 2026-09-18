"use client";

import { useState } from "react";
import { createCareerProfile, profileSafetyIssues, type CareerDocument, type CareerProfile, type CareerProfileInput, type CareerProject } from "./career-profile";
import "./resume.css";

const blankProject = (): CareerProject => ({ name: "", category: "", description: "", url: "" });
const blankDocument = (): CareerDocument => ({ docType: "Recommendation Letter", recommenderRaw: "", fileUrl: "" });
const initial: CareerProfileInput = { student: { fullName: "", university: "", major: "", gradYear: "", targetRole: "", rawBio: "", skillsRaw: "" }, rawProjects: [blankProject()], documents: [] };

function Input({ label, value, onChange, placeholder = "", area = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; area?: boolean }) {
  return <label className={`resume-field${area ? " wide" : ""}`}><span>{label}</span>{area ? <textarea rows={3} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder}/> : <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder}/>}</label>;
}

export default function CareerLaunchpadProfile() {
  const [input, setInput] = useState<CareerProfileInput>(initial);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [message, setMessage] = useState("");
  const update = (next: CareerProfileInput) => { setInput(next); setProfile(null); setMessage(""); };
  const student = (key: keyof CareerProfileInput["student"], value: string) => update({ ...input, student: { ...input.student, [key]: value } });
  const project = (index: number, key: keyof CareerProject, value: string) => update({ ...input, rawProjects: input.rawProjects.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  const updateDocument = (index: number, key: keyof CareerDocument, value: string) => update({ ...input, documents: input.documents.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  const generate = () => {
    const issues = profileSafetyIssues(input);
    if (issues.length) { setMessage(issues.join(" ")); setProfile(null); return; }
    setProfile(createCareerProfile(input));
    setMessage("Review and edit the profile before sharing. EFF has not verified the claims or recommenders.");
    window.setTimeout(() => document.getElementById("career-profile-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }), 70);
  };
  const copy = async () => {
    if (!profile) return;
    try {
      const lines = [profile.headline, "", profile.summary, "", ...profile.projects.flatMap(p => [p.title + " | " + p.domain, ...p.bullets.map(b => `• ${b}`), p.url]), "", ...profile.documents.map(d => `${d.title} — ${d.endorser} (${d.verification})`)].filter(Boolean);
      await navigator.clipboard.writeText(lines.join("\n"));
      setMessage("Profile copied. Check the destination before sharing any document link.");
    } catch { setMessage("Clipboard access was unavailable. Select the text in the preview to copy it."); }
  };
  const download = () => {
    if (!profile) return;
    const payload = { schemaVersion: "1.0", visibility: "private-draft", generatedAt: new Date().toISOString(), studentName: input.student.fullName.trim(), ...profile };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = window.document.createElement("a"); link.href = url; link.download = `EFF-Career-Launchpad-${input.student.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "profile"}.json`; link.click(); URL.revokeObjectURL(url);
    setMessage("Structured profile downloaded to your device. It has not been submitted to EFF.");
  };
  return <section className="resume-engine career-engine" aria-labelledby="career-title">
    <header className="resume-engine-head"><div><p>EFF CAREER LAUNCHPAD</p><h2 id="career-title">Make your work<br/><em>visible.</em></h2><span>Build a professional story from school, projects, service, and real skills.</span></div><div className="resume-engine-mark" aria-hidden="true">EFF<span>CAREERS</span></div></header>
    <p className="resume-privacy">Private draft: this page does not save or send your information to EFF. Do not enter home addresses, government IDs, or confidential reference documents. EFF does not verify credentials here.</p>
    <div className="resume-form">
      <div className="resume-step"><span>01</span><h3>Your direction</h3><p>Use your own words. This starter profile is editable before you share it.</p></div>
      <div className="resume-grid"><Input label="Full name" value={input.student.fullName} onChange={v => student("fullName", v)} placeholder="Alexandria Brooks"/><Input label="University" value={input.student.university} onChange={v => student("university", v)} placeholder="Florida State University"/><Input label="Major or program" value={input.student.major} onChange={v => student("major", v)} placeholder="Computer Science & Information Technology"/><Input label="Graduation year" value={input.student.gradYear} onChange={v => student("gradYear", v)} placeholder="2027"/><Input label="Role or field you are exploring" value={input.student.targetRole} onChange={v => student("targetRole", v)} placeholder="Front-End or UX Engineering internship"/><Input label="Skills, separated by commas" value={input.student.skillsRaw} onChange={v => student("skillsRaw", v)} placeholder="React, CSS, Python, Figma"/><Input label="Your rough story" value={input.student.rawBio} onChange={v => student("rawBio", v)} placeholder="I built an accessible club website and tutored first-year students in Python." area/></div>
      <div className="resume-step"><span>02</span><h3>Projects</h3><p>Coursework counts. State the deliverable, tools, scope, and outcome only if you can support them.</p></div>
      {input.rawProjects.map((item, index) => <fieldset className="resume-entry-form" key={index}><legend>Project {index + 1}</legend><div className="resume-grid"><Input label="Project title" value={item.name} onChange={v => project(index, "name", v)} placeholder="Club Website Redesign"/><Input label="Domain or category" value={item.category} onChange={v => project(index, "category", v)} placeholder="Web Development"/><Input label="Secure project URL (optional)" value={item.url} onChange={v => project(index, "url", v)} placeholder="https://github.com/..."/><Input label="What did you make, how, and for whom?" value={item.description} onChange={v => project(index, "description", v)} placeholder="Redesigned the club website for screen-reader access; about 200 students viewed it." area/></div>{input.rawProjects.length > 1 && <button type="button" className="resume-text-button" onClick={() => update({ ...input, rawProjects: input.rawProjects.filter((_, i) => i !== index) })}>Remove project</button>}</fieldset>)}
      {input.rawProjects.length < 3 && <button type="button" className="resume-add" onClick={() => update({ ...input, rawProjects: [...input.rawProjects, blankProject()] })}>+ Add a project</button>}
      <div className="resume-step"><span>03</span><h3>Document metadata</h3><p>Describe a recommendation or reference; do not upload the document here. Only include a link you are authorized to share.</p></div>
      {input.documents.map((item, index) => <fieldset className="resume-entry-form" key={index}><legend>Document {index + 1}</legend><div className="resume-grid"><Input label="Document type" value={item.docType} onChange={v => updateDocument(index, "docType", v)} placeholder="Recommendation Letter"/><Input label="Recommender name and title" value={item.recommenderRaw} onChange={v => updateDocument(index, "recommenderRaw", v)} placeholder="Dr. Marcus Vance, Associate Professor"/><Input label="Secure URL (optional)" value={item.fileUrl} onChange={v => updateDocument(index, "fileUrl", v)} placeholder="https://..."/></div><button type="button" className="resume-text-button" onClick={() => update({ ...input, documents: input.documents.filter((_, i) => i !== index) })}>Remove document</button></fieldset>)}
      {input.documents.length < 3 && <button type="button" className="resume-add" onClick={() => update({ ...input, documents: [...input.documents, blankDocument()] })}>+ Add document metadata</button>}
      <div className="resume-create"><button type="button" onClick={generate}>Build my career profile →</button><p>Nothing is published or submitted. You decide when to share.</p></div>
    </div>
    <p className="resume-status" role="status" aria-live="polite">{message}</p>
    {profile && <div className="resume-preview" id="career-profile-preview"><div className="resume-preview-heading"><div><p>PRIVATE PROFILE DRAFT</p><h3>Your launchpad profile</h3><span>Check every claim. Edit fields above and rebuild if needed.</span></div><div className="career-actions"><button type="button" onClick={copy}>Copy profile</button><button type="button" onClick={download}>Download structured profile</button></div></div><article className="career-card"><p className="career-kicker">CAREER LAUNCHPAD · DRAFT</p><h3>{profile.headline}</h3><p className="career-summary">{profile.summary}</p>{profile.skills.length > 0 && <div className="career-tags">{profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div>}{profile.projects.length > 0 && <section><h4>Selected projects</h4>{profile.projects.map((item, index) => <div className="career-project" key={index}><strong>{item.title}</strong><small>{item.domain}</small>{item.bullets.map((bullet, i) => <p key={i}>• {bullet}</p>)}{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Project link ↗</a>}</div>)}</section>}{profile.documents.length > 0 && <section><h4>Documents & references</h4>{profile.documents.map((item, index) => <div className="career-project" key={index}><strong>{item.title}</strong><p>{item.endorser}</p><small>{item.verification}</small>{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Document link ↗</a>}</div>)}</section>}</article>{profile.warnings.map(warning => <p className="career-warning" key={warning}>{warning}</p>)}<p className="resume-preview-note">This is a student-edited draft, not an EFF endorsement or a live public profile.</p></div>}
  </section>;
}
