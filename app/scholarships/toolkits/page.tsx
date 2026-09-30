import type { Metadata } from "next";
import Link from "next/link";
import { Top, Foot } from "../parts";
import "../scholarships.css";

/* Free downloads. The six PDFs came from the Portal (public/downloads) with the Portal's
   own descriptions; the interactive tools are REACH's. */
export const metadata: Metadata = {
  title: "Toolkits | REACH Scholarships",
  description: "Free essay toolkits, planners, aid-appeal and emergency guides from Esther Funds Foundation.",
  alternates: { canonical: "/scholarships/toolkits" },
};

const PDFS = [
  { who: "Start here in an emergency", name: "Student Emergency Mentor Guide", file: "eff-student-emergency-mentor-guide.pdf", text: "A nine-page calm-action guide for tuition, aid, enrollment, food, housing, transportation, medical, or personal emergencies—with a 24–72 hour plan, scripts, resource map, privacy rules, and seven-day tracker." },
  { who: "Most requested", name: "Scholarship Essay Toolkit", file: "eff-scholarship-essay-toolkit.pdf", text: "Story-bank prompts, three essay planning templates, a five-part writing map, revision rubric, and final submission checklist." },
  { who: "Student planner", name: "Scholarship Application Planner", file: "eff-scholarship-application-planner.pdf", text: "A printable tracker, reusable information inventory, weekly application rhythm, submission checklist, and scam-safety review." },
  { who: "High school seniors", name: "Senior Scholarship Roadmap", file: "eff-high-school-senior-roadmap.pdf", text: "A month-by-month senior-year plan, trusted places to search, application-packet checklist, and recommendation request script." },
  { who: "Parent & family resource", name: "Parent & Family College Funding Guide", file: "eff-parent-family-college-funding-guide.pdf", text: "Practical ways to support without taking over, FAFSA and aid-office questions, college-cost comparison worksheet, and urgent-money plan." },
  { who: "Student + family resource", name: "Financial Aid & Appeal Toolkit", file: "eff-financial-aid-appeal-toolkit.pdf", text: "Decode an aid offer, prepare a changed-circumstances appeal, track school contacts, and ask for emergency or completion support." },
];
const TOOLS = [
  { name: "Scholarship Essay Builder", href: "/tools/essay", text: "Answer five quick prompts and get a scholarship-ready STORY outline." },
  { name: "Scholarship Action Center", href: "/tools/scholarship", text: "Turn one deadline and its requirements into a complete application checklist." },
  { name: "Official EFF Recommendation Letter", href: "/tools/recommendation", text: "Submit truthful facts and save a personalized Esther Funds Foundation letter." },
  { name: "Deadline Reminder Builder", href: "/tools/reminders", text: "Download private calendar alerts for two weeks, three days, and one day before." },
];

export default function Page() {
  return (
    <main className="sc">
      <Top on="/scholarships/toolkits" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick">Free · print them or save them</span>
          <h1>Write it. <em>Track it.</em> Win it.</h1>
          <p>Every guide is free and built to get you to the next clear step.</p>
        </div>
      </section>
      <div className="sc-wrap sc-section">
        <div className="sc-kits">
          {PDFS.map((k) => (
            <a className="sc-kit" key={k.file} href={`/downloads/${k.file}`} download>
              <em>{k.who} · PDF</em><b>{k.name}</b><span>{k.text}</span>
            </a>
          ))}
        </div>
        <h2 className="sc-h2">Tools that do it with you</h2>
        <div className="sc-kits">
          {TOOLS.map((t) => <Link className="sc-kit" key={t.href} href={t.href}><em>Interactive</em><b>{t.name}</b><span>{t.text}</span></Link>)}
        </div>
        <p className="sc-note"><b>Use these safely:</b> never put Social Security numbers, passwords, verification codes, tax returns, or full bank information in an essay or ordinary email. Scholarship requirements vary, so always follow the original provider&rsquo;s instructions.</p>
      </div>
      <Foot />
    </main>
  );
}
