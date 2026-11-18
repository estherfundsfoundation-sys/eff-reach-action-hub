import Link from "next/link";
import { SiteTop, SiteFoot } from "./myreach/ui";
import { HomeSearch } from "./Front";
import { RealReachHome } from "./RealReach";
import "./scholarships/scholarships.css";
import "./reach-home.css";
import "./reach-face.css";

/* REACH home, rebuilt as the face of the whole program (18 Nov 2026, Shayna: "IT IS CONFUSING ... our reach website
   is the face of reach ... reach is more than just help we offer workshops all kinds of things"). One page, in order:
   what REACH is, help for students, EFF's own financial assistance, REACH Workshops and REACH on Tour, schools and
   partners, leading with REACH, REACH in real life. The menu is the first thing on the page. Every tool and page that
   existed before is still reachable from here or the menu. The old home (scroll film, walkers, REACH Box, extra door
   sections) is in git history before this commit. */

const MYEFF = "https://my.estherfundsfoundation.org";
/* Shayna's REACH photos in the media library (same files as PHOTOS in RealReach.tsx, which is a client module). */
const MEDIA = "https://voljlrqyruluuqrfqwww.supabase.co/storage/v1/object/public/eff-media/2026/";
const HERO = MEDIA + "d6373041-d376-46bc-9701-6a986c796dc8.jpg";
const WS_PHOTO = MEDIA + "eb625356-5cf6-443d-ab38-2d4cc9a1e47e.jpg";

const LETTERS = [
  { l: "R", t: "Reach out", x: "Ask early. Help exists, and it's okay to reach for it before a hard week becomes a crisis." },
  { l: "E", t: "Engage your community", x: "College is people too: classmates, campus offices, ambassadors, your church." },
  { l: "A", t: "Access resources", x: "Aid, food, housing, tutoring and emergency money are there to be used." },
  { l: "C", t: "Care for your mental health", x: "You deserve support before you hit your limit. In a crisis, call or text 988." },
  { l: "H", t: "Hold on", x: "Every finished semester is a win. You're not behind. You're building." },
];

const NEEDS = [
  { href: "/emergency", t: "I have an emergency", s: "Rent, a bill, a car, a hold. A step-by-step plan in 2 minutes." },
  { href: "/screening", t: "I owe my school", s: "Free Balance Screening. EFF reads your case and sends you a plan." },
  { href: "/holdup", t: "A hold is blocking my classes", s: "See what you really owe and how to get the hold lifted." },
  { href: "/get-help", t: "I need food or a place to stay", s: "Help near your campus and near you." },
  { href: "/scholarships", t: "I need money for school", s: "Scholarships checked by EFF, matched to you." },
  { href: `${MYEFF}/lighthouse`, t: "I need someone to talk to", s: "Ask EFF privately. A real person answers." },
];

const EFF_HELP = [
  { href: "/apply/emergency-grant", k: "Financial assistance", t: "EFF Emergency Grant", s: "Up to $250 for an emergency that could push you out of school, paid to the bill." },
  { href: "/apply/transfer-fee", k: "Financial assistance · 2027", t: "EFF Transfer Fee Assistance", s: "Left with a balance? Don't drop out completely. Transfer somewhere affordable, and EFF covers up to $100 of the application fee." },
  { href: "/screening", k: "Free", t: "Balance Screening", s: "Send us your balance. EFF reviews it like an aid advisor and tells you exactly what to ask your school." },
];

const WORKSHOPS = [
  { href: "/workshop-request", t: "Book REACH on Tour", s: "EFF brings a live, interactive REACH workshop to your school, campus or church." },
  { href: `${MYEFF}/workshop`, t: "Host a REACH workshop", s: "Ambassadors and chapter leaders run a ready-made workshop with phones, games and a big screen." },
  { href: "/workshops", t: "Join a workshop", s: "In the room? Type the code on the screen and play along on your phone." },
];

const PARTNERS = [
  { href: "/campus", t: "REACH for Campuses", s: "Colleges, departments and professors partner with REACH for free." },
  { href: "/for/schools", t: "High schools", s: "Get seniors ready for college, money and the first semester." },
  { href: "/for/colleges", t: "Colleges", s: "Keep students enrolled with REACH tools and workshops." },
  { href: "/for/families", t: "Families", s: "Help your student pay for school and stay in it." },
  { href: "/for/community", t: "Churches & nonprofits", s: "Bring REACH to the students you already serve." },
  { href: "/sponsor", t: "Sponsor REACH", s: "Put your name behind students staying in school." },
];

const LEAD = [
  { href: "https://represent.estherfundsfoundation.org", t: "Become a Campus Ambassador", s: "Bring REACH to your campus: drives, workshops and care." },
  { href: `${MYEFF}/tiktok`, t: "Join the TikTok team", s: "Make videos that tell students help is out there." },
  { href: "/apply", t: "Apply to EFF", s: "Everything EFF has open right now, in one place." },
];

const ext = (h: string) => /^https?:/.test(h);
function Card({ href, t, s, k }: { href: string; t: string; s: string; k?: string }) {
  const body = <>{k ? <em>{k}</em> : null}<b>{t}</b><span>{s}</span><i aria-hidden="true">→</i></>;
  return ext(href) ? <a className="rx-card" href={href}>{body}</a> : <Link className="rx-card" href={href}>{body}</Link>;
}

export default function Home() {
  return (
    <main className="sc rh rx">
      <SiteTop />

      <section className="rx-hero">
        <div className="rx-hero-bg" style={{ backgroundImage: `url(${HERO})` }} aria-hidden="true" />
        <div className="sc-wrap rx-hero-in">
          <p className="rx-kick">REACH · by Esther Funds Foundation</p>
          <h1>Before you drop out, <span>REACH.</span></h1>
          <p className="rx-lede">REACH is Esther Funds Foundation&rsquo;s answer to college dropout: help when school gets hard, money for emergencies, workshops on campus, and people who show up.</p>
          <div className="rx-paths">
            <a href="#help" className="rx-path"><small>I&rsquo;m a student</small><b>I need help staying in school</b><i aria-hidden="true">→</i></a>
            <a href="#workshops" className="rx-path alt"><small>Schools, churches &amp; partners</small><b>Bring REACH to my students</b><i aria-hidden="true">→</i></a>
          </div>
          <p className="rx-crisis">In crisis? Call or text <a href="tel:988">988</a>, any time. In danger, call <a href="tel:911">911</a>.</p>
        </div>
      </section>

      <section id="about" className="rx-sec rx-letters">
        <div className="sc-wrap">
          <p className="rh-kick">What REACH means</p>
          <h2>Five letters for the moment you want to quit.</h2>
          <ol>{LETTERS.map((x) => <li key={x.l}><span aria-hidden="true">{x.l}</span><b>{x.t}</b><p>{x.x}</p></li>)}</ol>
        </div>
      </section>

      <section id="help" className="rx-sec">
        <div className="sc-wrap">
          <p className="rh-kick">For students</p>
          <h2>What do you need right now?</h2>
          <p className="rx-sub">Free, and you don&rsquo;t need an account. Tap the one that sounds like you.</p>
          <div className="rx-grid">{NEEDS.map((n) => <Card key={n.href} {...n} />)}</div>
          <HomeSearch />
          <p className="rx-more">Not sure where to start? <Link href="/start">Answer 3 questions</Link> · <Link href="/resources">See every resource</Link> · <a href={`${MYEFF}/kit`}>The Survival Kit</a></p>
        </div>
      </section>

      <section className="rx-sec rx-eff">
        <div className="sc-wrap">
          <p className="rh-kick">From Esther Funds Foundation</p>
          <h2>EFF&rsquo;s own help.</h2>
          <p className="rx-sub">One free My REACH account for all of it. EFF pays the bill or the school directly.</p>
          <div className="rx-grid three">{EFF_HELP.map((n) => <Card key={n.href} {...n} />)}</div>
        </div>
      </section>

      <section id="workshops" className="rx-sec rx-ws">
        <div className="sc-wrap rx-split">
          <div>
            <p className="rh-kick">REACH Workshops</p>
            <h2>Students out of their seats.</h2>
            <p className="rx-sub">REACH Workshops are live, game-show style sessions on money, mental health, staying enrolled and what comes next. Everyone plays on their phone, and every student leaves with a kit of real resources.</p>
            <div className="rx-list">{WORKSHOPS.map((n) => <Card key={n.href} {...n} />)}</div>
          </div>
          <div className="rx-ws-photo" style={{ backgroundImage: `url(${WS_PHOTO})` }} role="img" aria-label="A REACH workshop on campus" />
        </div>
      </section>

      <section id="schools" className="rx-sec">
        <div className="sc-wrap">
          <p className="rh-kick">For schools, families &amp; partners</p>
          <h2>Bring REACH to your students.</h2>
          <div className="rx-grid three">{PARTNERS.map((n) => <Card key={n.href} {...n} />)}</div>
        </div>
      </section>

      <section className="rx-sec rx-lead">
        <div className="sc-wrap">
          <p className="rh-kick">Lead with REACH</p>
          <h2>Be the reason someone stays.</h2>
          <div className="rx-grid three">{LEAD.map((n) => <Card key={n.href} {...n} />)}</div>
        </div>
      </section>

      <RealReachHome />
      <SiteFoot />
    </main>
  );
}
