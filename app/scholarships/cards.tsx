import Link from "next/link";
import { dueLabel, urgent, checkedOn, type Card } from "./lib";
import { SaveButton } from "./parts";
import { GROUPS } from "./browse";

/* One scholarship card, and the Browse block of doors, shared by the directory and every browse list. */
export function CardView({ c }: { c: Card }) {
  return (
    <article className="sc-card">
      {c.featured ? <span className="sc-feat">EFF pick</span> : null}
      {c.deep?.verified ? <span className="sc-checked" title={`Checked on the provider's own page ${checkedOn(c.deep.last_verified_at) || ""}`}>✓ Checked by EFF</span> : null}
      <span className={`sc-due${urgent(c) ? " hot" : ""}`}>{urgent(c) ? "⏳ " : ""}{dueLabel(c)}</span>
      <div className={c.amount && /\d/.test(c.amount) ? "sc-amt" : "sc-amt quiet"}>{c.amount && /\d/.test(c.amount) ? c.amount : c.deep ? "Amount not stated" : "Amount varies"}</div>
      <h3><Link href={`/scholarships/${c.slug}`}>{c.title}</Link></h3>
      {c.sponsor ? <p className="sc-by">Offered by {c.sponsor}</p> : null}
      {c.deep?.last_verified_at ? <p className="sc-by sc-last">Last checked {checkedOn(c.deep.last_verified_at)}</p> : null}
      <SaveButton slug={c.slug} compact />
    </article>
  );
}

export function BrowseBlock({ on }: { on?: string }) {
  return (
    <section className="sc-browse" id="browse" aria-label="Browse scholarships">
      {GROUPS.map((g) => g.key === "state" ? (
        <details key={g.key} className="sc-bgroup" open={Boolean(on?.startsWith("state-"))}>
          <summary><h3>{g.title}</h3><span>Pick your state</span></summary>
          <div className="sc-chips">{g.lists.map((b) => <Link key={b.key} className={`sc-chip${on === b.key ? " on" : ""}`} href={`/scholarships/browse/${b.key}`}>{b.label}</Link>)}</div>
        </details>
      ) : (
        <div key={g.key} className="sc-bgroup">
          <h3>{g.title}</h3>
          <div className="sc-chips">{g.lists.map((b) => <Link key={b.key} className={`sc-chip${on === b.key ? " on" : ""}`} href={`/scholarships/browse/${b.key}`}>{b.label}</Link>)}</div>
        </div>
      ))}
    </section>
  );
}
