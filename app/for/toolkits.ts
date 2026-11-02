/* REACH toolkits (2 Nov 2026, Shayna: "toolkits for school universities nonprofits and etc"). One
   per door on /start. Each has a promise, numbered steps, words to copy, printable checklists, and the
   REACH Library filtered to who it's for. Facts here are general and point to the official page;
   never add a dollar amount or a date that can go stale. */
import type { Who } from "../content/library";

export type Step = { title: string; text: string; href?: string; link?: string };
export type Kit = {
  tab: string; slug: string; who: Who; hue: string; k: string; title: string; em: string; lede: string;
  steps: { heading: string; list: Step[] };
  boxes: { title: string; items: string[] }[];
  copy: { title: string; text: string }[];
  close: { title: string; text: string; cta: { label: string; href: string }[] };
};

const REACH = "reach.estherfundsfoundation.org";

export const KITS: Kit[] = [
  {
    tab: "Families", slug: "families", who: "family", hue: "#ff9ec4", k: "For parents, grandparents and guardians",
    title: "You don't have to know college", em: "to help someone finish it.",
    lede: "Whether you're a parent, a grandparent raising a grandchild, an auntie or a guardian: here's what to know, what to say, and where to send them, from the first FAFSA to graduation day.",
    steps: { heading: "Five things every family should know", list: [
      { title: "The FAFSA is free, and it opens the door to most aid.", text: "Federal grants, work-study, loans, and most state and college aid start with it. Never pay anyone to file it. A dependent student's FAFSA asks for a parent's information; a grandparent or legal guardian usually isn't the FAFSA parent unless they adopted the student. If a student has no contact with their parents, the college's financial aid office can talk about a dependency override.", href: "https://studentaid.gov/articles/fafsa-for-parents/", link: "FAFSA for parents (official)" },
      { title: "Once they're in college, the school talks to them, not you.", text: "Under FERPA, a college generally can't share grades or a balance with family unless the student agrees in writing. Ask your student to add you through the school's own consent form if they want you to help.", href: "https://studentprivacy.ed.gov/", link: "Student privacy (official)" },
      { title: "A small balance can stop a whole semester.", text: "A hold can block registration and transcripts over an unpaid bill. If they mention a hold, help them find the exact amount and the date it's due before anything else.", href: "/holdup", link: "HOLD UP: know what you owe" },
      { title: "Help is out there, and most of it is on campus.", text: "Most colleges have an emergency fund, a food pantry and a payment plan, and the financial aid office can look again when a family's money changes. REACH Emergency builds the plan in five questions.", href: "/emergency", link: "REACH Emergency" },
      { title: "Scholarship offers that ask for money are scams.", text: "You never pay to apply for a real scholarship or to file the FAFSA.", href: "https://studentaid.gov/resources/scams", link: "Spot a scam (official)" },
    ] },
    boxes: [
      { title: "When they call and say they want to quit", items: ["Listen first. Ask what's going on before you answer.", "Ask: is it money, a class, where they live, or how they feel?", "Don't fix it all tonight. Find the one next step together.", "Ask who at school they've told. A professor, an advisor, financial aid.", "Send them the plan: REACH Emergency, or a real person at EFF.", "Check in again in three days. Then again."] },
      { title: "Grandparents and relatives raising a student", items: ["You may not be the FAFSA parent: ask the aid office what applies to your student.", "Kinship families can find support and benefits through GrandFamilies help.", "Your student may qualify as independent in some situations: the aid office decides.", "You can still be the one they call. That matters more than the paperwork."] },
      { title: "A family calendar", items: ["Senior year, fall: college list, applications, the FAFSA when it opens.", "Senior year, spring: compare aid offers, decide, pay the deposit.", "Summer before: orientation, housing, the first bill. Don't let summer take the seat.", "Every year: file the FAFSA again.", "Every semester: ask about the balance before registration."] },
    ],
    copy: [
      { title: "A text to send your student", text: `I'm proud of you. If anything ever gets in the way of school (money, a class, anything), tell me first and we'll figure out the next step together. EFF has free help for students too: ${REACH}` },
    ],
    close: { title: "Bring the whole family", text: "Ask your student's school, church or chapter to host First-Gen Family Night, a REACH workshop for families.", cta: [{ label: "Request a REACH visit", href: "/workshop-request" }, { label: "Put an Emergency Grant in your family's name", href: "https://www.estherfundsfoundation.org/name-a-grant" }] },
  },
  {
    tab: "High schools", slug: "schools", who: "school", hue: "#ffb35a", k: "For high school counselors, teachers and coaches",
    title: "Get them to college,", em: "and through it.",
    lede: "A free toolkit for your building: what to share with students and families in every grade, the REACH tools that do the heavy lifting, and words you can copy into an announcement tonight.",
    steps: { heading: "Bring REACH into your school in four steps", list: [
      { title: "Share one link.", text: `Put ${REACH} in your newsletter, your counseling page and your senior seminar. Students tap "I'm a student", answer three private questions and get their own plan.`, href: "/start", link: "Open Start here" },
      { title: "Let seniors build their applications with EFF.", text: "Apply With Me · College walks them through activities, a personal statement, a college list and every supplement, then they click submit on the college's own portal.", href: "/apply-with-me/college", link: "Apply With Me · College" },
      { title: "Stop summer melt.", text: "Students who get in can still lose the seat over a deposit, orientation or the first bill. Senior mode in the REACH Predictor lines those up against their aid.", href: "https://my.estherfundsfoundation.org/kit/predictor", link: "The REACH Predictor" },
      { title: "Host a REACH night.", text: "FAFSA & Financial Aid Night, Apply With Me Night or First-Gen Family Night: the whole room plays along on their phones.", href: "/workshop-request", link: "Request a REACH visit" },
    ] },
    boxes: [
      { title: "9th and 10th grade", items: ["The hardest classes they can handle, and help when they need it.", "One or two activities they really care about.", "Explore careers and colleges early.", "Start a list of everything they do: it becomes the application."] },
      { title: "11th grade", items: ["PSAT, and SAT or ACT with fee waivers if they qualify.", "A first college list: reach, match, safe, and affordable.", "Visit campuses, in person or online.", "Ask two teachers early about recommendations."] },
      { title: "12th grade", items: ["Applications and fee waivers.", "The FAFSA as soon as it opens, with a parent contributor.", "Scholarships every month.", "Compare aid offers in spring: gift aid versus loans.", "Deposit, orientation and the first bill over the summer."] },
    ],
    copy: [
      { title: "An announcement for families", text: `Free help for every student and family, from 9th grade through college: scholarships checked every morning, help with the FAFSA and college applications, and a real person if something goes wrong. Esther Funds Foundation's REACH: ${REACH}` },
      { title: "For the morning announcements", text: `Thinking about college, or already applying? REACH by Esther Funds Foundation is free: scholarships, application help and a plan made for you. Go to ${REACH} and tap "I'm a student."` },
    ],
    close: { title: "Partner with EFF", text: "Want REACH in front of every student in your district? Tell us about your school.", cta: [{ label: "Request a REACH visit", href: "/workshop-request" }, { label: "Partner with EFF", href: "https://partner.estherfundsfoundation.org/" }] },
  },
  {
    tab: "Colleges", slug: "colleges", who: "college", hue: "#6fb3ff", k: "For college staff, faculty and advisors",
    title: "Help them stay.", em: "It's free.",
    lede: "Students rarely leave over one big thing. It's a hold, a bill, a hard week. REACH puts help in their hands before a hard semester becomes the last one, and it costs your campus nothing.",
    steps: { heading: "Four ways your campus can use REACH", list: [
      { title: "Partner free with REACH for Campuses.", text: "Get a campus link, graphics, captions and a syllabus statement, and be listed as a REACH campus if you'd like.", href: "/campus", link: "Join REACH for Campuses" },
      { title: "Put REACH in your syllabus and orientation.", text: "Students who know where help is before they need it use it sooner. Copy the statement below.", },
      { title: "Send students to the right tool.", text: "HOLD UP for a balance and a hold, Before You Withdraw for the cost of leaving, Talk to My Professor for the email they're scared to write, and REACH Emergency for everything else.", href: "/start", link: "See the student guide" },
      { title: "Bring REACH to campus.", text: "A live REACH workshop for a class, a residence hall or orientation, or REACH on Tour.", href: "/workshop-request", link: "Request a REACH visit" },
    ] },
    boxes: [
      { title: "When a student tells you something is wrong", items: ["Thank them for telling you. That took courage.", "Listen. You don't have to solve it or diagnose it.", "Ask what would help this week: time, a referral, a person.", "Walk them to the office, or send the email together.", "If they mention hurting themselves, they can call or text 988 now, and follow your campus's safety steps.", "Follow up in a few days."] },
      { title: "What students most often need", items: ["Money for a bill or a hold before registration.", "Food and housing.", "A deadline or attendance exception after a crisis.", "Someone to explain their aid offer.", "Permission to ask for help without shame."] },
      { title: "Make basic needs part of the campus", items: ["Put the food pantry and emergency fund on the syllabus and the student portal.", "Use research on student basic needs to make the case on campus.", "Start or grow a meal-sharing program.", "Tell students what you'll do with what they share, and who will see it."] },
    ],
    copy: [
      { title: "A syllabus statement", text: `If something outside this class is making it hard to stay in school (money, food, housing, family, your health), you are not alone and you don't have to explain it all. Talk to me, contact our campus resources, or use REACH by Esther Funds Foundation, free and private: ${REACH}` },
      { title: "For your orientation slide", text: `Before you drop out, REACH. Free scholarships, emergency plans and a real person to talk to: ${REACH}` },
    ],
    close: { title: "Your campus, on the map", text: "Partner campuses get their own REACH link and a share kit, and EFF chapters can partner on events.", cta: [{ label: "Join REACH for Campuses", href: "/campus" }, { label: "Sponsor REACH", href: "/sponsor" }] },
  },
  {
    tab: "Churches & nonprofits", slug: "community", who: "community", hue: "#c9a0ff", k: "For churches, nonprofits and businesses",
    title: "Your people can keep", em: "a student in school.",
    lede: "Most students who leave college don't leave over grades. A congregation, a nonprofit or a business can be the reason one stays: with a gift, a workshop, a service drive or a door opened.",
    steps: { heading: "Five ways to stand with students", list: [
      { title: "Tell your students REACH exists.", text: "Copy the announcement below into your bulletin, your newsletter or your group chat.", },
      { title: "Put an Emergency Grant in your name.", text: "$250 pays one student's emergency to the landlord, clinic or school, in your church's, family's or company's name.", href: "https://www.estherfundsfoundation.org/name-a-grant", link: "Name a grant" },
      { title: "Host a REACH workshop.", text: "A youth night, a back-to-school Sunday or a community event: REACH comes to you and the whole room plays along.", href: "/workshop-request", link: "Request a REACH visit" },
      { title: "Lead a service drive.", text: "Care packages, pantry and hygiene drives for students near you: collect first, then give.", href: "/reach-your-community", link: "Reach Your Community" },
      { title: "Fundraise or partner.", text: "Start a fundraiser for the EFF Student Fund, sponsor REACH, mentor students or offer internships.", href: "https://partner.estherfundsfoundation.org/", link: "100 ways to partner" },
    ] },
    boxes: [
      { title: "For churches", items: ["Pray for your students by name at the start of each semester.", "Ask each college student one question: is anything in the way of school right now?", "Keep a small fund, or name an EFF Emergency Grant.", "Send care packages at midterms and finals.", "Celebrate graduates from the pulpit."] },
      { title: "For nonprofits and businesses", items: ["Offer paid internships and job shadows.", "Mentor a student through their first year.", "Sponsor a REACH stop or a REACH Box.", "Match your employees' gifts to students.", "Hire graduates."] },
    ],
    copy: [
      { title: "A Sunday announcement", text: `If you're in college, or getting ready to go, and anything is getting in the way (money, a bill, a hard semester), there is free help through Esther Funds Foundation's REACH: ${REACH}. And if you'd like to help a student stay in school, talk to us about putting an EFF Emergency Grant in our church's name.` },
    ],
    close: { title: "For such a time as this", text: "“Who knows but that you have come to your position for such a time as this?” Esther 4:14", cta: [{ label: "Partner with EFF", href: "https://partner.estherfundsfoundation.org/" }, { label: "Fundraise for students", href: "https://www.estherfundsfoundation.org/fundraise" }] },
  },
];
