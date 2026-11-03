"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteFoot, SiteTop } from "../../myreach/ui";
import { rpc } from "../../scholarships/lib";
import { EFF_ROUTES, fmtDate, host, type College, type Item } from "../data";

const TYPES: Array<[string, string]> = [
  ["emergency_grant", "Emergency money"], ["food_pantry", "Food pantry"], ["basic_needs_center", "Basic needs center"],
  ["emergency_housing", "Emergency housing"], ["financial_aid_office", "Financial aid office"], ["pj_appeals", "Ask financial aid to look again"],
  ["counseling", "Counseling"], ["benefits_help", "Help with benefits"], ["textbook_lending", "Textbooks"], ["laptop_lending", "Laptops and tech"],
  ["childcare", "Childcare"], ["transportation", "Getting around"], ["other", "Something else"],
];

function Listing({ it, onReport }: { it: Item; onReport: (it: Item) => void }) {
  const s = it.service;
  return (
    <article className="cr-item">
      <h3>{s.name}</h3>
      {s.description ? <p>{s.description}</p> : null}
      {s.amount_max ? <p className="cr-amt">Up to ${Number(s.amount_max).toLocaleString()}, as the college states it.</p> : null}
      {s.college_wording ? <blockquote className="cr-quote"><span>In the college&rsquo;s own words:</span> &ldquo;{s.college_wording}&rdquo;</blockquote> : null}
      {s.how_to_apply ? <p><b>How to ask:</b> {s.how_to_apply}</p> : null}
      <p className="cr-next"><b>Your next step:</b> {it.next_step}</p>
      <ul className="cr-contact">
        {it.contact.office ? <li>{it.contact.office}</li> : null}
        {it.contact.phone ? <li><a href={`tel:${it.contact.phone.replace(/[^0-9+]/g, "")}`}>{it.contact.phone}</a></li> : null}
        {it.contact.email ? <li><a href={`mailto:${it.contact.email}`}>{it.contact.email}</a></li> : null}
        {it.location.text ? <li>{it.location.text}</li> : null}
        {it.location.hours ? <li>{it.location.hours}</li> : null}
      </ul>
      <div className="sc-acts">
        {s.url ? <a className="sc-btn sm" href={s.url} target="_blank" rel="noopener noreferrer">Open their page ↗</a> : null}
        <button type="button" className="sc-btn sm ghost" onClick={() => onReport(it)}>Something changed?</button>
      </div>
      <p className="cr-src">Source: <a href={it.source_url} target="_blank" rel="noopener noreferrer">{host(it.source_url)}</a>{it.last_verified_at ? ` · Last checked ${fmtDate(it.last_verified_at)}` : ""}</p>
    </article>
  );
}

function Report({ c, item, close }: { c: College; item: Item | null; close: () => void }) {
  const [kind, setKind] = useState(item ? "changed" : "missing");
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  async function send(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      await rpc("eff_campus_report", { p: { unitid: c.unitid, resource_id: item?.id || "", kind, resource_type: type, message: msg, link, email, website: trap } });
      setDone(true);
    } catch (x) { setErr(x instanceof Error ? x.message : "That didn't send. Try again."); }
    finally { setBusy(false); }
  }
  return (
    <div className="cr-sheet" role="dialog" aria-modal="true" aria-label="Tell us">
      <form className="cr-sheet-in" onSubmit={send}>
        <button type="button" className="cr-x" onClick={close} aria-label="Close">×</button>
        {done ? (
          <>
            <h2>Thank you.</h2>
            <p>It goes to the people who check {c.name}&rsquo;s listings: EFF&rsquo;s chapter or Campus Ambassadors there, or EFF National. We fix it after we&rsquo;ve looked at the college&rsquo;s own page.</p>
            <button type="button" className="sc-btn" onClick={close}>Done</button>
          </>
        ) : (
          <>
            <h2>{item ? `About “${item.service.name}”` : `Tell us about ${c.name}`}</h2>
            <label className="sc-field">What happened?
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                {item ? <><option value="changed">Something changed</option><option value="wrong">Something here is wrong</option><option value="gone">It doesn&rsquo;t exist any more</option></> : null}
                <option value="missing">There&rsquo;s help here you don&rsquo;t list</option>
              </select>
            </label>
            {!item ? (
              <label className="sc-field">What kind of help?
                <select value={type} onChange={(e) => setType(e.target.value)}><option value="">Pick one</option>{TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </label>
            ) : null}
            <label className="sc-field">Tell us in your words
              <textarea required minLength={5} maxLength={1200} rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="For example: the pantry moved to the student center and is open Tuesdays." />
            </label>
            <label className="sc-field">A link to the college&rsquo;s page about it (if you have one)
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
            </label>
            <label className="sc-field">Your email, only if you want us to write back (optional)
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <input className="cr-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} aria-hidden="true" />
            {err ? <p className="cr-err" role="alert">{err}</p> : null}
            <button className="sc-btn" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
          </>
        )}
      </form>
    </div>
  );
}

export default function CollegeView({ c }: { c: College }) {
  const [report, setReport] = useState<{ item: Item | null } | null>(null);
  const has = c.groups.length > 0;
  return (
    <div className="sc cr">
      <SiteTop />
      <main>
        <section className="sc-hero"><div className="sc-wrap">
          <Link href="/my-college" className="cr-back">← Another college</Link>
          <span className="sc-kick"><span className="dot" />{[c.city, c.state].filter(Boolean).join(", ")}{c.hbcu ? " · HBCU" : ""}{c.tribal ? " · Tribal college" : ""}</span>
          <h1 className="cr-h1">{c.name}</h1>
          <p>{has ? "Help at your college that EFF has checked, starting with emergency money. Every listing shows where it came from." : "EFF hasn't confirmed this college's help yet. Here's where to start today, and what EFF has for you right now."}</p>
          {!c.active ? <p className="cr-warn">IPEDS lists this college as no longer open. If you were a student here, financial aid can still help with your records.</p> : null}
        </div></section>

        <section className="sc-wrap">
          <div className="cr-start">
            {c.financial_aid_url ? <a className="sc-door" href={c.financial_aid_url} target="_blank" rel="noopener noreferrer"><b>Financial aid office ↗</b><span>Their official page. Ask about emergency aid and about a review if your money changed.</span></a> : null}
            {c.website_url ? <a className="sc-door" href={c.website_url} target="_blank" rel="noopener noreferrer"><b>{host(c.website_url)} ↗</b><span>The college&rsquo;s own site. Search it for &ldquo;emergency fund&rdquo; or &ldquo;food pantry&rdquo;.</span></a> : null}
            {c.chapter ? <a className="sc-door" href={`https://my.estherfundsfoundation.org/chapters/${c.chapter.slug}`}><b>{c.chapter.name}</b><span>EFF has a chapter here. Students who can walk this with you.</span></a> : null}
          </div>

          {c.groups.map((g) => (
            <section key={g.type} className="cr-group">
              <h2>{g.label}</h2>
              {g.items.map((it) => <Listing key={it.id} it={it} onReport={(x) => setReport({ item: x })} />)}
            </section>
          ))}

          {c.pages.length ? (
            <section className="cr-group">
              <h2>Pages on {host(c.website_url || c.pages[0].url)} that may help</h2>
              <p className="cr-note">EFF found these on the college&rsquo;s own site but hasn&rsquo;t confirmed them yet. Open them to read the details from the college itself.</p>
              <ul className="cr-pages">
                {c.pages.map((p) => <li key={p.url}><a href={p.url} target="_blank" rel="noopener noreferrer"><b>{p.label}</b><span>{host(p.url)}{p.url.replace(/^https?:\/\/[^/]+/, "").slice(0, 70)}</span></a></li>)}
              </ul>
            </section>
          ) : null}

          <section className="cr-group">
            <h2>EFF has your back too</h2>
            <div className="sc-doors">
              {EFF_ROUTES.map((r) => <a key={r.title} className="sc-door" href={r.href}><b>{r.title}</b><span>{r.text}</span></a>)}
            </div>
          </section>

          <div className="cr-tell">
            <p><b>Know something we don&rsquo;t?</b> If {c.name} has help that isn&rsquo;t here, or something changed, tell us. A person checks it against the college&rsquo;s own page.</p>
            <button type="button" className="sc-btn coral" onClick={() => setReport({ item: null })}>Tell us</button>
          </div>
          <p className="cr-note cr-foot">College details come from the U.S. Department of Education (IPEDS 2024). Help listed here is for every student and never depends on faith. In a crisis, call or text <a href="tel:988">988</a>.</p>
        </section>
      </main>
      {report ? <Report c={c} item={report.item} close={() => setReport(null)} /> : null}
      <SiteFoot />
    </div>
  );
}
