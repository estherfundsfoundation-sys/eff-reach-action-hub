/* REACH Scholarships: explainable matching, ported from the Portal
   (eff-scholarship-portal src/lib/scholarship-matching.ts) and pointed at the
   eligibility fields MyEFF's importer writes (academic_levels, residency,
   fields_of_study, institutions, gpa_min, categories). It explains every match
   and flags what the student still has to confirm; the provider decides. */
import type { Card } from "./lib";

export type Profile = {
  level?: string | null; state?: string | null; school?: string | null; field?: string | null;
  gpa?: string | null; identity?: string[]; needs?: string[];
};
export type Candidate = Card & { eligibility?: Record<string, unknown> | null };
export type Match = { item: Card; score: number; confidence: "strong" | "possible" | "broad"; reasons: string[]; cautions: string[] };

const list = (v: unknown) => (Array.isArray(v) ? v.map(String).map((x) => x.toLowerCase().trim()).filter(Boolean) : []);
const norm = (v: unknown) => String(v ?? "").toLowerCase().trim();
const overlaps = (a: string[], b: string[]) => b.some((i) => a.map(norm).some((v) => v && (v === i || v.includes(i) || i.includes(v))));
const gpaFloor = (band?: string | null) => ({ "below-2.0": 1.9, "2.0-2.49": 2, "2.5-2.99": 2.5, "3.0-3.49": 3, "3.5-4.0": 3.5 } as Record<string, number>)[String(band)] ?? null;

// What an identity or need answer looks like in a listing's category tags.
const TAGS: Record<string, string[]> = {
  "first-generation": ["first-gen", "first generation"], "black-african-american": ["black", "african american", "black-hbcu"],
  "hispanic-latino": ["hispanic", "latino", "latinx", "heritage-immigrant"], "native-indigenous": ["native", "indigenous", "tribal", "american indian"],
  aapi: ["asian", "pacific islander", "apia"], lgbtq: ["lgbt", "lgbtq"], disability: ["disabilit"], "parenting-student": ["parent", "parents"],
  hbcu: ["hbcu", "black-hbcu"], "community-college": ["community college", "community-college"], "veteran-military": ["veteran", "military", "military-veteran"],
  women: ["women", "woman"], immigrant: ["daca", "undocumented", "dreamer", "heritage-immigrant"],
};

export function score(p: Profile, s: Candidate): Match {
  const e = s.eligibility ?? {};
  let n = 20; const reasons: string[] = []; const cautions: string[] = [];
  const levels = list(e.academic_levels);
  if (levels.length) {
    if (p.level && overlaps([p.level], levels)) { n += 22; reasons.push(`Open to ${p.level === "undergraduate" ? "college" : p.level} students like you.`); }
    else if (p.level) { n -= 45; cautions.push("The listed level may not match yours."); }
  }
  const states = list(e.residency);
  if (states.length) {
    const st = norm(p.state);
    if (st && states.includes(st)) { n += 18; reasons.push(`For students in ${p.state?.toUpperCase()}.`); }
    else if (st) { n -= 35; cautions.push("It's limited to students from certain states."); }
    else cautions.push("Add your state to check whether it's limited to certain states.");
  }
  const fields = list(e.fields_of_study);
  if (fields.length) {
    if (p.field && overlaps([p.field], fields)) { n += 20; reasons.push("Your major is one they list."); }
    else if (p.field) { n -= 22; cautions.push("Your major isn't among the ones they list."); }
    else cautions.push("Add your major to check the field requirement.");
  }
  const schools = list(e.institutions);
  if (schools.length) {
    if (p.school && overlaps([p.school], schools)) { n += 24; reasons.push("Your school is named: this one is for your campus."); }
    else if (p.school) { n -= 40; cautions.push("It's for students at a specific school."); }
    else { n -= 15; cautions.push("It's for students at one specific school."); }
  }
  const cats = list(e.categories);
  const idHits = (p.identity ?? []).filter((id) => (TAGS[id] ?? [id]).some((t) => cats.some((c) => c.includes(t))));
  if (idHits.length) { n += 14; reasons.push("Something you told us about yourself matches who it's for."); }
  const min = Number(e.gpa_min);
  const floor = gpaFloor(p.gpa);
  if (Number.isFinite(min) && min > 0) {
    if (floor !== null && floor >= min) { n += 10; reasons.push(`Your GPA looks like it meets their ${min.toFixed(1)} minimum.`); }
    else cautions.push(`They list a ${min.toFixed(1)} minimum GPA; check yours.`);
  }
  if (s.deadline) {
    const days = Math.ceil((new Date(`${s.deadline}T23:59:59Z`).getTime() - Date.now()) / 86400000);
    if (days >= 0 && days <= 30) { n += 8; reasons.push(`Closes in about ${days} day${days === 1 ? "" : "s"}. Worth doing now.`); }
  }
  if (!levels.length && !states.length && !fields.length && !schools.length) cautions.push("Their eligibility isn't spelled out here; read the provider's page carefully.");
  n = Math.max(0, Math.min(100, n));
  const confidence = n >= 70 && cautions.length <= 1 ? "strong" : n >= 40 ? "possible" : "broad";
  const { eligibility: _drop, ...item } = s; void _drop;
  return { item, score: n, confidence, reasons: reasons.length ? reasons : ["Broadly open. Worth a look."], cautions };
}

export function rank(p: Profile, items: Candidate[], limit = 100) {
  return items.map((s) => score(p, s)).filter((m) => m.score >= 25)
    .sort((a, b) => b.score - a.score || (a.item.deadline ?? "9999").localeCompare(b.item.deadline ?? "9999"))
    .slice(0, limit);
}
