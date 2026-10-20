"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { rpc } from "../../scholarships/lib";
import { SiteTop, SiteFoot } from "../../myreach/ui";
import { qrSvg } from "../qr";
import { CAPTIONS, KIT, LMS, NEWSLETTER, STATEMENT, SYLLABUS } from "../content";

/* A campus partner's share kit: their own link with a QR, the graphics, captions, a newsletter blurb, a syllabus
   statement and an LMS message, each filled in with their link and name. Without a code it shows the general kit. */

const SITE = "https://reach.estherfundsfoundation.org";

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return <button type="button" className={`aw-copy${done ? " done" : ""}`} onClick={async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* old browser */ }
    setDone(true); setTimeout(() => setDone(false), 1500);
  }}>{done ? "Copied ✓" : "Copy"}</button>;
}

export default function Kit() {
  const [code, setCode] = useState<string | null>(null);
  const [inst, setInst] = useState<string>("");
  const [bad, setBad] = useState(false);
  useEffect(() => {
    const c = new URLSearchParams(location.search).get("c");
    if (!c) return;
    setCode(c);
    rpc<{ institution?: string } | null>("eff_reach_campus_kit", { p_code: c }, 0).then((r) => { if (r?.institution) setInst(r.institution); else setBad(true); }).catch(() => setBad(true));
  }, []);
  const link = code && !bad ? `${SITE}/go/${code}` : SITE;
  const school = inst || "Our campus";
  const fill = (s: string) => s.replaceAll("{link}", link).replaceAll("{school}", school);
  const qr = useMemo(() => qrSvg(link, "#2a0a55", "#ffffff"), [link]);
  const qrHref = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`, [qr]);

  return (
    <main className="sc aw cp">
      <SiteTop />
      <section className="cp-hero sm">
        <div className="sc-wrap">
          <span className="cp-kick">REACH for Campuses · share kit</span>
          <h1>{inst ? <>{inst}, <em>thank you.</em></> : <>The REACH <em>share kit.</em></>}</h1>
          <p className="cp-lede">Everything you need to put REACH in front of your students. Download, copy, paste.</p>
          {bad ? <p className="aw-err">We couldn&rsquo;t find that campus link. The general kit is below. <Link href="/campus#join">Join for your own link</Link>.</p> : null}
        </div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>Our partnership, in one line</h2>
        <div className="aw-ans"><span>Partnership statement</span><p>{fill(STATEMENT)}</p><Copy text={fill(STATEMENT)} /></div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>{code && !bad ? "Your campus link" : "The REACH link"}</h2>
        <div className="cp-link">
          <div dangerouslySetInnerHTML={{ __html: qr }} className="cp-qr" />
          <div>
            <p className="cp-url">{link.replace("https://", "")}</p>
            <div className="sc-acts"><Copy text={link} /><a className="sc-btn ghost sm" href={qrHref} download="reach-qr.svg">Download QR</a></div>
            {code && !bad ? <p className="sc-small">Opens REACH. We count how many times your link is opened, never who opened it.</p> : <p className="sc-small"><Link href="/campus#join">Join for free</Link> to get your own campus link.</p>}
          </div>
        </div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>Graphics</h2>
        <p className="cp-sub">The QR on these opens REACH. Post them as they are; please don&rsquo;t change the words or the logo.</p>
        <div className="cp-kit">
          {KIT.map((k) => (
            <figure key={k.file}>
              {k.file.endsWith(".jpg") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/campus-kit/${k.file}`} alt={k.label} loading="lazy" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/campus-kit/flyer-print.jpg" alt={k.label} loading="lazy" />
              )}
              <figcaption><b>{k.label}</b><span>{k.size}</span><a className="sc-btn sm" href={`/campus-kit/${k.file}`} download>Download</a></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="sc-wrap cp-sec">
        <h2>Captions</h2>
        {CAPTIONS.map((c, i) => <div key={i} className="aw-ans"><span>Caption {i + 1}</span><p>{fill(c)}</p><Copy text={fill(c)} /></div>)}
      </section>
      <section className="sc-wrap cp-sec">
        <h2>For your newsletter or website</h2>
        <div className="aw-ans"><span>Newsletter blurb</span><p className="cp-pre">{fill(NEWSLETTER)}</p><Copy text={fill(NEWSLETTER)} /></div>
      </section>
      <section className="sc-wrap cp-sec">
        <h2>For professors</h2>
        <div className="aw-ans"><span>Syllabus statement</span><p>{fill(SYLLABUS)}</p><Copy text={fill(SYLLABUS)} /></div>
        <div className="aw-ans"><span>Canvas / LMS announcement</span><p>{fill(LMS)}</p><Copy text={fill(LMS)} /></div>
      </section>
      <section className="sc-wrap cp-sec"><p className="cp-close">Thank you for standing with your students. Questions or ideas? <a href="mailto:nationals@estherfundsinc.org">nationals@estherfundsinc.org</a></p></section>
      <SiteFoot />
    </main>
  );
}
