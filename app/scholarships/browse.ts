/* REACH Scholarships: the browse lists. Every list is the same directory (MyEFF eff_scholarships_find) with one
   filter already chosen, so nothing is ever left out of the directory: a list only sorts what is there into doors.
   Each has its own address, /scholarships/browse/<key>, to share on its own. */
export type Browse = { key: string; group: "when" | "level" | "for" | "field" | "quick" | "state"; label: string; title: string; blurb: string; find: Record<string, unknown> };

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington, DC", FL: "Florida",
  GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
  SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", PR: "Puerto Rico",
};

const when: Browse[] = [
  { key: "closing-soon", group: "when", label: "Closing in 30 days", title: "Scholarships closing in the next 30 days", blurb: "Soonest first. Start with the one at the top.", find: { deadline: "soon" } },
  { key: "apply-anytime", group: "when", label: "Apply anytime", title: "Scholarships you can apply to anytime", blurb: "Rolling deadlines: no clock ticking, but earlier is still better.", find: { deadline: "rolling" } },
];
const level: Browse[] = [
  { key: "high-school", group: "level", label: "High school students", title: "Scholarships for high school students", blurb: "Open to students still in high school, seniors included.", find: { level: "high school" } },
  { key: "undergraduate", group: "level", label: "College students", title: "Scholarships for college students", blurb: "Open to undergraduates, at two-year and four-year colleges.", find: { level: "undergraduate" } },
  { key: "graduate", group: "level", label: "Grad students", title: "Scholarships for graduate students", blurb: "Master's, doctoral and professional school.", find: { level: "graduate" } },
  { key: "trade-school", group: "level", label: "Trade school", title: "Scholarships for trade and technical school", blurb: "For students learning a trade or earning a certificate.", find: { level: "trade school" } },
];
const FOR: Array<[string, string, string, string]> = [
  ["first-gen", "first_gen", "First in my family", "first-generation college students"],
  ["black-students", "black", "Black / African American", "Black and African American students"],
  ["hispanic-latino", "hispanic", "Hispanic / Latino", "Hispanic and Latino students"],
  ["native-indigenous", "native", "Native / Indigenous", "Native and Indigenous students"],
  ["asian-pacific-islander", "asian", "Asian American / Pacific Islander", "Asian American and Pacific Islander students"],
  ["women", "women", "Women", "women"],
  ["low-income", "low_income", "Low income / Pell", "students with financial need"],
  ["military-veterans", "military", "Military / veterans", "service members, veterans and their families"],
  ["disability", "disability", "Living with a disability", "students living with a disability"],
  ["lgbtq", "lgbtq", "LGBTQ+", "LGBTQ+ students"],
  ["foster-care", "foster", "Foster care", "students who have been in foster care"],
  ["immigrant-daca", "immigrant", "Immigrant / DACA", "immigrant and DACA students"],
];
const made: Browse[] = FOR.map(([key, focus, label, who]) => ({ key, group: "for", label, title: `Scholarships for ${who}`, blurb: `Scholarships that name ${who} in who they are for.`, find: { focus } }));

const FIELDS: Array<[string, string, string]> = [
  ["nursing", "Nursing", "nursing"], ["health", "Health & medicine", "health"], ["education", "Education & teaching", "education"],
  ["business", "Business", "business"], ["engineering", "Engineering", "engineering"], ["computer-science", "Computer science & tech", "computer"],
  ["science", "Science", "science"], ["math", "Math", "math"], ["arts", "Art & design", "art"], ["music", "Music", "music"],
  ["communications", "Communications & journalism", "journalism"], ["law", "Law & criminal justice", "law"], ["social-work", "Social work", "social work"],
  ["psychology", "Psychology", "psychology"], ["agriculture", "Agriculture", "agriculture"], ["accounting", "Accounting & finance", "accounting"],
];
const field: Browse[] = FIELDS.map(([key, label, major]) => ({ key, group: "field", label, title: `${label} scholarships`, blurb: `Scholarships for ${label.toLowerCase()} students, plus ones open to every major.`, find: { major } }));

const quick: Browse[] = [
  { key: "checked-by-eff", group: "quick", label: "✓ Checked by EFF", title: "Scholarships EFF checked on the provider's own page", blurb: "A person at EFF opened the provider's page and confirmed the facts.", find: { verified: true } },
  { key: "5000-and-up", group: "quick", label: "$5,000 and up", title: "Scholarships worth $5,000 or more", blurb: "Biggest first.", find: { amount_min: "5000", sort: "amount" } },
  { key: "10000-and-up", group: "quick", label: "$10,000 and up", title: "Scholarships worth $10,000 or more", blurb: "Biggest first.", find: { amount_min: "10000", sort: "amount" } },
  { key: "1000-and-up", group: "quick", label: "$1,000 and up", title: "Scholarships worth $1,000 or more", blurb: "Biggest first.", find: { amount_min: "1000", sort: "amount" } },
];
const state: Browse[] = Object.entries(STATE_NAMES).map(([code, name]) => ({ key: `state-${code.toLowerCase()}`, group: "state", label: name, title: `Scholarships for students in ${name}`, blurb: `${name}'s own scholarships and state aid, plus national ones open to you.`, find: { state: code } }));

export const GROUPS: Array<{ key: Browse["group"]; title: string; lists: Browse[] }> = [
  { key: "when", title: "By deadline", lists: when },
  { key: "level", title: "By where you are in school", lists: level },
  { key: "for", title: "Made for students like you", lists: made },
  { key: "field", title: "By what you study", lists: field },
  { key: "quick", title: "Quick lists", lists: quick },
  { key: "state", title: "By state", lists: state },
];
export const ALL: Browse[] = GROUPS.flatMap((g) => g.lists);
export const byKey = (k: string) => ALL.find((b) => b.key === k) || null;
