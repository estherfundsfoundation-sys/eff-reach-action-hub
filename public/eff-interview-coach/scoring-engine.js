import { SCORING_CONFIG } from "./career-data.js";

const FILLERS = ["um", "uh", "like", "basically", "you know", "i guess", "kind of", "sort of"];
const WEAK_LANGUAGE = ["i guess", "maybe", "probably", "i think i could", "i don't know", "hopefully"];
const ACTION_LANGUAGE = ["i created", "i organized", "i led", "i implemented", "i developed", "i helped", "i coordinated", "i resolved", "i improved", "i managed", "i collaborated", "i designed", "i analyzed", "i delivered", "i communicated", "i advocated"];
const RESULT_LANGUAGE = ["resulted in", "increased", "decreased", "improved", "led to", "successfully", "achieved", "completed", "reduced", "grew", "as a result", "the outcome", "ultimately"];
const PROFANITY = ["fuck", "shit", "bitch", "hoe", "asshole", "damn"];
const STOP_WORDS = new Set(["about", "after", "again", "against", "and", "are", "because", "before", "being", "between", "could", "describe", "from", "have", "into", "interview", "role", "that", "the", "their", "tell", "this", "time", "what", "when", "where", "which", "while", "with", "would", "your"]);

const clean = (value = "") => value.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9%$'\s-]/g, " ").replace(/\s+/g, " ").trim();
const words = (value = "") => clean(value).split(" ").filter(Boolean);
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function phraseCount(text, phrases) {
  return phrases.reduce((total, phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return total + (text.match(new RegExp(`\\b${escaped}\\b`, "g")) || []).length;
  }, 0);
}

function detectSTARComponents(text) {
  const t = clean(text);
  const situation = /(when|during|at the time|our team|the challenge|the problem|in my role|in a class|at work)/.test(t);
  const task = /(needed to|my goal|i was asked|the priority|my responsibility|we had to|deadline|objective)/.test(t);
  const action = phraseCount(t, ACTION_LANGUAGE) > 0 || /(so i|i decided|my first step|i then|i worked with|i reached out)/.test(t);
  const result = phraseCount(t, RESULT_LANGUAGE) > 0 || /\b\d+(?:\.\d+)?%?\b/.test(t);
  return { situation, task, action, result, count: [situation, task, action, result].filter(Boolean).length };
}

function detectCareerKeywords(text, keywords = []) {
  const t = clean(text);
  const matched = keywords.filter((keyword) => t.includes(clean(keyword)));
  return { matched: [...new Set(matched)], count: new Set(matched).size };
}

function relevantQuestionTerms(question = "") {
  return [...new Set(words(question).filter((word) => word.length > 3 && !STOP_WORDS.has(word)))];
}

export function calculateAnswerScore({ transcript = "", question = {}, profession = {} }) {
  const t = clean(transcript);
  const tokenList = words(t);
  if (!t) return emptyScore();

  const fillerCount = phraseCount(t, FILLERS);
  const weakCount = phraseCount(t, WEAK_LANGUAGE);
  const actionCount = phraseCount(t, ACTION_LANGUAGE);
  const resultCount = phraseCount(t, RESULT_LANGUAGE);
  const profanityCount = phraseCount(t, PROFANITY);
  const numberCount = (t.match(/(?:\$?\d+(?:\.\d+)?%?)/g) || []).length;
  const star = detectSTARComponents(t);
  const career = detectCareerKeywords(t, profession.keywords || []);
  const questionTerms = relevantQuestionTerms(question.prompt || "");
  const questionMatches = questionTerms.filter((term) => t.includes(term)).length;
  const wordCount = tokenList.length;
  const sentenceCount = Math.max(1, (transcript.match(/[.!?]+/g) || []).length);
  const specificityMarkers = phraseCount(t, ["for example", "specifically", "one time", "such as", "my role", "the challenge"]);

  const relevanceRatio = questionTerms.length ? questionMatches / Math.min(questionTerms.length, 5) : 0;
  const relevance = clamp(0.36 + relevanceRatio * 0.42 + (wordCount >= 45 ? 0.18 : wordCount / 250));
  const specificity = clamp((wordCount >= 45 ? 0.42 : wordCount / 108) + Math.min(0.34, (specificityMarkers + numberCount) * 0.11) + (actionCount ? 0.18 : 0));
  const structure = question.star
    ? clamp(star.count / 4)
    : clamp((wordCount >= 45 ? 0.55 : wordCount / 82) + (sentenceCount >= 3 ? 0.25 : 0.08) + (star.action ? 0.2 : 0));
  const action = clamp(actionCount * 0.38 + (star.action ? 0.42 : 0) + (/\bi\b/.test(t) ? 0.2 : 0));
  const result = clamp(resultCount * 0.34 + numberCount * 0.19 + (star.result ? 0.35 : 0));
  const professional = clamp(1 - weakCount * 0.16 - profanityCount * 0.5 - (wordCount < 20 ? 0.25 : 0));
  const alignment = clamp(career.count / 4 + (career.count >= 2 ? 0.18 : 0));
  const fillerRate = fillerCount / Math.max(wordCount, 1);
  const tooLongPenalty = wordCount > 260 ? Math.min(0.55, (wordCount - 260) / 180) : 0;
  const tooShortPenalty = wordCount < 35 ? (35 - wordCount) / 70 : 0;
  const delivery = clamp(1 - fillerRate * 15 - tooLongPenalty - tooShortPenalty);

  const ratios = { relevance, specificity, structure, action, result, professional, alignment, delivery };
  const categoryScores = Object.fromEntries(Object.entries(SCORING_CONFIG.weights).map(([key, weight]) => [key, Math.round(ratios[key] * weight)]));
  const score = Object.values(categoryScores).reduce((sum, value) => sum + value, 0);

  const analysis = { wordCount, fillerCount, weakCount, actionCount, resultCount, numberCount, profanityCount, star, career, questionMatches, questionTerms };
  return { score, label: masteryLabel(score), categoryScores, analysis, feedback: generateFeedback({ score, ratios, analysis, question, profession }) };
}

function emptyScore() {
  return {
    score: 0,
    label: "Needs Practice",
    categoryScores: Object.fromEntries(Object.keys(SCORING_CONFIG.weights).map((key) => [key, 0])),
    analysis: { wordCount: 0, fillerCount: 0, weakCount: 0, actionCount: 0, resultCount: 0, numberCount: 0, profanityCount: 0, star: { count: 0 }, career: { matched: [], count: 0 } },
    feedback: { strengths: [], improvements: ["Add or correct the transcript so the coach can evaluate the answer."], nextGoal: "Give a complete, truthful answer before scoring." },
  };
}

function masteryLabel(score) {
  return SCORING_CONFIG.mastery.find((level) => score >= level.min)?.label || "Needs Practice";
}

export function generateFeedback({ score, ratios, analysis, question, profession }) {
  const strengths = [];
  const improvements = [];

  if (ratios.relevance >= 0.72) strengths.push("You stayed connected to the question instead of giving a generic response.");
  if (analysis.actionCount > 0 || analysis.star.action) strengths.push("You explained your personal actions clearly.");
  if (analysis.resultCount > 0 || analysis.numberCount > 0) strengths.push("You included an outcome or measurable detail that made the example more credible.");
  if (analysis.career.count >= 2) strengths.push(`You connected your answer to ${profession.competencies?.[0]?.toLowerCase() || "the profession"}.`);
  if (question.star && analysis.star.count >= 3) strengths.push("Your example followed a clear situation-to-action story.");
  if (!analysis.fillerCount && analysis.wordCount >= 35) strengths.push("Your transcript avoided the filler phrases tracked by this rubric.");

  if (ratios.relevance < 0.58) improvements.push("Answer the exact question in your first sentence, then support it with one example.");
  if (analysis.wordCount < 35) improvements.push("Your answer is too brief to show your thinking. Add the context, your action, and what happened next.");
  if (analysis.wordCount > 260) improvements.push("Tighten the answer. Keep one example and remove details that do not change the outcome.");
  if (analysis.weakCount) improvements.push(`You used uncertain language ${analysis.weakCount} time${analysis.weakCount === 1 ? "" : "s"}. Replace it with a direct, truthful statement.`);
  if (analysis.fillerCount) improvements.push(`The transcript detected ${analysis.fillerCount} filler phrase${analysis.fillerCount === 1 ? "" : "s"}. Pause briefly instead of filling the silence.`);
  if (analysis.profanityCount) improvements.push("Replace informal or profane language with workplace-appropriate wording.");
  if (question.star && analysis.star.count < 4) {
    const missing = Object.entries(analysis.star).filter(([key, value]) => key !== "count" && !value).map(([key]) => key);
    improvements.push(`Strengthen the story by adding the ${missing.join(" and ")} portion${missing.length > 1 ? "s" : ""}.`);
  }
  if (!analysis.actionCount && !analysis.star.action) improvements.push("Use direct ownership language: explain what you decided, created, coordinated, or resolved.");
  if (!analysis.resultCount && !analysis.numberCount) improvements.push("Add the outcome. Explain what changed, improved, finished, or became possible because of your actions.");
  if (analysis.career.count < 2) improvements.push(`Connect the example more directly to ${profession.competencies?.slice(0, 2).join(" and ").toLowerCase() || "the role's core competencies"}.`);

  const dedupedStrengths = [...new Set(strengths)].slice(0, 3);
  const dedupedImprovements = [...new Set(improvements)].slice(0, 4);
  if (!dedupedStrengths.length) dedupedStrengths.push("You completed an attempt and now have a clear baseline to improve.");
  if (!dedupedImprovements.length) dedupedImprovements.push("Keep this structure and make the example even more concise on the next attempt.");

  let nextGoal = "Give one focused example with clear action ownership and a result.";
  if (!analysis.resultCount && !analysis.numberCount) nextGoal = "End your next attempt with a specific result or measurable outcome.";
  else if (question.star && analysis.star.count < 4) nextGoal = "Complete all four parts of the story: context, responsibility, action, and result.";
  else if (analysis.fillerCount) nextGoal = "Retry with deliberate pauses and fewer filler phrases.";
  else if (score >= 95) nextGoal = "Question mastered. Keep the same clarity while sounding natural—not memorized.";

  return { strengths: dedupedStrengths, improvements: dedupedImprovements, nextGoal };
}

export function compareAttempts(previous, current) {
  if (!previous) return { change: 0, improvements: ["This is your baseline attempt."] };
  const change = current.score - previous.score;
  const improvements = [];
  if (current.analysis.resultCount + current.analysis.numberCount > previous.analysis.resultCount + previous.analysis.numberCount) improvements.push("You added a clearer result or measurable outcome.");
  if (current.analysis.fillerCount < previous.analysis.fillerCount) improvements.push("You used fewer tracked filler phrases.");
  if (current.analysis.star.count > previous.analysis.star.count) improvements.push("Your answer included more of the STAR story structure.");
  if (current.analysis.career.count > previous.analysis.career.count) improvements.push("You connected the example more directly to the profession.");
  if (!improvements.length && change > 0) improvements.push("Your overall rubric performance became more complete and focused.");
  if (!improvements.length) improvements.push("Use the coaching goal below to create a stronger next attempt.");
  return { change, improvements };
}

export { detectSTARComponents, detectCareerKeywords };
