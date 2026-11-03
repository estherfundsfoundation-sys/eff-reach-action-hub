import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rpc, dueLabel, urgent, checkedOn, type Detail, type Deep } from "../lib";
import { Top, SaveButton, Foot } from "../parts";
import { CalendarButton, ReportProblem } from "./actions";
import "../scholarships.css";

/* One scholarship: what it is, when it closes, where to apply (the provider's own page),
   save it, put it in your calendar, or tell EFF something's wrong. Read from
   eff_scholarship(slug); reports go to eff_scholarship_report and land in
   MyEFF → National → Scholarships. */
async function load(slug: string) {
  try { return await rpc<Detail | null>("eff_scholarship", { p_slug: slug }); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) return { title: "Scholarship | REACH" };
  const desc = `${s.amount && /\d/.test(s.amount) ? `${s.amount}. ` : ""}${dueLabel(s)}.${s.sponsor ? ` Offered by ${s.sponsor}.` : ""} Found on REACH by Esther Funds Foundation.`;
  return { title: `${s.title} | REACH Scholarships`, description: desc, openGraph: { title: s.title, description: desc, images: [{ url: "/og.png", width: 1536, height: 1024, alt: "REACH Scholarships" }] } };
}

const LEVEL: Record<string, string> = { "high school": "High school", undergraduate: "College", graduate: "Grad school", "trade school": "Trade school", "community-college": "Community college", "middle school": "Middle school" };

const PROVIDER: Record<string, string> = { federal: "The federal government", state_agency: "A state agency", foundation: "A foundation", corporate: "A company", college: "A college", community: "A community group", other: "An organization" };

/* The checked facts, in plain words. Every line is what the provider's page states; a blank says so. */
function DeepFacts({ d }: { d: Deep }) {
  const deadline = d.rollover
    ? "Closed for this year. It usually opens again next cycle; we'll show the new date once we've checked it."
    : d.deadline_type === "fixed" && d.deadline_date
      ? `${new Date(`${d.deadline_date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${d.deadline_text ? ` · ${d.deadline_text}` : ""}`
      : d.deadline_type === "rolling" ? `Rolling: apply any time${d.deadline_text ? ` · ${d.deadline_text}` : ""}`
      : d.deadline_type === "varies_by_school" ? `Varies by school${d.deadline_text ? ` · ${d.deadline_text}` : ""}` : d.deadline_text || "Not stated on the provider's page.";
  const rows: Array<[string, string | null]> = [
    ["What you get", d.amount_text || "The provider's page doesn't state an amount."],
    ["Deadline", deadline],
    ["Who can apply", d.eligibility_text],
    ["Grade point average", d.gpa_min != null ? `${Number(d.gpa_min).toFixed(d.gpa_min % 1 ? 2 : 1)} or higher` : null],
    ["Where you live", d.states?.length ? d.states.join(", ") : d.state_residency && d.state_residency !== "any" ? d.state_residency : "Any state"],
    ["Level", d.level && d.level !== "any" ? d.level.replace("_", " ") : null],
    ["Enrollment", d.enrollment === "full_time" ? "Full-time" : d.enrollment === "part_time" ? "Part-time" : null],
    ["Citizenship", d.citizenship],
    ["Field of study", d.major_field && !/^any/i.test(d.major_field) ? d.major_field : null],
    ["Made for", d.demographic_focus && !/^open$/i.test(d.demographic_focus) ? d.demographic_focus : null],
    ["Essay", d.essay_required === true ? "Yes" : d.essay_required === false ? "No essay" : null],
    ["Renewable", d.renewable === true ? "Yes, you can keep it in later years" : d.renewable === false ? "One time" : null],
    ["Awards each year", d.num_awards ? d.num_awards.toLocaleString() : null],
    ["Offered by", d.provider ? `${d.provider}${d.provider_type ? ` (${PROVIDER[d.provider_type] || ""})` : ""}` : null],
  ];
  return (
    <section className="sc-box sc-deep">
      <div className="sc-deep-top">
        {d.verified ? <span className="sc-checked">✓ Checked by EFF on the provider&rsquo;s own page</span> : <span className="sc-checked wait">EFF is re-checking this one</span>}
        <span className="sc-small">Last checked {checkedOn(d.last_verified_at) || "not yet"}</span>
      </div>
      <dl className="sc-facts">{rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <div className="sc-acts">
        {d.source_url ? <a className="sc-btn ghost sm" href={d.source_url} target="_blank" rel="noopener noreferrer">Where these facts came from ↗</a> : null}
      </div>
      <p className="sc-small" style={{ margin: "8px 0 0" }}>The provider decides who qualifies. If anything here doesn&rsquo;t match their page, their page is right, and please tell us below.</p>
    </section>
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) notFound();
  const e = s.eligibility ?? {};
  const residency = Array.isArray(e.residency) ? (e.residency as string[]) : [];
  const fields = Array.isArray(e.fields_of_study) ? (e.fields_of_study as string[]) : [];
  const schools = Array.isArray(e.institutions) ? (e.institutions as string[]) : [];
  const gpa = typeof e.gpa_min === "number" && e.gpa_min > 0 ? e.gpa_min : null;
  const hasAmount = s.amount && /\d/.test(s.amount);

  return (
    <main className="sc">
      <Top on="" />
      <div className="sc-wrap">
        <article className="sc-detail">
          <Link className="sc-back" href="/scholarships">← All scholarships</Link>
          <div><span className={`sc-due${urgent(s) ? " hot" : ""}`}>{s.current ? dueLabel(s) : s.deep?.rollover ? "Closed for this year · expected again, not confirmed" : "This one has closed"}</span></div>
          <h1>{s.title}</h1>
          {s.sponsor ? <p className="sc-small" style={{ fontSize: 17 }}>Offered by {s.sponsor}</p> : null}
          <div className="sc-bigamt">{hasAmount ? s.amount : <span className="sc-amt quiet">{s.deep ? "Amount not stated on the provider\u2019s page" : "Amount varies: see the provider\u2019s page"}</span>}</div>

          <div className="sc-acts">
            {s.current ? <a className="sc-btn coral" href={s.url} target="_blank" rel="noopener noreferrer">Apply on their site ↗</a> : null}
            <SaveButton slug={s.slug} />
            {s.deadline && s.current ? <CalendarButton item={{ slug: s.slug, title: s.title, sponsor: s.sponsor, deadline: s.deadline }} /> : null}
          </div>

          {s.deep ? <DeepFacts d={s.deep} /> : null}

          {!s.deep && (s.levels?.length || residency.length || fields.length || schools.length || gpa) ? (
            <section className="sc-box">
              <h2>Who it&rsquo;s for</h2>
              <div className="sc-chips">
                {(s.levels ?? []).map((l) => <span className="sc-chip" key={l}>{LEVEL[l] ?? l}</span>)}
                {residency.map((r) => <span className="sc-chip" key={r}>Lives in {r}</span>)}
                {schools.map((x) => <span className="sc-chip" key={x}>{x} students</span>)}
                {fields.slice(0, 6).map((f) => <span className="sc-chip" key={f}>{f}</span>)}
                {gpa ? <span className="sc-chip">{gpa.toFixed(1)}+ GPA</span> : null}
              </div>
              <p className="sc-small">This is what the listing says. The provider&rsquo;s page has the full rules and decides who qualifies.</p>
            </section>
          ) : null}

          {s.summary ? <section className="sc-box"><h2>About it</h2><p style={{ margin: 0 }}>{s.summary}</p></section> : null}

          <section className="sc-box">
            <h2>Before you apply</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Open the provider&rsquo;s page and check the deadline, the time zone and who can apply.</li>
              <li>Real scholarships never make you pay to apply or ask for bank or card details.</li>
              <li>Stuck on the essay? Use the free <Link href="/scholarships/toolkits">essay and planner toolkits</Link>.</li>
            </ul>
          </section>

          <section className="sc-box">
            <h2>Where this came from</h2>
            <p style={{ margin: 0 }}>
              Listed by <a href={s.source.url} target="_blank" rel="noopener noreferrer">{s.source.name}</a>
              {s.seen ? ` · seen ${new Date(s.seen).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
              {s.checked ? ` · link checked ${new Date(s.checked).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}.
              {" "}{s.source.note ? <span className="sc-small">{s.source.note}</span> : null}
            </p>
            <p className="sc-small" style={{ margin: "8px 0 0" }}>Esther Funds Foundation doesn&rsquo;t run this scholarship, pick winners or see applications.</p>
          </section>

          <ReportProblem slug={s.slug} />
        </article>
      </div>
      <Foot />
    </main>
  );
}
