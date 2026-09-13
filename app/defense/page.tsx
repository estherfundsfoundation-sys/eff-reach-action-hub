import Link from "next/link";
import type { Metadata } from "next";
import DefenseSuite from "./DefenseSuite";
import "./defense.css";

export const metadata: Metadata = {
  title: "EFF Student Defense Suite | REACH",
  description: "Private tools for financial aid, academic progress, school holds, employer education benefits, course planning, and urgent student support.",
  alternates: { canonical: "/defense" },
};

export default function DefensePage() {
  return <main className="defense-page">
    <header className="defense-nav"><Link href="/">← REACH Action Hub</Link><span>EFF STUDENT DEFENSE SUITE</span><a href="https://portal.estherfundsfoundation.org/resources/student-help">Open a help case ↗</a></header>
    <DefenseSuite/>
    <section className="defense-impact"><div><p>AFTER YOU USE A TOOL</p><h2>Tell EFF what moved.</h2><span>A school response, protected credit, added grant, cleared hold, or unresolved barrier helps EFF improve the system and prove the need.</span></div><Link href="/outcome">Share my outcome →</Link></section>
    <footer className="defense-footer"><strong>Esther Funds Foundation</strong><span>Real. Raw. Relevant. Rooted in faith and relentless student advocacy.</span><Link href="/">Return to REACH</Link></footer>
  </main>;
}
