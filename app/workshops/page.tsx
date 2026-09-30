import type { Metadata } from "next";
import Link from "next/link";
import { SiteFoot, SiteTop } from "../myreach/ui";
import JoinCode from "./JoinCode";
import "../scholarships/scholarships.css";
import "../reach-home.css";
import "./workshops.css";

export const metadata: Metadata = {
  title: "REACH Workshops · Esther Funds Foundation",
  description: "Live workshops that get a room on its feet. Students join on their phones; chapters and Campus Ambassadors host.",
};

/* The workshops live in MyEFF (my.estherfundsfoundation.org/workshop to host,
   /w to join). This page is REACH's door to them. Names and lines are copied
   from MyEFF's app/workshop/tracks.ts; keep them in step. */
const MYEFF = "https://my.estherfundsfoundation.org";
const SHELVES = [
  { title: "REACH Workshops", line: "Before you drop out, REACH. Hosted by Campus Ambassadors, chapters and National.", items: [
    ["Before you drop out, REACH.", "Money, food, mental health, and keeping a friend in school."],
    ["Get Paid to Learn", "Free money first, the scholarship hunt, scam radar, and borrowing like it's your future."],
    ["Mind Matters", "You're not alone, the basics that hold you, tools for a loud mind, and how to be the one who asks."],
    ["Stay Enrolled", "Holds and bills, keeping your aid, what withdrawing really costs, and food and rent."],
    ["Career Launch", "A resume that speaks, STAR interviews, your network, and your pitch."],
  ] },
  { title: "EFF Signature Workshops", line: "Built on EFF's mission, made for chapters to host with their own logo and partners.", items: [
    ["Everything Within Reach", "EFF's own scholarships and emergency help, thousands more checked every morning, and every EFF tool."],
    ["First in the Family", "The rulebook nobody hands first-generation students."],
    ["For Such a Time as This", "Esther's story and our founder's, your why written down, and a plan for the hard days."],
    ["Lead Where You Stand", "Lead yourself, serve the EFF way, lead people, and pitch a project."],
    ["Finish Strong", "Your degree audit, registering right, the midterm check, finals, and applying to graduate."],
  ] },
  { title: "Meetings", line: "For chapters and campuses getting started.", items: [
    ["EFF Informational Meeting", "Who EFF is, the story so far, where you fit, and joining in the room."],
    ["Chapter Interest Meeting", "A chapter's logo, board and own slides, with everyone joining on their phones."],
  ] },
] as const;

export default function Workshops() {
  return (
    <main className="sc rh wk">
      <SiteTop on="/workshops" />
      <header className="wk-hero">
        <div className="wk-stage" aria-hidden>
          {["R", "E", "A", "C", "H"].map((l, i) => <span key={l} style={{ ["--i" as string]: i }}>{l}</span>)}
        </div>
        <div className="sc-wrap wk-hero-in">
          <p className="rh-kick">REACH Workshops</p>
          <h1>Get out of your seat.</h1>
          <p className="rh-lede">Live workshops on the big screen, with every student playing along on their phone: stand-ups, four corners, timed questions, text-message scenarios, and every resource saved before they leave.</p>
          <JoinCode base={`${MYEFF}/w`} />
        </div>
      </header>

      <section className="wk-how">
        <div className="sc-wrap">
          <ol className="rh-steps wk-steps">
            <li><b>1</b><span>A host puts the workshop on a projector. A code and QR appear.</span></li>
            <li><b>2</b><span>Students scan or type the code. First name only, no account.</span></li>
            <li><b>3</b><span>Everyone plays along, moves, answers, and leaves with the kit.</span></li>
          </ol>
        </div>
      </section>

      {SHELVES.map((sh, k) => (
        <section key={sh.title} className="wk-shelf">
          <div className="sc-wrap">
            <p className="rh-kick">{sh.title}</p>
            <h2>{sh.line}</h2>
            <div className="wk-grid">
              {sh.items.map(([name, line], i) => (
                <article key={name} className="wk-card" style={{ ["--d" as string]: `${i * 0.07}s`, ["--hue" as string]: ["#ffd35a", "#c9a0ff", "#ff8f7f"][k] }}>
                  <h3>{name}</h3>
                  <p>{line}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="rh-me wk-host">
        <div className="sc-wrap rh-me-in">
          <div>
            <p className="rh-kick">Host one</p>
            <h2>Bring it to your campus.</h2>
            <p>Chapter officers, Campus Ambassadors and National host from MyEFF: pick a workshop, add your facilitators, your logo and a partner, and your flyers and caption are made for you.</p>
            <div className="sc-acts">
              <a className="sc-btn coral" href={`${MYEFF}/workshop`}>Host in MyEFF</a>
              <Link className="sc-btn ghost" href="/workshop-request">Ask EFF to bring one</Link>
            </div>
          </div>
          <ol className="rh-steps" aria-label="Who can host">
            <li><b>✦</b><span>Chapter officers: sign in to MyEFF and open Workshops &amp; meetings.</span></li>
            <li><b>✦</b><span>Campus Ambassadors: sign in with the email you applied with.</span></li>
            <li><b>✦</b><span>No chapter yet? Ask EFF, or apply to become an ambassador.</span></li>
          </ol>
        </div>
      </section>
      <SiteFoot />
    </main>
  );
}
