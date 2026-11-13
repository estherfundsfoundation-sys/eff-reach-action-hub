import type { Metadata } from "next";
import Link from "next/link";
import ReachOpening from "../ReachOpening";
import { SiteTop, SiteFoot } from "../myreach/ui";
import "../scholarships/scholarships.css";
import "../reach-home.css";

/* The REACH story: the scroll film that used to open the home page (moved here 13 Nov 2026 so the home page
   opens on help; the film itself is unchanged). */
export const metadata: Metadata = { title: "The REACH story", description: "Why REACH exists: before you drop out, REACH." };

export default function Story() {
  return (
    <main className="sc rh">
      <SiteTop />
      <ReachOpening />
      <section className="rh-what"><div className="sc-wrap">
        <p className="rh-kick">That&rsquo;s the story</p>
        <h2>Now find what you need.</h2>
        <div className="sc-acts"><Link className="sc-btn" href="/">Back to REACH</Link><Link className="sc-btn ghost" href="/resources">Every resource</Link></div>
      </div></section>
      <SiteFoot />
    </main>
  );
}
