"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readPass } from "./pass";

/* The REACH site bar: one menu for every page. */
export const NAV = [
  { href: "/get-help", label: "Get Help" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/apply", label: "Apply to EFF" },
  { href: "/workshops", label: "Workshops" },
  { href: "/resources", label: "Resources" },
  { href: "/ambassadors", label: "Ambassadors" },
];

export function SiteTop({ on }: { on?: string }) {
  const [signed, setSigned] = useState(false);
  useEffect(() => {
    const up = () => setSigned(Boolean(readPass()));
    up(); window.addEventListener("reach-pass", up);
    return () => window.removeEventListener("reach-pass", up);
  }, []);
  return (
    <header className="sc-top">
      <div className="sc-wrap">
        <Link className="sc-brand" href="/">REACH<small>BY ESTHER FUNDS FOUNDATION</small></Link>
        <nav className="sc-menu" aria-label="REACH">
          {NAV.map((n) => <Link key={n.href} href={n.href} className={on === n.href ? "on" : ""} aria-current={on === n.href ? "page" : undefined}>{n.label}</Link>)}
          <Link href="/account" className={on === "/account" ? "on" : ""} style={{ fontWeight: 800 }}>{signed ? "My REACH" : "Sign in"}</Link>
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
        <p><Link href="/">REACH home</Link> · <Link href="/get-help">Get Help</Link> · <Link href="/scholarships">Scholarships</Link> · <Link href="/apply">Apply to EFF</Link> · <Link href="/workshops">Workshops</Link> · <Link href="/account">My REACH</Link> · <a href="https://www.estherfundsfoundation.org">Esther Funds Foundation</a></p>
      </div>
    </footer>
  );
}
