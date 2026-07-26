/* eslint-disable @next/next/no-img-element */
import type {Metadata} from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "REACH Ambassador Directory | Esther Funds Foundation",
  description: "Meet the REACH Ambassadors connecting students and communities with resources, encouragement, and practical support.",
};

type Ambassador = {
  slug:string;
  display_name:string;
  headline:string|null;
  institution:string;
  class_year:string|null;
  focus_areas:string[];
  photo_url:string|null;
};

async function loadAmbassadors(): Promise<Ambassador[]> {
  try {
    const response = await fetch("https://portal.estherfundsfoundation.org/api/reach/ambassadors", {cache:"no-store"});
    if (!response.ok) return [];
    const result = await response.json() as {ambassadors?:Ambassador[]};
    return Array.isArray(result.ambassadors) ? result.ambassadors : [];
  } catch {
    return [];
  }
}

const initials = (name:string) => name.split(/\s+/).slice(0,2).map((part) => part[0]).join("");

export default async function AmbassadorDirectoryPage() {
  const ambassadors = await loadAmbassadors();
  return <main className="public-ambassador-page">
    <div className="announcement">Every public profile is published by an ambassador who intentionally chooses what to share.</div>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="EFF Reach Action Hub home"><img src="/eff-logo.png" alt="Esther Funds Foundation"/><span><strong>REACH</strong> Action Hub</span></Link>
      <nav aria-label="Directory navigation"><Link href="/">Action Hub</Link><Link href="/ambassadors">Ambassadors</Link><a href="https://portal.estherfundsfoundation.org/reach/apply">Apply</a><a href="https://portal.estherfundsfoundation.org/reach/claim">Sign in</a></nav>
      <a className="header-cta" href="https://portal.estherfundsfoundation.org/">Scholarship Portal ↗</a>
    </header>
    <section className="ambassador-directory-hero"><div>
      <p className="kicker">REACH AMBASSADOR DIRECTORY</p>
      <h1>Real people.<br/><em>Real campus care.</em></h1>
      <p>Meet the students and community leaders who help others find resources, build confidence, and hold on when college gets hard.</p>
      <div className="hero-actions"><a className="button light" href="https://portal.estherfundsfoundation.org/reach/apply">Apply to become an ambassador</a><a className="button secondary" href="https://portal.estherfundsfoundation.org/reach/ambassador/training">Open ambassador training</a></div>
    </div><aside><strong>{ambassadors.length}</strong><span>public ambassador profile{ambassadors.length===1?"":"s"}</span><p>Private login details and anything the ambassador does not publish remain hidden.</p></aside></section>
    <section className="ambassador-directory-shell">
      {ambassadors.length ? <div className="ambassador-directory-grid">{ambassadors.map((ambassador) => <Link className="ambassador-directory-card" href={`/ambassadors/${ambassador.slug}`} key={ambassador.slug}>
        <div className="ambassador-photo">{ambassador.photo_url ? <img src={ambassador.photo_url} alt=""/> : <span>{initials(ambassador.display_name)}</span>}</div>
        <p className="kicker">{ambassador.class_year || "REACH AMBASSADOR"}</p>
        <h2>{ambassador.display_name}</h2>
        {ambassador.headline && <p className="ambassador-headline">{ambassador.headline}</p>}
        <p className="ambassador-school">{ambassador.institution}</p>
        {ambassador.focus_areas.length > 0 && <div className="ambassador-tags">{ambassador.focus_areas.slice(0,3).map((area) => <span key={area}>{area}</span>)}</div>}
        <b>View profile →</b>
      </Link>)}</div> : <div className="ambassador-empty"><div className="empty-star">★</div><p className="kicker">DIRECTORY OPENING SOON</p><h2>Our ambassadors are building their profiles.</h2><p>Profiles appear here immediately after each ambassador chooses what to share and publishes from the secure workspace.</p><a className="button primary" href="https://portal.estherfundsfoundation.org/reach/ambassador">Open Ambassador Workspace</a></div>}
    </section>
    <section className="ambassador-directory-cta"><div><p className="kicker">BECOME A REACH CAMPUS AMBASSADOR</p><h2>Apply, train, serve, and share your impact.</h2><p>New ambassadors receive an automatic acceptance letter, secure account, EFF-hosted training, professional certificate, official social template, and workshop toolkits.</p></div><div className="hero-actions"><a className="button light" href="https://portal.estherfundsfoundation.org/reach/apply">Apply now ↗</a><a className="button secondary" href="https://portal.estherfundsfoundation.org/reach/ambassador">Ambassador workspace ↗</a></div></section>
    <footer><div className="footer-brand"><img src="/eff-logo.png" alt=""/><div><strong>Esther Funds Foundation</strong><span>Every Future Fulfilled.</span></div></div><div className="footer-links"><Link href="/">REACH Action Hub</Link><a href="https://portal.estherfundsfoundation.org/">Scholarship Portal</a><a href="mailto:nationals@estherfundsinc.org">Contact EFF</a></div><p className="disclaimer">Profiles and impact stories appear only after the ambassador confirms public-sharing permission.</p></footer>
  </main>;
}
