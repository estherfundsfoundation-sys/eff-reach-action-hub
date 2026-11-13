/* REACH Balance Screening: every question, in one place. The same file lives in the REACH repo
   (app/screening/questions.ts); keep them identical. Keys are stored in eff_bal_cases (pre / full_answers),
   so never rename a key once students have answered. From reports/Student balance screening playbook.md. */

export type Opt = { v: string; l: string };
export type Q = { key: string; label: string; help?: string; kind: "one" | "many" | "text" | "long" | "money" | "date" | "number" | "school"; opts?: Opt[]; show?: (a: Record<string, unknown>) => boolean };

export const PRE: Q[] = [
  { key: "school", label: "Your college", kind: "school" },
  { key: "where", label: "Where are you right now?", kind: "one", opts: [
    { v: "enrolled", l: "Enrolled this term" }, { v: "blocked_next", l: "Registered for next term, but blocked" },
    { v: "cant_register", l: "I can't register for next term" }, { v: "stopped_out", l: "Not enrolled right now (stopped out)" },
    { v: "finishing", l: "Finishing in my last 1–2 terms" }] },
  { key: "level", label: "Your year", kind: "one", opts: [
    { v: "y1", l: "First year" }, { v: "y2", l: "Second year" }, { v: "y3", l: "Third year" }, { v: "y4", l: "Fourth year or more" }, { v: "grad", l: "Graduate school" }] },
  { key: "balance", label: "How much do you owe? (your best number)", help: "Leave it blank if you don't know. That's okay.", kind: "money" },
  { key: "term", label: "Which term is the balance from?", kind: "one", opts: [
    { v: "this", l: "This term" }, { v: "earlier", l: "An earlier term" }, { v: "both", l: "Both" }, { v: "unknown", l: "I don't know" }] },
  { key: "for", label: "What is the balance for? (pick all)", kind: "many", opts: [
    { v: "tuition", l: "Tuition and fees" }, { v: "housing", l: "Housing or meal plan" }, { v: "fines", l: "Fines or late fees" },
    { v: "aid_back", l: "Aid taken back after I withdrew or dropped a class" }, { v: "books", l: "Books or other charges" }, { v: "unknown", l: "I don't know" }] },
  { key: "hold", label: "Do you have a hold?", kind: "one", opts: [
    { v: "registration", l: "Yes, it stops me registering" }, { v: "transcript", l: "Yes, it stops my transcript or diploma" },
    { v: "both", l: "Both" }, { v: "none", l: "No hold" }, { v: "unknown", l: "I don't know" }] },
  { key: "deadline", label: "When is your payment, drop or purge deadline?", kind: "one", opts: [
    { v: "gone", l: "I've already been dropped from my classes" }, { v: "7", l: "7 days or less" }, { v: "21", l: "8 to 21 days" },
    { v: "later", l: "More than 21 days" }, { v: "none", l: "No deadline, or I don't know" }] },
  { key: "fafsa", label: "Did you file the FAFSA for this school year?", kind: "one", opts: [
    { v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "not_eligible", l: "I can't (international or undocumented)" }, { v: "unknown", l: "I don't know" }] },
  { key: "fafsa_who", label: "Who is on your FAFSA?", kind: "one", show: (a) => a.fafsa === "yes", opts: [
    { v: "parents", l: "My parents" }, { v: "me", l: "Just me (independent)" }, { v: "cant", l: "I can't reach my parents, or it isn't safe to involve them" }] },
  { key: "aid", label: "What does your financial aid look like?", kind: "one", opts: [
    { v: "all_paid", l: "It's all paid in" }, { v: "pending", l: "Some shows as pending or anticipated" },
    { v: "docs_asked", l: "The school asked me for documents" }, { v: "suspended", l: "My aid was suspended (grades or pace)" },
    { v: "none", l: "I don't get aid" }, { v: "unknown", l: "I don't know" }] },
  { key: "loans", label: "Federal student loans", kind: "one", opts: [
    { v: "all", l: "I accepted everything offered" }, { v: "some_declined", l: "I declined or didn't accept some" },
    { v: "none_offered", l: "None were offered" }, { v: "no_loans", l: "I don't want loans" }] },
  { key: "plan", label: "Payment plan", kind: "one", opts: [
    { v: "on", l: "I'm on one" }, { v: "tried", l: "I tried, but couldn't afford it" }, { v: "not_offered", l: "My school doesn't offer one" }, { v: "didnt_know", l: "I didn't know about it" }] },
  { key: "changed", label: "Did anything change this year? (pick all)", kind: "many", opts: [
    { v: "job", l: "I lost my job or hours" }, { v: "income", l: "My family's income dropped" }, { v: "divorce", l: "Divorce or separation" },
    { v: "death", l: "A death in the family" }, { v: "medical", l: "Medical bills" }, { v: "housing", l: "I lost my housing" },
    { v: "plus_denied", l: "A Parent PLUS loan was denied" }, { v: "surprise", l: "A surprise charge on my bill" },
    { v: "aid_down", l: "My aid went down" }, { v: "nothing", l: "Nothing changed" }] },
  { key: "today", label: "Is anything urgent today? (pick all)", kind: "many", opts: [
    { v: "housing", l: "I'm losing my housing" }, { v: "food", l: "I don't have food" }, { v: "utilities", l: "My utilities are being shut off" },
    { v: "safety", l: "I don't feel safe" }, { v: "none", l: "None of these" }] },
];

export const FULL: { title: string; qs: Q[] }[] = [
  { title: "About you", qs: [
    { key: "name", label: "Your full legal name", kind: "text" },
    { key: "preferred", label: "What should we call you?", kind: "text" },
    { key: "phone", label: "Phone number", kind: "text" },
    { key: "id_last4", label: "Last 4 of your student ID (optional)", help: "Only the last 4. Never your Social Security number.", kind: "text" },
  ] },
  { title: "School", qs: [
    { key: "credits_done", label: "Credits you've finished (about)", kind: "number" },
    { key: "credits_needed", label: "Credits you need to graduate (about)", kind: "number" },
    { key: "grad_term", label: "When do you expect to graduate?", kind: "text", help: "For example: Spring 2028" },
    { key: "enroll_next", label: "How many classes next term?", kind: "one", opts: [
      { v: "full", l: "Full time" }, { v: "three_quarter", l: "Three-quarter time" }, { v: "half", l: "Half time" }, { v: "less", l: "Less than half time" }, { v: "none", l: "I'm not registered" }] },
    { key: "housing_now", label: "Where do you live?", kind: "one", opts: [
      { v: "on", l: "On campus" }, { v: "off", l: "Off campus" }, { v: "parents", l: "With my parents or family" }, { v: "unstable", l: "I don't have stable housing" }] },
  ] },
  { title: "Your balance", qs: [
    { key: "deadline_on", label: "The exact deadline date (if you know it)", kind: "date" },
    { key: "charges", label: "What's on your account? List each charge and amount if you can.", help: "Copy it from your student account: tuition $2,400, housing $1,100, late fee $50…", kind: "long" },
    { key: "collections", label: "Has the balance gone to a collection agency or the state?", kind: "one", opts: [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "unknown", l: "I don't know" }] },
    { key: "aid_paid_term", label: "Did federal aid (Pell or loans) pay any of the term that has the hold?", kind: "one", opts: [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "unknown", l: "I don't know" }] },
  ] },
  { title: "Your aid", qs: [
    { key: "aid_lines", label: "List your aid this year: what it is, the amount, and whether it's accepted, pending or paid", kind: "long" },
    { key: "aid_requests", label: "Is your aid office waiting on anything from you? (pick all)", kind: "many", opts: [
      { v: "verification", l: "Documents (verification)" }, { v: "sap", l: "A grades/pace (SAP) appeal" }, { v: "other", l: "Something else" }, { v: "none", l: "No" }] },
    { key: "pell", label: "Do you get the Pell Grant?", kind: "one", opts: [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "unknown", l: "I don't know" }] },
    { key: "scholarships", label: "Outside or school scholarships this year (total, if any)", kind: "money" },
    { key: "plus", label: "Parent PLUS loan", kind: "one", opts: [
      { v: "not_applied", l: "My parent didn't apply" }, { v: "approved", l: "Approved" }, { v: "denied", l: "Denied because of credit" },
      { v: "wont", l: "My parent won't apply" }, { v: "capped", l: "Approved, but for less than I need" }, { v: "na", l: "Doesn't apply to me" }] },
    { key: "family_note", label: "Anything about your family situation we should know? (optional)", kind: "long" },
  ] },
  { title: "What happened", qs: [
    { key: "hardship", label: "What changed, and when? What proof do you have?", help: "For example: lost my job on Sept 10, I have the letter.", kind: "long" },
    { key: "story", label: "In your own words: how is this balance keeping you from staying in school?", kind: "long" },
  ] },
  { title: "What you've tried", qs: [
    { key: "tried", label: "What have you already done? (pick all)", kind: "many", opts: [
      { v: "aid_office", l: "Talked to financial aid" }, { v: "bursar", l: "Talked to the bursar / business office" },
      { v: "emergency_fund", l: "Applied to my campus emergency fund" }, { v: "payment_plan", l: "Asked about a payment plan" },
      { v: "appeal", l: "Filed an appeal" }, { v: "loans", l: "Asked about more loans" }, { v: "scholarships", l: "Applied for scholarships" }, { v: "nothing", l: "Nothing yet" }] },
    { key: "tried_note", label: "What happened when you tried? (who you talked to, what they said, dates)", kind: "long" },
  ] },
  { title: "What would help", qs: [
    { key: "help_type", label: "What kind of help do you want? (pick all)", kind: "many", opts: [
      { v: "understand", l: "Help understanding my bill and aid" }, { v: "appeal", l: "Help writing an appeal or email" },
      { v: "mentor", l: "Someone to walk me through it" }, { v: "money", l: "Help finding money" }, { v: "unknown", l: "I'm not sure" }] },
    { key: "needs", label: "Do you need help with anything else? (pick all)", kind: "many", opts: [
      { v: "housing", l: "Housing" }, { v: "food", l: "Food" }, { v: "childcare", l: "Child care" }, { v: "transport", l: "Transportation" },
      { v: "health", l: "Health" }, { v: "mental", l: "Stress or mental health" }] },
    { key: "release", label: "Have you signed your school's release so EFF can talk to them about your account?", kind: "one", opts: [
      { v: "signed", l: "Yes" }, { v: "not_yet", l: "Not yet" }, { v: "no_form", l: "I don't know how / my school doesn't have one" }] },
  ] },
];

export const DOCS: Opt[] = [
  { v: "statement", l: "Your balance or account statement (a screenshot works)" },
  { v: "hold", l: "The hold screen" },
  { v: "aid_offer", l: "Your financial aid offer (accepted, pending, declined)" },
  { v: "verification", l: "A verification or document request" },
  { v: "sap", l: "A SAP (grades/pace) letter or appeal decision" },
  { v: "plus_denial", l: "A Parent PLUS denial" },
  { v: "plan_terms", l: "Payment plan terms" },
  { v: "hardship", l: "Proof of what happened (job letter, bills, notices)" },
  { v: "enrollment", l: "Your schedule or enrollment for next term" },
  { v: "other", l: "Anything else" },
];

export type Route = "urgent" | "review" | "self" | "campus";
export const ROUTE_LABEL: Record<Route, string> = { urgent: "Urgent today", review: "EFF reviews this week", self: "Try these first", campus: "Ask your campus first" };

/* The routes from the playbook: the most urgent one wins. */
export function routeFor(a: Record<string, unknown>): Route {
  const arr = (k: string) => (Array.isArray(a[k]) ? (a[k] as string[]) : []);
  const today = arr("today"), changed = arr("changed");
  if (a.deadline === "gone" || a.deadline === "7" || today.some((x) => ["housing", "food", "utilities", "safety"].includes(x))) return "urgent";
  if (a.where === "blocked_next" || a.where === "cant_register" || a.deadline === "21" || a.aid === "suspended" || a.term === "earlier" || a.term === "both"
    || changed.some((x) => ["job", "income", "divorce", "death", "medical", "housing", "plus_denied"].includes(x))) return "review";
  const bal = Number(a.balance || 0);
  if (a.where === "finishing" && arr("for").includes("tuition") && (!bal || bal <= 2500)) return "campus";
  return a.aid === "pending" || a.loans === "some_declined" || a.fafsa === "no" || a.plan === "didnt_know" || a.deadline === "none" || a.deadline === "later" ? "self" : "review";
}

/* Moves to try, worked out from the answers. Shown to the student after the pre-screen and to National as flags. */
export function movesFor(a: Record<string, unknown>): string[] {
  const arr = (k: string) => (Array.isArray(a[k]) ? (a[k] as string[]) : []);
  const m: string[] = [];
  if (a.fafsa === "no") m.push("File the FAFSA for this school year at StudentAid.gov. It's free, and most aid (and most emergency funds) need it.");
  if (a.aid === "pending") m.push("Ask the financial aid office why your aid is still pending and what's needed to release it. Ask the bursar to hold off on dropping you while it's pending.");
  if (a.aid === "docs_asked") m.push("Send the financial aid office the documents they asked for. Your aid can't pay out until verification is done.");
  if (a.aid === "suspended") m.push("Ask about a SAP appeal and an academic plan. Write what got in the way of your grades and what's different now.");
  if (a.loans === "some_declined") m.push("You may still have federal loans you didn't accept. Ask financial aid if you can accept them now for this term.");
  if (a.plan === "didnt_know" || a.plan === "not_offered") m.push("Ask the bursar or business office for a payment plan, and whether the first payment stops the drop.");
  if (arr("changed").some((x) => ["job", "income", "divorce", "death", "medical"].includes(x)))
    m.push("Ask financial aid for a special circumstances review (professional judgment). Bring proof of what changed. They can recalculate your aid.");
  if (arr("changed").includes("plus_denied")) m.push("A Parent PLUS denial for credit can unlock extra federal unsubsidized loan for you. Bring the denial letter to financial aid and ask.");
  if (a.fafsa_who === "cant") m.push("If you can't safely involve your parents, ask financial aid about a dependency override. A counselor, pastor or social worker letter helps.");
  if (arr("for").includes("aid_back")) m.push("If aid was taken back after you withdrew, ask for a copy of your Return of Title IV calculation and check the dates.");
  if (a.hold === "transcript" || a.hold === "both") m.push("If federal aid paid for that term, ask about the federal rule on releasing transcripts for terms paid with federal aid, or a payment plan that releases it.");
  if (a.where === "finishing") m.push("Ask your school about a completion or retention grant. Many colleges cover small balances for students close to graduating.");
  m.push("Ask the dean of students or basic needs office about the campus emergency fund.");
  return m;
}
