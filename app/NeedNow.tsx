import Link from "next/link";

/* REACH home, the very first thing on the page (10 Nov 2026, Shayna: a student told her finding REACH's
   help was difficult and she was lost). Before the film, before anything: "What do you need right now?"
   Six plain doors to the right tool, 988 always, and the film below for anyone who wants it. */
const NEEDS = [
  { href: "/emergency", glyph: "🚨", t: "I have an emergency", s: "Rent, a bill, a hold, a car. Get a step-by-step plan in 2 minutes." },
  { href: "/screening", glyph: "📋", t: "I owe my school and need help clearing it", s: "Free balance screening. EFF reviews your case and sends you a plan." },
  { href: "/holdup", glyph: "🔓", t: "A hold is blocking my classes", s: "Find what you really owe and how to get it lifted." },
  { href: "/get-help", glyph: "🍎", t: "I need food or a place to stay", s: "Help near your campus and near you." },
  { href: "/emergency-aid", glyph: "🏫", t: "Does my college have emergency money?", s: "Find your college's emergency fund and the words to ask." },
  { href: "/scholarships", glyph: "🎓", t: "I need money for school", s: "Scholarships EFF checked. Match me in a minute." },
  { href: "https://my.estherfundsfoundation.org/lighthouse", glyph: "💬", t: "I need someone to talk to", s: "Ask EFF privately. A real person answers." },
];

export default function NeedNow() {
  return (
    <section className="rh-need" aria-labelledby="need-h">
      <div className="sc-wrap">
        <p className="rh-need-brand">REACH <span>by Esther Funds Foundation</span></p>
        <h1 id="need-h">What do you need right now?</h1>
        <p className="rh-need-lede">Tap the one that sounds like you. It&rsquo;s free, and you don&rsquo;t need an account.</p>
        <div className="rh-need-grid">
          {NEEDS.map((n) => (
            <Link key={n.href} href={n.href} className="rh-need-card">
              <span aria-hidden="true">{n.glyph}</span>
              <b>{n.t}</b>
              <small>{n.s}</small>
            </Link>
          ))}
        </div>
        <p className="rh-need-more">
          Not sure? <Link href="/start">Answer 3 questions and we&rsquo;ll show you what fits</Link> · <Link href="/resources">See everything</Link>
        </p>
        <p className="rh-need-crisis">In crisis? Call or text <a href="tel:988">988</a>, any time. In danger, call <a href="tel:911">911</a>.</p>
        <a className="rh-need-film" href="#reach-film">Or watch what REACH is ↓</a>
      </div>
    </section>
  );
}
