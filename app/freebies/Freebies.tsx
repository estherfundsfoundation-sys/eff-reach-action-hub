"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteFoot, SiteTop } from "../myreach/ui";
import { KEY, SUPABASE } from "../scholarships/lib";

export type Deal = {
  slug: string; brand: string; title: string; what: string; how: string | null; needs: string | null;
  category: string; kind: string; url: string; ends_on: string | null; closing_soon: boolean;
};
export type Data = { week: string; free_friday: Deal | null; deals: Deal[] };

const CATS: Array<[string, string, string]> = [
  ["all", "Everything", "✨"], ["money", "Money you're owed", "💸"], ["food", "Food", "🍔"], ["subscriptions", "Subscriptions", "🎧"],
  ["tech", "Tech & software", "💻"], ["clothes", "Clothes & shopping", "👟"], ["health", "Health", "🧘🏽"], ["learning", "Learning", "📚"],
];
const KIND: Record<string, string> = { free: "FREE", trial: "FREE TRIAL", half: "HALF PRICE", student_price: "STUDENT PRICE", money: "MONEY BACK" };

/* "What am I missing?": four private questions, answered on this phone only. */
const CHECKS: Array<{ id: string; q: string; slugs: string[]; when: boolean }> = [
  { id: "paid", q: "Did you (or a parent) pay tuition, fees or books this year?", slugs: ["irs-aotc", "irs-free-file"], when: true },
  { id: "work", q: "Do you work 20+ hours a week, have work-study, or care for a child?", slugs: ["usda-snap-students"], when: true },
  { id: "edu", q: "Do you have a school email address?", slugs: ["microsoft-365-education", "github-student-pack", "notion-education", "figma-education"], when: true },
  { id: "fafsa", q: "Have you filed the FAFSA for this school year?", slugs: ["studentaid-fafsa"], when: false },
];

const GOT = "reach-freebies-got";
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(GOT) || "[]"); } catch { return []; } };

function tap(slug: string) {
  try {
    fetch(`${SUPABASE}/rest/v1/rpc/eff_deal_click`, {
      method: "POST", keepalive: true,
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_slug: slug }),
    }).catch(() => null);
  } catch { /* counting is optional */ }
}

function Card({ d, got, toggle, big }: { d: Deal; got: boolean; toggle: () => void; big?: boolean }) {
  return (
    <article className={`fb-card${big ? " big" : ""}${got ? " got" : ""}`}>
      <div className="fb-tags">
        <span className={`fb-kind k-${d.kind}`}>{KIND[d.kind] || d.kind}</span>
        {d.closing_soon && d.ends_on ? <span className="fb-soon">Ends {new Date(`${d.ends_on}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span> : null}
      </div>
      <p className="fb-brand">{d.brand}</p>
      <h3>{d.title}</h3>
      <p className="fb-what">{d.what}</p>
      {d.how ? <p className="fb-how"><b>How:</b> {d.how}</p> : null}
      {d.needs ? <p className="fb-needs">✔ {d.needs}</p> : null}
      <div className="fb-acts">
        <a className="sc-btn sm" href={d.url} target="_blank" rel="noopener noreferrer" onClick={() => tap(d.slug)}>Get it ↗</a>
        <button type="button" className={`sc-btn sm ghost${got ? " on" : ""}`} aria-pressed={got} onClick={toggle}>{got ? "✓ Got it" : "I got it"}</button>
      </div>
    </article>
  );
}

export default function Freebies({ data }: { data: Data | null }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [got, setGot] = useState<string[]>([]);
  const [ans, setAns] = useState<Record<string, boolean | undefined>>({});
  const [copied, setCopied] = useState(false);
  useEffect(() => setGot(read()), []);

  const deals = useMemo(() => data?.deals ?? [], [data]);
  const toggle = (slug: string) => setGot((g) => {
    const next = g.includes(slug) ? g.filter((s) => s !== slug) : [...g, slug];
    try { localStorage.setItem(GOT, JSON.stringify(next)); } catch { /* fine */ }
    return next;
  });
  const shown = deals.filter((d) => (cat === "all" || d.category === cat)
    && (!q.trim() || `${d.brand} ${d.title} ${d.what}`.toLowerCase().includes(q.trim().toLowerCase())));
  const answered = CHECKS.filter((c) => ans[c.id] !== undefined).length;
  const missing = CHECKS.filter((c) => ans[c.id] === c.when).flatMap((c) => c.slugs)
    .map((s) => deals.find((d) => d.slug === s)).filter((d): d is Deal => Boolean(d));
  const ff = data?.free_friday;

  async function share() {
    const url = "https://reach.estherfundsfoundation.org/freebies";
    const text = "Free stuff students are owed, checked by EFF 💜";
    try { if (navigator.share) { await navigator.share({ title: "REACH Freebies", text, url }); return; } } catch { return; }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* fine */ }
  }

  return (
    <div className="sc fb">
      <SiteTop on="/freebies" />
      <main>
        <section className="sc-hero"><div className="sc-wrap">
          <span className="sc-kick"><span className="dot" />Free stuff · checked by EFF</span>
          <h1>Free <em>stuff</em> you&rsquo;re owed.</h1>
          <p>Money back for college, free software, free trials and student prices. Every link goes straight to the brand&rsquo;s own page, and EFF checks them every morning.</p>
          <div className="sc-acts">
            <a className="sc-btn coral" href="#missing">What am I missing?</a>{" "}
            <button type="button" className="sc-btn ghost" onClick={share}>{copied ? "Link copied ✓" : "Send to a friend"}</button>
          </div>
          {got.length ? <p className="fb-tally">🎉 You&rsquo;ve claimed <b>{got.length}</b> freebie{got.length === 1 ? "" : "s"}. Keep going.</p> : null}
        </div></section>

        {ff ? (
          <section className="sc-wrap fb-ff" aria-label="Free Friday">
            <div className="fb-ff-label"><span>⭐ Free Friday</span><small>This week&rsquo;s pick. A new one every week.</small></div>
            <Card d={ff} big got={got.includes(ff.slug)} toggle={() => toggle(ff.slug)} />
          </section>
        ) : null}

        <section className="sc-wrap fb-missing" id="missing">
          <h2>What am I missing?</h2>
          <p className="fb-sub">Four quick questions. Your answers stay on this phone.</p>
          <div className="fb-qs">
            {CHECKS.map((c) => (
              <div key={c.id} className="fb-q">
                <span>{c.q}</span>
                <div>
                  <button type="button" className={ans[c.id] === true ? "on" : ""} onClick={() => setAns({ ...ans, [c.id]: true })}>Yes</button>
                  <button type="button" className={ans[c.id] === false ? "on" : ""} onClick={() => setAns({ ...ans, [c.id]: false })}>No</button>
                </div>
              </div>
            ))}
          </div>
          {answered ? (
            missing.length ? (
              <div className="fb-found">
                <p><b>You may be missing {missing.length} thing{missing.length === 1 ? "" : "s"}:</b></p>
                <div className="fb-grid">{missing.map((d) => <Card key={d.slug} d={d} got={got.includes(d.slug)} toggle={() => toggle(d.slug)} />)}</div>
              </div>
            ) : <p className="fb-sub">Nothing flagged from those answers. Scroll down: there&rsquo;s still free stuff for everyone.</p>
          ) : null}
        </section>

        <section className="sc-wrap fb-all">
          <h2>All freebies</h2>
          <div className="fb-chips" role="tablist" aria-label="Categories">
            {CATS.map(([k, label, icon]) => (
              <button key={k} type="button" role="tab" aria-selected={cat === k} className={cat === k ? "on" : ""} onClick={() => setCat(k)}>{icon} {label}</button>
            ))}
          </div>
          <label className="sc-field fb-search">Search
            <input type="search" placeholder="Spotify, textbooks, taxes…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {!data ? <p className="fb-sub">The freebies didn&rsquo;t load. Refresh in a moment.</p>
            : shown.length ? <div className="fb-grid">{shown.map((d) => <Card key={d.slug} d={d} got={got.includes(d.slug)} toggle={() => toggle(d.slug)} />)}</div>
              : <p className="fb-sub">Nothing matches that yet.</p>}
        </section>

        <section className="sc-wrap fb-more">
          <div className="fb-door"><b>Need money for school?</b><span>Scholarships, checked and sorted by deadline.</span><Link className="sc-btn sm" href="/scholarships">Find scholarships</Link></div>
          <div className="fb-door"><b>Be first to know</b><span>One email when the EFF Emergency Grant opens.</span><Link className="sc-btn sm" href="/notify">Get alerts</Link></div>
          <div className="fb-door"><b>In a tough spot?</b><span>Food, rent, a bill, a hold on your account.</span><Link className="sc-btn sm" href="/get-help">Get help</Link></div>
        </section>

        <p className="sc-wrap fb-note">EFF earns nothing from these links. Each offer is the brand&rsquo;s or agency&rsquo;s own, and they set the rules and prices, so read their page before you sign up. Set a reminder before any free trial ends. Never pay anyone to get a free government benefit or the FAFSA.</p>
      </main>
      <SiteFoot />
    </div>
  );
}
