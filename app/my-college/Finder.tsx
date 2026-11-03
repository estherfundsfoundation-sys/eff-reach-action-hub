"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteFoot, SiteTop } from "../myreach/ui";
import { rpc } from "../scholarships/lib";
import type { Coverage, Hit } from "./data";

const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR GU VI AS MP FM MH PW".split(" ");

export default function Finder({ coverage }: { coverage: Coverage | null }) {
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) { setHits(null); return; }
    timer.current = setTimeout(async () => {
      setBusy(true); setErr("");
      try { setHits(await rpc<Hit[]>("eff_campus_search", { p_q: q.trim(), p_state: st || null })); }
      catch (e) { setErr(e instanceof Error ? e.message : "Search didn't work. Try again."); }
      finally { setBusy(false); }
    }, 250);
  }, [q, st]);

  return (
    <div className="sc cr">
      <SiteTop />
      <main>
        <section className="sc-hero"><div className="sc-wrap">
          <span className="sc-kick"><span className="dot" />Your college · every US college</span>
          <h1>What does your college <em>already</em> offer you?</h1>
          <p>Most colleges have emergency money, a food pantry, counseling and people in financial aid who can look at your situation again. A lot of students never hear about them. Type your college to see what&rsquo;s there.</p>
        </div></section>

        <section className="sc-wrap">
          <div className="sc-filters cr-search">
            <label className="sc-field grow">Your college
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type its name, like Florida A&M or Tuskegee" autoComplete="off" />
            </label>
            <label className="sc-field">State
              <select value={st} onChange={(e) => setSt(e.target.value)}><option value="">Any state</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
          </div>
          {err ? <p className="cr-err" role="alert">{err}</p> : null}
          {busy && !hits ? <p className="cr-note">Looking…</p> : null}
          {hits ? (
            hits.length ? (
              <ul className="cr-hits">
                {hits.map((h) => (
                  <li key={h.unitid}>
                    <Link href={`/my-college/${h.unitid}`} className="cr-hit">
                      <b>{h.name}</b>
                      <span>{[h.city, h.state].filter(Boolean).join(", ")}{h.level ? ` · ${h.level}` : ""}{h.hbcu ? " · HBCU" : ""}{h.tribal ? " · Tribal college" : ""}{!h.active ? " · no longer open" : ""}</span>
                      {h.verified > 0 ? <em>{h.verified} confirmed by EFF</em> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="cr-note">No college by that name yet. Try fewer words, or its full name.</p>
          ) : null}

          <div className="cr-honest">
            <h2>How we know</h2>
            <p>Every college in the U.S. Department of Education&rsquo;s list is here ({(coverage?.colleges ?? 6072).toLocaleString()}), with its own website and financial aid office. EFF reads each college&rsquo;s public pages to find its help, and a person checks every listing before you see it as confirmed. Each one shows where it came from and when it was last checked.</p>
            <p className="cr-count"><b>{(coverage?.verified_colleges ?? 0).toLocaleString()}</b> colleges have help confirmed by EFF so far. We&rsquo;re adding more every week, starting with the campuses where EFF has chapters, then HBCUs.</p>
            <p className="cr-note">See something wrong or missing at your college? Every college page has a &ldquo;Tell us&rdquo; button.</p>
          </div>
        </section>
      </main>
      <SiteFoot />
    </div>
  );
}
