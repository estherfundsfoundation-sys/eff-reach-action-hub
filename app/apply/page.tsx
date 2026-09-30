import type { Metadata } from "next";
import Link from "next/link";
import { rpc } from "../scholarships/lib";
import type { Program } from "../myreach/pass";
import { SiteTop, SiteFoot } from "../myreach/ui";
import "../scholarships/scholarships.css";

/* Apply to EFF: EFF's own scholarships, grants and emergency funding (eff_reach_programs).
   National opens and closes them in MyEFF → National → Programs. */
export const metadata: Metadata = {
  title: "Apply to EFF | REACH",
  description: "Esther Funds Foundation's own scholarships and emergency funding. Apply with a free My REACH account and follow your application.",
  alternates: { canonical: "/apply" },
};
const KIND: Record<string, string> = { scholarship: "Scholarship", grant: "Grant", emergency: "Emergency funding", award: "Award" };

export default async function Page() {
  let programs: Program[] = [];
  try { programs = await rpc<Program[]>("eff_reach_programs", {}, 60); } catch { /* shown below */ }
  const open = programs.filter((p) => p.open);
  const closed = programs.filter((p) => !p.open);
  const card = (p: Program) => (
    <article className="sc-card" key={p.key}>
      <span className={`sc-due${p.open ? " hot" : ""}`}>{p.open ? (p.rolling ? "Open: apply anytime" : p.closes_at ? `Open · closes ${new Date(p.closes_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })}` : "Open") : "Closed for now"}</span>
      <span className="sc-small" style={{ fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", fontSize: 12 }}>{KIND[p.kind] || p.kind}{p.audience === "members" ? " · EFF members" : ""}</span>
      {p.amount ? <div className="sc-amt">{p.amount}</div> : null}
      <h3><Link href={`/apply/${p.key}`}>{p.name}</Link></h3>
      <p className="sc-by">{p.summary}</p>
    </article>
  );
  return (
    <main className="sc">
      <SiteTop on="/apply" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick"><span className="dot" aria-hidden="true" />From Esther Funds Foundation</span>
          <h1>Apply to <em>EFF.</em></h1>
          <p>EFF&rsquo;s own scholarships and emergency funding. Make a free My REACH account with just your email, apply in one place, upload what&rsquo;s asked, and watch your application move. Never pay to apply.</p>
          <div className="sc-acts"><Link className="sc-btn coral" href="/account">Sign in or make an account</Link><Link className="sc-btn ghost" href="/scholarships/recipients">Meet past recipients</Link></div>
        </div>
      </section>
      <div className="sc-wrap sc-section">
        {open.length ? <><h2 className="sc-h2" style={{ marginTop: 0 }}>Open now</h2><div className="sc-grid">{open.map(card)}</div></> : (
          <div className="sc-empty"><h2>Nothing is open this minute.</h2><p>When EFF opens a scholarship or emergency funding, it appears here first, and on <a href="https://www.instagram.com/estherfundsfoundation/">EFF&rsquo;s Instagram</a>. Make your account now so you&rsquo;re ready. Need money this week? <Link href="/get-help">Get Help</Link> finds emergency aid near you.</p></div>
        )}
        {closed.length ? <><h2 className="sc-h2">Opening again</h2><div className="sc-grid">{closed.map(card)}</div></> : null}
      </div>
      <SiteFoot />
    </main>
  );
}
