import Link from "next/link";
import ReachOpening from "./ReachOpening";
import { ReachBox, ReachLetters, ReachStill, ReachStory, ReachWalkers } from "./ReachFilm";
import { CATEGORIES } from "./content/resources";
import { SiteTop, SiteFoot } from "./myreach/ui";
import Doors from "./Doors";
import "./scholarships/scholarships.css";
import "./reach-home.css";

/* REACH home: the opening (a scroll-driven 3D film), what R.E.A.C.H. means, every resource
   behind seven doors (app/content/resources.ts is the one list), My REACH, the story so far
   with every date linked to its post, and a quiet close. Theatre for the moments; the doors
   and lists are plain and fast. */
export default function Home() {
  const total = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  return (
    <main className="sc rh">
      <ReachOpening />
      <SiteTop />

      <section id="what" className="rh-what">
        <div className="sc-wrap">
          <p className="rh-kick">What REACH is</p>
          <h2>Five letters for the moment you want to quit.</h2>
          <p>REACH is Esther Funds Foundation&rsquo;s student support. When school gets expensive, heavy or lonely, it puts help, money and people within reach, before a hard semester becomes the last one.</p>
        </div>
      </section>
      <ReachLetters />

      <section id="doors" className="rh-doors">
        <div className="sc-wrap">
          <p className="rh-kick">Everything, organized</p>
          <h2>Pick a door.</h2>
          <p className="rh-lede">{total} tools, guides and lifelines, sorted by what&rsquo;s going on. Or <Link href="/resources">see them all on one page</Link>.</p>
          <Doors />
        </div>
      </section>

      <section className="rh-me">
        <div className="sc-wrap rh-me-in">
          <div>
            <p className="rh-kick">My REACH</p>
            <h2>One account. Every application.</h2>
            <p>Apply for EFF&rsquo;s own scholarships and emergency funding, upload what&rsquo;s asked, and watch your application move, all in one place. No password: just your email and a code.</p>
            <div className="sc-acts"><Link className="sc-btn coral" href="/account">Make my free account</Link><Link className="sc-btn ghost" href="/apply">See what&rsquo;s open</Link></div>
          </div>
          <ol className="rh-steps" aria-label="How it works">
            <li><b>1</b><span>Type your email, then the code we send.</span></li>
            <li><b>2</b><span>Apply when EFF opens a scholarship or funding.</span></li>
            <li><b>3</b><span>Follow it here. EFF emails you when there&rsquo;s news.</span></li>
          </ol>
        </div>
      </section>

      <ReachWalkers />
      <ReachBox />

      <section className="rh-lead">
        <div className="sc-wrap rh-lead-in">
          <div className="rh-lead-art" aria-hidden="true"><span>R</span><span>E</span><span>A</span><span>C</span><span>H</span></div>
          <div>
            <p className="rh-kick">Student leaders in action</p>
            <h2>Be the reason someone stays.</h2>
            <p>REACH Ambassadors bring care, resources and connection to campus. Host a REACH workshop, lead a drive, or give to a student&rsquo;s next step.</p>
            <div className="sc-acts">
              <Link className="sc-btn" href="/ambassadors">Meet the ambassadors</Link>
              <Link className="sc-btn ghost" href="/workshops">REACH Workshops</Link>
              <Link className="sc-btn ghost" href="/resources#lead">All the ways to lead</Link>
            </div>
          </div>
        </div>
      </section>

      <ReachStory />
      <ReachStill />
      <SiteFoot />
    </main>
  );
}
