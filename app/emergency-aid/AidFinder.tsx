"use client";

/* REACH Emergency Aid Finder (10 Nov 2026, Shayna: "eff needs that emergency aid finder but eff style").
   Pick what happened, pick your college, and see the emergency help EFF confirmed there (eff_campus_public,
   filtered to emergency kinds and ordered by what you picked), with the exact words to ask for it. When EFF
   hasn't confirmed a fund yet, it says so and gives the moves that work anywhere. Nothing is saved. */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SiteFoot, SiteTop } from "../myreach/ui";
import { rpc } from "../scholarships/lib";
import { fmtDate, host, type College, type Hit, type Item } from "../my-college/data";
import { Path, type DItem, type DossierData } from "../my-college/[unitid]/Dossier";
import type { AidStats } from "./page";

type Need = { key: string; label: string; glyph: string; types: string[]; ask: string };
const NEEDS: Need[] = [
  { key: "bill", label: "A bill or rent", glyph: "🧾", types: ["emergency_grant", "benefits_help", "pj_appeals"], ask: "I have an unexpected bill I can't cover, and it could make me leave school" },
  { key: "hold", label: "A hold on my account", glyph: "🔓", types: ["payment_plans", "emergency_grant", "pj_appeals"], ask: "I have a balance and a hold on my account that is keeping me from registering" },
  { key: "food", label: "Food", glyph: "🍎", types: ["food_pantry", "basic_needs_center", "benefits_help", "emergency_grant"], ask: "I don't have enough food this week" },
  { key: "housing", label: "A place to stay", glyph: "🏠", types: ["emergency_housing", "basic_needs_center", "emergency_grant"], ask: "I am about to lose my housing, or I don't have a safe place to stay" },
  { key: "tech", label: "Laptop or books", glyph: "💻", types: ["laptop_lending", "textbook_lending", "emergency_grant"], ask: "my laptop broke and I can't afford a new one or my books for class" },
  { key: "ride", label: "Getting to class", glyph: "🚌", types: ["transportation", "emergency_grant"], ask: "I lost my way to get to campus" },
  { key: "kids", label: "Childcare", glyph: "🧸", types: ["childcare", "emergency_grant"], ask: "I lost my childcare and can't get to class" },
  { key: "money", label: "My money changed", glyph: "📉", types: ["pj_appeals", "emergency_grant"], ask: "my family's income changed and my aid no longer covers school" },
];
const ALL = ["emergency_grant", "pj_appeals", "payment_plans", "food_pantry", "basic_needs_center", "emergency_housing", "benefits_help", "laptop_lending", "textbook_lending", "clothing_closet", "transportation", "childcare"];

function email(c: College, it: Item | null, need: Need | null, name: string) {
  const office = it?.contact.office || "Financial Aid";
  const what = need?.ask || "I'm facing an emergency that could make me leave school";
  const ask = it ? `I'd like to apply for ${it.service.name}.` : "Does the college have an emergency grant, emergency loan or any other help for a student in my situation?";
  return `Hello ${office} team,

My name is ${name || "[your name]"}, and I'm a student at ${c.name} (student ID [your ID]). Right now ${what}.

${ask} What do I need to send, and how soon could I hear back?

Thank you for your help,
${name || "[your name]"}
[your phone]`;
}

export default function AidFinder({ stats }: { stats: AidStats | null }) {
  const [need, setNeed] = useState<Need | null>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [c, setC] = useState<College | null>(null);
  const [deep, setDeep] = useState<DossierData | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const out = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (c) return;
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) { setHits(null); return; }
    timer.current = setTimeout(async () => {
      try { setHits(await rpc<Hit[]>("eff_campus_search", { p_q: q.trim(), p_state: null })); } catch { setHits([]); }
    }, 250);
  }, [q, c]);

  async function pick(h: Hit) {
    setBusy(true); setHits(null); setQ(h.name);
    setDeep(null);
    try {
      const [col, dos] = await Promise.all([
        rpc<College | null>("eff_campus_public", { p_unitid: h.unitid }),
        rpc<DossierData | null>("eff_campus_dossier_public", { p_unitid: h.unitid }).catch(() => null),
      ]);
      setC(col); setDeep(dos);
    } catch { setC(null); }
    setBusy(false);
    setTimeout(() => out.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const items = useMemo(() => {
    if (!c) return [] as Array<{ type: string; label: string; it: Item }>;
    const order = need ? [...need.types, ...ALL.filter((t) => !need.types.includes(t))] : ALL;
    return c.groups.filter((g) => ALL.includes(g.type))
      .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
      .flatMap((g) => g.items.map((it) => ({ type: g.type, label: g.label, it })));
  }, [c, need]);
  const fund = items.find((x) => x.type === "emergency_grant") || null;
  /* EFF's own full guide (the dossier), where one exists: its emergency-money paths come first, with real steps. */
  const SEC: Record<string, string> = { hold: "holds_balances", food: "food", housing: "housing_emergencies" };
  const paths: DItem[] = useMemo(() => {
    if (!deep) return [];
    const get = (k: string) => deep.sections.find((x) => x.key === k)?.items || [];
    const extra = need && SEC[need.key] ? get(SEC[need.key]) : [];
    const seen = new Set<string>();
    return [...get("emergency_money"), ...extra].filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  }, [deep, need]);
  const found = Boolean(fund) || paths.length > 0;
  const site = c?.website_url ? host(c.website_url) : null;

  async function copy(text: string, key: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2000); } catch { /* the text stays on screen */ }
  }

  return (
    <div className="sc cr ea">
      <SiteTop />
      <main>
        <section className="sc-hero ea-hero"><div className="sc-wrap">
          <span className="sc-kick"><span className="dot" />EFF Emergency Campus Aid Lookup</span>
          <h1>Your college might have money for you <em>right now.</em></h1>
          <p>Most colleges keep emergency money, food and housing help for students in a crisis. Most students never hear about it. Find yours, and we&rsquo;ll give you the exact words to ask.</p>
          {stats ? <p className="ea-stat"><b>{stats.funds.toLocaleString()}</b> emergency funds and <b>{stats.listings.toLocaleString()}</b> kinds of emergency help confirmed at <b>{stats.colleges.toLocaleString()}</b> colleges, and growing every week.</p> : null}
        </div></section>

        <section className="sc-wrap">
          <h2 className="ea-h2"><span>1</span> What happened?</h2>
          <div className="ea-needs">
            {NEEDS.map((n) => (
              <button key={n.key} type="button" className={`ea-need ${need?.key === n.key ? "on" : ""}`} aria-pressed={need?.key === n.key} onClick={() => setNeed(need?.key === n.key ? null : n)}>
                <span aria-hidden="true">{n.glyph}</span>{n.label}
              </button>
            ))}
          </div>

          <h2 className="ea-h2"><span>2</span> Your college</h2>
          <label className="sc-field ea-search">
            <input value={q} onChange={(e) => { setQ(e.target.value); setC(null); }} placeholder="Type its name, like Southern University or FIU" autoComplete="off" aria-label="Your college" />
          </label>
          {hits && hits.length ? (
            <ul className="cr-hits">
              {hits.slice(0, 8).map((h) => (
                <li key={h.unitid}><button type="button" className="cr-hit ea-hit" onClick={() => pick(h)}>
                  <b>{h.name}</b><span>{[h.city, h.state].filter(Boolean).join(", ")}{h.hbcu ? " · HBCU" : ""}</span>
                </button></li>
              ))}
            </ul>
          ) : hits ? <p className="cr-note">No college by that name. Try fewer words.</p> : null}
          {busy ? <p className="cr-note">Looking at {q}…</p> : null}

          {c ? (
            <div ref={out} className="ea-out">
              <h2 className="ea-h2"><span>3</span> What {c.name} has for you</h2>
              {found ? (
                <p className="ea-yes">✅ EFF found emergency help at {c.name}. Start there.</p>
              ) : (
                <p className="ea-no">EFF hasn&rsquo;t confirmed an emergency fund at {c.name} yet. That doesn&rsquo;t mean there isn&rsquo;t one: most colleges have something. Ask financial aid with the words below.</p>
              )}

              {paths.length ? (
                <div className="dz ea-paths">
                  {paths.map((it, i) => <Path key={it.id} it={it} n={i + 1} />)}
                </div>
              ) : null}

              {items.map(({ type, label, it }) => (
                <article key={it.id} className={`cr-item ea-item ${type === "emergency_grant" ? "fund" : ""}`}>
                  <p className="ea-tag">{label}</p>
                  <h3>{it.service.name}</h3>
                  {it.service.description ? <p>{it.service.description}</p> : null}
                  {it.service.amount_max ? <p className="cr-amt">Up to ${Number(it.service.amount_max).toLocaleString()}, as the college states it.</p> : null}
                  {it.service.how_to_apply ? <p><b>How to ask:</b> {it.service.how_to_apply}</p> : null}
                  <p className="cr-next"><b>Your next step:</b> {it.next_step}</p>
                  <ul className="cr-contact">
                    {it.contact.office ? <li>{it.contact.office}</li> : null}
                    {it.contact.phone ? <li><a href={`tel:${it.contact.phone.replace(/[^0-9+]/g, "")}`}>{it.contact.phone}</a></li> : null}
                    {it.contact.email ? <li><a href={`mailto:${it.contact.email}`}>{it.contact.email}</a></li> : null}
                  </ul>
                  <div className="sc-acts">
                    {it.service.url ? <a className="sc-btn sm" href={it.service.url} target="_blank" rel="noopener noreferrer">Open their page ↗</a> : null}
                    {type === "emergency_grant" || type === "pj_appeals" ? <button type="button" className="sc-btn sm ghost" onClick={() => copy(email(c, it, need, name), it.id)}>{copied === it.id ? "Copied ✓" : "Copy the email to ask"}</button> : null}
                  </div>
                  <p className="cr-src">Source: <a href={it.source_url} target="_blank" rel="noopener noreferrer">{host(it.source_url)}</a>{it.last_verified_at ? ` · Checked ${fmtDate(it.last_verified_at)}` : ""}</p>
                </article>
              ))}

              <section className="ea-words">
                <h3>The words to ask</h3>
                <p>Send this to financial aid{c.financial_aid_url ? <> (<a href={c.financial_aid_url} target="_blank" rel="noopener noreferrer">their page ↗</a>)</> : null}. Asking is normal. This is what the money is for.</p>
                <label className="sc-field">Your first and last name
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
                <pre>{email(c, fund?.it ?? null, need, name)}</pre>
                <button type="button" className="sc-btn" onClick={() => copy(email(c, fund?.it ?? null, need, name), "main")}>{copied === "main" ? "Copied ✓" : "Copy it"}</button>
              </section>

              {!found && site ? (
                <p className="cr-note">Search the college&rsquo;s own site: <a href={`https://www.google.com/search?q=${encodeURIComponent(`site:${site} emergency fund OR emergency grant students`)}`} target="_blank" rel="noopener noreferrer">emergency fund at {site} ↗</a></p>
              ) : null}

              <section className="ea-eff">
                <h3>If your college can&rsquo;t help, EFF can still try</h3>
                <div className="sc-doors">
                  <Link className="sc-door" href="/apply/emergency-grant"><b>EFF Emergency Grant</b><span>Up to $250 toward the bill, paid straight to the company or school. EFF decides within one weekday.</span></Link>
                  <Link className="sc-door" href="/holdup"><b>HOLD UP</b><span>Find what you really owe before a hold drops your classes.</span></Link>
                  <Link className="sc-door" href="/get-help"><b>Help near you</b><span>Food, housing and bills near your campus.</span></Link>
                  <Link className="sc-door" href={`/my-college/${c.unitid}`}><b>Everything at {c.name}</b><span>Counseling, tutoring, career help and more.</span></Link>
                </div>
              </section>
              <p className="cr-note">Know an emergency fund EFF missed? <Link href={`/my-college/${c.unitid}`}>Tell us on the college&rsquo;s page</Link>, and a person checks it.</p>
            </div>
          ) : null}

          <p className="cr-note ea-crisis">In crisis? Call or text <a href="tel:988">988</a>, any time. In danger, call <a href="tel:911">911</a>. Nothing you type here is saved.</p>
        </section>
      </main>
      <SiteFoot />
    </div>
  );
}
