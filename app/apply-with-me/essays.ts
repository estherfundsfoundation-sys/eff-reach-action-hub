/* Apply With Me: the essay bank. Each essay type is a short interview; the draft is built only from the
   student's own answers, put in a strong order with a few joining words. Nothing is invented and no AI
   writes it, because every scholarship asks her to certify the essay is hers. She edits it after. */

export type Kind = "story" | "leadership" | "service" | "goals" | "need" | "adversity";
export type Q = { key: string; ask: string; hint: string; rank: number };
export type EssayType = { kind: Kind; title: string; line: string; asks: string; qs: Q[] };

// rank: 1 = keep no matter what, 3 = first to go when an essay must be shorter.
export const TYPES: EssayType[] = [
  {
    kind: "story", title: "My story", line: "Tell us about yourself. The one almost every scholarship asks.",
    asks: "tell us about yourself, personal statement, who you are, background, describe yourself",
    qs: [
      { key: "moment", rank: 1, ask: "Describe one moment that shows who you are. Tell it like a scene: where were you, what happened?", hint: "Start in the middle of it. \"The night my mom's car broke down on the way to my orientation…\"" },
      { key: "roots", rank: 2, ask: "Where do you come from? The people, places or things that shaped you.", hint: "Your family, your neighborhood, your church, a job, a grandparent." },
      { key: "values", rank: 2, ask: "What did that teach you? What do you care about most because of it?", hint: "One or two values, and why." },
      { key: "now", rank: 3, ask: "What are you doing with that now, in school and outside it?", hint: "Your major, a club, a job, someone you help." },
      { key: "next", rank: 1, ask: "Where are you headed, and how would this scholarship help you get there?", hint: "Be specific: the degree, the career, the people you want to serve." },
    ],
  },
  {
    kind: "leadership", title: "Leadership", line: "A time you led, even if nobody gave you a title.",
    asks: "leadership, leader, led, lead a team, took initiative, organized",
    qs: [
      { key: "situation", rank: 1, ask: "What was going on? What needed to change or get done?", hint: "The problem, the goal, or the moment someone had to step up." },
      { key: "role", rank: 2, ask: "What was your role? Did anyone give it to you, or did you step in?", hint: "\"I wasn't the president, but…\"" },
      { key: "action", rank: 1, ask: "What did you actually do? Walk through the steps.", hint: "Use \"I\" here. What did you plan, say, organize, fix?" },
      { key: "result", rank: 1, ask: "What happened because of it? Use numbers if you have them.", hint: "How many people, dollars, hours, members, events." },
      { key: "learned", rank: 2, ask: "What did it teach you about leading people?", hint: "What you'd do the same, or differently, next time." },
    ],
  },
  {
    kind: "service", title: "Community service", line: "How you've served, and what it meant to you.",
    asks: "community service, volunteer, service, giving back, community involvement, impact on your community",
    qs: [
      { key: "who", rank: 2, ask: "Who did you serve, and where?", hint: "The people, the place, the organization." },
      { key: "why", rank: 1, ask: "Why that? What made you care?", hint: "A person, a memory, something you saw." },
      { key: "what", rank: 1, ask: "What did you do, and for how long?", hint: "Hours, weeks, years. What a day of it looked like." },
      { key: "impact", rank: 1, ask: "What changed because you were there? Give one real example.", hint: "One person's story, or a number that matters." },
      { key: "you", rank: 2, ask: "How did it change you, and will you keep serving?", hint: "What you see differently now." },
    ],
  },
  {
    kind: "goals", title: "Career goals", line: "What you want to do, and your plan to get there.",
    asks: "career goals, future goals, plans after graduation, academic goals, why this major, what do you want to do",
    qs: [
      { key: "career", rank: 1, ask: "What do you want to do for a career?", hint: "Name it: nurse practitioner, CPA, middle school teacher, software engineer." },
      { key: "spark", rank: 1, ask: "When did you know? What sparked it?", hint: "A person, a class, a moment you can describe." },
      { key: "plan", rank: 2, ask: "What's your plan? The steps from now to there.", hint: "Your degree, internships, certifications, grad school." },
      { key: "progress", rank: 3, ask: "What have you already done toward it?", hint: "Classes, jobs, programs, shadowing." },
      { key: "giveback", rank: 1, ask: "Who will your work help? How will you give back?", hint: "Your community, people like you, the next first-gen student." },
    ],
  },
  {
    kind: "need", title: "Financial need", line: "Why this money matters. Share only what you're comfortable sharing.",
    asks: "financial need, financial situation, why do you need this scholarship, how will this scholarship help, hardship, cost of attendance",
    qs: [
      { key: "situation", rank: 1, ask: "What's your financial situation? Share only what you're comfortable with.", hint: "Who supports you, what's changed, what you're facing." },
      { key: "effort", rank: 1, ask: "How are you paying for school right now?", hint: "Work hours, aid, loans, family help, what you've given up." },
      { key: "risk", rank: 2, ask: "What would happen without help? What's at stake?", hint: "Taking fewer classes, working more hours, stopping out." },
      { key: "use", rank: 1, ask: "Exactly how would you use this scholarship?", hint: "Tuition balance, books, housing, a laptop, fewer work hours." },
      { key: "resolve", rank: 2, ask: "Why are you going to finish no matter what?", hint: "Who you're finishing for." },
    ],
  },
  {
    kind: "adversity", title: "Overcoming a challenge", line: "Something hard you faced and how you kept going.",
    asks: "challenge, obstacle, adversity, overcome, setback, difficult time, hardship, failure, resilience",
    qs: [
      { key: "challenge", rank: 1, ask: "What was the challenge? Share as much or as little as you want.", hint: "You never have to share more than you're comfortable with." },
      { key: "felt", rank: 3, ask: "How did it affect you and your school?", hint: "Grades, attendance, how you felt." },
      { key: "did", rank: 1, ask: "What did you do to keep going?", hint: "The decisions, the people you asked, the routines you built." },
      { key: "help", rank: 2, ask: "Who or what helped you?", hint: "A person, your faith, a program, a friend." },
      { key: "strength", rank: 1, ask: "Who are you now because of it?", hint: "The strength you carry into what's next." },
    ],
  },
];
export const TYPE = Object.fromEntries(TYPES.map((t) => [t.kind, t])) as Record<Kind, EssayType>;

const clean = (s: string) => {
  let t = (s || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  t = t[0].toUpperCase() + t.slice(1);
  if (!/[.!?"”’)]$/.test(t)) t += ".";
  return t;
};

// The order each draft uses, and the few joining words placed only where they read naturally.
const ORDER: Record<Kind, Array<{ k: string; join?: string }>> = {
  story: [{ k: "moment" }, { k: "roots" }, { k: "values", join: "That is what taught me what matters." }, { k: "now" }, { k: "next" }],
  leadership: [{ k: "situation" }, { k: "role" }, { k: "action" }, { k: "result" }, { k: "learned", join: "Leading taught me something I still carry." }],
  service: [{ k: "why" }, { k: "who" }, { k: "what" }, { k: "impact" }, { k: "you" }],
  goals: [{ k: "spark" }, { k: "career" }, { k: "plan" }, { k: "progress" }, { k: "giveback" }],
  need: [{ k: "situation" }, { k: "effort" }, { k: "risk" }, { k: "use" }, { k: "resolve" }],
  adversity: [{ k: "challenge" }, { k: "felt" }, { k: "did" }, { k: "help" }, { k: "strength" }],
};

export type Para = { text: string; rank: number };
export function draftParas(kind: Kind, answers: Record<string, string>): Para[] {
  const type = TYPE[kind];
  return ORDER[kind].flatMap(({ k, join }) => {
    const a = clean(answers[k] || "");
    if (!a) return [];
    const rank = type.qs.find((q) => q.key === k)?.rank ?? 2;
    return [{ text: join ? `${join} ${a}` : a, rank }];
  });
}
export const draft = (kind: Kind, answers: Record<string, string>) => draftParas(kind, answers).map((p) => p.text).join("\n\n");

export const words = (s: string) => (s.trim().match(/\S+/g) || []).length;
export const answered = (kind: Kind, answers: Record<string, string>) => TYPE[kind].qs.filter((q) => (answers[q.key] || "").trim().length >= 15).length;

// Fit an essay under a word limit: drop the least important paragraphs first (never the first or last),
// then trim sentences from the end of the longest middle paragraph. She always reads it after.
export function fit(body: string, limit: number, ranks?: number[]): { text: string; cut: number } {
  const before = words(body);
  if (!limit || before <= limit) return { text: body, cut: 0 };
  let paras = body.split(/\n\s*\n/).map((t, i) => ({ t: t.trim(), r: ranks?.[i] ?? 2 })).filter((p) => p.t);
  const total = () => paras.reduce((n, p) => n + words(p.t), 0);
  while (total() > limit && paras.length > 2) {
    const mid = paras.slice(1, -1);
    const worst = mid.reduce((w, p) => (p.r > w.r || (p.r === w.r && words(p.t) > words(w.t)) ? p : w), mid[0]);
    if (worst.r < 3 && total() - words(worst.t) < limit * 0.6) break;
    paras = paras.filter((p) => p !== worst);
  }
  let guard = 0;
  while (total() > limit && guard++ < 200) {
    const pool = paras.length > 2 ? paras.slice(1, -1) : paras;
    const longest = pool.reduce((w, p) => (words(p.t) > words(w.t) ? p : w), pool[0]);
    const sents = longest.t.match(/[^.!?]+[.!?]+["”’)]?\s*/g) || [longest.t];
    if (sents.length <= 1) {
      const over = total() - limit;
      const ws = longest.t.split(/\s+/);
      longest.t = ws.slice(0, Math.max(5, ws.length - over)).join(" ").replace(/[,;:]$/, "") + ".";
      break;
    }
    longest.t = sents.slice(0, -1).join("").trim();
  }
  const text = paras.map((p) => p.t).join("\n\n");
  return { text, cut: before - words(text) };
}

// Which essay in her bank best answers a prompt she pasted.
export function suggestKind(prompt: string): Kind {
  const p = prompt.toLowerCase();
  let best: Kind = "story", score = 0;
  for (const t of TYPES) {
    const s = t.asks.split(",").map((x) => x.trim()).filter(Boolean).reduce((n, w) => n + (p.includes(w) ? w.split(" ").length + 1 : 0), 0);
    if (s > score) { score = s; best = t.kind; }
  }
  return best;
}
export function wordLimitIn(prompt: string): number | null {
  const range = prompt.match(/(\d{2,4})\s*(?:-|–|to)\s*(\d{2,4})\s*words?/i);
  if (range) return Number(range[2]);
  const one = prompt.match(/(\d{2,4})\s*words?/i) || prompt.match(/(?:maximum|max|limit|no more than|up to)\D{0,12}(\d{2,4})/i);
  return one ? Number(one[1]) : null;
}
