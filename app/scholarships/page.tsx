import type { Metadata } from "next";
import Link from "next/link";
import { rpc, dueLabel, urgent, checkedOn, LEVELS, type Search, type Stats, type Card } from "./lib";
import { Top, SaveButton, Foot } from "./parts";
import "./scholarships.css";

/* REACH Scholarships: the directory. Server-rendered from MyEFF's eff_scholarships_find (one directory: REACH's
   listings plus EFF's checked deep records, which win where they exist; search, level, deadline window, state,
   GPA, field, who it's for, amount, checked-only; 24 a page), cached five minutes. */
export const metadata: Metadata = {
  title: "Scholarships | REACH by Esther Funds Foundation",
  description: "Thousands of real scholarships, checked every morning. Search by level and deadline, get matched in two minutes, save your list, and never pay to apply.",
  alternates: { canonical: "/scholarships" },
  openGraph: { title: "REACH Scholarships", description: "Real scholarships, checked every morning. Find yours in two minutes.", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "REACH Scholarships" }] },
};

type Params = { q?: string; level?: string; deadline?: string; sort?: string; page?: string; state?: string; gpa?: string; major?: string; focus?: string; amount?: string; checked?: string };

const FOCUS = [
  ["first_gen", "First in my family"], ["black", "Black / African American"], ["hispanic", "Hispanic / Latino"], ["native", "Native / Indigenous"],
  ["asian", "Asian American / Pacific Islander"], ["women", "Women"], ["low_income", "Low income / Pell"], ["military", "Military / veterans"],
  ["disability", "Living with a disability"], ["lgbtq", "LGBTQ+"], ["foster", "Foster care"], ["immigrant", "Immigrant / DACA"],
];
const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR".split(" ");

function CardView({ c }: { c: Card }) {
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

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const page = Math.max(1, Number.parseInt(p.page ?? "1", 10) || 1);
  let data: Search | null = null; let stats: Stats | null = null;
  try {
    [data, stats] = await Promise.all([
      rpc<Search>("eff_scholarships_find", { p: { q: p.q || null, level: p.level && p.level !== "all" ? p.level : null, deadline: p.deadline || "upcoming", sort: p.sort || "deadline", page, state: p.state || null,
        gpa: p.gpa || null, major: p.major || null, focus: p.focus || null, amount_min: p.amount || null, verified: p.checked === "1" } }),
      rpc<Stats>("eff_scholarships_stats"),
    ]);
  } catch { /* shown below */ }
  const filtered = Boolean(p.q || (p.level && p.level !== "all") || (p.deadline && p.deadline !== "upcoming") || p.state || (p.sort && p.sort !== "deadline") || p.gpa || p.major || p.focus || p.amount || p.checked);
  const href = (n: number) => {
    const q = new URLSearchParams();
    for (const k of ["q", "level", "deadline", "sort", "state", "gpa", "major", "focus", "amount", "checked"] as const) if (p[k]) q.set(k, p[k]!);
    q.set("page", String(n));
    return `/scholarships?${q}`;
  };

  return (
    <main className="sc">
      <Top on="/scholarships" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />{stats ? `${stats.current.toLocaleString()} open right now · checked every morning` : "Checked every morning"}</span>
          <h1>Get paid <em>to learn.</em></h1>
          <p>Real scholarships from the people who give them, updated every day. Search, get matched in two minutes, save your list and put the deadlines in your calendar. Free, always. Never pay to apply.</p>
          <div className="sc-acts">
            <Link className="sc-btn coral" href="/scholarships/match">Match me in 2 minutes</Link>
            <Link className="sc-btn" href="/apply-with-me">Apply With Me</Link>
            <a className="sc-btn ghost" href="#search">Search everything</a>
          </div>
        </div>
      </section>

      <div className="sc-wrap sc-section">
        <div className="sc-doors">
          <a className="sc-door" href="https://my.estherfundsfoundation.org/kit/pell"><b>Protect your Pell</b><span>New for 2026–27: too much scholarship money can cost you your Pell Grant. Check before you say yes.</span></a>
          <Link className="sc-door" href="/scholarships?deadline=soon"><b>Closing soon</b><span>{stats ? `${stats.closing_soon.toLocaleString()} close in the next 30 days.` : "Due in the next 30 days."}</span></Link>
          <Link className="sc-door" href="/scholarships?deadline=rolling"><b>Apply anytime</b><span>Rolling deadlines: no clock ticking.</span></Link>
          <Link className="sc-door" href="/scholarships/eff"><b>EFF&rsquo;s own</b><span>The scholarships Esther Funds Foundation gives.</span></Link>
          <a className="sc-door" href="/scholarshipwalk"><b>The Scholarship Walk</b><span>167 hand-picked, in the order they close.</span></a>
          <Link className="sc-door" href="/scholarships/toolkits"><b>Essay &amp; planner toolkits</b><span>Free downloads to write and track it all.</span></Link>
        </div>

        <form id="search" className="sc-filters" action="/scholarships">
          <label className="sc-field grow">Search<input name="q" defaultValue={p.q} placeholder="nursing, HBCU, first-gen, a sponsor…" /></label>
          <label className="sc-field">I&rsquo;m in<select name="level" defaultValue={p.level ?? "all"}><option value="all">Any level</option>{LEVELS.map((l) => <option key={l.v} value={l.v}>{l.label}</option>)}</select></label>
          <label className="sc-field">Deadline<select name="deadline" defaultValue={p.deadline ?? "upcoming"}><option value="upcoming">Still open</option><option value="soon">Next 30 days</option><option value="rolling">Apply anytime</option></select></label>
          <label className="sc-field">State<select name="state" defaultValue={p.state ?? ""}><option value="">Any state</option>{STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
          <label className="sc-field">Sort<select name="sort" defaultValue={p.sort ?? "deadline"}><option value="deadline">Closing first</option><option value="amount">Biggest first</option></select></label>
          <details className="sc-more" open={Boolean(p.gpa || p.major || p.focus || p.amount || p.checked)}>
            <summary>More filters</summary>
            <div className="sc-more-in">
              <label className="sc-field">My GPA<input name="gpa" defaultValue={p.gpa} inputMode="decimal" placeholder="e.g. 3.2" pattern="[0-5](\.[0-9]{1,2})?" /></label>
              <label className="sc-field">What I study<input name="major" defaultValue={p.major} placeholder="e.g. nursing" /></label>
              <label className="sc-field">Made for<select name="focus" defaultValue={p.focus ?? ""}><option value="">Anyone</option>{FOCUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label className="sc-field">At least<select name="amount" defaultValue={p.amount ?? ""}><option value="">Any amount</option><option value="500">$500</option><option value="1000">$1,000</option><option value="2500">$2,500</option><option value="5000">$5,000</option><option value="10000">$10,000</option></select></label>
              <label className="sc-check"><input type="checkbox" name="checked" value="1" defaultChecked={p.checked === "1"} /> Only ones EFF checked on the provider&rsquo;s own page</label>
            </div>
          </details>
          <button className="sc-btn">Search</button>
        </form>
        <p className="sc-small">A GPA or field filter hides only listings that say you don&rsquo;t qualify. Ones marked &ldquo;✓ Checked by EFF&rdquo; were checked on the provider&rsquo;s own page; the rest are listed as their source shows them.</p>

        {!data ? (
          <div className="sc-empty"><h2>The list didn&rsquo;t load.</h2><p>That&rsquo;s on us, not you. Refresh in a minute, or take the <a href="/scholarshipwalk">Scholarship Walk</a> in the meantime.</p></div>
        ) : data.items.length ? (
          <>
            <p className="sc-count">{data.total.toLocaleString()} {data.total === 1 ? "scholarship" : "scholarships"}{filtered ? " match" : " open"} · page {data.page} of {data.pages}{filtered ? <> · <Link href="/scholarships">clear</Link></> : null}</p>
            <div className="sc-grid">{data.items.map((c) => <CardView key={c.slug} c={c} />)}</div>
            {data.pages > 1 ? (
              <nav className="sc-pages" aria-label="Pages">
                {data.page > 1 ? <Link className="sc-btn ghost sm" href={href(data.page - 1)}>← Back</Link> : <span />}
                <span className="sc-small">Page {data.page} of {data.pages}</span>
                {data.page < data.pages ? <Link className="sc-btn sm" href={href(data.page + 1)}>More →</Link> : <span />}
              </nav>
            ) : null}
          </>
        ) : stats && !stats.current ? (
          <div className="sc-empty"><h2>The list is filling up.</h2><p>REACH is reading today&rsquo;s scholarships right now. Check back in a few minutes, or take the <a href="/scholarshipwalk">Scholarship Walk</a> while you wait.</p></div>
        ) : (
          <div className="sc-empty"><h2>Nothing matches that yet.</h2><p>Try fewer words, a different level, or <Link href="/scholarships">see everything</Link>. New scholarships come in every morning.</p>
            <p>Need money now? <a href="/apply/emergency-grant">The EFF Emergency Grant</a> pays a bill straight to the company, and <a href="/my-college">your college&rsquo;s own help</a> is listed too.</p></div>
        )}
        <section className="sc-box sc-trust">
          <h2>How REACH keeps this honest</h2>
          <ul>
            <li>Every link goes to the provider&rsquo;s own page. REACH never sends you to a scholarship search site.</li>
            <li>A passed deadline is never shown as open. When we don&rsquo;t know an amount, we say so.</li>
            <li>We never sell or share your information, and never will. No ads, no paid listings, never pay to apply.</li>
          </ul>
          <p className="sc-small">Know one we&rsquo;re missing? <Link href="/scholarships/missing">Tell us</Link> and a person checks it.</p>
        </section>
      </div>
      <Foot />
    </main>
  );
}
