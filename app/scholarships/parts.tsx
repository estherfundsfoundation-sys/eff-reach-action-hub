"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readSaved, writeSaved } from "./lib";

/* Shared pieces for REACH Scholarships: the top bar and the save heart. */

export const SCH_TABS = [
  { href: "/scholarships", label: "All scholarships" },
  { href: "/scholarships/match", label: "Match me" },
  { href: "/scholarships/saved", label: "Saved" },
  { href: "/scholarships/eff", label: "EFF scholarships" },
  { href: "/scholarships/recipients", label: "Past recipients" },
  { href: "/scholarships/toolkits", label: "Toolkits" },
];

export function Top({ on }: { on: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const up = () => setCount(readSaved().length);
    up(); window.addEventListener("reach-saved", up); window.addEventListener("storage", up);
    return () => { window.removeEventListener("reach-saved", up); window.removeEventListener("storage", up); };
  }, []);
  return (
    <header className="sc-top">
      <div className="sc-wrap">
        <Link className="sc-brand" href="/">REACH<small>SCHOLARSHIPS</small></Link>
        <nav className="sc-menu" aria-label="Scholarships">
          {SCH_TABS.map((t) => (
            <Link key={t.href} href={t.href} className={on === t.href ? "on" : ""} aria-current={on === t.href ? "page" : undefined}>
              {t.label}{t.href === "/scholarships/saved" && count ? ` (${count})` : ""}
            </Link>
          ))}
          <Link href="/get-help">Get Help</Link>
        </nav>
      </div>
    </header>
  );
}

export function SaveButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const up = () => setOn(readSaved().includes(slug));
    up(); window.addEventListener("reach-saved", up);
    return () => window.removeEventListener("reach-saved", up);
  }, [slug]);
  return (
    <button type="button" className={`sc-save${on ? " on" : ""}`} aria-pressed={on}
      onClick={() => { const cur = readSaved(); writeSaved(on ? cur.filter((s) => s !== slug) : [slug, ...cur.filter((s) => s !== slug)]); }}>
      <span aria-hidden="true">{on ? "♥" : "♡"}</span>{compact ? (on ? "Saved" : "Save") : on ? "Saved to this phone" : "Save it"}
    </button>
  );
}

export function Foot() {
  return (
    <footer className="sc-foot">
      <div className="sc-wrap">
        <p><b>How this list works.</b> Every morning REACH reads scholarship listings from providers&rsquo; own pages, open data and 26 university scholarship portals, checks that the links still work, and closes listings once their deadline passes. These scholarships are run by other organizations: EFF doesn&rsquo;t choose winners or see your application, and never charges you anything. Always check the provider&rsquo;s page. <b>Never pay to apply.</b></p>
        <p>Saved scholarships and quiz answers stay on this device. Nothing is sent to EFF.</p>
        <p><Link href="/">REACH home</Link> · <Link href="/get-help">Get Help</Link> · <a href="https://www.estherfundsfoundation.org">Esther Funds Foundation</a> · <a href="https://my.estherfundsfoundation.org/lighthouse">Talk to a person at EFF</a></p>
      </div>
    </footer>
  );
}
