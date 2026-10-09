"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SiteFoot, SiteTop } from "../myreach/ui";
import { MYEFF } from "../myreach/pass";
import { rpc } from "../scholarships/lib";
import { Icon } from "./icons";

/* REACH Emergency: a private, step-by-step emergency plan. The student answers five short
   questions; MyEFF's /api/reach/emergency builds the plan from EFF's directory (checked every
   morning, dead links hide themselves), her campus (EFF chapter + aid links National checked),
   local help nearest first, FEMA's live disaster data for her state, and (when switched on) a live
   web search for her own campus fund and local help. Nothing she answers is stored: MyEFF keeps
   counts by need and state only. The ZIP code never leaves this page. National runs the
   directory from MyEFF → National → Scholarships → REACH Emergency. */

type Need = { key: string; label: string };
const NEEDS: Need[] = [
  { key: "money", label: "A sudden bill or expense" },
  { key: "housing", label: "Rent, eviction or nowhere to stay" },
  { key: "food", label: "Food" },
  { key: "hygiene", label: "Hygiene or period supplies" },
  { key: "bills", label: "Lights, water, gas or phone" },
  { key: "school", label: "A hold, balance or aid problem" },
  { key: "health", label: "Medical, dental or prescriptions" },
  { key: "mind", label: "My mental health" },
  { key: "safety", label: "Abuse, assault or I don't feel safe" },
  { key: "tech", label: "Laptop or internet" },
  { key: "ride", label: "Car, gas or getting around" },
  { key: "child", label: "My child (care, diapers, food)" },
  { key: "legal", label: "Legal or immigration" },
  { key: "disaster", label: "A storm, fire or flood" },
  { key: "loss", label: "Someone I love died" },
];
const FLAGS: Array<[string, string]> = [
  ["foster", "I was in foster care"], ["parent", "I'm a parent or pregnant"], ["undocumented", "I'm undocumented or have DACA"],
  ["lgbtq", "I'm LGBTQ+"], ["working", "I work 20+ hours a week"], ["veteran", "I'm a veteran"],
  ["poc", "I'm a student of color"], ["homeless", "I don't have a stable place to live"],
];
const WHEN: Array<[string, string, string]> = [["today", "Today", "It can't wait"], ["week", "This week", "Something is due soon"], ["month", "This month", "I see it coming"]];
const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR".split(" ");
const AID_NEEDS = ["money", "school", "housing", "bills", "loss", "disaster"];

type Res = { slug: string; needs: string[]; title: string; provider: string | null; what: string; how: string | null; url: string | null; phone: string | null; sms: string | null; kind: string; found: boolean; warning: string | null };
type Local = { id: string; name: string; summary: string | null; url: string | null; phone: string | null; city: string | null; state: string | null; address: string | null; source: string };
type Web = { title: string; org: string | null; what: string; how: string | null; url: string; phone: string | null; scope: string; need: string | null };
type Plan = {
  resources: Res[]; ended: Array<{ slug: string; title: string; what: string; warning: string | null }>;
  grant: { open: boolean; key: string; closes_at: string | null } | null;
  state: string | null; campus: { institution?: { id: string; name: string; city: string | null; state: string | null }; chapter?: { name: string; slug: string } | null; links?: Array<{ kind: string; label: string; url: string }> } | null;
  nearby: Local[]; fema: Array<{ number: number; title: string; type: string; declared: string; areas: string[]; url: string }>;
  web: Web[] | null; web_available: boolean; error?: string;
};
type School = { id: string; name: string; city: string; state: string; is_hbcu: boolean; has_chapter: boolean };

const tel = (p: string) => `tel:${p.replace(/[^0-9+]/g, "")}`;
const q = (s: string) => `https://www.google.com/search?q=${encodeURIComponent(s)}`;

function ResCard({ r }: { r: Res }) {
  return (
    <article className={`em-card${r.kind === "hotline" ? " hot" : ""}`}>
      <div className="em-tags">
        {r.kind === "hotline" ? <span className="em-tag hot">24/7 line</span> : r.kind === "federal" ? <span className="em-tag">Government</span> : <span className="em-tag">National</span>}
        {r.found ? <span className="em-tag web">Found on the web</span> : null}
      </div>
      <h4>{r.title}</h4>
      {r.provider ? <p className="em-prov">{r.provider}</p> : null}
      <p>{r.what}</p>
      {r.how ? <p className="em-how"><b>How:</b> {r.how}</p> : null}
      {r.warning ? <p className="em-warn"><Icon name="alert" size={16} /><span><b>Heads up.</b> {r.warning}</span></p> : null}
      <div className="em-acts">
        {r.phone ? <a className="sc-btn sm" href={tel(r.phone)}><Icon name="phone" size={17} />{r.phone}</a> : null}
        {r.sms ? <span className="em-sms"><Icon name="text" size={17} />{r.sms}</span> : null}
        {r.url ? <a className="sc-btn sm ghost" href={r.url} target="_blank" rel="noopener noreferrer">Open their page <Icon name="out" size={15} /></a> : null}
      </div>
    </article>
  );
}

function Step({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="em-step">
      <div className="em-num" aria-hidden="true" />
      <div className="em-body"><h3>{title}</h3>{sub ? <p className="em-sub">{sub}</p> : null}{children}</div>
    </section>
  );
}

function WebCard({ w }: { w: Web }) {
  return (
    <article className="em-card web">
      <div className="em-tags"><span className="em-tag web">{w.scope === "campus" ? "Your campus" : w.scope === "national" ? "National" : "Near you"} · found on the web</span></div>
      <h4>{w.title}</h4>
      {w.org ? <p className="em-prov">{w.org}</p> : null}
      <p>{w.what}</p>
      {w.how ? <p className="em-how"><b>How:</b> {w.how}</p> : null}
      <div className="em-acts">
        {w.phone ? <a className="sc-btn sm" href={tel(w.phone)}><Icon name="phone" size={17} />{w.phone}</a> : null}
        <a className="sc-btn sm ghost" href={w.url} target="_blank" rel="noopener noreferrer">Open their page <Icon name="out" size={15} /></a>
      </div>
    </article>
  );
}

export default function Emergency() {
  const [step, setStep] = useState(0);
  const [crisis, setCrisis] = useState(false);
  const [needs, setNeeds] = useState<string[]>([]);
  const [when, setWhen] = useState("");
  const [query, setQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [web, setWeb] = useState<{ state: "idle" | "loading" | "done" | "off"; items: Web[] }>({ state: "idle", items: [] });
  const [copied, setCopied] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => { top.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step, crisis]);
  useEffect(() => {
    if (school || query.trim().length < 2) { setSchools([]); return; }
    const t = setTimeout(() => rpc<School[]>("eff_search_institutions", { p_query: query, p_limit: 6 }).then(setSchools).catch(() => setSchools([])), 220);
    return () => clearTimeout(t);
  }, [query, school]);

  const toggle = (list: string[], k: string) => (list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);
  const where = school ? school.name : state;

  async function build() {
    setStep(5); setLoading(true); setPlan(null); setWeb({ state: "idle", items: [] });
    const body = { needs, state: school ? school.state : state, institution: school?.id || null, flags };
    try {
      const r = await fetch(`${MYEFF}/api/reach/emergency`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = (await r.json()) as Plan;
      if (!r.ok) throw new Error(d.error || "failed");
      setPlan(d);
      if (d.web && d.web.length) setWeb({ state: "done", items: d.web });
      else if (d.web_available && d.web === null) {
        setWeb({ state: "loading", items: [] });
        fetch(`${MYEFF}/api/reach/emergency/web`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
          .then((x) => x.json()).then((x: { results?: Web[] }) => setWeb({ state: "done", items: x.results || [] }))
          .catch(() => setWeb({ state: "done", items: [] }));
      } else setWeb({ state: d.web_available ? "done" : "off", items: d.web || [] });
    } catch {
      /* the plan still works from the public directory if MyEFF's route is unreachable */
      const d = await rpc<Plan>("eff_emergency_public", { p_needs: needs, p_state: body.state || null, p_flags: flags }).catch(() => null);
      setPlan(d ? { ...d, state: body.state || null, campus: school ? { institution: { id: school.id, name: school.name, city: school.city, state: school.state } } : null, nearby: [], fema: [], web: null, web_available: false } : null);
      setWeb({ state: "off", items: [] });
    }
    setLoading(false);
  }

  const groups = useMemo(() => {
    if (!plan) return { aid: [] as Res[], hot: [] as Res[], byNeed: [] as Array<[Need, Res[]]> };
    const aid = plan.resources.filter((r) => r.slug === "aid-not-enough" || r.slug === "homeless-determination");
    const rest = plan.resources.filter((r) => !aid.includes(r));
    const hot = rest.filter((r) => r.kind === "hotline" && r.needs.some((x) => ["mind", "safety", "loss"].includes(x) && needs.includes(x)));
    const used = new Set(hot.map((r) => r.slug));
    const byNeed: Array<[Need, Res[]]> = [];
    for (const n of NEEDS.filter((x) => needs.includes(x.key))) {
      const list = rest.filter((r) => r.needs.includes(n.key) && !used.has(r.slug));
      list.forEach((r) => used.add(r.slug));
      if (list.length) byNeed.push([n, list]);
    }
    return { aid, hot, byNeed };
  }, [plan, needs]);

  const campusName = plan?.campus?.institution?.name || school?.name || null;
  const webCampus = web.items.filter((w) => w.scope === "campus");
  const webNear = web.items.filter((w) => w.scope !== "campus");
  const script = `Hi, I'm a student${campusName ? ` at ${campusName}` : ""} and I'm dealing with ${NEEDS.filter((n) => needs.includes(n.key)).map((n) => n.label.toLowerCase()).join(", ")}. Does the school have an emergency grant or basic needs fund? Who runs it, what do I send, and how fast is a decision? Can it be paid straight to my landlord or the company I owe? And can financial aid look at my aid again because my situation changed?`;

  async function copy(text: string) { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* fine */ } }
  function restart() { setStep(0); setCrisis(false); setNeeds([]); setWhen(""); setSchool(null); setQuery(""); setState(""); setZip(""); setFlags([]); setPlan(null); }

  return (
    <div className="sc em">
      <SiteTop on="/emergency" />
      <div className="em-alert" role="note">In danger right now? Call <a href="tel:911">911</a>. Thinking about suicide or in crisis? Call or text <a href="tel:988">988</a>.</div>
      <main ref={top}>
        {step < 5 ? (
          <section className="em-hero"><div className="sc-wrap">
            <div className="em-lantern" aria-hidden="true"><i /><i /><i /></div>
            <span className="sc-kick"><span className="dot" />REACH Emergency · private</span>
            <h1>Let&rsquo;s make a <em>plan</em>.</h1>
            <p>Five quick questions, then a step-by-step plan built for you: your campus, help near you, and what&rsquo;s open right now on the web. Your answers aren&rsquo;t saved anywhere.</p>
            <ol className="em-dots" aria-label="Progress">{[0, 1, 2, 3, 4].map((i) => <li key={i} className={i < step ? "done" : i === step ? "on" : ""} />)}</ol>
          </div></section>
        ) : null}

        <div className="sc-wrap em-stage">
          {step === 0 && !crisis ? (
            <div className="em-q" key="q0">
              <h2>First: are you safe right now?</h2>
              <div className="em-big">
                <button type="button" className="em-choice danger" onClick={() => setCrisis(true)}><b>I&rsquo;m not safe</b><span>Someone is hurting me, or I&rsquo;m thinking about hurting myself</span></button>
                <button type="button" className="em-choice" onClick={() => setStep(1)}><b>I&rsquo;m safe</b><span>I need help with something that&rsquo;s going on</span></button>
              </div>
            </div>
          ) : null}

          {crisis ? (
            <div className="em-q em-crisis" key="crisis">
              <h2>You matter. Reach someone now.</h2>
              <div className="em-lines">
                <a className="em-line red" href="tel:911"><Icon name="phone" /><b>911</b><span>If you&rsquo;re in danger right now</span></a>
                <a className="em-line" href="tel:988"><Icon name="phone" /><b>Call 988</b><span>Suicide & Crisis Lifeline, 24/7</span></a>
                <a className="em-line" href="sms:988"><Icon name="text" /><b>Text 988</b><span>If talking out loud is too much</span></a>
                <a className="em-line" href="sms:741741&body=HOME"><Icon name="text" /><b>Text HOME to 741741</b><span>Crisis Text Line</span></a>
                <a className="em-line" href="tel:18006564673"><Icon name="phone" /><b>800-656-4673</b><span>RAINN, sexual assault, 24/7</span></a>
                <a className="em-line" href="tel:18007997233"><Icon name="phone" /><b>1-800-799-7233</b><span>Domestic violence, 24/7. Text START to 88788</span></a>
                <a className="em-line" href="tel:18664887386"><Icon name="phone" /><b>1-866-488-7386</b><span>The Trevor Project, LGBTQ+ under 25</span></a>
              </div>
              <p className="em-sub">When you&rsquo;re safe, come back. We&rsquo;ll make the rest of the plan together.</p>
              <button type="button" className="sc-btn ghost" onClick={() => { setCrisis(false); setStep(1); }}>I&rsquo;m safe now, keep going</button>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="em-q" key="q1">
              <h2>What&rsquo;s going on?</h2>
              <p className="em-sub">Pick everything that fits. It&rsquo;s okay if it&rsquo;s a lot.</p>
              <div className="em-chips">
                {NEEDS.map((x) => (
                  <button key={x.key} type="button" aria-pressed={needs.includes(x.key)} className={needs.includes(x.key) ? "on" : ""} onClick={() => setNeeds(toggle(needs, x.key))}>
                    <span className="em-ico"><Icon name={x.key} /></span><span className="em-lbl">{x.label}</span><span className="em-tick"><Icon name="check" size={14} /></span>
                  </button>
                ))}
              </div>
              <div className="em-nav"><button type="button" className="sc-btn ghost" onClick={() => setStep(0)}>Back</button><button type="button" className="sc-btn" disabled={!needs.length} onClick={() => setStep(2)}>Next</button></div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="em-q" key="q2">
              <h2>How soon do you need help?</h2>
              <div className="em-big three">
                {WHEN.map(([k, l, s]) => <button key={k} type="button" className={`em-choice${when === k ? " on" : ""}`} onClick={() => { setWhen(k); setStep(3); }}><b>{l}</b><span>{s}</span></button>)}
              </div>
              <div className="em-nav"><button type="button" className="sc-btn ghost" onClick={() => setStep(1)}>Back</button></div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="em-q" key="q3">
              <h2>Where do you go to school?</h2>
              <p className="em-sub">Your campus is where most emergency money comes from, so this matters most.</p>
              {school ? (
                <div className="em-picked"><b>{school.name}</b><span>{school.city}, {school.state}</span><button type="button" className="sc-btn sm ghost" onClick={() => { setSchool(null); setQuery(""); }}>Change</button></div>
              ) : (
                <label className="sc-field">Search your school
                  <input type="search" placeholder="e.g. Florida A&M, Grambling, UNC Charlotte" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
                </label>
              )}
              {!school && schools.length ? (
                <ul className="em-results">{schools.map((s) => <li key={s.id}><button type="button" onClick={() => { setSchool(s); setState(s.state); setSchools([]); }}><b>{s.name}</b><span>{s.city}, {s.state}{s.has_chapter ? " · EFF chapter" : ""}</span></button></li>)}</ul>
              ) : null}
              {!school ? (
                <label className="sc-field" style={{ marginTop: 12 }}>School not listed? Pick your state
                  <select value={state} onChange={(e) => setState(e.target.value)}><option value="">Choose a state</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
              ) : null}
              <label className="sc-field" style={{ marginTop: 12 }}>ZIP code (optional, stays on this phone)
                <input inputMode="numeric" maxLength={5} placeholder="For 211 and food bank links" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} />
              </label>
              <div className="em-nav"><button type="button" className="sc-btn ghost" onClick={() => setStep(2)}>Back</button><button type="button" className="sc-btn" disabled={!school && !state} onClick={() => setStep(4)}>Next</button></div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="em-q" key="q4">
              <h2>Is any of this true for you?</h2>
              <p className="em-sub">Optional. Some help is only for certain students, so this finds more of it. Nothing is saved.</p>
              <div className="em-chips small">
                {FLAGS.map(([k, l]) => <button key={k} type="button" aria-pressed={flags.includes(k)} className={flags.includes(k) ? "on" : ""} onClick={() => setFlags(toggle(flags, k))}>{l}</button>)}
              </div>
              <div className="em-nav"><button type="button" className="sc-btn ghost" onClick={() => setStep(3)}>Back</button><button type="button" className="sc-btn coral" onClick={build}>Build my plan</button></div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="em-plan" key="plan">
              {loading ? (
                <div className="em-loading" role="status"><div className="em-lantern big" aria-hidden="true"><i /><i /><i /></div><p>Building your plan{where ? ` for ${where}` : ""}…</p></div>
              ) : !plan ? (
                <div className="em-q"><h2>The plan didn&rsquo;t load.</h2><p className="em-sub">Check your connection and try again. If it&rsquo;s urgent, call 211 or text 988.</p><button type="button" className="sc-btn" onClick={build}>Try again</button></div>
              ) : (
                <>
                  <header className="em-plan-head">
                    <span className="sc-kick"><span className="dot" />Your plan{when === "today" ? " · start now" : ""}</span>
                    <h1>Here&rsquo;s your <em>plan</em>.</h1>
                    <p>Take it one step at a time. You don&rsquo;t have to do it all tonight.</p>
                    <div className="sc-acts">
                      <button type="button" className="sc-btn sm" onClick={() => window.print()}>Save or print</button>{" "}
                      <button type="button" className="sc-btn sm ghost" onClick={restart}>Start over</button>
                    </div>
                  </header>

                  {plan.fema.length ? (
                    <div className="em-fema" role="alert">
                      <b className="em-fema-h"><Icon name="storm" />FEMA disaster help is open in {plan.state}.</b>
                      {plan.fema.map((f) => <p key={f.number}>{f.title} (declared {new Date(`${f.declared}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}){f.areas.length ? `: ${f.areas.slice(0, 6).join(", ")}${f.areas.length > 6 ? "…" : ""}` : ""}. <a href={f.url} target="_blank" rel="noopener noreferrer">Details <Icon name="out" size={15} /></a></p>)}
                      <a className="sc-btn sm" href="https://www.disasterassistance.gov/" target="_blank" rel="noopener noreferrer">Apply at DisasterAssistance.gov <Icon name="out" size={15} /></a>
                    </div>
                  ) : null}

                  {groups.hot.length && (when === "today" || needs.includes("mind") || needs.includes("safety")) ? (
                    <Step title="Talk to someone tonight" sub="Free, private, 24/7. You don't have to be in crisis to call.">
                      <div className="em-grid">{groups.hot.map((r) => <ResCard key={r.slug} r={r} />)}</div>
                    </Step>
                  ) : null}

                  <Step title={`Go to ${campusName || "your campus"} first`} sub="Your college is the main place emergency money comes from: usually a one-time grant, often a few hundred dollars up to about $1,000, sometimes decided in days.">
                    <div className="em-script">
                      <p><b>Ask the Dean of Students, financial aid or the basic needs office. Say:</b></p>
                      <blockquote>&ldquo;{script}&rdquo;</blockquote>
                      <button type="button" className="sc-btn sm" onClick={() => copy(script)}><Icon name={copied ? "check" : "copy"} size={17} />{copied ? "Copied" : "Copy what to say"}</button>
                      <p className="em-sub" style={{ marginTop: 10 }}><b>Have ready:</b> your student ID or class schedule, the bill or estimate, your lease if it&rsquo;s housing, and two sentences about what happened.</p>
                    </div>
                    {plan.campus?.links?.length ? (
                      <div className="em-grid">{plan.campus.links.map((l) => <article key={l.url} className="em-card"><div className="em-tags"><span className="em-tag">Checked by EFF</span></div><h4>{l.label}</h4><div className="em-acts"><a className="sc-btn sm ghost" href={l.url} target="_blank" rel="noopener noreferrer">Open <Icon name="out" size={15} /></a></div></article>)}</div>
                    ) : null}
                    {webCampus.length ? <div className="em-grid">{webCampus.map((w) => <WebCard key={w.url} w={w} />)}</div> : null}
                    {web.state === "loading" ? <p className="em-searching"><span className="em-spin" aria-hidden="true" />Searching {campusName ? `${campusName}'s website` : "the web"} for its emergency fund…</p> : null}
                    {campusName && !webCampus.length && web.state !== "loading" ? (
                      <p className="em-sub"><a href={q(`${campusName} student emergency grant fund`)} target="_blank" rel="noopener noreferrer">Search for {campusName}&rsquo;s emergency fund <Icon name="out" size={15} /></a> · <a href={q(`${campusName} food pantry basic needs`)} target="_blank" rel="noopener noreferrer">its food pantry <Icon name="out" size={15} /></a></p>
                    ) : null}
                    {plan.campus?.chapter ? <p className="em-sub em-chap">There&rsquo;s an EFF chapter on your campus: <Link href={`https://my.estherfundsfoundation.org/chapters/${plan.campus.chapter.slug}`}>{plan.campus.chapter.name}</Link>. They can walk with you.</p> : null}
                  </Step>

                  {groups.aid.length && needs.some((x) => AID_NEEDS.includes(x)) ? (
                    <Step title="Ask financial aid to look at your aid again" sub="When life changes, your aid can change too. This is one of the most powerful things you can ask for.">
                      <div className="em-grid">{groups.aid.map((r) => <ResCard key={r.slug} r={r} />)}</div>
                    </Step>
                  ) : null}

                  {(plan.nearby.length || webNear.length || zip || plan.state) ? (
                    <Step title="Help near you" sub="Call first to make sure you qualify and they serve your area.">
                      {plan.nearby.length ? <div className="em-grid">{plan.nearby.map((l) => (
                        <article key={l.id} className="em-card"><div className="em-tags"><span className="em-tag">{l.source === "hud" ? "HUD counselor" : "Local"}</span></div><h4>{l.name}</h4>{l.summary ? <p>{l.summary}</p> : null}{l.address ? <p className="em-prov">{l.address}</p> : null}
                          <div className="em-acts">{l.phone ? <a className="sc-btn sm" href={tel(l.phone)}><Icon name="phone" size={17} />{l.phone}</a> : null}{l.url ? <a className="sc-btn sm ghost" href={l.url} target="_blank" rel="noopener noreferrer">Open <Icon name="out" size={15} /></a> : null}</div></article>
                      ))}</div> : null}
                      {webNear.length ? <div className="em-grid">{webNear.map((w) => <WebCard key={w.url} w={w} />)}</div> : null}
                      <div className="em-acts" style={{ marginTop: 10 }}>
                        <a className="sc-btn sm" href="tel:211"><Icon name="phone" size={17} />Call 211</a>
                        <a className="sc-btn sm ghost" href={zip ? `https://www.findhelp.org/search_results/${zip}` : "https://www.findhelp.org/"} target="_blank" rel="noopener noreferrer">findhelp.org{zip ? ` for ${zip}` : ""} <Icon name="out" size={15} /></a>
                        {needs.includes("food") ? <a className="sc-btn sm ghost" href="https://www.feedingamerica.org/find-your-local-foodbank" target="_blank" rel="noopener noreferrer">Food banks <Icon name="out" size={15} /></a> : null}
                        <Link className="sc-btn sm ghost" href="/get-help">More on Get Help</Link>
                      </div>
                    </Step>
                  ) : null}

                  {groups.byNeed.length ? (
                    <Step title="Help for exactly what you're facing" sub="Government and national programs. EFF opens every one of these links each morning.">
                      {groups.byNeed.map(([need, list]) => (
                        <div key={need.key} className="em-need"><h4 className="em-needh"><span className="em-ico sm"><Icon name={need.key} size={18} /></span>{need.label}</h4><div className="em-grid">{list.map((r) => <ResCard key={r.slug} r={r} />)}</div></div>
                      ))}
                    </Step>
                  ) : null}

                  {groups.hot.length && !(when === "today" || needs.includes("mind") || needs.includes("safety")) ? (
                    <Step title="If it gets heavy" sub="Free, private, 24/7.">
                      <div className="em-grid">{groups.hot.map((r) => <ResCard key={r.slug} r={r} />)}</div>
                    </Step>
                  ) : null}

                  <Step title="EFF has your back" sub="You're not doing this alone.">
                    <div className="em-grid">
                      <article className="em-card eff"><h4>Talk to a real person at EFF</h4><p>Tell us what&rsquo;s going on. A person reads it, and you get a code to follow it.</p><div className="em-acts"><a className="sc-btn sm" href={`${MYEFF}/lighthouse`}>Ask EFF for help</a></div></article>
                      <article className="em-card eff"><h4>EFF Emergency Grant</h4>{plan.grant?.open ? <><p>It&rsquo;s open right now. Apply with your My REACH account.</p><div className="em-acts"><Link className="sc-btn sm coral" href={`/apply/${plan.grant.key}`}>Apply now</Link></div></> : <><p>Not open right now. Get one email the moment it opens.</p><div className="em-acts"><Link className="sc-btn sm" href="/notify">Tell me when it opens</Link></div></>}</article>
                      {needs.includes("food") ? <article className="em-card eff"><h4>REACH Emergency Food Request</h4><p>For enrolled college students facing an urgent food emergency.</p><div className="em-acts"><a className="sc-btn sm" href="https://form.jotform.com/262448222885060" target="_blank" rel="noopener noreferrer">Request food help <Icon name="out" size={15} /></a></div></article> : null}
                      {needs.includes("school") || needs.includes("money") ? <article className="em-card eff"><h4>The Survival Kit</h4><p>Can I still register? Write my appeal letter. Help near my campus.</p><div className="em-acts"><a className="sc-btn sm" href={`${MYEFF}/kit`}>Open the kit</a> <a className="sc-btn sm ghost" href={`${MYEFF}/kit/pell`}>Check my Pell</a></div></article> : null}
                      {needs.includes("money") || needs.includes("bills") ? <article className="em-card eff"><h4>Free money you&rsquo;re owed</h4><p>Tax credits, free software and student prices EFF checks every morning.</p><div className="em-acts"><Link className="sc-btn sm" href="/freebies">See freebies</Link> <Link className="sc-btn sm ghost" href="/scholarships">Scholarships</Link></div></article> : null}
                      {needs.includes("safety") ? <article className="em-card eff"><h4>Journey</h4><p>For college survivors of sexual assault: letters to professors that don&rsquo;t say what happened, your rights, and calm when it&rsquo;s loud.</p><div className="em-acts"><a className="sc-btn sm" href={`${MYEFF}/journey`}>Open Journey</a></div></article> : null}
                      {needs.includes("mind") || needs.includes("loss") ? <article className="em-card eff"><h4>Selah</h4><p>A quiet space: soft music, a verse and a breathing timer when your mind is loud.</p><div className="em-acts"><a className="sc-btn sm" href="https://selah.estherfundsfoundation.org/">Take a breath</a></div></article> : null}
                    </div>
                  </Step>

                  {plan.ended.length ? (
                    <section className="em-ended"><h3>Heads up: these ended</h3><p className="em-sub">You may still see them online. Don&rsquo;t count on them.</p>
                      <ul>{plan.ended.map((e) => <li key={e.slug}><b>{e.title}.</b> {e.warning || e.what}</li>)}</ul></section>
                  ) : null}

                  <section className="em-scam"><h3><Icon name="flag" />Real help never charges you</h3>
                    <p>If anyone asks for a fee, your bank or card number &ldquo;to confirm eligibility,&rdquo; your StudentAid.gov login, or &ldquo;guarantees&rdquo; you a grant, it&rsquo;s a scam. A job that sends you a check and asks you to send some back is a scam. Report it at <a href="https://reportfraud.ftc.gov/" target="_blank" rel="noopener noreferrer">ReportFraud.ftc.gov</a> and tell your financial aid office.</p></section>

                  <p className="em-foot">{web.state === "off" ? "This plan comes from EFF's checked directory and live local listings." : "This plan comes from EFF's checked directory, live local listings, FEMA's disaster data and a live web search. Web results are found automatically: check their page before you share personal information."} Nothing you answered was saved.</p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </main>
      <SiteFoot />
    </div>
  );
}
