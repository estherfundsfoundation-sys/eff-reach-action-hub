"use client";

/* REACH on Tour 2027 (15 Oct 2026, Shayna: "we dont use jotform anymore … this can be our intake process for high school,
   elementary, colleges and etc, chapter partnerships, ambassador, community affiliate etc and when we come in person …
   any high school, elementary or college will have to pay but we need to figure out pricing … like REACH on tour 2027").
   One intake for every way someone asks EFF to come. It replaces the old Jotform (262293112402041).
   Sends to MyEFF's anon eff_reach_tour_request (honeypot `website`, an adult must send it); the requester and
   nationals@ are emailed, the Executive Director is notified. National answers in National → Programs → REACH.
   No price is published here on purpose: prices are set by National and sent as a quote after a call.
   27 Oct 2026 (Shayna: "some low cost things for reach workshops are printing at your local school and for chapters
   hosting it themselves make sure the workshop request for funding reflects this"; "workshops support from nationals
   was up to $100 for pizza"): chapters and ambassadors hosting a REACH Workshop themselves see HOSTING below. */
import Link from "next/link";
import { useMemo, useState } from "react";
import { call, MYEFF } from "../myreach/pass";
import { SiteTop, SiteFoot } from "../myreach/ui";

type Kind = "school_visit" | "college_visit" | "community" | "chapter_partner" | "affiliate" | "ambassador_event" | "sponsor" | "other";

const KINDS: Array<{ key: Kind; title: string; line: string; paid?: boolean }> = [
  { key: "school_visit", title: "My K–12 school", line: "Elementary, middle or high school. Assemblies, classrooms, family nights.", paid: true },
  { key: "college_visit", title: "My college or university", line: "An office, department, program or student organization.", paid: true },
  { key: "community", title: "Church or community group", line: "Youth groups, churches, nonprofits, libraries, community centers." },
  { key: "chapter_partner", title: "My EFF chapter is hosting, or partnering", line: "Your chapter is hosting a REACH Workshop, or you want to bring REACH to a campus with an EFF chapter." },
  { key: "affiliate", title: "Become a community affiliate", line: "Your organization joins REACH's network of help for students." },
  { key: "ambassador_event", title: "I'm a Campus Ambassador", line: "Plan your REACH event and ask for food support for the room (up to $100)." },
  { key: "sponsor", title: "Sponsor a tour stop", line: "Help bring REACH to students who couldn't host it on their own." },
  { key: "other", title: "Something else", line: "Tell us what you have in mind." },
];

const HOSTING = [
  "Print handouts and flyers at your school (the library, your student union or your department often print for free or for pennies).",
  "Book a free room on campus through student activities or your residence hall.",
  "Partner with RAs, Residence Life, TRIO or student affairs. They often bring snacks, space and students.",
  "Use EFF's ready-made workshop on the big screen. Students join on their phones, so there's nothing to buy or print for the games.",
  "Ask campus offices (financial aid, counseling, the career center) for free handouts and a speaker.",
];

const AUDIENCE = [["elementary", "Elementary"], ["middle", "Middle school"], ["high", "High school"], ["college", "College students"], ["families", "Families"], ["educators", "Teachers & staff"], ["community", "Community"], ["faith", "Church / youth group"]] as const;
const OFFERINGS = [
  ["reach_talk", "REACH talk: every resource we offer"], ["workshop", "An interactive workshop"], ["game_night", "A game night (REACH Feud, Escape Room)"],
  ["service_drive", "A service drive"], ["family_night", "A family night"], ["assembly", "An assembly or keynote"],
  ["resource_table", "A resource table at a fair"], ["training", "Training for staff or student leaders"], ["virtual", "Something virtual"],
] as const;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_LABEL: Record<string, string> = { jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun", jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec" };
const FUNDING = [["school_budget", "School or district budget"], ["pta", "PTA / PTO"], ["title1", "Title I"], ["trio_gearup", "TRIO / GEAR UP"], ["student_affairs", "Student affairs / activities"], ["dept", "A department or program"], ["grant", "A grant"], ["sponsor", "A sponsor"], ["not_sure", "Not sure yet"]] as const;
const BUDGET = ["Under $500", "$500–$1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000 or more", "Not sure yet", "We would need a sponsor"];
const SIZE = ["Under 25", "25–50", "50–100", "100–250", "250–500", "500+"];
const STOPS = ["Workshops", "Game nights", "Service drives", "Family nights", "Every REACH resource", "Scholarships", "Emergency help", "Mental health", "Career"];

const knock = () => { try { fetch(`${MYEFF}/api/email/flush`, { method: "POST", mode: "no-cors", keepalive: true }).catch(() => {}); } catch { /* offline */ } };

function toggle(list: string[], v: string) { return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]; }

export default function TourRequest() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [f, setF] = useState({ org_name: "", org_type: "", city: "", state: "", contact_name: "", contact_title: "", email: "", phone: "", attendance: "", format: "in_person", budget: "", details: "", heard_from: "" });
  const [audience, setAudience] = useState<string[]>([]);
  const [offerings, setOfferings] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [funding, setFunding] = useState<string[]>([]);
  const [adult, setAdult] = useState(false);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ ref: string; isNew: boolean } | null>(null);

  const k = useMemo(() => KINDS.find((x) => x.key === kind) || null, [kind]);
  const visit = kind === "school_visit" || kind === "college_visit" || kind === "community" || kind === "chapter_partner" || kind === "ambassador_event";
  const pays = kind === "school_visit" || kind === "college_visit";
  const set = (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [key]: e.target.value });

  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!kind) { setErr("Choose what kind of request this is."); return; }
    setBusy(true);
    try {
      const r = await call<{ ok: boolean; ref?: string; new?: boolean }>("eff_reach_tour_request", {
        p: { ...f, kind, audience, offerings, months, funding, agree_adult: adult ? "true" : "", website: hp },
      });
      knock();
      setDone({ ref: r.ref || "", isNew: Boolean(r.new) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (x) { setErr(x instanceof Error ? x.message : "That didn't send. Try again."); }
    setBusy(false);
  }

  return (
    <div className="sc tr">
      <SiteTop />

      <section className="tr-stage" aria-labelledby="tr-title">
        <div className="tr-lights" aria-hidden="true"><i /><i /><i /></div>
        <div className="sc-wrap tr-copy">
          <span className="tr-kick">Esther Funds Foundation presents</span>
          {done ? (
            <>
              <h1 id="tr-title" className="tr-h">Your request <em>is in.</em></h1>
              <p className="tr-sub">{done.isNew ? "Thank you for asking us to come." : "Your request is updated."} Your reference is <b>{done.ref}</b>. We sent a copy to <b>{f.email}</b>: check your inbox (and spam). EFF National reads every request and will reach out to set up a short call.</p>
            </>
          ) : (
            <>
              <h1 id="tr-title" className="tr-h">REACH <em>on Tour</em> <span className="tr-year">2027</span></h1>
              <p className="tr-sub">We&rsquo;re bringing REACH to schools, colleges, churches and communities in person: the workshops, the game nights, the service, and every resource we offer, live in the room. Request a stop.</p>
              <a className="sc-btn coral tr-jump" href="#tr-form">Request a stop</a>
            </>
          )}
        </div>
        <div className="tr-marquee" aria-hidden="true"><div>{[...STOPS, ...STOPS].map((s, i) => <span key={i}>{s} <b>✦</b></span>)}</div></div>
      </section>

      <main className="sc-wrap tr-main">
        {done ? (
          <section className="tr-card">
            <h2>What happens next</h2>
            <ol className="tr-steps">
              <li><b>1</b><span>EFF National reads your request.</span></li>
              <li><b>2</b><span>We set up a short call about your students, your dates and what you&rsquo;d like us to bring.</span></li>
              <li><b>3</b><span>{pays ? "We send you a quote. Your visit is confirmed once we agree on the plan in writing." : "We agree on the plan together, in writing."}</span></li>
              <li><b>4</b><span>We plan the day with you.</span></li>
            </ol>
            <div className="sc-acts">
              <Link className="sc-btn" href="/resources">See every REACH resource</Link>
              <button type="button" className="sc-btn ghost" onClick={() => { setDone(null); setKind(null); }}>Send another request</button>
            </div>
          </section>
        ) : (
          <form id="tr-form" className="tr-card" onSubmit={send}>
            <h2>Who&rsquo;s asking?</h2>
            <div className="tr-kinds" role="radiogroup" aria-label="Kind of request">
              {KINDS.map((x) => (
                <button type="button" key={x.key} role="radio" aria-checked={kind === x.key} className={`tr-kind${kind === x.key ? " on" : ""}`} onClick={() => setKind(x.key)}>
                  <b>{x.title}</b><span>{x.line}</span>
                </button>
              ))}
            </div>
            <p className="sc-small tr-elsewhere">Want to <a href={`${MYEFF}/represent/ambassador`}>become a Campus Ambassador</a> or <a href={`${MYEFF}/chapters/apply`}>start an EFF chapter</a>? Those have their own applications.</p>

            {k ? (
              <>
                {pays ? (
                  <div className="tr-note">
                    <b>About cost.</b> In-person visits to schools and colleges are paid. After a short call we send a quote for what you&rsquo;d like us to bring. Every REACH tool stays free online for every student.
                  </div>
                ) : null}

                {kind === "chapter_partner" || kind === "ambassador_event" ? (
                  <div className="tr-note">
                    <b>Hosting a REACH Workshop yourselves?</b> EFF National can help with food only: <b>up to $100, for pizza</b>. That&rsquo;s all National can cover, and it isn&rsquo;t promised; ask early. We strongly encourage fundraising for anything else. Ways to keep it low-cost:
                    <ul className="tr-tips">{HOSTING.map((t) => <li key={t}>{t}</li>)}</ul>
                    In &ldquo;Tell us more&rdquo;, give your date, where, how many students, and how much food support you&rsquo;re asking for (up to $100).
                  </div>
                ) : null}

                <h3>{kind === "ambassador_event" ? "Your campus" : kind === "sponsor" ? "You or your organization" : "Your school or organization"}</h3>
                <div className="tr-row">
                  <label className="sc-field grow"><span>Name</span><input required maxLength={160} value={f.org_name} onChange={set("org_name")} placeholder={kind === "school_visit" ? "Washington High School" : kind === "college_visit" ? "Office of Student Success, Albany State University" : ""} /></label>
                  <label className="sc-field"><span>City</span><input required maxLength={80} value={f.city} onChange={set("city")} /></label>
                  <label className="sc-field tr-st"><span>State</span><input required maxLength={2} value={f.state} onChange={(e) => setF({ ...f, state: e.target.value.toUpperCase() })} placeholder="GA" /></label>
                </div>

                <h3>You</h3>
                <div className="tr-row">
                  <label className="sc-field"><span>Your name</span><input required autoComplete="name" maxLength={120} value={f.contact_name} onChange={set("contact_name")} /></label>
                  <label className="sc-field"><span>Your role (optional)</span><input maxLength={120} value={f.contact_title} onChange={set("contact_title")} placeholder="School counselor, director, pastor…" /></label>
                </div>
                <div className="tr-row">
                  <label className="sc-field"><span>Email</span><input required type="email" autoComplete="email" value={f.email} onChange={set("email")} /></label>
                  <label className="sc-field"><span>Phone (optional)</span><input type="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={set("phone")} /></label>
                </div>

                {visit ? (
                  <>
                    <h3>Who would be in the room?</h3>
                    <div className="tr-chips">{AUDIENCE.map(([v, l]) => <button type="button" key={v} aria-pressed={audience.includes(v)} className={audience.includes(v) ? "on" : ""} onClick={() => setAudience(toggle(audience, v))}>{l}</button>)}</div>
                    <label className="sc-field tr-one"><span>About how many people?</span>
                      <select value={f.attendance} onChange={set("attendance")}><option value="">Choose</option>{SIZE.map((s) => <option key={s}>{s}</option>)}</select>
                    </label>

                    <h3>What would you like us to bring?</h3>
                    <div className="tr-chips">{OFFERINGS.map(([v, l]) => <button type="button" key={v} aria-pressed={offerings.includes(v)} className={offerings.includes(v) ? "on" : ""} onClick={() => setOfferings(toggle(offerings, v))}>{l}</button>)}</div>
                    <p className="sc-small">Not sure? Leave these blank and we&rsquo;ll suggest something on the call. See <Link href="/workshops">every workshop</Link>.</p>

                    <h3>When in 2027?</h3>
                    <div className="tr-chips tr-months">{MONTHS.map((m) => <button type="button" key={m} aria-pressed={months.includes(m)} className={months.includes(m) ? "on" : ""} onClick={() => setMonths(toggle(months, m))}>{MONTH_LABEL[m]}</button>)}</div>
                    <div className="tr-chips">
                      {[["in_person", "In person"], ["virtual", "Virtual"], ["either", "Either"]].map(([v, l]) => <button type="button" key={v} aria-pressed={f.format === v} className={f.format === v ? "on" : ""} onClick={() => setF({ ...f, format: v })}>{l}</button>)}
                    </div>
                  </>
                ) : null}

                {pays || kind === "community" || kind === "sponsor" ? (
                  <>
                    <h3>{kind === "sponsor" ? "What would you like to give?" : "Budget"}</h3>
                    <label className="sc-field tr-one"><span>{kind === "sponsor" ? "About how much?" : "Roughly what can you spend?"}</span>
                      <select value={f.budget} onChange={set("budget")}><option value="">Choose</option>{BUDGET.map((s) => <option key={s}>{s}</option>)}</select>
                    </label>
                    {kind !== "sponsor" ? (
                      <>
                        <p className="sc-small">Where would the money come from? (choose any)</p>
                        <div className="tr-chips">{FUNDING.map(([v, l]) => <button type="button" key={v} aria-pressed={funding.includes(v)} className={funding.includes(v) ? "on" : ""} onClick={() => setFunding(toggle(funding, v))}>{l}</button>)}</div>
                      </>
                    ) : null}
                  </>
                ) : null}

                <h3>Tell us more</h3>
                <label className="sc-field"><span>{kind === "affiliate" ? "What does your organization do for students, and how would you like to work with REACH?" : kind === "chapter_partner" ? "Which chapter or campus, what you're planning (date, where, how many students), and any food support you need (up to $100)" : kind === "ambassador_event" ? "Your event: the date, where, how many students, what you're planning, and the food support you need (up to $100)" : "What do your students need, and what would make this a win?"}</span>
                  <textarea required minLength={20} maxLength={3000} rows={5} value={f.details} onChange={set("details")} />
                </label>
                <label className="sc-field tr-one"><span>How did you hear about REACH? (optional)</span><input maxLength={80} value={f.heard_from} onChange={set("heard_from")} /></label>

                <label className="tr-agree"><input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} /><span>I&rsquo;m 18 or older and I&rsquo;m asking on behalf of this school or organization. (Students: ask a teacher, counselor or advisor to send this.)</span></label>
                <label style={{ position: "absolute", left: -9999 }} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
                <p className="sc-small">Please don&rsquo;t include student names, ID numbers, passwords, payment details or medical information.</p>
                {err ? <p className="tr-err" role="alert">{err}</p> : null}
                <div className="sc-acts"><button className="sc-btn coral" disabled={busy}>{busy ? "Sending…" : "Send my request"}</button></div>
              </>
            ) : null}
          </form>
        )}
        <p className="sc-small">Questions? <a href="mailto:nationals@estherfundsinc.org">nationals@estherfundsinc.org</a>. In crisis? Call or text <a href="tel:988">988</a>.</p>
      </main>
      <SiteFoot />
    </div>
  );
}
