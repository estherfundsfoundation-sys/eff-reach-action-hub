"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readPass } from "./pass";

/* The REACH site bar: Emergency always first, three main tabs, and everything else
   under Menu so the bar never runs off the screen (Shayna, 9 Oct 2026). On a phone only
   Emergency, Sign in and Menu show; the menu then lists every tab. */
export const NAV = [
  { href: "/emergency", label: "Emergency" },
  { href: "/get-help", label: "Get Help" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/freebies", label: "Freebies" },
  { href: "/apply", label: "Apply to EFF" },
  { href: "/workshops", label: "Workshops" },
  { href: "/resources", label: "All resources" },
  { href: "/ambassadors", label: "Ambassadors" },
];
const MAIN = NAV.slice(1, 4);

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
              <div className="sc-drop" role="menu">
                {NAV.slice(1).map((n, i) => <Link key={n.href} role="menuitem" href={n.href} className={`${i < MAIN.length ? "sc-dmain " : ""}${cur(n.href)}`} onClick={() => setOpen(false)}>{n.label}</Link>)}
                <Link role="menuitem" href="/account" className={`sc-dmain ${cur("/account")}`} onClick={() => setOpen(false)}>{signed ? "My REACH" : "Sign in"}</Link>
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
        <p>In immediate danger, call 911. In crisis, call or text <a href="tel:988">988</a>.</p>
        <p><Link href="/emergency">Emergency plan</Link> · <Link href="/">REACH home</Link> · <Link href="/get-help">Get Help</Link> · <Link href="/scholarships">Scholarships</Link> · <Link href="/freebies">Freebies</Link> · <Link href="/apply">Apply to EFF</Link> · <Link href="/workshops">Workshops</Link> · <Link href="/account">My REACH</Link> · <a href="https://www.estherfundsfoundation.org">Esther Funds Foundation</a></p>
      </div>
    </footer>
  );
}
