export type ResumeEntry = {
  role: string;
  organization: string;
  location: string;
  dates: string;
  rawInput: string;
  proof: string;
};

export type ResumeProject = {
  title: string;
  context: string;
  dates: string;
  rawInput: string;
  proof: string;
};

export type ResumeInput = {
  personal: { fullName: string; email: string; phone: string; location: string; linkedIn: string };
  education: { institution: string; degree: string; graduationDate: string; gpa: string; honors: string; relevantCoursework: string };
  experience: ResumeEntry[];
  projects: ResumeProject[];
  skills: { technical: string; languages: string; certifications: string };
};

export type ResumeLine = { text: string; needsProof: boolean };
export type ResumeSectionEntry = { heading: string; subheading: string; bullets: ResumeLine[] };
export type ResumeDraft = { experience: ResumeSectionEntry[]; projects: ResumeSectionEntry[]; proofCount: number };

const tidy = (value: string) => value.replace(/\s+/g, " ").trim().replace(/[.;,\s]+$/, "");
const sentence = (value: string) => `${tidy(value).replace(/^./, c => c.toUpperCase())}.`;
const wordCount = (value: string) => tidy(value).split(/\s+/).filter(Boolean).length;

function clauses(value: string): string[] {
  return value
    .replace(/\s+and\s+(?=(?:showed|trained|solved|resolved|ran|managed|surveyed|built|created|opened|made|prepared|tutored|organized|led|tracked|stocked|helped)\b)/gi, "; ")
    .split(/[;\n]+|,\s+(?=(?:showed|trained|solved|resolved|ran|managed|surveyed|built|created|opened|made|prepared|tutored|organized|led|tracked|stocked|helped)\b)/i)
    .map(tidy)
    .filter(Boolean);
}

function subjectOf(raw: string): { result: string; method: string } {
  const text = raw.toLowerCase();
  if (/train|showed|coach|onboard|teach/.test(text)) return {
    result: "team onboarding",
    method: `teaching ${/prep|barista|drink/.test(text) ? "preparation routines" : "the tasks described"}`,
  };
  if (/complaint|conflict|customer concern/.test(text)) return {
    result: "customer concerns",
    method: "responding to reported complaints",
  };
  if (/cash|register|drawer|transaction/.test(text)) return {
    result: "daily transactions",
    method: "handling the cash drawer",
  };
  if (/survey|interview|research|data/.test(text)) return {
    result: "research findings",
    method: /excel|chart/.test(text) ? "collecting responses and presenting findings in Excel" : "collecting information and organizing findings for review",
  };
  if (/stock|inventory|suppl|shipment/.test(text)) return {
    result: "inventory organization",
    method: "tracking supplies and preparing materials for daily operations",
  };
  if (/drink|order|rush|food|serve/.test(text)) return {
    result: "peak-period service",
    method: "preparing orders and coordinating tasks during busy shifts",
  };
  if (/child|tutor|student|homework/.test(text)) return {
    result: "student support",
    method: "providing individualized guidance and communicating progress",
  };
  if (/website|app|code|design|build/.test(text)) return {
    result: "a digital project",
    method: "planning, building, and reviewing the project against its stated requirements",
  };
  if (/open|clos|shift|schedule/.test(text)) return {
    result: "opening operations",
    method: "completing opening tasks and coordinating daily handoffs",
  };
  return { result: "the assigned work", method: tidy(raw).replace(/^i\s+/i, "") };
}

function evidenceFrom(raw: string, proof: string): string {
  if (tidy(proof)) return tidy(proof);
  const withNoun = raw.match(/\b\d[\d,]*(?:\.\d+)?\s+(?:[a-z-]+\s+){0,2}(?:students?|customers?|clients?|peers?|coworkers?|baristas?|responses?|surveys?|orders?|events?|projects?|reports?|hours?|shifts?|members?|volunteers?)\b/i);
  if (!withNoun) return "";
  const noun = withNoun[0];
  if (/train|showed|coach|onboard|teach/i.test(raw)) return `${noun} trained`;
  if (/survey|interview|research/i.test(raw)) return `${noun} surveyed`;
  return noun;
}

function draftBullet(raw: string, proof: string, used: Set<string>): ResumeLine {
  const { result, method } = subjectOf(raw);
  const evidence = evidenceFrom(raw, proof);
  const actionChoices = /train|showed|coach|onboard|teach/i.test(raw) ? ["Strengthened", "Advanced", "Supported"]
    : /survey|interview|research|data/i.test(raw) ? ["Analyzed", "Evaluated", "Synthesized"]
    : /complaint|conflict|customer concern/i.test(raw) ? ["Resolved", "Mediated", "Addressed"]
    : /cash|register|drawer|transaction/i.test(raw) ? ["Processed", "Managed", "Reconciled"]
    : /website|app|code|design|build/i.test(raw) ? ["Developed", "Designed", "Built"]
    : /drink|order|rush|food|serve/i.test(raw) ? ["Coordinated", "Prepared", "Executed"]
    : /open|clos|shift|schedule/i.test(raw) ? ["Prepared", "Coordinated", "Organized"]
    : ["Organized", "Executed", "Delivered"];
  const verb = actionChoices.find(choice => !used.has(choice)) || actionChoices[0];
  used.add(verb);
  const base = evidence
    ? `${verb} ${result}, as measured by ${evidence}, by ${method}`
    : `${verb} ${result} by ${method}`;
  const compact = tidy(base).replace(/\bby by\b/gi, "by");
  const words = compact.split(/\s+/);
  return { text: sentence(words.length > 26 ? words.slice(0, 26).join(" ") : compact), needsProof: !evidence };
}

function bulletsFor(raw: string, proof: string, used: Set<string>): ResumeLine[] {
  const parts = clauses(raw);
  const ranked = parts.map((part, index) => ({
    part,
    index,
    score: (evidenceFrom(part, "") ? 8 : 0) + (/train|showed|coach|onboard|survey|research|complaint|conflict|cash|register|design|build/i.test(part) ? 2 : 0),
  })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 3).sort((a, b) => a.index - b.index);
  const proofWords = tidy(proof).toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const matching = ranked.find(({ part }) => proofWords.some(word => part.toLowerCase().includes(word)));
  const proofIndex = matching?.index ?? ranked[0]?.index;
  return ranked.map(({ part, index }) => draftBullet(part, index === proofIndex ? proof : "", used));
}

export function createResumeDraft(input: ResumeInput): ResumeDraft {
  const used = new Set<string>();
  const experience = input.experience.slice(0, 3).filter(item => item.role || item.organization || item.rawInput).map(item => ({
    heading: [tidy(item.role), tidy(item.organization)].filter(Boolean).join(" | "),
    subheading: [tidy(item.location), tidy(item.dates)].filter(Boolean).join(" · "),
    bullets: bulletsFor(item.rawInput, item.proof, used),
  }));
  const projects = input.projects.slice(0, 2).filter(item => item.title || item.rawInput).map(item => ({
    heading: [tidy(item.title), tidy(item.context)].filter(Boolean).join(" | "),
    subheading: tidy(item.dates),
    bullets: bulletsFor(item.rawInput, item.proof, used),
  }));
  return { experience, projects, proofCount: [...experience, ...projects].flatMap(item => item.bullets).filter(item => item.needsProof).length };
}

export function validateResume(input: ResumeInput, draft: ResumeDraft): string[] {
  const issues: string[] = [];
  if (!tidy(input.personal.fullName)) issues.push("Add your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.personal.email.trim())) issues.push("Add a valid email address.");
  if (!tidy(input.education.institution) || !tidy(input.education.degree)) issues.push("Add your school and degree or program.");
  if (!draft.experience.length && !draft.projects.length) issues.push("Add at least one experience or project.");
  for (const item of [...draft.experience, ...draft.projects]) for (const bullet of item.bullets) {
    if (wordCount(bullet.text) > 26) issues.push("Shorten each bullet to 26 words or fewer.");
  }
  return [...new Set(issues)];
}
