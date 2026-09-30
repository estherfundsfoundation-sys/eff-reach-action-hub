import type { Metadata } from "next";
import Link from "next/link";
import { Top, Foot } from "../parts";
import "../scholarships.css";

/* EFF's own scholarships. The descriptions are the Portal's program text word for word;
   on 30 Sept 2026 no cycle was open for any of them. A new application system is being
   built; until it opens, nobody is asked to apply anywhere. */
export const metadata: Metadata = {
  title: "EFF Scholarships | REACH",
  description: "The scholarships Esther Funds Foundation gives, and when they open.",
  alternates: { canonical: "/scholarships/eff" },
};

const PROGRAMS = [
  { kind: "Scholarship", name: "EFF Name Your Need Scholarship", text: "A need-based award where students name what they need most to stay enrolled." },
  { kind: "Scholarship", name: "EFF For Such a Time as This Scholarship", text: "A rolling need-based scholarship for students facing a defining season when timely help can protect continued enrollment." },
  { kind: "Scholarship", name: "EFF Members-Only Service Scholarship", text: "Three scholarship awards recognizing active EFF collegiate chapter members who document chapter involvement, community service, FAFSA completion, and participation in the national Double Good popcorn fundraiser." },
  { kind: "Scholarship", name: "EFF Collegiate Executive Board Service Scholarship", text: "A $1,000 scholarship recognizing an EFF collegiate executive board member whose leadership, reliability, chapter climate, and documented service demonstrate excellence." },
  { kind: "Scholarship", name: "EFF Ambassador Service Scholarship", text: "A $1,000 scholarship recognizing an EFF ambassador whose documented fall work, community service, and student-centered impact advance Every Future Fulfilled." },
  { kind: "Emergency grant", name: "EFF Emergency Grant", text: "EFF's emergency grant for students." },
];

export default function Page() {
  return (
    <main className="sc">
      <Top on="/scholarships/eff" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick">From Esther Funds Foundation</span>
          <h1>EFF&rsquo;s <em>own.</em></h1>
          <p>The scholarships EFF funds and gives itself. None is open right now. When a cycle opens, it&rsquo;s announced here and on EFF&rsquo;s Instagram, with the date it closes and how to apply.</p>
          <div className="sc-acts">
            <a className="sc-btn ghost" href="https://www.instagram.com/estherfundsfoundation/" target="_blank" rel="noopener noreferrer">Follow @estherfundsfoundation</a>
            <Link className="sc-btn" href="/scholarships/recipients">Meet past recipients</Link>
          </div>
        </div>
      </section>
      <div className="sc-wrap sc-section">
        <div className="sc-grid">
          {PROGRAMS.map((p) => (
            <article className="sc-card" key={p.name}>
              <span className="sc-due">Closed for now</span>
              <span className="sc-small" style={{ fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", fontSize: 12 }}>{p.kind}</span>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <p className="sc-by">{p.text}</p>
            </article>
          ))}
        </div>
        <div className="sc-note">Need money this week? Don&rsquo;t wait for a cycle: <Link href="/get-help">Get Help</Link> finds emergency aid near you, and <a href="https://my.estherfundsfoundation.org/lighthouse">the Lighthouse</a> puts you in touch with a person at EFF. Meanwhile, <Link href="/scholarships/match">thousands of other scholarships are open</Link>.</div>
      </div>
      <Foot />
    </main>
  );
}
