"use client";

import Link from "next/link";
import { SiteTop, SiteFoot } from "../myreach/ui";
import LibCard from "../content/LibCard";
import { useLibrary } from "../content/useLibrary";

/* Organizations doing this work (3 Nov 2026, Shayna: "all of these resources should be on reach with
   links to all"). EFF's Similar-Mission Organizations directory, its ten sections in order. Every card is
   a REACH Library row (MyEFF eff_reach_items, keys org-* plus Hope Center and Swipe Out Hunger), so the
   morning link check and "Didn't help?" reports cover them. The list itself: MyEFF scripts/reach/library-orgs.mjs. */
const SECTIONS: { title: string; line: string; hue: string; keys: string[] }[] = [
  { title: "Emergency money that keeps students enrolled", hue: "#ff6f61", line: "Small amounts of money, fast, before a small balance becomes a dropped enrollment.",
    keys: ["org-believe-in-students", "org-scholarship-america-emergency-aid", "org-beam"] },
  { title: "Food, housing and benefits", hue: "#ffb35a", line: "Students leave over food, housing and benefits they never claimed as often as over tuition.",
    keys: ["the-hope-center-student-basic-needs-research", "swipe-out-hunger", "org-food-recovery-network", "org-single-stop"] },
  { title: "Tools and money guidance in your hands", hue: "#ffd35a", line: "A coach, an app or an adviser who explains the money before the bill comes.",
    keys: ["org-beyond-12", "org-uaspire", "org-get-schooled"] },
  { title: "Coaching that gets you to the finish", hue: "#b799e3", line: "A named person who stays with you is the most proven way students finish. Including for anyone who stepped away.",
    keys: ["org-bottom-line", "org-college-possible", "org-college-track", "org-college-advising-corps", "org-insidetrack", "org-reup-education", "org-onegoal", "org-imentor", "org-one-million-degrees"] },
  { title: "Chapters, cohorts and mentors", hue: "#c9a0ff", line: "Groups that run on local chapters, tight cohorts or matched mentors, like EFF's campus chapters.",
    keys: ["org-posse-foundation", "org-kipp-forward", "org-communities-in-schools", "org-city-year", "org-big-brothers-big-sisters"] },
  { title: "HBCU and identity-focused support", hue: "#5fd0a8", line: "Scholarships plus community for HBCU students and other underrepresented students.",
    keys: ["org-uncf", "org-tmcf", "org-hbcu-first", "org-hispanic-scholarship-fund", "org-apia-scholars"] },
  { title: "First-generation and low-income students", hue: "#6fb3ff", line: "Money paired with real support, for the first in the family to go.",
    keys: ["org-questbridge", "org-dell-scholars", "org-firstgen-forward"] },
  { title: "Foster youth, homeless students and career paths", hue: "#ff9ec4", line: "For students without a family safety net, and a way into a career.",
    keys: ["org-foster-care-to-success", "org-schoolhouse-connection", "org-year-up"] },
  { title: "Staying in high school", hue: "#9fa8ff", line: "The front end of the same road: keeping students in high school and on to graduation.",
    keys: ["org-jag", "org-check-and-connect", "org-national-dropout-prevention-center", "org-attendance-works", "org-everyone-graduates-center", "org-boys-girls-clubs", "org-say-yes-buffalo"] },
  { title: "Research, policy and completion networks", hue: "#7fd3c7", line: "Where the data, the research and the policy language live.",
    keys: ["org-complete-college-america", "org-achieving-the-dream", "org-edtrust", "org-strivetogether"] },
];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function Orgs() {
  const { items } = useLibrary();
  const by = new Map(items.map((i) => [i.key, i]));
  const total = SECTIONS.reduce((n, s) => n + s.keys.filter((k) => by.has(k)).length, 0);
  return (
    <main className="sc rh rs">
      <SiteTop on="/resources" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />{total} organizations, links checked every morning</span>
          <h1>You are not <em>the only one fighting for you.</em></h1>
          <p>Across the country, these organizations do the same work EFF does: emergency money, food and housing, coaches who stay, scholarships, and keeping students in high school. Every name opens their own website.</p>
          <nav className="sc-pills" aria-label="Sections">
            {SECTIONS.map((s, n) => <a key={s.title} className="sc-pill" href={`#s${n + 1}`} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", borderColor: s.hue }}>{ROMAN[n]} · {s.title}</a>)}
          </nav>
        </div>
      </section>
      <div className="sc-wrap sc-section">
        {SECTIONS.map((s, n) => {
          const list = s.keys.map((k) => by.get(k)).filter(Boolean) as NonNullable<ReturnType<typeof by.get>>[];
          if (!list.length) return null;
          return (
            <section key={s.title} id={`s${n + 1}`} className="rs-sec">
              <div className="rs-sec-h"><span style={{ background: s.hue }} aria-hidden="true">{ROMAN[n]}</span><div><h2>{s.title}</h2><p>{s.line}</p></div></div>
              <div className="lb-grid">{list.map((i) => <LibCard key={i.key} i={i} />)}</div>
            </section>
          );
        })}
        <section className="rs-more">
          <h2>Need help right now?</h2>
          <p>These organizations are national. For your own situation tonight, start with EFF.</p>
          <div className="rs-acts">
            <Link className="sc-btn coral" href="/emergency">Make my emergency plan</Link>
            <Link className="sc-btn ghost" href="/start">Get my own plan</Link>
            <Link className="sc-btn ghost" href="/resources">All resources</Link>
          </div>
        </section>
      </div>
      <SiteFoot />
    </main>
  );
}
