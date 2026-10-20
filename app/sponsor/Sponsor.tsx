"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { rpc, SUPABASE, KEY } from "../scholarships/lib";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { PHOTOS, CLIPS } from "../RealReach";
import { FUND, FOR_YOU, PROMISES, PATHWAYS, ORG_TYPES, CONTRIBUTIONS, FACTS, IMPACT, WE_DO, TIERS, INKIND } from "./content";

/* Sponsor REACH (20 Oct 2026, Shayna: "a page just for sponsors … instead of a PDF or a PowerPoint … the videos,
   all that good stuff … what's in it for them"; then "your logo on the reach box, your logo on the workshops, and
   show visuals of that … we'll do all the work … different tiers … a smaller, just by putting your logo … offer
   some of your goods to go in the boxes … we leverage with our chapters that are all over the country").
   The brand studio shows a sponsor's own name or logo on a REACH Box, a workshop screen, a tour banner and a post.
   A logo picked there is read in the browser only and never uploaded. Tiers and tapped items ride into the form,
   which sends eff_partner_interest (area "sponsor"): the sponsor is emailed a reference, nationals@ is told, and
   the note waits in MyEFF → National → Strategy → Partners. */

type Site = { members?: number; chapters?: number; states?: number };
type Sch = { current?: number };
type Chapter = { school_name: string | null; chapter_name: string; state: string | null };
const IG = ["DZnxaMJJNlE", "DesNpGvINUE", "Dek6k_2Rc_Q", "DeDK3FOR2z9"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
// The IRS Tax Exempt Organization Search, so a donor can check the EIN for themselves.
// Shayna, 20 Oct 2026: 56,000+ followers, videos with millions of views.
const IG_URL = "https://www.instagram.com/Estherfundsfoundation";
const IRS_SEARCH = "https://apps.irs.gov/app/eos/";
const n = (x?: number) => (typeof x === "number" ? x.toLocaleString("en-US") : "");

export default function Sponsor() {
  const [site, setSite] = useState<Site | null>(null);
  const [sch, setSch] = useState<Sch | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [tier, setTier] = useState("");
  const [brand, setBrand] = useState("");
  const [logo, setLogo] = useState("");
  const [f, setF] = useState({ contact_name: "", organization: "", email: "", phone: "", org_type: "business", contribution: "financial", products: "", message: "", heard_from: "", website: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ref, setRef] = useState("");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    rpc<Site>("eff_site_stats", {}, 300).then(setSite).catch(() => {});
    rpc<Sch>("eff_scholarships_stats", {}, 300).then(setSch).catch(() => {});
    // Only active and chartered chapters are shown publicly (Shayna's rule for the map and website).
    fetch(`${SUPABASE}/rest/v1/eff_chapter_picker?select=school_name,chapter_name,state&lifecycle_status=in.(active,chartered)&order=state,school_name`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
      .then((r) => (r.ok ? r.json() : [])).then((x) => setChapters(Array.isArray(x) ? x : [])).catch(() => {});
  }, []);
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>("[data-rv]:not([data-in])");
    if (!els || typeof IntersectionObserver === "undefined") { els?.forEach((e) => (e.dataset.in = "1")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = "1"; io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [chapters.length]);

  const set = (k: keyof typeof f, v: string) => setF((o) => ({ ...o, [k]: v }));
  const toggle = (k: string) => setPicked(picked.includes(k) ? picked.filter((x) => x !== k) : [...picked, k]);
  const tierRow = TIERS.find((t) => t.key === tier);
  const states = Array.from(new Set(chapters.map((c) => c.state).filter(Boolean))) as string[];

  function pickLogo(file?: File | null) {
    if (!file || !file.type.startsWith("image/") || file.size > 8_000_000) return;
    const r = new FileReader();
    r.onload = () => setLogo(typeof r.result === "string" ? r.result : "");
    r.readAsDataURL(file);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const ideas = [
      ...(tierRow ? [`Tier: ${tierRow.name} (${tierRow.price})`] : []),
      ...FUND.filter((x) => picked.includes(x.key)).map((x) => x.idea),
      ...(f.products.trim() ? ["In-kind: products in REACH Boxes"] : []),
    ];
    const areas = ["sponsor", ...(f.contribution === "products" || f.products.trim() ? ["give"] : []), ...(f.contribution === "time" ? ["workplace"] : [])];
    const message = [f.products.trim() ? `Products we could put in the boxes: ${f.products.trim()}` : "", f.message.trim()].filter(Boolean).join("\n\n");
    const { products: _p, ...rest } = f; void _p;
    try {
      const r = await rpc<{ ok?: boolean; ref?: string }>("eff_partner_interest", {
        p: { ...rest, message, organization: f.organization || brand.trim(), heard_from: ["REACH sponsor page", f.heard_from].filter(Boolean).join(" · "), agree: agree ? "true" : "", areas, ideas },
      }, 0);
      setRef(r.ref || "sent");
      fetch("https://my.estherfundsfoundation.org/api/email/flush", { method: "POST", keepalive: true, mode: "no-cors" }).catch(() => {});
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : "That didn't send. Try again."); }
    setBusy(false);
  }

  const mark = <Mark brand={brand} logo={logo} />;

  return (
    <main className="sc aw cp sp" ref={root}>
      <SiteTop />

      <section className="cp-hero cp-film sp-hero">
        <div className="cp-bg" aria-hidden="true"><Clip c={CLIPS.v4} label="" /></div>
        <div className="sc-wrap cp-over">
          <span className="cp-kick">Sponsor REACH · Esther Funds Foundation</span>
          <div className="sp-what">
            <p><b>What is REACH?</b> REACH is Esther Funds Foundation&rsquo;s response to student retention around the globe.</p>
            <p className="sp-what-letters"><span>R</span>each out · <span>E</span>ngage your community · <span>A</span>ccess resources · <span>C</span>are for your mental health · <span>H</span>old on</p>
            <p className="sp-what-box"><b>What is a REACH Box?</b> The most elite, helpful care package a college student can receive: food, hygiene and school supplies, packed by EFF and put in the hands of students who asked for help.</p>
          </div>
          <h1>Put your name on the moment a student <em>almost walked away.</em></h1>
          <p className="cp-lede">Students rarely leave college all at once. It&rsquo;s a bill, a hold, an empty fridge, a hard week. REACH is where they turn first. <b>Your logo on the box they open. Your name on the screen when they learn. We do all the work.</b></p>
          <div className="sc-acts"><a className="sc-btn coral" href="#studio">See your brand on REACH</a><a className="sc-btn ghost" href="#tiers">See the tiers</a></div>
          <div className="sp-live">
            {sch?.current ? <div><b>{n(sch.current)}</b><span>scholarships live on REACH today</span></div> : null}
            {site?.members ? <div><b>{n(site.members)}</b><span>EFF members</span></div> : null}
            {site?.chapters ? <div><b>{n(site.chapters)}</b><span>campus chapters in {n(site.states)} states</span></div> : null}
            <div><b>$0</b><span>for a student to use any of it</span></div>
          </div>
        </div>
      </section>


      <section className="sp-trust" aria-label="Tax-exempt status">
        <div className="sc-wrap sp-trust-in">
          <div className="sp-seal" aria-hidden="true"><span>501</span><small>(c)(3)</small></div>
          <div className="sp-trust-txt">
            <b>IRS-verified 501(c)(3) public charity</b>
            <span>Esther Funds Foundation · Federal Tax ID (EIN) <strong>93-4917509</strong> · Gifts are tax-deductible as the law allows, with a written acknowledgment for every one.</span>
          </div>
          <a className="sp-verify" href={IRS_SEARCH} target="_blank" rel="noreferrer">Verify us on IRS.gov →</a>
        </div>
      </section>

      <section className="sp-impact" aria-labelledby="sp-imp">
        <div className="sc-wrap">
          <span className="sp-eyebrow">REACH so far</span>
          <h2 id="sp-imp">This is already happening. <em>Imagine it with your name on it.</em></h2>
          <div className="sp-imp-grid">
            {IMPACT.map((x) => (
              <a key={x.t} className="sp-imp" href={`https://www.instagram.com/p/${x.post}/`} target="_blank" rel="noreferrer" data-rv>
                <b><Count to={x.n} />{x.s}</b><span>{x.t}</span><i>See the post →</i>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-social" aria-labelledby="sp-so">
        <div className="sc-wrap sp-so-in">
          <div>
            <span className="sp-eyebrow">Our audience is your audience</span>
            <h2 id="sp-so">Join forces. <em>Get your brand in front of the students who matter.</em></h2>
            <p className="sp-st-sub">EFF speaks straight to minority, first-generation and low-income college students, many at HBCUs and across the South. Partner with us and we connect your brand with them, on their phones and on their campuses.</p>
            <div className="sp-so-stats">
              <div><b><Count to={56000} />+</b><span>followers on Instagram</span></div>
              <div><b>Millions</b><span>of views on our videos</span></div>
            </div>
            <a className="sp-ig-btn" href={IG_URL} target="_blank" rel="noreferrer"><span aria-hidden="true">◎</span> Follow @estherfundsfoundation</a>
          </div>
          <div className="sp-so-phone" aria-hidden="true">
            <Clip c={CLIPS.v1} label="" />
            <span className="sp-so-tag">@estherfundsfoundation</span>
          </div>
        </div>
      </section>

      <section className="sp-studio" id="studio" aria-labelledby="sp-st">
        <div className="sc-wrap">
          <span className="sp-eyebrow">The brand studio</span>
          <h2 id="sp-st">See your brand on REACH.</h2>
          <p className="sp-st-sub">Type your brand or add your logo. It stays on your device and is never uploaded. This is what students would see.</p>
          <div className="sp-st-in">
            <label className="sc-field"><span>Your brand name</span><input value={brand} maxLength={40} onChange={(e) => setBrand(e.target.value)} placeholder="Your Company" /></label>
            <label className="sp-file"><input type="file" accept="image/*" onChange={(e) => pickLogo(e.target.files?.[0])} /><span>{logo ? "✓ Logo added · change it" : "＋ Add your logo"}</span></label>
            {logo ? <button type="button" className="sp-clear" onClick={() => setLogo("")}>Remove logo</button> : null}
          </div>

          <div className="sp-mocks">
            <figure className="sp-mock" data-rv>
              <div className="sp-stage">
                <div className="sp-box" aria-hidden="true">
                  <div className="sp-face sp-front"><span className="sp-bx-k">REACH Box</span><span className="sp-bx-h">Before you drop out, REACH.</span><span className="sp-bx-p">in partnership with</span>{mark}</div>
                  <div className="sp-face sp-side"><span className="sp-bx-r">R·E·A·C·H</span>{mark}</div>
                  <div className="sp-face sp-top"><span className="sp-bx-t">REACH</span><span className="sp-bx-tt">Esther Funds Foundation</span></div>
                </div>
              </div>
              <figcaption><b>On the REACH Box.</b> The most elite care package a college student can receive, with your logo on the front and side and your product inside if you like.</figcaption>
            </figure>

            <figure className="sp-mock" data-rv>
              <div className="sp-screen">
                <div className="sp-scr">
                  <span className="sp-scr-k">REACH Workshop</span>
                  <span className="sp-scr-h">Stay Enrolled</span>
                  <span className="sp-scr-p">in partnership with</span>
                  {mark}
                  <span className="sp-scr-j">Students join on their phones</span>
                </div>
                <div className="sp-scr-base" />
              </div>
              <figcaption><b>On the workshop screen.</b> &ldquo;In partnership with&rdquo; your logo, on the big screen as the room fills.</figcaption>
            </figure>

            <figure className="sp-mock" data-rv>
              <div className="sp-banner" style={{ backgroundImage: `url(${PHOTOS.p6.src})` }}>
                <div className="sp-bn">
                  <span className="sp-bn-k">REACH on Tour</span>
                  <span className="sp-bn-h">Before you drop out, REACH.</span>
                  <span className="sp-bn-p">Presented by</span>
                  {mark}
                </div>
              </div>
              <figcaption><b>On the tour stop.</b> &ldquo;Presented by&rdquo; on the banner, the screens and every graphic for that day.</figcaption>
            </figure>

            <figure className="sp-mock" data-rv>
              <div className="sp-post">
                <div className="sp-post-top"><span className="sp-av">EFF</span><b>estherfundsfoundation</b></div>
                <div className="sp-post-img" style={{ backgroundImage: `url(${PHOTOS.p5.src})` }}>
                  <div className="sp-post-ov"><span>Made possible by</span>{mark}</div>
                </div>
                <p className="sp-post-cap"><b>estherfundsfoundation</b> REACH Boxes landed on campus today 💜 Thank you, {brand.trim() || "our partner"}, for showing up for students. #REACH</p>
              </div>
              <figcaption><b>On social.</b> Photos and video from the day, tagged and posted on EFF and REACH.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="sc-wrap cp-sec" aria-labelledby="sp-wd">
        <h2 id="sp-wd">You send your logo. <em className="sp-em">We do all the work.</em></h2>
        <p className="cp-sub">No warehouse, no shipping, no staff time unless you want to be there.</p>
        <ol className="sp-wedo">
          {WE_DO.map((s, i) => <li key={s.h} data-rv><span className="sp-wd-n">{i + 1}</span><h3>{s.h}</h3><p>{s.p}</p></li>)}
        </ol>
      </section>

      <section className="sp-map" aria-labelledby="sp-ch">
        <div className="sc-wrap">
          <span className="sp-eyebrow">Where your brand goes</span>
          <h2 id="sp-ch">Our chapters are on campuses across the country. <em>We bring your brand to them.</em></h2>
          <p className="sp-st-sub">EFF&rsquo;s campus chapters and REACH Ambassadors hand your boxes and products to students face to face, not through a mailbox.</p>
          <div className="sp-map-n">
            <div><b>{site?.chapters ? n(site.chapters) : chapters.length || "—"}</b><span>active campus chapters</span></div>
            <div><b>{site?.states ? n(site.states) : states.length || "—"}</b><span>states with a chapter</span></div>
            <div><b>22</b><span>states with REACH Ambassadors</span></div>
            <div><b>325+</b><span>colleges students applied from</span></div>
          </div>
          {chapters.length ? (
            <div className="sp-chips">
              {states.map((s) => (
                <div key={s} className="sp-state" data-rv>
                  <b>{s}</b>
                  <ul>{chapters.filter((c) => c.state === s).map((c) => <li key={c.chapter_name}>{c.school_name || c.chapter_name}</li>)}</ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sc-wrap cp-sec" id="tiers" aria-labelledby="sp-ti">
        <h2 id="sp-ti">Ways to sponsor, from a logo to the whole year.</h2>
        <p className="cp-sub">Pick one and it goes with your note. Every sponsorship is set with you in writing, and we&rsquo;ll shape any of these around your goals.</p>
        <div className="sp-tiers">
          {TIERS.map((t) => {
            const on = tier === t.key;
            return (
              <article key={t.key} className={`sp-tier${t.hot ? " hot" : ""}${on ? " on" : ""}`} data-rv>
                {t.hot ? <span className="sp-flag">Most popular</span> : null}
                <h3>{t.name}</h3>
                <b className="sp-price">{t.price}</b>
                <p className="sp-lead">{t.lead}</p>
                <ul>{t.gets.map((g) => <li key={g}>{g}</li>)}</ul>
                <button type="button" className={`sc-btn ${on ? "coral" : "ghost"}`} aria-pressed={on} onClick={() => setTier(on ? "" : t.key)}>{on ? "✓ Chosen" : `Choose ${t.name}`}</button>
              </article>
            );
          })}
        </div>
        <p className="sc-small">Not a fit? <a href="#talk">Tell us your budget</a> and we&rsquo;ll build one with you.</p>
      </section>

      <section className="sp-inkind" aria-labelledby="sp-ik">
        <div className="sc-wrap sp-ik-grid">
          <div className="sp-ik-ph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.p7.src} alt="REACH on campus" loading="lazy" />
            <Clip c={CLIPS.v2} label="A moment from REACH" />
          </div>
          <div>
            <span className="sp-eyebrow">Give what you make</span>
            <h2 id="sp-ik">Put your products in the boxes.</h2>
            <div className="sp-ik-list">
              {INKIND.map((x) => <div key={x.h} data-rv><h3>{x.h}</h3><p>{x.p}</p></div>)}
            </div>
            <a className="sc-btn coral" href="#talk" onClick={() => set("contribution", "products")}>Offer our products</a>
          </div>
        </div>
      </section>

      <section className="sc-wrap cp-sec" id="fund">
        <h2>Or put your name behind one thing</h2>
        <p className="cp-sub">Tap anything you&rsquo;d sponsor. It goes with your note.</p>
        <div className="sp-fund">
          {FUND.map((x, i) => {
            const on = picked.includes(x.key);
            return (
              <button key={x.key} type="button" className={`sp-card${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(x.key)} data-rv>
                <span className="sp-num">{ROMAN[i]}</span>
                <h3>{x.h}</h3>
                <p>{x.p}</p>
                <span className="sp-tick">{on ? "✓ Added to your note" : "+ I'd sponsor this"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="cp-facts" aria-labelledby="sp-why">
        <div className="sc-wrap">
          <h2 id="sp-why">Why it matters. <em>The need is real.</em></h2>
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
          <Clip c={CLIPS.v3} label="A REACH event" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.p7.src} alt="REACH on campus" loading="lazy" />
        </div>
        <p className="sp-reel-line">This is REACH. <em>Not a website. A movement.</em></p>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>What&rsquo;s in it for you</h2>
        <p className="cp-sub">Your brand in front of the students who will remember who showed up for them.</p>
        <div className="cp-grid">{FOR_YOU.map((o) => <article key={o.h} className="cp-card" data-rv><h3>{o.h}</h3><p>{o.p}</p></article>)}</div>
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
        <h2>Every way to partner</h2>
        <div className="cp-grid">{PATHWAYS.map((o) => <article key={o.h} className="cp-card you" data-rv><h3>{o.h}</h3><p>{o.p}</p></article>)}</div>
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
            {tierRow ? <div className="sp-picked"><span>Your tier:</span><button type="button" className="sc-pill on" onClick={() => setTier("")}>{tierRow.name} · {tierRow.price} ✕</button></div> : null}
            {picked.length ? (
              <div className="sp-picked"><span>You&rsquo;d like to sponsor:</span>{FUND.filter((x) => picked.includes(x.key)).map((x) => <button type="button" key={x.key} className="sc-pill on" onClick={() => toggle(x.key)}>{x.h} ✕</button>)}</div>
            ) : null}
            {!tierRow && !picked.length ? <p className="sc-small"><a href="#tiers">Pick a tier</a> or <a href="#fund">something to sponsor</a> (optional).</p> : null}
            <div className="cp-fields">
              <label className="sc-field"><span>Your name</span><input required value={f.contact_name} onChange={(e) => set("contact_name", e.target.value)} autoComplete="name" /></label>
              <label className="sc-field"><span>Organization</span><input value={f.organization} onChange={(e) => set("organization", e.target.value)} placeholder={brand.trim() || undefined} autoComplete="organization" /></label>
              <label className="sc-field"><span>Email</span><input required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></label>
              <label className="sc-field"><span>Phone (optional)</span><input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></label>
              <label className="sc-field"><span>You are a</span><select value={f.org_type} onChange={(e) => set("org_type", e.target.value)}>{ORG_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label className="sc-field"><span>You&rsquo;d like to give</span><select value={f.contribution} onChange={(e) => set("contribution", e.target.value)}>{CONTRIBUTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            </div>
            <label className="sc-field grow"><span>Products you could put in the boxes (optional)</span><input value={f.products} onChange={(e) => set("products", e.target.value)} placeholder="Snacks, hygiene, school supplies, gift cards…" /></label>
            <label className="sc-field grow"><span>Anything else? (optional)</span><textarea rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="A campus you care about, a timeline, a budget range…" /></label>
            <label className="sc-field grow"><span>How did you hear about REACH? (optional)</span><input value={f.heard_from} onChange={(e) => set("heard_from", e.target.value)} /></label>
            <input className="cp-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={(e) => set("website", e.target.value)} />
            <label className="cp-check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />Esther Funds Foundation may contact me about this sponsorship.</label>
            {err ? <p className="aw-err" role="alert">{err}</p> : null}
            <div className="sc-acts"><button className="sc-btn coral" disabled={busy}>{busy ? "Sending…" : "Send my note"}</button></div>
            <p className="sc-small">You&rsquo;ll send your logo files after we talk. Esther Funds Foundation is an IRS-verified 501(c)(3) public charity, EIN 93-4917509 (<a href={IRS_SEARCH} target="_blank" rel="noreferrer">verify on IRS.gov</a>). Sponsorship benefits are set by written agreement and follow nonprofit rules.</p>
          </form>
        )}
      </section>

      <section className="sp-close" aria-label="Closing">
        <p className="sp-verse">&ldquo;Who knoweth whether thou art come to the kingdom for such a time as this?&rdquo;</p>
        <p className="sp-ref">Esther 4:14</p>
        <p className="sp-cl">Before you drop out, REACH. Questions? <a href="mailto:nationals@estherfundsinc.org">nationals@estherfundsinc.org</a> · <Link href="/campus">For colleges</Link></p>
      </section>

      {(picked.length || tier) && !ref ? <a className="sp-tray" href="#talk">{tierRow ? tierRow.name : `${picked.length} picked`} · Send it to EFF →</a> : null}
      <SiteFoot />
    </main>
  );
}

/* The sponsor's mark: their logo if they added one, else their name, else a dashed "Your logo" placeholder. */
function Mark({ brand, logo }: { brand: string; logo: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (logo) return <span className="sp-mark img"><img src={logo} alt={brand || "Your logo"} /></span>;
  if (brand.trim()) return <span className="sp-mark word">{brand.trim()}</span>;
  return <span className="sp-mark empty">YOUR LOGO</span>;
}

/* Counts up once when it scrolls into view; reduced motion shows the number at once. */
function Count({ to }: { to: number }) {
  const [v, setV] = useState(to);
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const e = el.current;
    if (!e || typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(([x]) => {
      if (!x.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / 1400); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(e);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={el}>{v.toLocaleString("en-US")}</span>;
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
