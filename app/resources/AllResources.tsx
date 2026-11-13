"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteTop, SiteFoot } from "../myreach/ui";
import LibCard from "../content/LibCard";
import { CATS, GROUPS, ORDER, STAGES, WHO } from "../content/library";
import { useLibrary } from "../content/useLibrary";

/* Every REACH resource on one page, from the REACH Library (MyEFF's eff_reach_items, checked every
   morning; National edits it in MyEFF). Filter by who you are, your stage and the group a resource
   was made for, or search across all of it. */
const short: Record<string, string> = { student: "A student", family: "Parent or family", school: "High school staff", college: "College staff", community: "Church, nonprofit or business" };

export default function AllResources() {
  const { items } = useLibrary();
  const [q, setQ] = useState("");
  useEffect(() => { const v = new URLSearchParams(window.location.search).get("q"); if (v) setQ(v); }, []);
  const [who, setWho] = useState("");
  const [stage, setStage] = useState("");
  const [group, setGroup] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = items.filter((i) => (!who || i.who.includes(who)) && (!stage || i.stages.includes(stage)) && (!group || i.groups.includes(group))
      && (!s || `${i.title} ${i.text}`.toLowerCase().includes(s)));
    return ORDER.map((c) => ({ c, list: list.filter((i) => i.cat === c) })).filter((g) => g.list.length);
  }, [items, q, who, stage, group]);
  const count = shown.reduce((n, g) => n + g.list.length, 0);

  return (
    <main className="sc rh rs">
      <SiteTop on="/resources" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />{items.length} tools, guides and lifelines, checked every morning</span>
          <h1>Everything, <em>organized.</em></h1>
          <p>For students from 9th grade to after graduation, and for everyone in their corner. Or <Link href="/start">answer three questions and get your own plan</Link>, or see <Link href="/organizations">46 organizations across the country doing this work</Link>.</p>
          <div className="sc-filters" style={{ marginTop: 18 }}>
            <label className="sc-field grow"><span>Search everything</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="rent, FAFSA, DACA, GI Bill, résumé, 988…" /></label>
            <label className="sc-field"><span>I&rsquo;m</span><select value={who} onChange={(e) => setWho(e.target.value)}><option value="">Anyone</option>{WHO.map((w) => <option key={w.key} value={w.key}>{short[w.key]}</option>)}</select></label>
            <label className="sc-field"><span>Stage</span><select value={stage} onChange={(e) => setStage(e.target.value)}><option value="">Any</option>{STAGES.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}</select></label>
            <label className="sc-field"><span>Made for</span><select value={group} onChange={(e) => setGroup(e.target.value)}><option value="">Everyone</option>{GROUPS.map((g) => <option key={g.key} value={g.key}>{g.title}</option>)}</select></label>
          </div>
          <nav className="sc-pills" aria-label="Sections">
            {shown.map((g) => <a key={g.c} className="sc-pill" href={`#${g.c}`} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", borderColor: CATS[g.c].hue }}>{CATS[g.c].glyph} {CATS[g.c].title}</a>)}
          </nav>
        </div>
      </section>
      <div className="sc-wrap sc-section">
        {!count ? <div className="sc-empty"><h2>Nothing matches that yet.</h2><p>Try fewer filters, or <a href="https://my.estherfundsfoundation.org/lighthouse">ask a real person at EFF</a>.</p></div> : null}
        {shown.map((g) => (
          <section key={g.c} id={g.c} className="rs-sec">
            <div className="rs-sec-h"><span style={{ background: CATS[g.c].hue }} aria-hidden="true">{CATS[g.c].glyph}</span><div><h2>{CATS[g.c].title}</h2><p>{CATS[g.c].line}</p></div></div>
            <div className="lb-grid">{g.list.map((i) => <LibCard key={i.key} i={i} />)}</div>
          </section>
        ))}
        <section className="rs-more">
          <h2>Toolkits for everyone in a student&rsquo;s corner</h2>
          <p>Families, high schools, colleges, churches and nonprofits: steps, checklists and words to copy.</p>
          <div className="rs-acts">{WHO.filter((w) => w.key !== "student").map((w, n) => <Link key={w.key} className={`sc-btn ${n ? "ghost" : "coral"}`} href={w.href}>{short[w.key]}</Link>)}</div>
        </section>
      </div>
      <SiteFoot />
    </main>
  );
}
