"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLibrary } from "./content/useLibrary";

/* REACH's front door (13 Nov 2026, Shayna: "a more luxury look to reach but still the same branding ... a professional
   look easy to navigate but dont remove the resources ... BEST stuff to the front"). One calm screen: what REACH is,
   one search box over every resource in the library, the seven things students come for, then the tools students
   use most. The film moved to /story; nothing was removed. */
const NEEDS = [
  { href: "/emergency", t: "I have an emergency", s: "Rent, a bill, a hold, a car. A step-by-step plan in two minutes.", hot: true },
  { href: "/screening", t: "I owe my school", s: "Free balance screening. A person at EFF reviews your case and writes you a plan." },
  { href: "/holdup", t: "A hold is blocking my classes", s: "See what you really owe and how to get the hold lifted." },
  { href: "/get-help", t: "I need food or a place to stay", s: "Help near your campus and near you, tonight." },
  { href: "/emergency-aid", t: "Does my college have emergency money?", s: "Your college's own fund, and the words to ask for it." },
  { href: "/scholarships", t: "I need money for school", s: "Scholarships EFF checked. Matched to you in a minute." },
  { href: "https://my.estherfundsfoundation.org/lighthouse", t: "I need someone to talk to", s: "Ask EFF privately. A real person answers." },
];
const BEST = [
  { href: "/screening", k: "New", t: "Balance Screening", s: "Your balance, read like an aid advisor would." },
  { href: "/eff-interview-coach", k: "Career", t: "Mock Interview Coach", s: "56 professions. Practice out loud, get scored, try again." },
  { href: "/scholarships/match", k: "Money", t: "Scholarship Match", s: "Only what you qualify for, with the reason why." },
  { href: "/apply-with-me", k: "Money", t: "Apply With Me", s: "We build the application with you. You press submit." },
  { href: "/practice", k: "Skills", t: "Practice the Conversation", s: "Rehearse the talk with financial aid, a professor or a boss." },
  { href: "/my-college", k: "Campus", t: "My College", s: "What your own campus offers, read for you." },
  { href: "/resume", k: "Career", t: "Résumé Builder", s: "Tap through your experience. Leave with one clean page." },
  { href: "/freebies", k: "Save", t: "Freebies", s: "Free software, student prices and money you're owed." },
  { href: "https://my.estherfundsfoundation.org/kit", k: "Everything", t: "The Survival Kit", s: "Sixty tools for registering, paying, staying and finishing." },
];
const TRY = ["hold", "FAFSA", "food", "interview", "rent", "appeal", "laptop", "first-gen"];

export default function Front() {
  const { items } = useLibrary();
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    if (!words.length) return [];
    return items
      .map((it) => {
        const t = it.title.toLowerCase(); const all = `${t} ${it.text.toLowerCase()} ${it.tag.toLowerCase()}`;
        if (!words.every((w) => all.includes(w))) return null;
        return { it, score: words.reduce((n, w) => n + (t.includes(w) ? 3 : 1), 0) + (it.featured ? 1 : 0) };
      })
      .filter(Boolean).sort((a, b) => b!.score - a!.score).slice(0, 7).map((x) => x!.it);
  }, [q, items]);
  const ext = (h: string) => /^https?:/.test(h);

  return (
    <>
      <section className="lx-hero" aria-labelledby="lx-h">
        <div className="sc-wrap">
          <p className="lx-eyebrow">Esther Funds Foundation · student support</p>
          <h1 id="lx-h">Before you drop out, <em>REACH.</em></h1>
          <p className="lx-lede">Money, food, a hold, a hard semester. Whatever is standing between you and your degree, the help is here, it&rsquo;s free, and you don&rsquo;t need an account.</p>
          <form className="lx-search" role="search" action="/resources" onSubmit={(e) => { if (!q.trim()) e.preventDefault(); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search everything: a hold, FAFSA, food, an interview…" aria-label={`Search all ${items.length} REACH resources`} autoComplete="off" />
            <button type="submit">Search</button>
          </form>
          {q.trim().length > 1 ? (
            <div className="lx-hits" aria-live="polite">
              {hits.length ? hits.map((it) => (
                <a key={it.key} href={it.href} {...(ext(it.href) ? { target: "_blank", rel: "noopener" } : {})}>
                  <b>{it.title}</b><span>{it.text}</span>
                </a>
              )) : <p>Nothing by that name yet. Try one word, like &ldquo;rent&rdquo; or &ldquo;appeal&rdquo;, or <Link href="/get-help">ask a person</Link>.</p>}
              {hits.length ? <Link className="lx-all" href={`/resources?q=${encodeURIComponent(q.trim())}`}>See every match →</Link> : null}
            </div>
          ) : (
            <p className="lx-try">Try{" "}{TRY.map((w) => <button key={w} type="button" onClick={() => setQ(w)}>{w}</button>)}</p>
          )}
          <p className="lx-crisis">In crisis? Call or text <a href="tel:988">988</a>, any time. In danger, call <a href="tel:911">911</a>.</p>
        </div>
      </section>

      <section className="lx-need" aria-labelledby="lx-need-h">
        <div className="sc-wrap">
          <p className="lx-eyebrow">Start with what&rsquo;s happening</p>
          <h2 id="lx-need-h">What do you need right now?</h2>
          <div className="lx-rows">
            {NEEDS.map((n, i) => {
              const inner = (<><i aria-hidden="true">{String(i + 1).padStart(2, "0")}</i><span><b>{n.t}</b><small>{n.s}</small></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>);
              return ext(n.href) ? <a key={n.href} href={n.href} className="lx-row">{inner}</a> : <Link key={n.href} href={n.href} className={`lx-row${n.hot ? " hot" : ""}`}>{inner}</Link>;
            })}
          </div>
          <p className="lx-more">Not sure where you fit? <Link href="/start">Answer three questions</Link> and REACH shows you what&rsquo;s made for you.</p>
        </div>
      </section>

      <section className="lx-best" aria-labelledby="lx-best-h">
        <div className="sc-wrap">
          <p className="lx-eyebrow">The best of REACH</p>
          <h2 id="lx-best-h">What students use most.</h2>
          <div className="lx-grid">
            {BEST.map((b) => {
              const inner = (<><small>{b.k}</small><b>{b.t}</b><span>{b.s}</span><em>Open →</em></>);
              return ext(b.href) ? <a key={b.href} href={b.href} className="lx-card">{inner}</a> : <Link key={b.href} href={b.href} className="lx-card">{inner}</Link>;
            })}
          </div>
          <div className="lx-story">
            <div><b>New to REACH?</b><span>Watch the two-minute story of why it exists.</span></div>
            <Link className="sc-btn ghost" href="/story">Watch the REACH story</Link>
          </div>
        </div>
      </section>
    </>
  );
}
