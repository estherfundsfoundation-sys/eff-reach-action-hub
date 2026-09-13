export type RecommendationSafetyIssue = {
  field: string;
  category: "inappropriate language" | "threatening content" | "illegal or accusatory content" | "instruction manipulation" | "non-scholarship use";
};

const FIELD_LABELS: Record<string, string> = {
  studentName: "student name",
  school: "college or university",
  major: "major or program",
  gpa: "GPA",
  opportunity: "scholarship name",
  organization: "scholarship organization",
  effConnection: "EFF connection",
  strengths: "strengths",
  achievement: "achievement or service example",
  challenge: "challenge overcome",
  futureGoal: "future goal",
};

const RULES: Array<{ category: RecommendationSafetyIssue["category"]; pattern: RegExp }> = [
  {
    category: "inappropriate language",
    pattern: /\b(?:f\s*u\s*c\s*k|s\s*h\s*i\s*t|b\s*i\s*t\s*c\s*h|c\s*u\s*n\s*t|a\s*s\s*s\s*h\s*o\s*l\s*e|m\s*o\s*t\s*h\s*e\s*r\s*f\s*u\s*c\s*k\s*e\s*r|w\s*h\s*o\s*r\s*e|s\s*l\s*u\s*t|n\s*i\s*g\s*g\s*(?:e\s*r|a)|f\s*a\s*g\s*g\s*o\s*t|t\s*r\s*a\s*n\s*n\s*y|c\s*h\s*i\s*n\s*k|s\s*p\s*i\s*c|k\s*i\s*k\s*e)\b/i,
  },
  {
    category: "inappropriate language",
    pattern: /\b(?:porn(?:ography|ographic)?|sex\s*tape|explicit\s*sexual|send\s*nudes?)\b/i,
  },
  {
    category: "threatening content",
    pattern: /\b(?:i|we|you|they)\s+(?:will|should|want\s+to|plan\s+to|am\s+going\s+to|are\s+going\s+to)\s+(?:kill|hurt|shoot|stab|bomb|attack)\b/i,
  },
  {
    category: "threatening content",
    pattern: /\b(?:death\s+threat|bomb\s+threat|threaten(?:ed|ing)?\s+to\s+(?:kill|hurt|shoot|stab|attack))\b/i,
  },
  {
    category: "illegal or accusatory content",
    pattern: /\b(?:i|we)\s+(?:stole|robbed|embezzled|forged|committed\s+fraud|sold\s+drugs|laundered\s+money|hacked)\b/i,
  },
  {
    category: "illegal or accusatory content",
    pattern: /\b(?:eff|esther\s+funds\s+foundation)\b.{0,90}\b(?:scam(?:med)?|fraud|stole|illegal|criminal|harass(?:ed|ment)?|assault(?:ed)?|abuse(?:d)?|threaten(?:ed)?)\b/i,
  },
  {
    category: "instruction manipulation",
    pattern: /\b(?:ignore\s+(?:all\s+)?previous|system\s+prompt|developer\s+message|override\s+(?:the\s+)?instructions?|sign\s+as|forge|fabricate|falsify|pretend\s+(?:that\s+)?eff|claim\s+(?:that\s+)?eff|state\s+(?:that\s+)?eff|verified\s+by\s+eff|confirmed\s+by\s+eff)\b/i,
  },
];

const NON_SCHOLARSHIP_USE = /\b(?:employment\s+(?:reference|verification)|job\s+application|court|lawsuit|litigation|immigration|visa\s+application|housing\s+application|loan\s+application|credit\s+application|identity\s+verification|background\s+check|custody|parole|probation|disciplinary\s+hearing)\b/i;

function normalizeForScreening(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function screenRecommendationDetails(details: Record<string, string>) {
  const issues: RecommendationSafetyIssue[] = [];
  for (const [field, rawValue] of Object.entries(details)) {
    if (!FIELD_LABELS[field] || !rawValue.trim()) continue;
    const value = normalizeForScreening(rawValue);
    for (const rule of RULES) {
      if (rule.pattern.test(value)) {
        issues.push({ field: FIELD_LABELS[field], category: rule.category });
        break;
      }
    }
  }

  const requestedUse = normalizeForScreening(details.opportunity || "");
  if (NON_SCHOLARSHIP_USE.test(requestedUse)) {
    issues.push({ field: FIELD_LABELS.opportunity, category: "non-scholarship use" });
  }

  return issues.filter((issue, index, all) =>
    all.findIndex((candidate) => candidate.field === issue.field && candidate.category === issue.category) === index,
  );
}
