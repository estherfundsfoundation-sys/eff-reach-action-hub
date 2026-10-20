/* Apply With Me · College (20 Oct 2026, Shayna: "let us apply for your college this is a good resource for
   high school students"). The same promise as the scholarship builder: EFF builds the application with the
   student, and she submits it on the college's own portal, because every college asks her to certify it is
   her own work. Lengths follow the Common App's own limits; the prompts are the Common App's, and the page
   tells her to confirm this year's list on commonapp.org. Nothing here is a guess about a college's rules:
   she checks each college's page and her counselor. */

export type CRow = Record<string, string>;
export type CProfile = {
  hs?: string; hs_city?: string; hs_state?: string; ceeb?: string; grad_year?: string;
  gpa?: string; gpa_scale?: string; gpa_weighted?: string; rank?: string;
  senior_courses?: string; tests?: string; ap?: string; major?: string; major2?: string;
  first_gen?: string; waiver?: string; counselor?: string; counselor_email?: string; parent?: string; parent_email?: string;
  activities?: CRow[]; honors?: CRow[]; teachers?: CRow[];
};

export const LIMITS = { position: 50, org: 100, describe: 150, honor: 100 };

export const ACTIVITY_TYPES = [
  "Academic", "Art", "Athletics: Club", "Athletics: JV/Varsity", "Career Oriented", "Community Service (Volunteer)",
  "Cultural", "Dance", "Debate/Speech", "Family Responsibilities", "Journalism/Publication", "Music: Instrumental",
  "Music: Vocal", "Religious", "Robotics", "School Spirit", "STEM", "Student Government/Politics", "Theater/Drama",
  "Work (Paid)", "Other Club/Activity",
];
export const GRADES = ["9", "10", "11", "12", "After 12"];
export const HONOR_LEVELS = ["School", "State/Regional", "National", "International"];

// The Common App personal statement prompts. Confirm this year's on commonapp.org: they rarely change.
export const PROMPTS = [
  "Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.",
  "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?",
  "Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?",
  "Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?",
  "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
  "Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?",
  "Share an essay on any topic of your choice. It can be one you've already written, one that responds to a different prompt, or one of your own design.",
];
export const PS_LIMIT = 650;
export const PS_MIN = 250;

// The personal statement interview. Same rule as the scholarship essays: only her words, in a strong order.
export const PS_QS = [
  { key: "scene", rank: 1, ask: "Start in a moment. Where were you, what was happening, what could you see and hear?", hint: "Not \"I have always loved…\". Put us in the room: \"The bus was 40 minutes late again…\"" },
  { key: "before", rank: 2, ask: "Who were you before this, or what did you believe?", hint: "What you thought, what you were afraid of, what you didn't know yet." },
  { key: "turn", rank: 1, ask: "What changed? What did you do, decide or realize?", hint: "The turning point. Use \"I\" and real actions." },
  { key: "since", rank: 2, ask: "How does it show up in your life now? Give one or two real examples.", hint: "A habit, a role you took on, how you treat people, what you study." },
  { key: "meaning", rank: 1, ask: "What does this say about who you are and who you want to be in college and after?", hint: "End looking forward. This is the line they remember." },
];

// "Why us?" supplements: her research, her reasons, in her words.
export const WHY_QS = [
  { key: "specific", rank: 1, ask: "Name two or three things only this college has: a program, a professor, a club, a tradition, a place.", hint: "Look at their website and the major's page. Specific beats general every time." },
  { key: "connect", rank: 1, ask: "How does each one connect to something you've already done or care about?", hint: "\"I've led my school's robotics team for two years, so the ___ lab…\"" },
  { key: "give", rank: 2, ask: "What would you bring to their campus?", hint: "A club you'd join or start, a community you'd show up for." },
  { key: "future", rank: 2, ask: "Where would it take you after?", hint: "The career, the people you want to serve." },
];

export const PLATFORMS = [
  { v: "common", l: "Common App", url: "https://www.commonapp.org/" },
  { v: "cbca", l: "Common Black College App (many HBCUs)", url: "https://commonblackcollegeapp.com/" },
  { v: "coalition", l: "Coalition with Scoir", url: "https://www.coalitionforcollegeaccess.org/" },
  { v: "own", l: "The college's own application", url: "" },
  { v: "other", l: "Something else", url: "" },
];
export const DEADLINES = [
  { v: "ed", l: "Early Decision (binding)", note: "If you're admitted you must go and withdraw everywhere else. Only choose ED if you're sure and the money works; ask your counselor first." },
  { v: "ea", l: "Early Action", note: "Apply early, hear early, nothing binding." },
  { v: "rea", l: "Restrictive Early Action", note: "Not binding, but it limits where else you can apply early. Read the college's rules." },
  { v: "rd", l: "Regular Decision", note: "" },
  { v: "rolling", l: "Rolling admission", note: "They decide as applications arrive. Earlier is better." },
  { v: "priority", l: "Priority deadline", note: "Apply by this date for the best chance at scholarships and housing." },
];
export const DECISIONS = [
  { v: "", l: "Haven't heard yet" }, { v: "admitted", l: "Admitted 🎉" }, { v: "waitlisted", l: "Waitlisted" },
  { v: "deferred", l: "Deferred" }, { v: "denied", l: "Not admitted" },
];

// What every application usually needs. Each college's page decides.
export const CHECKS = [
  { k: "form", l: "Application form filled in", who: "you" },
  { k: "ps", l: "Personal statement pasted in", who: "you" },
  { k: "supp", l: "Supplement essays", who: "you" },
  { k: "transcript", l: "Transcript sent", who: "counselor" },
  { k: "counselor", l: "Counselor recommendation & school report", who: "counselor" },
  { k: "teachers", l: "Teacher recommendations", who: "teachers" },
  { k: "tests", l: "Test scores (only if required, or if you choose to send them)", who: "you" },
  { k: "fee", l: "Application fee paid, or fee waiver approved", who: "you" },
  { k: "fafsa", l: "FAFSA lists this college", who: "you" },
  { k: "css", l: "CSS Profile (only if this college asks for it)", who: "you" },
  { k: "portal", l: "Applicant portal opened and checked", who: "you" },
];

export function counselorEmail(p: CProfile, name: string, colleges: string[]) {
  const list = colleges.length ? colleges.map((c) => `- ${c}`).join("\n") : "- (my college list)";
  return `Hi ${p.counselor || "[counselor's name]"},

I'm applying to college this year and wanted to ask for your help with a few things. These are the colleges on my list:

${list}

Could you please:
1. Send my transcript and your counselor recommendation to each one.
2. Tell me if I qualify for application fee waivers${p.waiver === "yes" ? " (I believe I do)" : ""}.
3. Let me know anything you need from me, like a brag sheet or a resume.

Thank you so much for helping me get here.

${name}
Class of ${p.grad_year || "[year]"}`;
}

export function teacherEmail(t: CRow, p: CProfile, name: string, colleges: string[], first: string) {
  return `Hi ${t.name || "[teacher's name]"},

I'm applying to college this year and I would be honored if you'd write me a recommendation. Your ${t.subject || "class"} meant a lot to me${t.why ? `, especially ${t.why}` : ""}.

My first deadline is ${first || "[date]"}. I'm applying to:
${colleges.length ? colleges.map((c) => `- ${c}`).join("\n") : "- (my college list)"}

I can send you my activities list and anything else that would help. Thank you for considering it.

${name}`;
}

// Common App style activity line, to check lengths at a glance.
export const over = (s: string | undefined, n: number) => (s || "").length > n;
