/* Apply With Me: the profile. Everything scholarship forms ask most often, filled once. Never a Social
   Security number, a bank account or a password: no real scholarship needs those from REACH. */

export type Field = { key: string; label: string; type?: "text" | "email" | "tel" | "date" | "select" | "textarea" | "yesno"; options?: string[]; hint?: string; wide?: boolean };
export type ListDef = { key: string; label: string; one: string; hint: string; fields: Field[] };
export type Section = { key: string; title: string; line: string; fields?: Field[]; list?: ListDef };

export const STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR".split(" ");

export const IDENTITY = [
  { v: "first-generation", l: "First in my family in college" }, { v: "black-african-american", l: "Black / African American" },
  { v: "hispanic-latino", l: "Hispanic / Latino" }, { v: "native-indigenous", l: "Native / Indigenous" }, { v: "aapi", l: "Asian American / Pacific Islander" },
  { v: "women", l: "Woman" }, { v: "hbcu", l: "At an HBCU" }, { v: "community-college", l: "At a community college" },
  { v: "parenting-student", l: "I'm a parent" }, { v: "veteran-military", l: "Veteran / military family" }, { v: "disability", l: "Living with a disability" },
  { v: "lgbtq", l: "LGBTQ+" }, { v: "immigrant", l: "Immigrant / DACA / Dreamer" },
];

export const SECTIONS: Section[] = [
  { key: "you", title: "About you", line: "The basics every form starts with.", fields: [
    { key: "first_name", label: "First name" }, { key: "last_name", label: "Last name" }, { key: "preferred_name", label: "Preferred name (optional)" },
    { key: "contact_email", label: "Email you want scholarships to use", type: "email", hint: "A school email can stop working after you graduate. A personal one is safer." },
    { key: "phone", label: "Phone", type: "tel" }, { key: "birthdate", label: "Date of birth", type: "date" },
    { key: "address", label: "Street address", wide: true }, { key: "city", label: "City" },
    { key: "state", label: "State", type: "select", options: STATES }, { key: "zip", label: "ZIP" },
    { key: "linkedin", label: "LinkedIn (optional)", hint: "https://www.linkedin.com/in/…" },
  ] },
  { key: "school", title: "School", line: "Where you are and how you're doing.", fields: [
    { key: "level", label: "Where you are", type: "select", options: ["high school", "undergraduate", "graduate", "trade school"] },
    { key: "school", label: "School", wide: true }, { key: "classification", label: "Year", type: "select", options: ["Senior in high school", "Freshman", "Sophomore", "Junior", "Senior", "Fifth year +", "Graduate student"] },
    { key: "major", label: "Major (or intended major)" }, { key: "minor", label: "Minor (optional)" },
    { key: "grad_term", label: "Expected graduation", hint: "e.g. May 2028" }, { key: "grad_year", label: "Graduation year", hint: "e.g. 2028" },
    { key: "gpa", label: "GPA", hint: "e.g. 3.4" }, { key: "gpa_scale", label: "GPA scale", type: "select", options: ["4.0", "5.0", "100"] },
    { key: "enrollment", label: "Enrollment", type: "select", options: ["Full-time", "Part-time"] },
    { key: "test_scores", label: "SAT / ACT (optional)", hint: "Only if a scholarship asks." },
    { key: "high_school", label: "High school", hint: "Name and city" }, { key: "hs_grad_year", label: "High school graduation year" },
  ] },
  { key: "background", title: "Who you are", line: "Many scholarships are for students like you. Share only what you want.", fields: [
    { key: "first_gen", label: "First in your family to go to college?", type: "yesno" },
    { key: "pell", label: "Do you receive a Pell Grant?", type: "yesno" },
    { key: "household_size", label: "People in your household" },
    { key: "income_band", label: "Household income (optional)", type: "select", options: ["Under $25,000", "$25,000 – $49,999", "$50,000 – $74,999", "$75,000 – $99,999", "$100,000 or more", "I'd rather not say"] },
    { key: "sai", label: "Student Aid Index (SAI) from your FAFSA (optional)", hint: "On your FAFSA Submission Summary." },
    { key: "citizenship", label: "Citizenship (some scholarships ask)", type: "select", options: ["U.S. citizen", "Permanent resident", "DACA / undocumented", "International student", "I'd rather not say"] },
  ] },
  { key: "activities", title: "Activities & leadership", line: "Clubs, teams, church, chapters. Anything you've given time to.", list: {
    key: "activities", label: "Activities", one: "activity", hint: "Most forms ask for 5 to 10.",
    fields: [{ key: "name", label: "Organization or activity" }, { key: "role", label: "Your role" }, { key: "years", label: "When", hint: "e.g. 2024 – now" }, { key: "hours", label: "Hours a week" }, { key: "what", label: "What you did (one or two lines)", type: "textarea", wide: true }],
  } },
  { key: "service", title: "Community service", line: "Volunteering and service projects, with hours.", list: {
    key: "service", label: "Service", one: "service", hint: "Count the hours honestly. Round to the nearest hour.",
    fields: [{ key: "org", label: "Where" }, { key: "role", label: "What you did" }, { key: "hours", label: "Total hours" }, { key: "when", label: "When" }, { key: "what", label: "The difference it made", type: "textarea", wide: true }],
  } },
  { key: "work", title: "Work", line: "Jobs count. Working while in school is a story scholarships want to hear.", list: {
    key: "work", label: "Work", one: "job", hint: "Include babysitting, family business and gig work.",
    fields: [{ key: "employer", label: "Employer" }, { key: "role", label: "Job title" }, { key: "hours", label: "Hours a week" }, { key: "when", label: "When" }, { key: "what", label: "What you do", type: "textarea", wide: true }],
  } },
  { key: "awards", title: "Honors & awards", line: "Dean's list, certificates, crowns, competitions.", list: {
    key: "awards", label: "Awards", one: "award", hint: "Small ones count.",
    fields: [{ key: "name", label: "Award or honor" }, { key: "from", label: "Given by" }, { key: "year", label: "Year" }],
  } },
  { key: "goals", title: "Your goals", line: "Short answers here. Your essays go deeper.", fields: [
    { key: "career", label: "Career you want", wide: true },
    { key: "goal_line", label: "Your goal in one or two sentences", type: "textarea", wide: true, hint: "Many forms have a short \"career goals\" box. This is that answer." },
    { key: "bio", label: "A short bio (3 to 4 sentences)", type: "textarea", wide: true, hint: "Some forms ask for a short description of yourself." },
  ] },
  { key: "recs", title: "Recommenders", line: "People who said yes to writing for you. Ask them first, kindly, and early.", list: {
    key: "recommenders", label: "Recommenders", one: "recommender", hint: "Two or three: a professor or teacher, a boss or advisor, a mentor.",
    fields: [{ key: "name", label: "Name" }, { key: "title", label: "Title and where" }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Phone", type: "tel" }, { key: "relationship", label: "How they know you" }],
  } },
];

export type Profile = Record<string, unknown> & { identity?: string[] };
export type Row = Record<string, string>;
export const rows = (p: Profile, key: string): Row[] => (Array.isArray(p[key]) ? (p[key] as Row[]) : []);
export const str = (p: Profile, key: string) => (typeof p[key] === "string" ? (p[key] as string) : "");

// How complete the profile is: the fields a form nearly always asks, plus one of each list.
const CORE = ["first_name", "last_name", "contact_email", "phone", "address", "city", "state", "zip", "school", "level", "major", "grad_term", "gpa", "career", "goal_line"];
export function completeness(p: Profile) {
  const have = CORE.filter((k) => str(p, k).trim()).length + ["activities", "service", "recommenders"].filter((k) => rows(p, k).some((r) => Object.values(r).some((v) => v?.trim()))).length;
  return Math.round((have / (CORE.length + 3)) * 100);
}

// The kit: every answer laid out the way forms ask, each with a copy button.
export function kitRows(p: Profile, email: string): Array<{ label: string; value: string }> {
  const s = (k: string) => str(p, k).trim();
  const list = (k: string, fmt: (r: Row) => string) => rows(p, k).map(fmt).filter((x) => x.trim()).join("\n");
  const service = rows(p, "service");
  const hours = service.reduce((n, r) => n + (Number(String(r.hours || "").replace(/[^\d.]/g, "")) || 0), 0);
  const yn = (k: string) => (s(k) === "yes" ? "Yes" : s(k) === "no" ? "No" : "");
  const out: Array<{ label: string; value: string }> = [
    { label: "Full name", value: [s("first_name"), s("last_name")].filter(Boolean).join(" ") },
    { label: "Preferred name", value: s("preferred_name") },
    { label: "Email", value: s("contact_email") || email },
    { label: "Phone", value: s("phone") },
    { label: "Date of birth", value: s("birthdate") ? new Date(`${s("birthdate")}T12:00:00`).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "" },
    { label: "Street address", value: s("address") }, { label: "City", value: s("city") }, { label: "State", value: s("state") }, { label: "ZIP", value: s("zip") },
    { label: "Full address", value: [s("address"), [s("city"), [s("state"), s("zip")].filter(Boolean).join(" ")].filter(Boolean).join(", ")].filter(Boolean).join(", ") },
    { label: "School", value: s("school") }, { label: "Year in school", value: s("classification") }, { label: "Major", value: s("major") }, { label: "Minor", value: s("minor") },
    { label: "Expected graduation", value: s("grad_term") || s("grad_year") },
    { label: "GPA", value: s("gpa") ? `${s("gpa")}${s("gpa_scale") ? ` on a ${s("gpa_scale")} scale` : ""}` : "" },
    { label: "Enrollment", value: s("enrollment") }, { label: "SAT / ACT", value: s("test_scores") },
    { label: "High school", value: [s("high_school"), s("hs_grad_year") && `Class of ${s("hs_grad_year")}`].filter(Boolean).join(", ") },
    { label: "First-generation college student", value: yn("first_gen") }, { label: "Pell Grant recipient", value: yn("pell") },
    { label: "Household size", value: s("household_size") }, { label: "Household income", value: s("income_band") }, { label: "Student Aid Index (SAI)", value: s("sai") },
    { label: "Citizenship", value: s("citizenship") },
    { label: "Career goal", value: s("career") }, { label: "Goal statement", value: s("goal_line") }, { label: "Short bio", value: s("bio") },
    { label: "Activities & leadership", value: list("activities", (r) => [[r.role, r.name].filter(Boolean).join(", "), r.years, r.hours && `${r.hours} hrs/week`].filter(Boolean).join(" · ") + (r.what ? `: ${r.what}` : "")) },
    { label: "Community service", value: list("service", (r) => [[r.role, r.org].filter(Boolean).join(", "), r.when, r.hours && `${r.hours} hours`].filter(Boolean).join(" · ") + (r.what ? `: ${r.what}` : "")) },
    { label: "Total service hours", value: hours ? String(hours) : "" },
    { label: "Work experience", value: list("work", (r) => [[r.role, r.employer].filter(Boolean).join(", "), r.when, r.hours && `${r.hours} hrs/week`].filter(Boolean).join(" · ") + (r.what ? `: ${r.what}` : "")) },
    { label: "Honors & awards", value: list("awards", (r) => [r.name, r.from, r.year].filter(Boolean).join(", ")) },
    { label: "Recommenders", value: list("recommenders", (r) => [r.name, r.title, r.email, r.phone, r.relationship && `(${r.relationship})`].filter(Boolean).join(" · ")) },
    { label: "LinkedIn", value: s("linkedin") },
  ];
  return out.filter((r) => r.value);
}

// The quiz profile the scholarship matcher already understands.
export function matchProfile(p: Profile) {
  const g = Number(str(p, "gpa")) || 0;
  const scale = Number(str(p, "gpa_scale")) || 4;
  const four = scale === 100 ? g / 25 : scale === 5 ? (g / 5) * 4 : g;
  const gpa = !g ? null : four >= 3.5 ? "3.5-4.0" : four >= 3 ? "3.0-3.49" : four >= 2.5 ? "2.5-2.99" : four >= 2 ? "2.0-2.49" : "below-2.0";
  const identity = [...(Array.isArray(p.identity) ? p.identity : [])];
  if (str(p, "first_gen") === "yes" && !identity.includes("first-generation")) identity.push("first-generation");
  return { level: str(p, "level") || null, state: str(p, "state").toLowerCase() || null, school: str(p, "school") || null, field: str(p, "major") || null, gpa, identity };
}
