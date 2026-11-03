import { fmtDate, host } from "../data";

/* The Deep Dossier (3 Nov 2026, Shayna: "REACH's value: WE NAVIGATE THE COLLEGE FOR THE STUDENT"). Twelve sections,
   each a path ("do this → then this → ask for X") with the college's own page and the date it was read. A section
   the college doesn't publish shows the move instead. Read from eff_campus_dossier_public (only when the dossier meets
   the standard). Broke on a Friday night comes first, big. */
export type DItem = {
  id: string; title: string; office: string | null; summary: string | null; eligibility: string | null; amount_text: string | null;
  amount_max: number | null; steps: string[]; turnaround: string | null; deadline_text: string | null; deadline_date: string | null;
  college_wording: string | null; form_url: string | null; contact: { office?: string; email?: string; phone?: string; location?: string; hours?: string };
  source_url: string; last_verified_at: string | null; rechecking: boolean;
};
export type DSection = { key: string; label: string; items: DItem[]; move: string | null };
export type DossierData = { researched_at: string | null; sections: DSection[] };

const NUM = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function Path({ it, n }: { it: DItem; n?: number }) {
  const c = it.contact || {};
  const steps = Array.isArray(it.steps) ? it.steps.filter(Boolean) : [];
  return (
    <article className="dz-path">
      <h4>{n ? <span className="dz-n">{n}</span> : null}{it.title}</h4>
      {it.office ? <p className="dz-office">{it.office}</p> : null}
      {it.rechecking ? <p className="dz-re">The college changed this page. EFF is re-checking it; open their page to be sure.</p> : null}
      {it.summary ? <p>{it.summary}</p> : null}
      {it.amount_text || it.amount_max ? <p className="dz-amt">{it.amount_text || `Up to $${Number(it.amount_max).toLocaleString()}`}</p> : null}
      {it.eligibility ? <p><b>Who it&rsquo;s for:</b> {it.eligibility}</p> : null}
      {steps.length ? <ol className="dz-steps">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol> : null}
      {it.college_wording ? <blockquote className="cr-quote"><span>In the college&rsquo;s own words</span>&ldquo;{it.college_wording}&rdquo;</blockquote> : null}
      <ul className="dz-facts">
        {it.turnaround ? <li><b>How fast:</b> {it.turnaround}</li> : null}
        {it.deadline_text || it.deadline_date ? <li><b>Deadline:</b> {it.deadline_text || fmtDate(it.deadline_date)}</li> : null}
        {c.location ? <li><b>Where:</b> {c.location}</li> : null}
        {c.hours ? <li><b>Hours:</b> {c.hours}</li> : null}
        {c.phone ? <li><b>Call:</b> <a href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}>{c.phone}</a></li> : null}
        {c.email ? <li><b>Email:</b> <a href={`mailto:${c.email}`}>{c.email}</a></li> : null}
      </ul>
      <div className="sc-acts">
        {it.form_url ? <a className="sc-btn sm" href={it.form_url} target="_blank" rel="noopener noreferrer">Open the form ↗</a> : null}
        <a className="sc-btn sm ghost" href={it.source_url} target="_blank" rel="noopener noreferrer">Their page ↗</a>
      </div>
      <p className="cr-src">Source: <a href={it.source_url} target="_blank" rel="noopener noreferrer">{host(it.source_url)}</a>{it.last_verified_at ? ` · Last checked ${fmtDate(it.last_verified_at)}` : ""}</p>
    </article>
  );
}

export default function Dossier({ d, name }: { d: DossierData; name: string }) {
  const fri = d.sections.find((s) => s.key === "friday_night");
  const rest = d.sections.filter((s) => s.key !== "friday_night");
  return (
    <div className="dz">
      {fri ? (
        <section className="dz-fri" id="friday-night">
          <span className="dz-kick">Broke on a Friday night at {name}</span>
          <h2>Do these, in this order.</h2>
          {fri.items.length ? fri.items.map((it, i) => <Path key={it.id} it={it} n={i + 1} />) : <p className="dz-move"><b>The move:</b> {fri.move}</p>}
        </section>
      ) : null}
      <nav className="dz-toc" aria-label="Sections">
        {rest.map((s, i) => <a key={s.key} href={`#${s.key}`}><span>{NUM[i]}</span>{s.label}</a>)}
      </nav>
      {rest.map((s, i) => (
        <section key={s.key} id={s.key} className="dz-sec">
          <h3 className="dz-h"><span>{NUM[i]}</span>{s.label}</h3>
          {s.items.length ? s.items.map((it) => <Path key={it.id} it={it} />) : (
            <div className="dz-gap"><b>Not published — here&rsquo;s the move:</b> {s.move}</div>
          )}
        </section>
      ))}
      {d.researched_at ? <p className="cr-note">EFF read {name}&rsquo;s own pages for this guide on {fmtDate(d.researched_at)} and re-reads them every month.</p> : null}
    </div>
  );
}
