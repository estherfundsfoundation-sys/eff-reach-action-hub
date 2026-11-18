import type { Metadata } from "next";
import Link from "next/link";
import { SiteFoot, SiteTop } from "../myreach/ui";
import JoinCode from "./JoinCode";
import Catalog from "./Catalog";
import { SHELVES } from "./shelves";
import "../scholarships/scholarships.css";
import "../reach-home.css";
import "../reach-face.css";
import "./workshops.css";

export const metadata: Metadata = {
  title: "REACH Workshops · Esther Funds Foundation",
  description: "Live, interactive workshops that keep students in college. Book REACH on Tour for your school or church, host one in MyEFF, or join with a code.",
};

/* REACH Workshops, rebuilt with the new REACH home (18 Nov 2026, Shayna: "now revamp the workshop pages too").
   The workshops themselves run in MyEFF (/workshop to host, /w to join); this page explains them and opens the
   three doors: book REACH on Tour, host one, join with a code. The catalog is shelves.ts. */
const MYEFF = "https://my.estherfundsfoundation.org";
const MEDIA = "https://voljlrqyruluuqrfqwww.supabase.co/storage/v1/object/public/eff-media/2026/";
const PHOTO = MEDIA + "d3c2fde7-f7e5-4704-b735-94505eeec9d4.jpg";
const total = SHELVES.reduce((n, s) => n + s.items.length, 0);

const FOR = [
  { t: "High schools", s: "Juniors and seniors get ready for college money, applying and the first semester." },
  { t: "Colleges", s: "Students learn where the help is before a hard week becomes a dropped semester." },
  { t: "Churches & community", s: "Youth groups and families learn the road to college, and how to stay on it." },
  { t: "EFF chapters", s: "Chapters host Signature Workshops and meetings with their own logo and partners." },
];

const FAQ = [
  { q: "How long is a workshop?", a: "Most run about an hour. EFF can shape a REACH on Tour stop around your schedule." },
  { q: "What do students need?", a: "A phone. They scan the code, type a first name, and play. No app, no account." },
  { q: "Is there a cost?", a: "Chapters and Campus Ambassadors host for free from MyEFF. For a REACH on Tour visit to your school or college, EFF sends a quote after a short call." },
  { q: "Do you come in person?", a: "Yes. REACH on Tour is EFF in the room. You can also host one yourself on any projector or shared screen." },
];

export default function Workshops() {
  return (
    <main className="sc rh rx wk2">
      <SiteTop on="/workshops" />

      <section className="rx-hero">
        <div className="rx-hero-bg" style={{ backgroundImage: `url(${PHOTO})` }} aria-hidden="true" />
        <div className="sc-wrap rx-hero-in">
          <p className="rx-kick">REACH Workshops</p>
          <h1>Get students out of their <span>seats.</span></h1>
          <p className="rx-lede">Live, game-show style workshops on money, mental health, staying enrolled and what comes next. The whole room plays on their phones, and every student leaves with real resources in their pocket.</p>
          <div className="rx-paths">
            <Link href="/workshop-request" className="rx-path alt"><small>Schools, colleges &amp; churches</small><b>Book REACH on Tour</b><i aria-hidden="true">→</i></Link>
            <a href={`${MYEFF}/workshop`} className="rx-path"><small>Chapters &amp; ambassadors</small><b>Host a workshop</b><i aria-hidden="true">→</i></a>
          </div>
          <div className="wk2-join"><JoinCode base={`${MYEFF}/w`} /></div>
        </div>
      </section>

      <section className="rx-sec">
        <div className="sc-wrap">
          <p className="rh-kick">How it works</p>
          <h2>A projector, a room, and their phones.</h2>
          <ol className="wk2-steps">
            <li><b>1</b><h3>Put it on the big screen</h3><p>The host opens the workshop. A code and QR code appear.</p></li>
            <li><b>2</b><h3>Students join</h3><p>They scan or type the code on their phones. First name only, no account.</p></li>
            <li><b>3</b><h3>Everyone plays</h3><p>Stand-ups, four corners, timed questions, real-life text scenarios and a leaderboard.</p></li>
            <li><b>4</b><h3>They leave with the kit</h3><p>Every resource shown is saved on their phone before they walk out.</p></li>
          </ol>
        </div>
      </section>

      <section className="rx-sec rx-eff">
        <div className="sc-wrap">
          <p className="rh-kick">The catalog</p>
          <h2>{total} workshops, ready to run.</h2>
          <Catalog />
        </div>
      </section>

      <section className="rx-sec">
        <div className="sc-wrap">
          <p className="rh-kick">Who it&rsquo;s for</p>
          <h2>Anywhere students are.</h2>
          <div className="rx-grid">{FOR.map((f) => <article key={f.t} className="rx-card wk2-card"><b>{f.t}</b><span>{f.s}</span></article>)}</div>
        </div>
      </section>

      <section className="rx-sec rx-ws">
        <div className="sc-wrap">
          <p className="rh-kick">Bring REACH to your students</p>
          <h2>Two ways to do it.</h2>
          <div className="wk2-two">
            <div className="wk2-way">
              <em>EFF comes to you</em>
              <h3>REACH on Tour</h3>
              <p>EFF brings a live REACH workshop to your high school, college, church or community. Tell us about your students, we set up a call, and you get a quote and a date.</p>
              <Link className="sc-btn coral" href="/workshop-request">Request a REACH on Tour stop</Link>
            </div>
            <div className="wk2-way">
              <em>You run it</em>
              <h3>Host a workshop</h3>
              <p>EFF chapter officers and Campus Ambassadors host for free in MyEFF: pick a workshop, add your facilitators, your logo and a partner, and your flyers and caption are made for you.</p>
              <a className="sc-btn" href={`${MYEFF}/workshop`}>Host in MyEFF</a>
              <p className="wk2-small">Not an officer or ambassador yet? <a href="https://represent.estherfundsfoundation.org">Become a Campus Ambassador</a>.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rx-sec">
        <div className="sc-wrap">
          <p className="rh-kick">Questions</p>
          <h2>Good to know.</h2>
          <div className="wk2-faq">{FAQ.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
        </div>
      </section>

      <SiteFoot />
    </main>
  );
}
