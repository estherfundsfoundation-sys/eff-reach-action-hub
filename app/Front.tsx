"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLibrary } from "./content/useLibrary";

/* Two additions to the REACH home page (13 Nov 2026), in the look REACH already has (Shayna chose to keep it):
   HomeSearch, one search box over every resource in the library, and Best, the tools students use most. */
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

export function HomeSearch() {
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
    <div className="hs">
      <form className="hs-box" role="search" action="/resources" onSubmit={(e) => { if (!q.trim()) e.preventDefault(); }}>
        <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Or search everything: a hold, FAFSA, food, an interview…" aria-label={`Search all ${items.length} REACH resources`} autoComplete="off" />
        <button type="submit">Search</button>
      </form>
      {q.trim().length > 1 ? (
        <div className="hs-hits" aria-live="polite">
          {hits.length ? hits.map((it) => (
            <a key={it.key} href={it.href} {...(ext(it.href) ? { target: "_blank", rel: "noopener" } : {})}><b>{it.title}</b><span>{it.text}</span></a>
          )) : <p>Nothing by that name yet. Try one word, like &ldquo;rent&rdquo; or &ldquo;appeal&rdquo;, or <Link href="/get-help">ask a person</Link>.</p>}
          {hits.length ? <Link className="hs-all" href={`/resources?q=${encodeURIComponent(q.trim())}`}>See every match →</Link> : null}
        </div>
      ) : (
        <p className="hs-try">Try{" "}{TRY.map((w) => <button key={w} type="button" onClick={() => setQ(w)}>{w}</button>)}</p>
      )}
    </div>
  );
}

export function Best() {
  const ext = (h: string) => /^https?:/.test(h);
  return (
    <section className="rh-best" aria-labelledby="best-h">
      <div className="sc-wrap">
        <p className="rh-kick">The best of REACH</p>
        <h2 id="best-h">What students use most.</h2>
        <div className="sc-doors">
          {BEST.map((b) => ext(b.href)
            ? <a key={b.href} href={b.href} className="sc-door"><b>{b.t}</b><span>{b.s}</span></a>
            : <Link key={b.href} href={b.href} className="sc-door"><b>{b.t}</b><span>{b.s}</span></Link>)}
        </div>
      </div>
    </section>
  );
}
