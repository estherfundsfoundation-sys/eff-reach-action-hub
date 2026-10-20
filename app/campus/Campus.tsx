"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rpc } from "../scholarships/lib";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { KINDS, OFFERS, WAYS, KIT } from "./content";

/* REACH for Campuses (20 Oct 2026, Shayna: "i want universities and colleges and professors to promote reach at
   their school ... a free partnership ... will your university join the mission of preventing college dropouts?").
   A college office, a department or a professor joins for free (eff_reach_campus_join) and gets a campus link
   (/go/<code>) and the share kit (/campus/kit?c=<code>). Campuses show on the page only after National approves. */

type School = { name: string; city?: string; state?: string };
type Pub = { count: number; listed: Array<{ name: string; state: string | null }> };

export default function Campus() {
  const [pub, setPub] = useState<Pub | null>(null);
  const [f, setF] = useState({ kind: "campus", institution: "", city: "", state: "", contact_name: "", contact_title: "", office: "", email: "", phone: "", note: "", website: "" });
  const [ways, setWays] = useState<string[]>([]);
  const [listed, setListed] = useState(true);
  const [agree, setAgree] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ code: string; institution: string } | null>(null);

  useEffect(() => { rpc<Pub>("eff_reach_campus_public", {}, 60).then(setPub).catch(() => {}); }, []);
  useEffect(() => {
    const q = f.institution.trim();
    if (q.length < 3) { setSchools([]); return; }
    const t = setTimeout(() => rpc<School[]>("eff_search_institutions", { p_query: q, p_limit: 6 }).then(setSchools).catch(() => setSchools([])), 220);
    return () => clearTimeout(t);
  }, [f.institution]);

  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });
  async function join(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await rpc<{ code?: string; institution?: string }>("eff_reach_campus_join", { p: { ...f, share_ways: ways, listed: String(listed), agree: String(agree), source: new URLSearchParams(location.search).get("from") || "" } }, 0);
      if (r.code) setDone({ code: r.code, institution: r.institution || f.institution });
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : "That didn't send. Try again."); }
    setBusy(false);
  }

  return (
    <main className="sc aw cp">
      <SiteTop />
      <section className="cp-hero">
        <div className="sc-wrap">
          <span className="cp-kick">REACH for Campuses · a free partnership with Esther Funds Foundation</span>
          <h1>Will your university join the mission of <em>preventing college dropouts?</em></h1>
          <p className="cp-statement">&ldquo;We are partnering with the Esther Funds Foundation on college dropout prevention by encouraging our students to REACH.&rdquo;</p>
          <p className="cp-lede">Students rarely leave all at once. It&rsquo;s a bill, a hold, an empty fridge, a hard week. REACH gives every student one free place to turn before they walk away: emergency help, scholarships, free tools, mental health support and real people. <b>All we ask is that you share it with your students.</b></p>
          <div className="sc-acts"><a className="sc-btn coral" href="#join">Join for free</a><a className="sc-btn ghost" href="#what">What students get</a></div>
          {pub && pub.count > 0 ? <p className="cp-count"><b>{pub.count}</b> {pub.count === 1 ? "campus has" : "campuses have"} joined.</p> : null}
        </div>
      </section>

      <section className="sc-wrap cp-sec" id="what">
        <h2>What your students get</h2>
        <p className="cp-sub">Free, always. No account needed to start. Nothing about a student is ever shared with us or with you.</p>
        <div className="cp-grid">
          {OFFERS.map((o) => <article key={o.h} className="cp-card"><h3>{o.h}</h3><p>{o.p}</p></article>)}
        </div>
        <p className="sc-small"><Link href="/resources">See every REACH resource →</Link></p>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>What partnering means</h2>
        <div className="cp-steps">
          <div><b>1</b><h3>You join, free</h3><p>Tell us who you are and how you might share. Two minutes.</p></div>
          <div><b>2</b><h3>You get your campus kit</h3><p>Your own campus link, Instagram posts and a story, a printable flyer, captions, a newsletter blurb, a syllabus statement and an LMS message.</p></div>
          <div><b>3</b><h3>You share it</h3><p>Orientation, advising, the counseling center, a Canvas announcement, a professor&rsquo;s syllabus, a flyer by the financial aid office. Wherever students look.</p></div>
          <div><b>4</b><h3>We keep REACH current</h3><p>Scholarships refresh every morning, broken links are checked daily, and a real person at EFF answers. You can see how many times your link was opened.</p></div>
        </div>
        <p className="cp-note">There is no cost, no contract and no data sharing. Your campus is named on this page only if you say yes. You can stop any time by replying to any email from us.</p>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>For professors</h2>
        <p className="cp-sub">One line in a syllabus or one announcement on the first day can be the reason a student stays. Join as a professor and your kit includes a ready-to-paste syllabus statement and LMS announcement.</p>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>A peek at the share kit</h2>
        <div className="cp-peek">
          {KIT.filter((k) => k.file.endsWith(".jpg")).slice(0, 4).map((k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k.file} src={`/campus-kit/${k.file}`} alt={k.label} loading="lazy" />
          ))}
        </div>
      </section>

      <section className="sc-wrap cp-sec" id="join">
        {done ? (
          <div className="cp-done">
            <h2>Welcome, {done.institution}. 💜</h2>
            <p>Thank you for joining the mission. Your campus link and kit are ready, and we emailed them to you too.</p>
            <div className="sc-acts"><Link className="sc-btn coral" href={`/campus/kit?c=${done.code}`}>Open my share kit</Link></div>
          </div>
        ) : (
          <form className="cp-form" onSubmit={join}>
            <h2>Join REACH for Campuses</h2>
            <p className="cp-sub">Free. Takes two minutes.</p>
            <fieldset><legend>Who&rsquo;s joining?</legend>
              <div className="sc-pills">{KINDS.map((k) => <button key={k.v} type="button" className={`sc-pill${f.kind === k.v ? " on" : ""}`} aria-pressed={f.kind === k.v} onClick={() => set("kind", k.v)}>{k.l}</button>)}</div>
            </fieldset>
            <div className="cp-fields">
              <label className="sc-field grow"><span>College or university</span>
                <input required value={f.institution} onChange={(e) => set("institution", e.target.value)} list="cp-schools" autoComplete="organization" />
                <datalist id="cp-schools">{schools.map((s) => <option key={s.name} value={s.name} />)}</datalist></label>
              <label className="sc-field"><span>City</span><input value={f.city} onChange={(e) => set("city", e.target.value)} /></label>
              <label className="sc-field"><span>State</span><input value={f.state} maxLength={2} placeholder="GA" onChange={(e) => set("state", e.target.value.toUpperCase())} /></label>
              <label className="sc-field"><span>Your name</span><input required value={f.contact_name} onChange={(e) => set("contact_name", e.target.value)} autoComplete="name" /></label>
              <label className="sc-field"><span>Your title</span><input value={f.contact_title} placeholder="Dean of Students, Professor…" onChange={(e) => set("contact_title", e.target.value)} /></label>
              <label className="sc-field grow"><span>Office or department</span><input value={f.office} placeholder="Student Life, TRIO, Counseling Center…" onChange={(e) => set("office", e.target.value)} /></label>
              <label className="sc-field"><span>Email</span><input required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></label>
              <label className="sc-field"><span>Phone (optional)</span><input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></label>
            </div>
            <fieldset><legend>How might you share REACH? (tap any)</legend>
              <div className="sc-pills">{WAYS.map((w) => { const on = ways.includes(w.v); return <button key={w.v} type="button" className={`sc-pill${on ? " on" : ""}`} aria-pressed={on} onClick={() => setWays(on ? ways.filter((x) => x !== w.v) : [...ways, w.v])}>{w.l}</button>; })}</div>
            </fieldset>
            <label className="sc-field grow"><span>Anything we should know? (optional)</span><textarea rows={3} value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Your students, an event coming up, how we can help…" /></label>
            <input className="cp-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={(e) => set("website", e.target.value)} />
            <label className="cp-check"><input type="checkbox" checked={listed} onChange={(e) => setListed(e.target.checked)} />You may name our campus on this page as a REACH partner.</label>
            <label className="cp-check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />We&rsquo;ll share REACH with our students. We understand it&rsquo;s free and there is no contract.</label>
            {err ? <p className="aw-err" role="alert">{err}</p> : null}
            <div className="sc-acts"><button className="sc-btn coral" disabled={busy}>{busy ? "Joining…" : "Join the mission"}</button></div>
          </form>
        )}
      </section>

      {pub && pub.listed.length ? (
        <section className="sc-wrap cp-sec">
          <h2>Campuses sharing REACH</h2>
          <ul className="cp-wall">{pub.listed.map((c) => <li key={c.name}>{c.name}{c.state ? <span> · {c.state}</span> : null}</li>)}</ul>
        </section>
      ) : null}

      <section className="sc-wrap cp-sec"><p className="cp-close">Before you drop out, REACH. Questions? Write to <a href="mailto:nationals@estherfundsinc.org">nationals@estherfundsinc.org</a>.</p></section>
      <SiteFoot />
    </main>
  );
}
