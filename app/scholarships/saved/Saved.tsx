"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rpc, readSaved, writeSaved, downloadIcs, dueLabel, urgent, type Card } from "../lib";
import { Top, Foot } from "../parts";

/* The saved list lives in this browser (localStorage reach-saved-scholarships); the current
   facts come from eff_scholarships_by_slugs. Closed ones stay until the student removes them. */
export default function Saved() {
  const [items, setItems] = useState<Card[] | null>(null);
  const [err, setErr] = useState("");
  const load = async () => {
    const slugs = readSaved();
    if (!slugs.length) { setItems([]); return; }
    try {
      const rows = await rpc<Card[]>("eff_scholarships_by_slugs", { p_slugs: slugs });
      const order = new Map(slugs.map((s, i) => [s, i]));
      setItems(rows.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)));
    } catch { setErr("Your list didn't load. Try again in a minute."); }
  };
  useEffect(() => { load(); }, []);
  const open = (items ?? []).filter((i) => i.current !== false);
  const dated = open.filter((i) => i.deadline);

  return (
    <main className="sc">
      <Top on="/scholarships/saved" />
      <div className="sc-wrap sc-section">
        <section className="sc-hero" style={{ paddingBottom: 10 }}>
          <span className="sc-kick">On this phone only</span>
          <h1>Your <em>list.</em></h1>
          <p>Everything you saved, closing first. Add them all to your calendar and you&rsquo;ll get a nudge a week out and the day before.</p>
          {dated.length ? <div className="sc-acts"><button className="sc-btn coral" onClick={() => downloadIcs(dated)}>Add {dated.length} deadline{dated.length === 1 ? "" : "s"} to my calendar</button></div> : null}
        </section>
        {err ? <div className="sc-empty"><p>{err}</p></div> : items === null ? <p className="sc-small">Loading…</p> : !items.length ? (
          <div className="sc-empty"><h2>Nothing saved yet.</h2><p>Tap ♡ Save on any scholarship and it shows up here. Start with <Link href="/scholarships/match">Match me</Link>.</p></div>
        ) : (
          <div className="sc-grid">
            {[...items].sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999")).map((c) => (
              <article className="sc-card" key={c.slug} style={c.current === false ? { opacity: .6 } : undefined}>
                <span className={`sc-due${c.current !== false && urgent(c) ? " hot" : ""}`}>{c.current === false ? "Closed" : dueLabel(c)}</span>
                <div className={c.amount && /\d/.test(c.amount) ? "sc-amt" : "sc-amt quiet"}>{c.amount && /\d/.test(c.amount) ? c.amount : "Amount varies"}</div>
                <h3><Link href={`/scholarships/${c.slug}`}>{c.title}</Link></h3>
                {c.sponsor ? <p className="sc-by">Offered by {c.sponsor}</p> : null}
                <button type="button" className="sc-save on" style={{ position: "relative", zIndex: 2, marginTop: "auto", alignSelf: "flex-start" }}
                  onClick={() => { writeSaved(readSaved().filter((s) => s !== c.slug)); setItems((cur) => (cur ?? []).filter((x) => x.slug !== c.slug)); }}>♥ Remove</button>
              </article>
            ))}
          </div>
        )}
      </div>
      <Foot />
    </main>
  );
}
