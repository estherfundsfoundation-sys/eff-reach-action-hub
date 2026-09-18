export type CareerProject = { name: string; category: string; description: string; url: string };
export type CareerDocument = { docType: string; recommenderRaw: string; fileUrl: string };
export type CareerProfileInput = {
  student: { fullName: string; university: string; major: string; gradYear: string; targetRole: string; rawBio: string; skillsRaw: string };
  rawProjects: CareerProject[];
  documents: CareerDocument[];
};

export type ProfileCard = { title: string; domain: string; bullets: string[]; url: string };
export type ProfileDocument = { title: string; endorser: string; url: string; verification: string };
export type CareerProfile = { headline: string; summary: string; projects: ProfileCard[]; documents: ProfileDocument[]; skills: string[]; warnings: string[] };

const tidy = (value: string) => value.replace(/\s+/g, " ").trim().replace(/[.,;\s]+$/, "");
const sentence = (value: string) => { const cleaned = tidy(value); return cleaned ? `${cleaned[0].toUpperCase()}${cleaned.slice(1)}.` : ""; };
const httpsUrl = (value: string) => { try { const url = new URL(value.trim()); return url.protocol === "https:" ? url.toString() : ""; } catch { return ""; } };

export function profileSafetyIssues(input: CareerProfileInput): string[] {
  const source = [input.student.rawBio, input.student.targetRole, input.student.skillsRaw, ...input.rawProjects.flatMap(p => [p.name, p.category, p.description]), ...input.documents.map(d => d.recommenderRaw)].join(" ");
  const issues: string[] = [];
  if (!tidy(input.student.fullName) || !tidy(input.student.university) || !tidy(input.student.major)) issues.push("Add your name, university, and major.");
  if (/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b|\b(?:social security|ssn|driver.?s license|passport number|bank account)\b/i.test(source)) issues.push("Remove government IDs or financial account details before continuing.");
  if (/\b\d{1,5}\s+[a-z\s]{2,40}\s(?:street|avenue|road|lane|drive|boulevard|court|way)\b/i.test(source)) issues.push("Remove home addresses before continuing.");
  if (/\b(?:fuck|shit|bitch|slut|whore|nigger|faggot)\b/i.test(source)) issues.push("Remove abusive or profane language before continuing.");
  return issues;
}

function focus(input: string): string {
  return tidy(input)
    .replace(/^(?:i am |i'm |looking for |seeking |interested in )+/i, "")
    .replace(/^(?:an?\s+)?(?:summer|fall|spring)\s+\d{4}\s+/i, "")
    .replace(/^an?\s+/i, "")
    .replace(/\b(?:an?\s+)?internship\b/i, "Intern");
}

function polishedBio(raw: string): string {
  const who = "They";
  return raw.split(/[.!?]+/).map(tidy).filter(Boolean).slice(0, 3).map(part => {
    let text = part
      .replace(/^i am (?:a|an) (?:freshman|sophomore|junior|senior) and\s+/i, "")
      .replace(/^i really like\s+/i, `${who} are interested in `)
      .replace(/^i like\s+/i, `${who} are interested in `)
      .replace(/^i spent the last semester working on\s+/i, `${who} recently worked on `)
      .replace(/\band i also help tutor\b/gi, "while also tutoring")
      .replace(/^i also help tutor\s+/i, `${who} also tutor `)
      .replace(/^i help tutor\s+/i, `${who} tutor `)
      .replace(/^i also\s+/i, `${who} also `)
      .replace(/^i am\s+/i, `${who} are `)
      .replace(/^i\s+/i, `${who} `);
    text = text.replace(/\bpython\b/gi, "Python");
    return sentence(text);
  }).join(" ");
}

function projectBullets(project: CareerProject): string[] {
  const raw = tidy(project.description);
  if (!raw) return [];
  const parts = raw.split(/;|\.\s+|,\s+(?=(?:had about|about \d|reached|built|created|designed|surveyed|presented|used|made|tested|analyzed|improved)\b)/i).map(tidy).filter(Boolean);
  return parts.slice(0, 2).map(part => {
    const polished = part.replace(/^i\s+/i, "").replace(/^redid\b/i, "Redesigned").replace(/\bour campus\b/i, "a campus").replace(/so students with screen readers could use it better/i, "to improve access for students using screen readers").replace(/^had about (\d[\d,]*) people check it out/i, "Reached about $1 visitors");
    return sentence(polished);
  });
}

export function createCareerProfile(input: CareerProfileInput): CareerProfile {
  const s = input.student;
  const skills = s.skillsRaw.split(/,|;|\n/).map(tidy).filter(Boolean).slice(0, 12);
  const goal = focus(s.targetRole);
  const year = tidy(s.gradYear).match(/\d{2}$/)?.[0];
  const headline = [goal ? `Aspiring ${goal}` : tidy(s.major), goal ? tidy(s.major) : "", tidy(s.university) + (year ? ` ’${year}` : "")].filter(Boolean).join(" | ");
  const standing = s.rawBio.match(/\bi am (?:a|an) (freshman|sophomore|junior|senior)\b/i)?.[1].toLowerCase();
  const intro = `${tidy(s.fullName)} is ${standing ? `a ${standing} studying` : "studying"} ${tidy(s.major)} at ${tidy(s.university)}.`;
  const rawGoal = tidy(s.targetRole).replace(/^(?:looking for|seeking)\s+/i, "");
  const goalLine = rawGoal ? `They are seeking ${rawGoal}.` : "";
  const bio = polishedBio(s.rawBio);
  const project = input.rawProjects.find(p => tidy(p.name) && tidy(p.description));
  const projectLine = project ? `Selected work includes ${tidy(project.name)}, described below.` : "";
  const skillLine = skills.length ? `Relevant tools and skills include ${skills.slice(0, 6).join(", ")}.` : "";
  const sentences = [intro, goalLine, bio, projectLine, skillLine].filter(Boolean).join(" ").match(/[^.!?]+[.!?]/g) || [];
  const summary = sentences.reduce((acc, part) => (acc + part).trim().split(/\s+/).length <= 90 ? `${acc}${part.trim()} ` : acc, "").trim();
  const projects = input.rawProjects.filter(p => tidy(p.name)).slice(0, 3).map(p => ({
    title: tidy(p.name), domain: tidy(p.category || "Student Project").replace(/^web dev$/i, "Web Development"), bullets: projectBullets(p), url: httpsUrl(p.url),
  }));
  const documents = input.documents.filter(d => tidy(d.docType) || tidy(d.recommenderRaw)).slice(0, 3).map(d => ({
    title: tidy(d.docType || "Supporting document"), endorser: tidy(d.recommenderRaw).replace(/\bassociate prof\b/i, "Associate Professor"), url: httpsUrl(d.fileUrl), verification: "Student-provided; endorser and document not verified by EFF",
  }));
  const warnings = [
    ...profileSafetyIssues(input),
    ...(input.rawProjects.some(p => tidy(p.url) && !httpsUrl(p.url)) || input.documents.some(d => tidy(d.fileUrl) && !httpsUrl(d.fileUrl)) ? ["Only secure HTTPS links are included in the profile."] : []),
    ...(/\b(?:\d+[\d,]*|first|best|award-winning|certified)\b/i.test([s.rawBio, ...input.rawProjects.map(p => p.description)].join(" ")) ? ["Check every number, credential, and claim against evidence before sharing."] : []),
  ];
  return { headline, summary, projects, documents, skills, warnings };
}
