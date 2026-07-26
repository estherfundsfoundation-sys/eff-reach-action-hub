/* eslint-disable @next/next/no-img-element */
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";

type Activity = {id:string;title:string;activity_type:string;campus:string;activity_date:string;description:string;students_reached:number|null;photo_urls:string[]};
type Ambassador = {
  slug:string;display_name:string;headline:string|null;institution:string;major:string|null;class_year:string|null;
  bio:string;why_reach:string|null;focus_areas:string[];instagram_url:string|null;linkedin_url:string|null;photo_url:string|null;activities:Activity[];
};

async function loadAmbassador(slug:string): Promise<Ambassador|null> {
  try {
    const response = await fetch(`https://portal.estherfundsfoundation.org/api/reach/ambassadors/${encodeURIComponent(slug)}`, {cache:"no-store"});
    if (!response.ok) return null;
    const result = await response.json() as {ambassador?:Ambassador};
    return result.ambassador ?? null;
  } catch {
    return null;
  }
}

const initials = (name:string) => name.split(/\s+/).slice(0,2).map((part) => part[0]).join("");

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug} = await params;
  const ambassador = await loadAmbassador(slug);
  return ambassador ? {title:`${ambassador.display_name} | REACH Ambassador`,description:ambassador.headline || `${ambassador.display_name} is a REACH Ambassador at ${ambassador.institution}.`} : {title:"REACH Ambassador"};
}

export default async function AmbassadorProfilePage({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params;
  const ambassador = await loadAmbassador(slug);
  if (!ambassador) notFound();
  return <main className="public-ambassador-page">
    <div className="announcement">Published with ambassador permission and Esther Funds Foundation review.</div>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="EFF Reach Action Hub home"><img src="/eff-logo.png" alt="Esther Funds Foundation"/><span><strong>REACH</strong> Action Hub</span></Link>
      <nav aria-label="Profile navigation"><Link href="/">Action Hub</Link><Link href="/ambassadors">Ambassadors</Link></nav>
      <a className="header-cta" href="https://portal.estherfundsfoundation.org/">Scholarship Portal ↗</a>
    </header>
    <section className="ambassador-profile-hero"><div className="profile-hero-inner">
      <Link className="profile-back" href="/ambassadors">← Ambassador Directory</Link>
      <div className="profile-identity"><div className="ambassador-photo large">{ambassador.photo_url ? <img src={ambassador.photo_url} alt=""/> : <span>{initials(ambassador.display_name)}</span>}</div><div><p className="kicker">EFF REACH AMBASSADOR</p><h1>{ambassador.display_name}</h1>{ambassador.headline && <p className="profile-headline">{ambassador.headline}</p>}<p className="profile-school">{ambassador.institution}</p></div></div>
    </div></section>
    <section className="ambassador-profile-body"><article><p className="kicker">MEET THE AMBASSADOR</p><h2>Service starts with connection.</h2><p className="profile-bio">{ambassador.bio}</p>{ambassador.why_reach && <blockquote><span>“</span><p>{ambassador.why_reach}</p><footer>Why REACH matters to {ambassador.display_name.split(" ")[0]}</footer></blockquote>}</article>
      <aside><p className="kicker">PROFILE</p>{ambassador.major && <div><small>AREA OF STUDY</small><strong>{ambassador.major}</strong></div>}{ambassador.class_year && <div><small>STUDENT STATUS</small><strong>{ambassador.class_year}</strong></div>}{ambassador.focus_areas.length > 0 && <div><small>FOCUS AREAS</small><div className="ambassador-tags">{ambassador.focus_areas.map((area) => <span key={area}>{area}</span>)}</div></div>}{(ambassador.instagram_url||ambassador.linkedin_url) && <div><small>CONNECT</small><div className="profile-socials">{ambassador.instagram_url && <a href={ambassador.instagram_url} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}{ambassador.linkedin_url && <a href={ambassador.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}</div></div>}</aside>
    </section>
    {ambassador.activities.length > 0 && <section className="ambassador-impact"><header><p className="kicker">REACH IN ACTION</p><h2>Approved campus impact</h2></header><div>{ambassador.activities.map((activity) => <article key={activity.id}>{activity.photo_urls[0] && <img src={activity.photo_urls[0]} alt=""/>}<section><p className="kicker">{activity.activity_type.replaceAll("_"," ")}</p><h3>{activity.title}</h3><p>{activity.description}</p><small>{activity.campus} · {new Date(`${activity.activity_date}T12:00:00`).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</small></section></article>)}</div></section>}
    <section className="ambassador-directory-cta"><div><p className="kicker">KEEP REACHING</p><h2>Find a practical next step.</h2><p>Explore student and family resources, interactive tools, and guided pathways across the REACH Action Hub.</p></div><Link className="button light" href="/">Open the Action Hub →</Link></section>
    <footer><div className="footer-links"><Link href="/">REACH Action Hub</Link><Link href="/ambassadors">Ambassador Directory</Link><a href="https://estherfundsfoundation.org/">Esther Funds Foundation</a></div><p className="disclaimer">EFF reviews public profile content for safety and relevance. Private contact details and unapproved submissions are never displayed.</p></footer>
  </main>;
}
