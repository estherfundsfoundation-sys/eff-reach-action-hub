"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteTop, SiteFoot } from "../myreach/ui";
import LibCard from "../content/LibCard";
import { CATS, GROUPS, NEEDS, ORDER, STAGES, WHO, fits, madeFor, readMe, saveMe, type Me } from "../content/library";
import { useLibrary } from "../content/useLibrary";

/* REACH Start here (2 Nov 2026): "Who are you?", then for students three private questions
   (where you are, what's true about you, what's on your mind) and a guide built from the REACH
   Library for exactly that student. The answers stay in this browser (reach-me) and nothing is sent. */
export default function Start() {
  const { items } = useLibrary();
  const [me, setMe] = useState<Me | null>(null);
  const [step, setStep] = useState<"who" | "stage" | "groups" | "needs" | "plan">("who");
  const [draft, setDraft] = useState<Me>({ who: "student", stage: "", groups: [], needs: [] });
  useEffect(() => {
    const m = readMe();
    if (m?.who === "student" && m.stage) { setMe(m); setDraft(m); setStep("plan"); }
    else if (new URLSearchParams(location.search).get("as") === "student") setStep("stage");
  }, []);

  const plan = useMemo(() => {
    if (!me) return null;
    const mine = items.filter((i) => fits(i, "student", me.stage, me.groups));
    const made = mine.filter((i) => madeFor(i, me.groups));
    const wanted = new Set(NEEDS.filter((n) => me.needs.includes(n.key)).flatMap((n) => n.cats));
    const order = [...ORDER].sort((a, b) => Number(wanted.has(b)) - Number(wanted.has(a)));
    const URGENT = ["reach-emergency-make-a-plan", "get-help-near-you", "ask-a-real-person-at-eff"];
    const picked = URGENT.map((k) => mine.find((i) => i.key === k)).filter((i): i is NonNullable<typeof i> => Boolean(i));
    const now = picked.length ? picked : mine.filter((i) => i.cat === "now").slice(0, 3);
    const sections = order.filter((c) => c !== "belong").map((c) => ({ c, list: mine.filter((i) => i.cat === c && !made.includes(i) && !now.includes(i)) })).filter((s) => s.list.length);
    return { now, made, sections, total: mine.length };
  }, [items, me]);

  const toggle = (k: "groups" | "needs", v: string) => setDraft((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));
  const finish = () => { saveMe(draft); setMe(draft); setStep("plan"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const stageTitle = STAGES.find((s) => s.key === me?.stage)?.title;

  return (
    <main className="sc rs">
      <SiteTop on="/start" />
      {step !== "plan" ? (
        <section className="rs-ask">
          <div className="sc-wrap">
            {step === "who" ? (
              <>
                <p className="rs-k">Start here</p>
                <h1>Who are you?</h1>
                <p className="rs-lede">REACH is for every student, from 9th grade to after graduation, and for everyone in their corner.</p>
                <div className="rs-doors">
                  {WHO.map((w, n) => w.key === "student"
                    ? <button key={w.key} type="button" className="rs-door" style={{ ["--hue" as string]: w.hue, ["--d" as string]: `${n * 0.06}s` }} onClick={() => setStep("stage")}><span aria-hidden="true">{w.glyph}</span><b>{w.title}</b><small>{w.line}</small></button>
                    : <Link key={w.key} href={w.href} className="rs-door" style={{ ["--hue" as string]: w.hue, ["--d" as string]: `${n * 0.06}s` }}><span aria-hidden="true">{w.glyph}</span><b>{w.title}</b><small>{w.line}</small></Link>)}
                </div>
              </>
            ) : null}
            {step === "stage" ? (
              <>
                <p className="rs-k">1 of 3 · private, stays on your phone</p>
                <h1>Where are you right now?</h1>
                <div className="rs-opts">
                  {STAGES.map((s) => <button key={s.key} type="button" className={`rs-opt${draft.stage === s.key ? " on" : ""}`} onClick={() => { setDraft({ ...draft, stage: s.key }); setStep("groups"); }}><b>{s.title}</b><small>{s.line}</small></button>)}
                </div>
                <button type="button" className="rs-back" onClick={() => setStep("who")}>← Back</button>
              </>
            ) : null}
            {step === "groups" ? (
              <>
                <p className="rs-k">2 of 3 · tick any that are true, or none</p>
                <h1>What&rsquo;s true about you?</h1>
                <p className="rs-lede">So REACH can show what was made for students like you. Nobody else sees this.</p>
                <div className="rs-chips">{GROUPS.map((g) => <button key={g.key} type="button" className={`rs-chip${draft.groups.includes(g.key) ? " on" : ""}`} aria-pressed={draft.groups.includes(g.key)} onClick={() => toggle("groups", g.key)}>{g.title}</button>)}</div>
                <div className="rs-acts"><button type="button" className="rs-back" onClick={() => setStep("stage")}>← Back</button><button type="button" className="sc-btn coral" onClick={() => setStep("needs")}>Next</button></div>
              </>
            ) : null}
            {step === "needs" ? (
              <>
                <p className="rs-k">3 of 3 · optional</p>
                <h1>What&rsquo;s on your mind?</h1>
                <div className="rs-chips">{NEEDS.map((g) => <button key={g.key} type="button" className={`rs-chip${draft.needs.includes(g.key) ? " on" : ""}`} aria-pressed={draft.needs.includes(g.key)} onClick={() => toggle("needs", g.key)}>{g.title}</button>)}</div>
                <div className="rs-acts"><button type="button" className="rs-back" onClick={() => setStep("groups")}>← Back</button><button type="button" className="sc-btn coral" onClick={finish}>Show me my REACH</button></div>
              </>
            ) : null}
          </div>
        </section>
      ) : plan ? (
        <>
          <section className="rs-hero">
            <div className="sc-wrap">
              <p className="rs-k">Your REACH · {stageTitle}</p>
              <h1>Made for <em>you.</em></h1>
              <p className="rs-lede">{plan.total} tools and resources that fit where you are{me?.groups.length ? ", with the ones made for students like you first" : ""}. In immediate danger, call 911. In crisis, call or text <a href="tel:988">988</a>.</p>
              <div className="rs-acts"><button type="button" className="rs-back" onClick={() => setStep("stage")}>Change my answers</button><Link className="rs-back" href="/resources">See everything</Link><button type="button" className="rs-back" onClick={() => { saveMe(null); setMe(null); setDraft({ who: "student", stage: "", groups: [], needs: [] }); setStep("who"); }}>Forget my answers</button></div>
            </div>
          </section>
          <div className="sc-wrap rs-plan">
            <Section title="If it's urgent" line="Start with one of these." hue={CATS.now.hue} glyph="✦" list={plan.now} />
            {plan.made.length ? <Section title="Made for students like you" line="Help built for exactly what you ticked." hue={CATS.belong.hue} glyph="◆" list={plan.made} mine /> : null}
            {plan.sections.map((s) => <Section key={s.c} title={CATS[s.c].title} line={CATS[s.c].line} hue={CATS[s.c].hue} glyph={CATS[s.c].glyph} list={s.list} />)}
            <section className="rs-more">
              <h2>Not here?</h2>
              <p>Tell a real person at EFF what&rsquo;s going on, privately. You get a code to follow your request.</p>
              <div className="rs-acts"><a className="sc-btn coral" href="https://my.estherfundsfoundation.org/lighthouse">Ask EFF</a><Link className="sc-btn ghost" href="/emergency">Make an emergency plan</Link></div>
            </section>
          </div>
        </>
      ) : null}
      <SiteFoot />
    </main>
  );
}

function Section({ title, line, hue, glyph, list, mine }: { title: string; line: string; hue: string; glyph: string; list: ReturnType<typeof useLibrary>["items"]; mine?: boolean }) {
  return (
    <section className="rs-sec">
      <div className="rs-sec-h"><span style={{ background: hue }} aria-hidden="true">{glyph}</span><div><h2>{title}</h2><p>{line}</p></div></div>
      <div className="lb-grid">{list.map((i) => <LibCard key={i.key} i={i} mine={mine} />)}</div>
    </section>
  );
}
