"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { rpc } from "../scholarships/lib";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { PHOTOS, CLIPS } from "../RealReach";
import { FUND, FOR_YOU, PROMISES, PATHWAYS, ORG_TYPES, CONTRIBUTIONS, FACTS } from "./content";

/* Sponsor REACH (20 Oct 2026, Shayna: "a page just for sponsors … instead of a PDF or a PowerPoint … the videos,
   all that good stuff … what's in it for them"). Tapping what they'd like to sponsor carries it into the form,
   which sends eff_partner_interest (area "sponsor"): the sponsor is emailed a reference, nationals@ is told, and
   the note waits in MyEFF → National → Strategy → Partners. */

type Site = { members?: number; chapters?: number; states?: number };
type Sch = { current?: number };
const IG = ["DZnxaMJJNlE", "DesNpGvINUE", "Dek6k_2Rc_Q", "DeDK3FOR2z9"];
const n = (x?: number) => (typeof x === "number" ? x.toLocaleString("en-US") : "");

export default function Sponsor() {
  const [site, setSite] = useState<Site | null>(null);
  const [sch, setSch] = useState<Sch | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [f, setF] = useState({ contact_name: "", organization: "", email: "", phone: "", org_type: "business", contribution: "financial", message: "", heard_from: "", website: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ref, setRef] = useState("");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    rpc<Site>("eff_site_stats", {}, 300).then(setSite).catch(() => {});
    rpc<Sch>("eff_scholarships_stats", {}, 300).then(setSch).catch(() => {});
  }, []);
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>("[data-rv]");
    if (!els || typeof IntersectionObserver === "undefined") { els?.forEach((e) => (e.dataset.in = "1")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = "1"; io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });
  const toggle = (k: string) => setPicked(picked.includes(k) ? picked.filter((x) => x !== k) : [...picked, k]);

  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const ideas = FUND.filter((x) => picked.includes(x.key)).map((x) => x.idea);
    const areas = ["sponsor", ...(f.contribution === "products" ? ["give"] : []), ...(f.contribution === "time" ? ["workplace"] : [])];
    try {
      const r = await rpc<{ ok?: boolean; ref?: string }>("eff_partner_interest", {
        p: { ...f, heard_from: ["REACH sponsor page", f.heard_from].filter(Boolean).join(" · "), agree: agree ? "true" : "", areas, ideas },
      }, 0);
      setRef(r.ref || "sent");
      fetch("https://my.estherfundsfoundation.org/api/email/flush", { method: "POST", keepalive: true, mode: "no-cors" }).catch(() => {});
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : "That didn't send. Try again."); }
    setBusy(false);
  }

  return (
    <main className="sc aw cp sp" ref={root}>
      <SiteTop />

      <section className="cp-hero cp-film sp-hero">
        <div className="cp-bg" aria-hidden="true"><Clip c={CLIPS.v4} label="" /></div>
        <div className="sc-wrap cp-over">
          <span className="cp-kick">Sponsor REACH · Esther Funds Foundation</span>
          <h1>Fund the moment a student <em>almost walked away.</em></h1>
          <p className="cp-lede">Students rarely leave college all at once. It&rsquo;s a bill, a hold, an empty fridge, a hard week. REACH is where they turn first: emergency help, scholarships, free tools and real people. <b>Put your name behind it.</b></p>
          <div className="sc-acts"><a className="sc-btn coral" href="#fund">See what you can sponsor</a><a className="sc-btn ghost" href="#talk">Talk with us</a></div>
          <div className="sp-live">
            {sch?.current ? <div><b>{n(sch.current)}</b><span>scholarships live on REACH today</span></div> : null}
            {site?.members ? <div><b>{n(site.members)}</b><span>EFF members</span></div> : null}
            {site?.chapters ? <div><b>{n(site.chapters)}</b><span>campus chapters in {n(site.states)} states</span></div> : null}
            <div><b>$0</b><span>for a student to use any of it</span></div>
          </div>
        </div>
      </section>

      <section className="cp-facts" aria-labelledby="sp-why">
        <div className="sc-wrap">
          <h2 id="sp-why">The need is real. <em>So is the help.</em></h2>
          <div className="cp-factgrid">
            {FACTS.map((x) => (
              <figure key={x.big} className="cp-fact" data-rv><b>{x.big}</b><p>{x.line}</p><figcaption><a href={x.url} target="_blank" rel="noreferrer">{x.src}</a></figcaption></figure>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-reel" aria-label="REACH in real life">
        <div className="sp-reel-row">
          <Clip c={CLIPS.v1} label="REACH students together" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.p5.src} alt="REACH with Esther Funds Foundation" loading="lazy" />
          <Clip c={CLIPS.v2} label="A moment from REACH" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.p7.src} alt="REACH on campus" loading="lazy" />
        </div>
        <p className="sp-reel-line">This is REACH. <em>Not a website. A movement.</em></p>
      </section>

      <section className="sc-wrap cp-sec" id="fund">
        <h2>What you can sponsor</h2>
        <p className="cp-sub">Tap anything you&rsquo;d like to put your name behind. It goes with your note, and we build the sponsorship around it with you.</p>
        <div className="sp-fund">
          {FUND.map((x, i) => {
            const on = picked.includes(x.key);
            return (
              <button key={x.key} type="button" className={`sp-card${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(x.key)} data-rv>
                <span className="sp-num">{["I", "II", "III", "IV", "V", "VI"][i]}</span>
                <h3>{x.h}</h3>
                <p>{x.p}</p>
                <span className="sp-tick">{on ? "✓ Added to your note" : "+ I'd sponsor this"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>What&rsquo;s in it for you</h2>
        <p className="cp-sub">The exact recognition is set with you in writing, so it fits what you sponsor.</p>
        <div className="cp-grid">{FOR_YOU.map((o) => <article key={o.h} className="cp-card" data-rv><h3>{o.h}</h3><p>{o.p}</p></article>)}</div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>REACH in real life</h2>
        <p className="cp-sub">Students, campuses and communities showing up for each other.</p>
        <div className="cp-gallery">
          <Clip c={CLIPS.v3} label="A REACH event" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.p6.src} alt="REACH students" loading="lazy" />
          <Clip c={CLIPS.v4} label="REACH in action" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.p5.src} alt="REACH with Esther Funds Foundation" loading="lazy" />
        </div>
        <div className="rr-ig sp-ig">
          {IG.map((id) => <iframe key={id} src={`https://www.instagram.com/p/${id}/embed`} title="REACH on Instagram" loading="lazy" />)}
        </div>
      </section>

      <section className="sp-promise" aria-labelledby="sp-pr">
        <div className="sc-wrap">
          <h2 id="sp-pr">What a sponsor never gets.</h2>
          <p className="sp-pr-sub">This is why students trust REACH, and why your name is safe on it.</p>
          <ul>{PROMISES.map((p) => <li key={p} data-rv>{p}</li>)}</ul>
        </div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>Ways to partner</h2>
        <div className="cp-grid">{PATHWAYS.map((o) => <article key={o.h} className="cp-card you" data-rv><h3>{o.h}</h3><p>{o.p}</p></article>)}</div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>How it works</h2>
        <div className="cp-steps">
          <div><b>1</b><h3>Send us a note</h3><p>Two minutes. Tell us who you are and what you&rsquo;d like to sponsor.</p></div>
          <div><b>2</b><h3>We talk</h3><p>A call with EFF National to shape it around your goals and our students.</p></div>
          <div><b>3</b><h3>We put it in writing</h3><p>What you give, what students get, and how you&rsquo;re recognized. No surprises.</p></div>
          <div><b>4</b><h3>You see the impact</h3><p>Totals after it&rsquo;s done: workshops, students reached, items given. Never student data.</p></div>
        </div>
      </section>

      <section className="sc-wrap cp-sec" id="talk">
        {ref ? (
          <div className="cp-done">
            <h2>Thank you. 💜</h2>
            <p>Your note is with EFF National{ref !== "sent" ? <> (reference <b>{ref}</b>)</> : null}. We emailed you a copy, and a real person will reach out.</p>
          </div>
        ) : (
          <form className="cp-form" onSubmit={send}>
            <h2>Sponsor REACH</h2>
            <p className="cp-sub">Tell us about you. We&rsquo;ll be in touch to build it together.</p>
            {picked.length ? (
              <div className="sp-picked"><span>You&rsquo;d like to sponsor:</span>{FUND.filter((x) => picked.includes(x.key)).map((x) => <button type="button" key={x.key} className="sc-pill on" onClick={() => toggle(x.key)}>{x.h} ✕</button>)}</div>
            ) : <p className="sc-small"><a href="#fund">Pick what you&rsquo;d sponsor</a> (optional).</p>}
            <div className="cp-fields">
              <label className="sc-field"><span>Your name</span><input required value={f.contact_name} onChange={(e) => set("contact_name", e.target.value)} autoComplete="name" /></label>
              <label className="sc-field"><span>Organization</span><input value={f.organization} onChange={(e) => set("organization", e.target.value)} autoComplete="organization" /></label>
              <label className="sc-field"><span>Email</span><input required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></label>
              <label className="sc-field"><span>Phone (optional)</span><input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></label>
              <label className="sc-field"><span>You are a</span><select value={f.org_type} onChange={(e) => set("org_type", e.target.value)}>{ORG_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label className="sc-field"><span>You&rsquo;d like to give</span><select value={f.contribution} onChange={(e) => set("contribution", e.target.value)}>{CONTRIBUTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            </div>
            <label className="sc-field grow"><span>Anything else? (optional)</span><textarea rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="A campus you care about, a timeline, a budget range…" /></label>
            <label className="sc-field grow"><span>How did you hear about REACH? (optional)</span><input value={f.heard_from} onChange={(e) => set("heard_from", e.target.value)} /></label>
            <input className="cp-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={(e) => set("website", e.target.value)} />
            <label className="cp-check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />Esther Funds Foundation may contact me about this sponsorship.</label>
            {err ? <p className="aw-err" role="alert">{err}</p> : null}
            <div className="sc-acts"><button className="sc-btn coral" disabled={busy}>{busy ? "Sending…" : "Send my note"}</button></div>
            <p className="sc-small">A 501(c)(3) nonprofit, EIN 93-4917509. Sponsorship benefits are set by written agreement and follow nonprofit rules.</p>
          </form>
        )}
      </section>

      <section className="sp-close" aria-label="Closing">
        <p className="sp-verse">&ldquo;Who knoweth whether thou art come to the kingdom for such a time as this?&rdquo;</p>
        <p className="sp-ref">Esther 4:14</p>
        <p className="sp-cl">Before you drop out, REACH. Questions? <a href="mailto:nationals@estherfundsinc.org">nationals@estherfundsinc.org</a> · <Link href="/campus">For colleges</Link></p>
      </section>

      {picked.length && !ref ? <a className="sp-tray" href="#talk">{picked.length} picked · Send them to EFF →</a> : null}
      <SiteFoot />
    </main>
  );
}

type ClipT = { src: string; poster: string; tall: boolean };
/* Muted and looping, loaded only while on screen; reduced motion keeps the still frame. */
function Clip({ c, label }: { c: ClipT; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause(); }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={c.src} poster={c.poster} muted loop playsInline preload="none" aria-label={label || undefined} />;
}
