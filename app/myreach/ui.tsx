"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readPass } from "./pass";

/* The REACH site bar: Emergency always first, three main tabs, and everything else
   under Menu so the bar never runs off the screen (Shayna, 9 Oct 2026). On a phone only
   Emergency, Sign in and Menu show; the menu then lists every tab. */
export const NAV = [
  { href: "/emergency", label: "Emergency" },
  { href: "/start", label: "Start here" },
  { href: "/get-help", label: "Get Help" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/emergency-aid", label: "Campus aid lookup" },
  { href: "/my-college", label: "My college" },
  { href: "/freebies", label: "Freebies" },
  { href: "/apply", label: "Apply to EFF" },
  { href: "/workshops", label: "Workshops" },
  { href: "/resources", label: "All resources" },
  { href: "https://represent.estherfundsfoundation.org", label: "Ambassadors" },
];
const MAIN = NAV.slice(1, 4);
/* The menu, grouped by what a student is trying to do (13 Nov 2026). Every page is here; nothing was taken out. */
const GROUPS = [
  { t: "Help right now", items: [
    { href: "/emergency", label: "Emergency plan" }, { href: "/screening", label: "Balance Screening" }, { href: "/holdup", label: "HOLD UP: clear a hold" },
    { href: "/get-help", label: "Food, housing & help near me" }, { href: "/emergency-aid", label: "Campus emergency aid lookup" }, { href: "https://my.estherfundsfoundation.org/lighthouse", label: "Talk to a person" } ] },
  { t: "Money for school", items: [
    { href: "/scholarships", label: "Scholarships" }, { href: "/scholarships/match", label: "Match me" }, { href: "/apply-with-me", label: "Apply With Me" },
    { href: "/aid-moves", label: "Financial aid moves" }, { href: "/freebies", label: "Freebies" }, { href: "/apply", label: "Apply to EFF" } ] },
  { t: "Get ready", items: [
    { href: "/eff-interview-coach", label: "Mock Interview Coach" }, { href: "/practice", label: "Practice the Conversation" }, { href: "/resume", label: "Résumé Builder" },
    { href: "/my-college", label: "My college" }, { href: "/apply-with-me/college", label: "Apply to college" }, { href: "https://my.estherfundsfoundation.org/kit", label: "The Survival Kit" } ] },
  { t: "Explore", items: [
    { href: "/start", label: "Start here" }, { href: "/resources", label: "All resources" }, { href: "/workshops", label: "Workshops" }, { href: "/organizations", label: "Organizations" },
    { href: "/for/families", label: "For families" }, { href: "/for/schools", label: "For schools & colleges" }, { href: "https://represent.estherfundsfoundation.org", label: "Ambassadors" } ] },
];

export function SiteTop({ on }: { on?: string }) {
  const [signed, setSigned] = useState(false);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const up = () => setSigned(Boolean(readPass()));
    up(); window.addEventListener("reach-pass", up);
    return () => window.removeEventListener("reach-pass", up);
  }, []);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const cur = (h: string) => (on === h ? "on" : "");
  return (
    <header className="sc-top">
      <div className="sc-wrap">
        <Link className="sc-brand" href="/">REACH<small>BY ESTHER FUNDS FOUNDATION</small></Link>
        <nav className="sc-menu" aria-label="REACH">
          <Link href="/emergency" className={`sc-emerg ${cur("/emergency")}`} aria-current={on === "/emergency" ? "page" : undefined}>Emergency</Link>
          {MAIN.map((n) => <Link key={n.href} href={n.href} className={`sc-main ${cur(n.href)}`} aria-current={on === n.href ? "page" : undefined}>{n.label}</Link>)}
          <div className="sc-more" ref={box}>
            <button type="button" className={`sc-morebtn${open ? " open" : ""}`} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
              Menu<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {open ? (
              <div className="sc-drop sc-mega" role="menu">
                {GROUPS.map((g) => (
                  <div key={g.t} className="sc-mgroup">
                    <p>{g.t}</p>
                    {g.items.map((n) => <Link key={n.href} role="menuitem" href={n.href} className={cur(n.href)} onClick={() => setOpen(false)}>{n.label}</Link>)}
                  </div>
                ))}
                <div className="sc-mfoot">
                  <Link role="menuitem" href="/account" onClick={() => setOpen(false)}>{signed ? "My REACH" : "Sign in"}</Link>
                  <span>In crisis? Call or text <a href="tel:988">988</a></span>
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/account" className={`sc-acct ${cur("/account")}`}>{signed ? "My REACH" : "Sign in"}</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFoot() {
  return (
    <footer className="sc-foot">
      <div className="sc-wrap">
        <p><b>REACH</b> is Esther Funds Foundation&rsquo;s student support: Reach out, Engage your community, Access resources, Care for your mental health, Hold on. Before you drop out, REACH.</p>
        <p><b>No more student dropouts.</b> REACH is part of Esther Funds Foundation, the world’s first faith-based college dropout prevention movement.</p>
        <p>In immediate danger, call 911. In crisis, call or text <a href="tel:988">988</a>.</p>
        <p><Link href="/emergency">Emergency plan</Link> · <Link href="/start">Start here</Link> · <Link href="/for/families">For families</Link> · <Link href="/for/schools">For high schools</Link> · <Link href="/for/colleges">For colleges</Link> · <Link href="/for/community">For churches &amp; nonprofits</Link> · <Link href="/holdup">HOLD UP</Link> · <Link href="/emergency-aid">Emergency Aid Finder</Link> · <Link href="/my-college">Your college&rsquo;s resources</Link> · <Link href="/organizations">Organizations doing this work</Link> · <Link href="/">REACH home</Link> · <Link href="/get-help">Get Help</Link> · <Link href="/scholarships">Scholarships</Link> · <Link href="/freebies">Freebies</Link> · <Link href="/apply">Apply to EFF</Link> · <Link href="/workshops">Workshops</Link> · <Link href="/account">My REACH</Link> · <Link href="/sponsor">Sponsor REACH</Link> · <a href="https://www.estherfundsfoundation.org">Esther Funds Foundation</a></p>
      </div>
    </footer>
  );
}
