/* Everything REACH offers, organized once. The home page doors and /resources read
   from here; add a new tool or link here and it shows up in both. Wording is REACH's
   own from the pages each item links to; outside links are official sources. */

export type Item = { title: string; text: string; href: string; tag?: "EFF" | "Tool" | "Guide" | "Official" | "Now" };
export type Category = { key: string; title: string; line: string; hue: string; glyph: string; items: Item[] };

export const CATEGORIES: Category[] = [
  {
    key: "now", title: "Help right now", line: "Food, rent, a bill, a hold, a hard night. Start here.", hue: "#ff6f61", glyph: "✦",
    items: [
      { title: "REACH Emergency: make a plan", text: "Five private questions, then a step-by-step plan: your campus emergency fund, help near you and what's open right now.", href: "/emergency", tag: "Now" },
      { title: "Get Help near you", text: "Say what's going on in your own words and get local help, nearest first, plus exactly what to say when you call.", href: "/get-help", tag: "Now" },
      { title: "988 Suicide & Crisis Lifeline", text: "Call, text, or chat 988 for immediate mental-health crisis support.", href: "https://988lifeline.org/", tag: "Official" },
      { title: "Ask a real person at EFF", text: "Tell EFF what's going on, privately. You get a code to follow your request.", href: "https://my.estherfundsfoundation.org/lighthouse", tag: "EFF" },
      { title: "College Retention Emergency Terminal", text: "Diagnose urgent barriers, build formal petitions, prepare evidence, and escalate to the right campus or public authority.", href: "/defense?tool=tuition", tag: "Tool" },
      { title: "Tuition Rescue Plan", text: "Get a personalized 48-hour plan and email opener based on your deadline.", href: "/tools/balance", tag: "Tool" },
      { title: "Local help through 211", text: "Find nearby food, housing, health, transportation, and emergency services.", href: "https://www.211.org/", tag: "Official" },
      { title: "Apply for EFF emergency funding", text: "When EFF's emergency funding is open, apply with your My REACH account.", href: "/apply", tag: "EFF" },
    ],
  },
  {
    key: "pay", title: "Pay for school", line: "Scholarships checked every morning, EFF's own awards, and aid made plain.", hue: "#ffd35a", glyph: "$",
    items: [
      { title: "REACH Scholarships", text: "Thousands of open scholarships, checked every morning. Search by level, deadline and state.", href: "/scholarships", tag: "EFF" },
      { title: "REACH Freebies", text: "Free money you're owed, free software, free trials and student prices, checked by EFF. A new Free Friday every week.", href: "/freebies", tag: "EFF" },
      { title: "Match me in 2 minutes", text: "Answer a few questions and see the open scholarships that fit you, with the reasons why.", href: "/scholarships/match", tag: "Tool" },
      { title: "Apply to EFF", text: "Esther Funds Foundation's own scholarships and funding, in one account.", href: "/apply", tag: "EFF" },
      { title: "The Scholarship Walk", text: "167 hand-picked scholarships in the order they close. Save a list and add deadlines to your calendar.", href: "/scholarshipwalk", tag: "EFF" },
      { title: "FAFSA Decoder", text: "Decode your FAFSA status, SAI, verification request, or changed financial circumstances.", href: "/tools/fafsa", tag: "Tool" },
      { title: "Award Letter & Balance Decoder", text: "Upload an aid letter, add your bill, wages, work hours, savings, and support, then see what is still uncovered.", href: "/tools/award", tag: "Tool" },
      { title: "Financial Aid Offer Decoder", text: "Separate gift aid, debt, work-study, bill gap, and the full cost of attendance.", href: "/tools/aid", tag: "Tool" },
      { title: "Financial Aid Counter-Offer Engine", text: "Compare competing offers, check a federal net-price benchmark, and draft a respectful institutional-aid reconsideration request.", href: "/tools/counteroffer", tag: "Tool" },
      { title: "Pell Protector", text: "Check whether other grants could push your Pell Grant away, before you accept them.", href: "https://my.estherfundsfoundation.org/kit/pell", tag: "Tool" },
      { title: "Scholarship Essay Builder", text: "Answer five quick prompts and instantly get a scholarship-ready STORY outline.", href: "/tools/essay", tag: "Tool" },
      { title: "Scholarship Action Center", text: "Turn one deadline and its requirements into a complete application checklist.", href: "/tools/scholarship", tag: "Tool" },
      { title: "Official EFF Recommendation Letter", text: "Submit truthful facts and save a personalized Esther Funds Foundation letter.", href: "/tools/recommendation", tag: "EFF" },
      { title: "Essay & planner toolkits", text: "Free PDFs: essay toolkit, application planner, senior roadmap, aid appeal toolkit and more.", href: "/scholarships/toolkits", tag: "Guide" },
      { title: "College Scorecard", text: "Compare institutions by costs, completion, fields of study, and earnings.", href: "https://collegescorecard.ed.gov/", tag: "Official" },
      { title: "Loan Simulator", text: "Estimate repayment options and understand how future borrowing changes your payment.", href: "https://studentaid.gov/loan-simulator/", tag: "Official" },
    ],
  },
  {
    key: "stay", title: "Stay enrolled", line: "Holds, appeals, grades, transcripts: fight for your seat before you give it up.", hue: "#b799e3", glyph: "↻",
    items: [
      { title: "The Survival Kit", text: "Can I still register? Write my appeal. Help near my campus. Everything in one place.", href: "https://my.estherfundsfoundation.org/kit", tag: "EFF" },
      { title: "EFF Student Defense Suite", text: "Protect your aid, grades, transcript, housing, degree path, and registration with one focused next-step system.", href: "/defense?tool=triage", tag: "Tool" },
      { title: "Stay-Enrolled Planner", text: "Name the barrier and build a support-team plan before changing enrollment.", href: "/tools/persist", tag: "Tool" },
      { title: "Deadline Reminder Builder", text: "Download private calendar alerts for two weeks, three days, and one day before.", href: "/tools/reminders", tag: "Tool" },
      { title: "Reach for Yourself", text: "Find immediate help, funding, benefits, academic support, wellness care, and a plan to stay enrolled.", href: "/reach-yourself", tag: "Guide" },
      { title: "Disability & accommodation rights", text: "Learn about Section 504, the ADA, and support in higher education.", href: "https://www.ed.gov/laws-and-policy/civil-rights-laws/disability-discrimination", tag: "Official" },
      { title: "Free civil legal aid", text: "Find local help for housing, family, benefits, employment, and consumer issues.", href: "https://www.lsc.gov/about-lsc/what-legal-aid/i-need-legal-help", tag: "Official" },
    ],
  },
  {
    key: "mind", title: "Mind & heart", line: "You don't have to hold it alone. Rest, talk, pray, breathe.", hue: "#7fd3c7", glyph: "♡",
    items: [
      { title: "988 Suicide & Crisis Lifeline", text: "Call, text, or chat 988 for immediate mental-health crisis support.", href: "https://988lifeline.org/", tag: "Official" },
      { title: "Crisis Text Line", text: "Text HOME to 741741 to reach a trained crisis counselor.", href: "https://www.crisistextline.org/", tag: "Official" },
      { title: "Selah", text: "A quiet space: music, scripture, breathing and a timer. No account.", href: "https://selah.estherfundsfoundation.org/", tag: "EFF" },
      { title: "The Lighthouse", text: "Ask EFF for help privately and follow your request.", href: "https://my.estherfundsfoundation.org/lighthouse", tag: "EFF" },
      { title: "Help Them Stay", text: "Practice a branching conversation, see how each response lands, and leave with words and resources you can use.", href: "/reach-a-friend/walkthrough", tag: "Tool" },
    ],
  },
  {
    key: "career", title: "Career & income", line: "Build the résumé, practice the interview, earn while you learn.", hue: "#6fb3ff", glyph: "↗",
    items: [
      { title: "EFF Builds Your Résumé", text: "Tap through your real experience and generate an editable, ATS-ready one-page résumé with interview-defense coaching.", href: "/resume", tag: "Tool" },
      { title: "EFF Interview Coach", text: "Practice a profession-specific interview, record locally, receive transparent rubric feedback, and retry until mastered.", href: "/eff-interview-coach/", tag: "Tool" },
      { title: "Career Launchpad Profile", text: "Organize your story, projects, skills, and reference details into a private, editable professional profile.", href: "/tools/career-profile", tag: "Tool" },
      { title: "CareerOneStop", text: "Explore careers, assessments, training, scholarships, and local American Job Centers.", href: "https://www.careeronestop.org/", tag: "Official" },
      { title: "Internships & apprenticeships", text: "Explore paid work-based learning and credentials connected to growing careers.", href: "https://www.apprenticeship.gov/", tag: "Official" },
      { title: "College money skills", text: "Handle aid refunds, banking, budgeting, and borrowing more confidently.", href: "https://www.consumerfinance.gov/consumer-tools/student-loans/manage-your-college-money/", tag: "Official" },
    ],
  },
  {
    key: "family", title: "Family & friends", line: "For the people in your corner, and for being someone's.", hue: "#ff9ec4", glyph: "∞",
    items: [
      { title: "Reach for a Friend", text: "Learn how to listen, encourage, connect, follow up, set boundaries, and respond when safety is at risk.", href: "/reach-a-friend", tag: "Guide" },
      { title: "Parent & Family College Funding Guide", text: "Practical ways to support without taking over, FAFSA and aid-office questions, and an urgent-money plan.", href: "/downloads/eff-parent-family-college-funding-guide.pdf", tag: "Guide" },
      { title: "Family Funding Check", text: "Pressure-test the college gap and a parent or private-loan decision.", href: "/tools/family", tag: "Tool" },
      { title: "FAFSA for parents", text: "Understand contributor invitations, consent, tax information, and common mistakes.", href: "https://studentaid.gov/articles/fafsa-for-parents/", tag: "Official" },
      { title: "Childcare & family assistance", text: "Find state childcare subsidies, campus childcare, WIC, SNAP, and family supports.", href: "https://www.childcare.gov/consumer-education/get-help-paying-for-child-care/child-care-financial-assistance-options", tag: "Official" },
      { title: "REACH K–12", text: "Help students and families prepare for college, financial aid, belonging, and the transition before a crisis begins.", href: "/reach-k-12", tag: "Guide" },
    ],
  },
  {
    key: "lead", title: "Lead & give", line: "Be the reason someone else stays.", hue: "#c9a0ff", glyph: "✺",
    items: [
      { title: "REACH Ambassadors", text: "Meet the student leaders bringing care, resources, and connection to campus.", href: "/ambassadors", tag: "EFF" },
      { title: "REACH Workshops", text: "Live workshops where the whole room plays along on their phones. Join with a code, or host one from MyEFF.", href: "/workshops", tag: "EFF" },
      { title: "Request a REACH workshop", text: "Bring a REACH workshop or support to your campus.", href: "/workshop-request", tag: "EFF" },
      { title: "Campus Event Builder", text: "Create a useful 60-minute REACH event in under three minutes.", href: "/tools/campus", tag: "Tool" },
      { title: "Reach Your Campus", text: "Run a workshop, request support, host a scholarship search party, or become an EFF ambassador.", href: "/reach-your-campus", tag: "Guide" },
      { title: "Reach Your Community", text: "Lead care packages, pantry and hygiene drives, advocacy, mentorship, and readiness projects.", href: "/reach-your-community", tag: "Guide" },
      { title: "Reach Beyond Campus", text: "Start a chapter, grow student leadership, donate, and build partnerships that outlast one event.", href: "/reach-beyond-campus", tag: "Guide" },
      { title: "REACH for Professionals", text: "Mentor students, sponsor programming, offer career access, partner with EFF, or return as an alum leader.", href: "/reach-for-professionals", tag: "Guide" },
      { title: "Fund a student's next step", text: "Support scholarships, emergency aid, educational tools, and student care.", href: "https://givebutter.com/estherfundsfoundation", tag: "EFF" },
    ],
  },
];
