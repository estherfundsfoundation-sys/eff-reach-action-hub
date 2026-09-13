/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const urgentHelp = [
  { title: "Food & essentials", text: "Find local food, SNAP, campus pantry, and basic-needs support.", href: "https://portal.estherfundsfoundation.org/resources#basic-needs", tone: "yellow" },
  { title: "Housing & utilities", text: "Start with local assistance, campus housing support, and 211.", href: "https://portal.estherfundsfoundation.org/resources", tone: "pink" },
  { title: "Tuition balance", text: "Build an action plan for a balance, hold, appeal, or emergency grant.", href: "https://portal.estherfundsfoundation.org/resources", tone: "blue" },
  { title: "Mental health", text: "Call or text 988 in a crisis. Find ongoing support and campus care.", href: "https://988lifeline.org/", tone: "lavender" },
];

const pathways = [
  { number: "01", title: "Money for school", text: "Scholarships, FAFSA, aid appeals, tuition gaps, emergency funding, and financial-aid offer help.", href: "#college-money" },
  { number: "02", title: "Parents & families", text: "Plain-language guidance for FAFSA contributors, college costs, Parent PLUS decisions, and supporting your student.", href: "#families" },
  { number: "03", title: "Stay enrolled", text: "Food, housing, transportation, childcare, books, technology, and school-balance resources.", href: "#stay-enrolled" },
  { number: "04", title: "Career & income", text: "Jobs that work around college, internships, apprenticeships, career planning, resumes, and training.", href: "#career" },
  { number: "05", title: "Wellness & rights", text: "Mental health, accommodations, student-parent support, legal aid, and advocacy resources.", href: "#wellness" },
  { number: "06", title: "Scholarship portal", text: "Apply to EFF programs, claim an application, manage documents, and view your secure dashboard.", href: "https://portal.estherfundsfoundation.org/" },
];

const actionJourneys = [
  { tag: "SUPPORT FOR ME", title: "Reach for Yourself", text: "Find immediate help, funding, benefits, academic support, wellness care, and a plan to stay enrolled.", href: "/reach-yourself", color: "yellow" },
  { tag: "SUPPORT SOMEONE", title: "Reach for a Friend", text: "Learn how to listen, encourage, connect, follow up, set boundaries, and respond when safety is at risk.", href: "/reach-a-friend", color: "pink" },
  { tag: "CREATE CAMPUS CARE", title: "Reach Your Campus", text: "Run a workshop, request support, host a scholarship search party, or become an EFF ambassador.", href: "/reach-your-campus", color: "blue" },
  { tag: "SERVE LOCALLY", title: "Reach Your Community", text: "Lead care packages, pantry and hygiene drives, advocacy, mentorship, and readiness projects.", href: "/reach-your-community", color: "lavender" },
  { tag: "BUILD THE MOVEMENT", title: "Reach Beyond Campus", text: "Start a chapter, grow student leadership, donate, and build partnerships that outlast one event.", href: "/reach-beyond-campus", color: "yellow" },
  { tag: "START EARLY", title: "REACH K–12", text: "Help students and families prepare for college, financial aid, belonging, and the transition before a crisis begins.", href: "/reach-k-12", color: "pink" },
  { tag: "MENTOR + PARTNER", title: "REACH for Professionals", text: "Mentor students, sponsor programming, offer career access, partner with EFF, or return as an alum leader.", href: "/reach-for-professionals", color: "blue" },
];

const downloads = [
  { type: "UPLOAD + DECODE", title: "Award Letter & Balance Decoder", text: "Upload an aid letter, add your bill, wages, work hours, savings, and support, then see what is still uncovered.", href: "/tools?tool=award", color: "purple", pages: "featured calculator" },
  { type: "COMPARE + REQUEST", title: "Financial Aid Counter-Offer Engine", text: "Compare competing offers, check a federal net-price benchmark, and draft a respectful institutional-aid reconsideration request.", href: "/tools?tool=counteroffer", color: "pink", pages: "new interactive engine" },
  { type: "WRITE YOUR STORY", title: "Scholarship Essay Builder", text: "Answer five quick prompts and instantly get a scholarship-ready STORY outline.", href: "/tools?tool=essay", color: "yellow", pages: "interactive" },
  { type: "STAY ORGANIZED", title: "Scholarship Action Center", text: "Turn one deadline and its requirements into a complete application checklist.", href: "/tools?tool=scholarship", color: "pink", pages: "interactive" },
  { type: "GET UNSTUCK", title: "FAFSA Decoder", text: "Decode your FAFSA status, SAI, verification request, or changed financial circumstances.", href: "/tools?tool=fafsa", color: "blue", pages: "interactive" },
  { type: "COMPARE OFFERS", title: "Financial Aid Offer Decoder", text: "Separate gift aid, debt, work-study, bill gap, and the full cost of attendance.", href: "/tools?tool=aid", color: "lavender", pages: "calculator" },
  { type: "URGENT BALANCE", title: "Tuition Rescue Plan", text: "Get a personalized 48-hour plan and email opener based on your deadline.", href: "/tools?tool=balance", color: "yellow", pages: "interactive" },
  { type: "DON'T MISS IT", title: "Deadline Reminder Builder", text: "Download private calendar alerts for two weeks, three days, and one day before.", href: "/tools?tool=reminders", color: "pink", pages: "calendar tool" },
  { type: "FOR FAMILIES", title: "Family Funding Check", text: "Pressure-test the college gap and a parent or private-loan decision.", href: "/tools?tool=family", color: "pink", pages: "calculator" },
  { type: "HELP SOMEONE", title: "Help-a-Friend Script", text: "Choose the situation and tone to get words you can actually say or text.", href: "/tools?tool=friend", color: "blue", pages: "script maker" },
  { type: "LEAD ON CAMPUS", title: "Campus Event Builder", text: "Create a useful 60-minute REACH event in under three minutes.", href: "/tools?tool=campus", color: "lavender", pages: "interactive" },
  { type: "KEEP GOING", title: "Stay-Enrolled Planner", text: "Name the barrier and build a support-team plan before changing enrollment.", href: "/tools?tool=persist", color: "yellow", pages: "interactive" },
];

const resourceGroups = [
  {
    id: "college-money",
    eyebrow: "FUND YOUR FUTURE",
    title: "College money, without the confusion",
    intro: "Make a plan before a financial gap becomes a reason to leave school.",
    links: [
      ["EFF Scholarship Portal", "Search scholarships and apply to current EFF programs.", "https://portal.estherfundsfoundation.org/"],
      ["FAFSA Decoder", "Understand your status, SAI, verification request, and exact next move.", "/tools?tool=fafsa"],
      ["College Cost Decision Lab", "Compare real costs, debt, graduation outcomes, and likely monthly payments.", "https://www.consumerfinance.gov/paying-for-college/your-financial-path-to-graduation/"],
      ["College Scorecard", "Compare institutions by costs, completion, fields of study, and earnings.", "https://collegescorecard.ed.gov/"],
    ],
  },
  {
    id: "families",
    eyebrow: "FOR THE WHOLE FAMILY",
    title: "A calmer college plan for parents",
    intro: "Know what to sign, what to ask, what belongs to the student, and what different types of aid really mean.",
    links: [
      ["Parent & Family Toolkit", "Download EFF's college funding guide and family conversation worksheets.", "https://portal.estherfundsfoundation.org/resources#toolkits"],
      ["FAFSA for Parents", "Understand contributor invitations, consent, tax information, and common mistakes.", "https://studentaid.gov/articles/fafsa-for-parents/"],
      ["Childcare & Family Assistance", "Find state childcare subsidies, campus childcare, WIC, SNAP, and family supports.", "https://www.childcare.gov/consumer-education/get-help-paying-for-child-care/child-care-financial-assistance-options"],
      ["Financial Aid Offer Decoder", "See your net price, estimated bill gap, full cost gap, and accepted debt.", "/tools?tool=aid"],
    ],
  },
  {
    id: "career",
    eyebrow: "EARN + LEARN",
    title: "Career support that starts before graduation",
    intro: "Connect education to income with credible training, job, internship, and career-planning tools.",
    links: [
      ["CareerOneStop", "Explore careers, assessments, training, scholarships, and local American Job Centers.", "https://www.careeronestop.org/"],
      ["Internships & Apprenticeships", "Explore paid work-based learning and credentials connected to growing careers.", "https://www.apprenticeship.gov/"],
      ["College Money Skills", "Handle aid refunds, banking, budgeting, and borrowing more confidently.", "https://www.consumerfinance.gov/consumer-tools/student-loans/manage-your-college-money/"],
      ["Loan Simulator", "Estimate repayment options and understand how future borrowing changes your payment.", "https://studentaid.gov/loan-simulator/"],
    ],
  },
  {
    id: "wellness",
    eyebrow: "YOU DESERVE SUPPORT",
    title: "Wellness, rights, and someone to call",
    intro: "School is hard enough. These resources help with safety, mental health, accommodations, and legal barriers.",
    links: [
      ["988 Suicide & Crisis Lifeline", "Call, text, or chat 988 for immediate mental-health crisis support.", "https://988lifeline.org/"],
      ["Local Help Through 211", "Find nearby food, housing, health, transportation, and emergency services.", "https://www.211.org/"],
      ["Disability & Accommodation Rights", "Learn about Section 504, the ADA, and support in higher education.", "https://www.ed.gov/laws-and-policy/civil-rights-laws/disability-discrimination"],
      ["Free Civil Legal Aid", "Find local help for housing, family, benefits, employment, and consumer issues.", "https://www.lsc.gov/about-lsc/what-legal-aid/i-need-legal-help"],
    ],
  },
];

export default function Home() {
  return (
    <main>
      <div className="announcement">If you are in immediate danger, call 911. For mental-health crisis support, call or text 988.</div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="EFF Reach Action Hub home">
          <img src="/eff-logo.png" alt="Esther Funds Foundation" />
          <span><strong>REACH</strong> Action Hub</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#find-help">Find help</a>
          <a href="#action-paths">7 pathways</a>
          <Link href="/ambassadors">Ambassadors</Link>
          <Link href="/workshop-request">Workshop request</Link>
          <a href="#downloads">Interactive tools</a>
          <a href="#families">For families</a>
          <a href="#take-action">Take action</a>
        </nav>
        <a className="header-cta" href="https://portal.estherfundsfoundation.org/">Scholarship Portal ↗</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">A FREE STUDENT + FAMILY SUPPORT CENTER</p>
          <h1>College gets hard.<br /><em>Keep reaching.</em></h1>
          <p className="hero-lead">One welcoming place to find college funding, emergency support, family guidance, career tools, wellness resources, and a clear next step.</p>
          <div className="hero-actions">
            <a className="button primary" href="#find-help">Help me find my next step</a>
            <a className="button secondary" href="#downloads">Open free action tools</a>
          </div>
          <p className="microcopy">No account required to explore resources. Never email passwords, Social Security numbers, or verification codes.</p>
        </div>
        <div className="hero-art" aria-label="Reach out. Engage. Access resources. Care for your mental health. Hold on.">
          <div className="sunburst" />
          <div className="note note-one">YOU ARE NOT<br />BEHIND.</div>
          <div className="note note-two">YOU ARE<br />BUILDING.</div>
          <div className="reach-card">
            <span>R</span><b>Reach out</b>
            <span>E</span><b>Engage your community</b>
            <span>A</span><b>Access resources</b>
            <span>C</span><b>Care for your mental health</b>
            <span>H</span><b>Hold on</b>
          </div>
        </div>
      </section>

      <section className="quick-help" id="find-help">
        <div className="section-heading">
          <p className="kicker">START WHERE YOU ARE</p>
          <h2>What do you need help with today?</h2>
          <p>Choose the closest match. You do not need to know the name of a program before asking for help.</p>
        </div>
        <div className="help-grid">
          {urgentHelp.map((item) => (
            <a key={item.title} className={`help-card ${item.tone}`} href={item.href}>
              <span className="arrow">↗</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </a>
          ))}
        </div>
        <div className="not-sure">
          <div><strong>Not sure where to begin?</strong><span>Use the complete EFF resource center or ask for guidance.</span></div>
          <div><a href="https://portal.estherfundsfoundation.org/resources">Explore all resources</a><a href="mailto:nationals@estherfundsinc.org?subject=Student%20support%20request">Email EFF support</a></div>
        </div>
      </section>

      <section className="journeys" id="action-paths">
        <div className="section-heading">
          <p className="kicker">THE COMPLETE REACH ACTION HUB</p>
          <h2>Who do you want to reach?</h2>
          <p>Choose one of seven guided pathways. Every REACH pathway now lives on this website—no embedded pages and no extra scrollbars.</p>
        </div>
        <div className="journey-grid">
          {actionJourneys.map((item, index) => (
            <a className={`journey-card ${item.color}`} href={item.href} key={item.title}>
              <span className="journey-number">0{index + 1}</span>
              <p>{item.tag}</p><h3>{item.title}</h3><div>{item.text}</div><b>Open this path →</b>
            </a>
          ))}
        </div>
      </section>

      <section className="ambassador-callout">
        <div className="ambassador-callout-art" aria-hidden="true"><span>R</span><span>E</span><span>A</span><span>C</span><span>H</span></div>
        <div>
          <p className="kicker">STUDENT LEADERS IN ACTION</p>
          <h2>Meet the REACH Ambassadors bringing care, resources, and connection to campus.</h2>
          <p>Explore opt-in profiles, focus areas, and consent-confirmed campus-impact stories from the people helping students take their next step.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/ambassadors">Meet our ambassadors</Link>
            <Link className="button secondary" href="/workshop-request">Request workshop support</Link>
            <a className="button secondary" href="https://portal.estherfundsfoundation.org/reach/apply">Apply to become an ambassador</a>
            <a className="button secondary" href="https://portal.estherfundsfoundation.org/reach/ambassador/training">Ambassador training</a>
          </div>
        </div>
      </section>

      <section className="download-library" id="downloads">
        <div className="download-intro">
          <div>
            <p className="kicker">THE EFF STUDENT ACTION CENTER</p>
            <h2>Tap it. Answer it. Get your next move.</h2>
          </div>
          <p>Fast, mobile-first EFF tools built around the questions students and families ask us most. No research assignment and no wall of text.</p>
        </div>
        <div className="download-grid">
          {downloads.map((item, index) => (
            <a className={`download-card ${item.color}`} href={item.href} key={item.title}>
              <div className="download-top"><span>{String(index + 1).padStart(2, "0")}</span><b>{item.pages}</b></div>
              <p>{item.type}</p>
              <h3>{item.title}</h3>
              <div>{item.text}</div>
              <strong>Open the tool →</strong>
            </a>
          ))}
        </div>
        <div className="download-note"><strong>Private by design.</strong><span>No account is required, and answers stay in the student’s browser.</span></div>
      </section>

      <section className="pathways" id="reach-path">
        <div className="pathways-intro">
          <p className="kicker">YOUR SUPPORT MAP</p>
          <h2>One hub.<br />Every next step.</h2>
          <p>Resources are organized around real-life problems—not complicated systems.</p>
        </div>
        <div className="pathway-list">
          {pathways.map((item) => (
            <a href={item.href} className="pathway" key={item.number}>
              <span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><b>→</b>
            </a>
          ))}
        </div>
      </section>

      <section className="reach-manifesto">
        <p>R.E.A.C.H. IS MORE THAN A PROGRAM</p>
        <h2><span>R</span>each out. <span>E</span>ngage your community. <span>A</span>ccess resources. <span>C</span>are for your mental health. <span>H</span>old on.</h2>
        <p className="manifesto-end">Seeking help is not weakness. It is the first courageous step.</p>
      </section>

      <section className="resource-library" id="stay-enrolled">
        {resourceGroups.map((group, index) => (
          <article className={`resource-group ${index % 2 ? "reverse" : ""}`} id={group.id} key={group.id}>
            <div className="resource-title">
              <p className="kicker">{group.eyebrow}</p>
              <h2>{group.title}</h2>
              <p>{group.intro}</p>
            </div>
            <div className="resource-links">
              {group.links.map(([title, text, href]) => (
                <a href={href} key={title} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  <div><h3>{title}</h3><p>{text}</p></div><span>↗</span>
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="portal-callout">
        <div>
          <p className="kicker">READY TO APPLY?</p>
          <h2>The Reach Action Hub helps you prepare. The EFF Scholarship Portal is where you apply.</h2>
          <p>Create or access your secure account, explore EFF scholarship programs, upload documents, and follow your application status.</p>
        </div>
        <a className="button light" href="https://portal.estherfundsfoundation.org/">Go to the Scholarship Portal ↗</a>
      </section>

      <section className="take-action" id="take-action">
        <div className="section-heading">
          <p className="kicker">TURN CARE INTO ACTION</p>
          <h2>Help another student hold on.</h2>
        </div>
        <div className="action-grid">
          <Link href="/reach-yourself"><span>01</span><h3>Request or support a REACH Box</h3><p>Care packages with essentials, resources, and encouragement for students facing hardship.</p></Link>
          <a href="https://portal.estherfundsfoundation.org/partners"><span>02</span><h3>Partner with EFF</h3><p>Help expand college-retention resources, emergency response, and campus support.</p></a>
          <a href="https://givebutter.com/estherfundsfoundation"><span>03</span><h3>Fund a student’s next step</h3><p>Support scholarships, emergency aid, educational tools, and student care.</p></a>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><img src="/eff-logo.png" alt="" /><div><strong>Esther Funds Foundation</strong><span>We are working to prevent college dropouts around the world.</span></div></div>
        <div className="footer-links"><a href="https://estherfundsfoundation.org/">EFF Home</a><Link href="/ambassadors">Ambassador Directory</Link><a href="https://portal.estherfundsfoundation.org/">Scholarship Portal</a><a href="https://portal.estherfundsfoundation.org/programs">Programs</a><a href="mailto:nationals@estherfundsinc.org">Contact</a></div>
        <p className="disclaimer">EFF provides educational information and resource navigation. External services set their own eligibility rules and availability. EFF cannot guarantee funding or assistance from outside organizations.</p>
        <div className="footer-bottom"><span>© 2026 Esther Funds Foundation</span><span>Every Future Fulfilled.</span></div>
      </footer>
    </main>
  );
}
