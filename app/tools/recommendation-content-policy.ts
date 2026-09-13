export type RecommendationSafetyIssue = {
  field: string;
  category: "inappropriate language" | "threatening content" | "illegal or accusatory content" | "instruction manipulation" | "non-scholarship use";
};

const FIELD_LABELS: Record<string, string> = {
  studentName: "student name",
  studentEmail: "student email",
  studentPhone: "student phone",
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

const INAPPROPRIATE_TERMS = [
  // Profanity and degrading language.
  "fuck", "fucks", "fucked", "fucker", "fuckers", "fuckin", "fuckinh", "fucking", "motherfucker", "motherfucking",
  "shit", "shits", "shitted", "shitting", "shitty", "bullshit", "bitch", "bitches", "bitchy", "cunt", "ass",
  "asses", "asshole", "assholes", "arsehole", "bastard", "damn", "dammit", "goddamn", "god damn", "hell",
  "piss", "pissed", "prick", "pricks", "dick", "dicks", "cock", "cocks", "pussy", "pussies",
  "twat", "slut", "sluts", "whore", "whores", "hoe", "hoes", "thot", "skank", "douche", "douchebag", "jackass", "dumbass",
  "badass", "shithead", "dipshit", "fuckboy", "fuckgirl", "bimbo", "crap", "arse", "wanker", "bollocks",
  "bugger", "sod off", "son of a bitch", "piece of shit", "screw you", "fuck you", "f off", "wtf",

  // Sexual language, explicit acts, exploitation, and sexualized platforms.
  "sex", "sexual", "porn", "porno", "pornography", "pornographic", "xxx", "onlyfans", "sex tape", "sex video", "sex work",
  "sex worker", "escort service", "prostitute", "prostitution", "stripper", "strip club", "nude", "nudes",
  "naked photo", "sext", "sexting", "blowjob", "blow job", "handjob", "hand job", "rimjob", "rim job",
  "oral sex", "anal sex", "vaginal sex", "intercourse", "masturbate", "masturbation", "orgasm", "ejaculate",
  "ejaculation", "semen", "sperm", "cum", "penis", "vagina", "vulva", "clitoris", "labia", "anus", "butthole",
  "testicle", "testicles", "scrotum", "nipple", "nipples", "boob", "boobs", "tits", "titties", "boner",
  "erection", "penetrate", "penetration", "dildo", "vibrator", "sex toy", "butt plug", "fetish", "kink", "horny",
  "erotic", "erotica", "bdsm", "dominatrix", "hentai", "deep throat", "doggy style", "gangbang", "three some",
  "threesome", "orgy", "rape", "rapist", "molest", "molested", "molestation", "pedophile", "sexual assault",
  "sexual abuse", "sexual favor", "sexual favors", "send nude", "send nudes", "explicit sexual", "hookup", "hook up",
  "one night stand", "friends with benefits", "sugar daddy", "sugar mama", "sugar baby", "cam girl", "cam boy",
  "incest", "bestiality", "necrophilia", "sixty nine",

  // Hate speech and dehumanizing slurs.
  "nigger", "nigga", "faggot", "tranny", "chink", "spic", "kike", "dyke", "retard",
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Allow punctuation, spaces, or repeated separators between letters so entries
// such as d.i.c.k, h0e, f-u-c-k, and spaced-out profanity are still caught.
const flexibleTerm = (term: string) => term
  .trim()
  .split(/\s+/)
  .map((word) => [...word].map(escapeRegExp).join("\\s*"))
  .join("\\s+");

const INAPPROPRIATE_LANGUAGE = new RegExp(
  `\\b(?:${INAPPROPRIATE_TERMS.map(flexibleTerm).join("|")})\\b`,
  "i",
);

export function sanitizeScholarName(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  // Respect legitimate surnames without printing a term prohibited elsewhere.
  return trimmed.replace(/\s+dick(?=(?:\s+(?:jr|sr|ii|iii|iv)\.?)?$)/i, " D.");
}

const RULES: Array<{ category: RecommendationSafetyIssue["category"]; pattern: RegExp }> = [
  {
    category: "inappropriate language",
    pattern: INAPPROPRIATE_LANGUAGE,
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
    .replace(/[8]/g, "b")
    .replace(/[6]/g, "g")
    .replace(/[9]/g, "g")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function screenRecommendationDetails(details: Record<string, string>) {
  const issues: RecommendationSafetyIssue[] = [];
  for (const [field, rawValue] of Object.entries(details)) {
    if (!FIELD_LABELS[field] || !rawValue.trim()) continue;
    const screenedValue = field === "studentName" ? sanitizeScholarName(rawValue) : rawValue;
    // "cum laude" is a legitimate academic distinction, not sexual language.
    const value = normalizeForScreening(screenedValue).replace(/\bcum\s+laude\b/g, "academic honor");
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
