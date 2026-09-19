import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CAREER_CATEGORIES, CAREER_DATA, FEATURED_PROFESSIONS, buildInterviewQuestions } from "../public/eff-interview-coach/career-data.js";
import { calculateAnswerScore, compareAttempts } from "../public/eff-interview-coach/scoring-engine.js";

test("Interview Coach ships the complete requested career catalog", () => {
  assert.equal(CAREER_CATEGORIES.length, 12);
  assert.ok(Object.keys(CAREER_DATA).length >= 40);
  for (const profession of FEATURED_PROFESSIONS) {
    assert.ok(CAREER_DATA[profession].questions.length >= 15, `${profession} needs at least 15 questions`);
    assert.ok(CAREER_DATA[profession].keywords.length >= 15, `${profession} needs at least 15 keywords`);
    assert.ok(CAREER_DATA[profession].welcome.length > 80);
  }
});

test("question builder returns a balanced eight-question interview", () => {
  const questions = buildInterviewQuestions("Elementary Teacher", 8);
  assert.equal(questions.length, 8);
  assert.equal(new Set(questions.map((item) => item.prompt)).size, 8);
  assert.ok(questions.some((item) => item.category === "Introduction"));
  assert.ok(questions.some((item) => item.category === "Closing"));
});

test("rule-based scoring rewards specific action, outcomes, and role alignment", () => {
  const question = { category: "Behavioral", prompt: "Tell me about a time you helped a learner understand a difficult concept.", star: true };
  const profession = CAREER_DATA["Elementary Teacher"];
  const strong = calculateAnswerScore({
    question,
    profession,
    transcript: "During student teaching, six students struggled with multi-step word problems. My goal was to improve understanding before the assessment. I created small-group lessons with visual models, reviewed exit-ticket data, and collaborated with my mentor teacher. As a result, five students improved their assessment scores by 18 percent.",
  });
  const weak = calculateAnswerScore({ question, profession, transcript: "Um, I guess I would probably help them and hopefully it works." });
  assert.ok(strong.score >= 80);
  assert.ok(strong.score > weak.score + 30);
  assert.equal(strong.analysis.star.count, 4);
  assert.ok(weak.feedback.improvements.some((item) => item.includes("uncertain language") || item.includes("filler")));
  const comparison = compareAttempts(weak, strong);
  assert.ok(comparison.change > 30);
  assert.ok(comparison.improvements.length > 0);
});

test("static interview surface includes privacy, fallback, mastery, and report controls", async () => {
  const html = await readFile(new URL("../public/eff-interview-coach/index.html", import.meta.url), "utf8");
  assert.match(html, /Your recordings stay in your browser session/);
  assert.match(html, /Continue without camera/);
  assert.match(html, /Try this question again/);
  assert.match(html, /Review my answers/);
  assert.match(html, /do not predict employment decisions/);
});
