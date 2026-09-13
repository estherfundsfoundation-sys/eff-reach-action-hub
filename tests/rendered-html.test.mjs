import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the complete public REACH hub", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /EFF Reach Action Hub/);
  assert.match(html, /THE COMPLETE REACH ACTION HUB/);
  assert.match(html, /REACH K/);
  assert.match(html, /REACH for Professionals/i);
  assert.doesNotMatch(html, /Codex is working|Your site is taking shape/);
});

test("renders every guided pathway", async () => {
  const paths = [
    "/reach-yourself",
    "/reach-a-friend",
    "/reach-your-campus",
    "/reach-your-community",
    "/reach-beyond-campus",
    "/reach-k-12",
    "/reach-for-professionals",
  ];

  for (const pathname of paths) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, /YOUR GUIDED PATH/, pathname);
    assert.match(html, /Return to the full hub/, pathname);
  }
});

test("renders all thirteen private student action tools", async () => {
  const response = await render("/tools");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const title of [
    "Award Letter &amp; Balance Decoder",
    "Financial Aid Counter-Offer Engine",
    "Recommendation Letter Builder",
    "Essay Story Builder",
    "Scholarship Action Center",
    "FAFSA Decoder",
    "Aid Offer Decoder",
    "Tuition Rescue Plan",
    "Deadline Reminder Builder",
    "Family Funding Check",
    "Help-a-Friend Script",
    "Campus Event Builder",
    "Stay-Enrolled Planner",
  ]) assert.match(html, new RegExp(title));
  assert.match(html, /answers stay in your browser/i);
});

test("homepage deep-links every tool and contains no retired 404 routes", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const id of ["award", "counteroffer", "recommendation", "essay", "scholarship", "fafsa", "aid", "balance", "reminders", "family", "friend", "campus", "persist"]) {
    assert.match(source, new RegExp(`/tools\\?tool=${id}`));
  }
  assert.doesNotMatch(source, /https:\/\/estherfundsfoundation\.org\/become-a-partner/);
  assert.doesNotMatch(source, /https:\/\/estherfundsfoundation\.org\/programs/);
});

test("deadline reminders are local calendar alerts", async () => {
  const source = await readFile(new URL("../app/tools/page.tsx", import.meta.url), "utf8");
  assert.match(source, /text\/calendar/);
  assert.match(source, /\[20160,4320,1440\]/);
  assert.match(source, /Your calendar app—not EFF—delivers these alerts/);
});

test("recommendation tool requires human review and never invents an EFF endorsement", async () => {
  const source = await readFile(new URL("../app/tools/RecommendationLetterTool.tsx", import.meta.url), "utf8");
  assert.match(source, /without inventing a single fact/i);
  assert.match(source, /must review, edit, verify, sign, and submit/i);
  assert.match(source, /never issued automatically from unverified student input/i);
  assert.match(source, /Open a secure EFF review case/);
  assert.match(source, /portal\.estherfundsfoundation\.org\/help-desk\/open-case/);
});

test("counter-offer engine compares gift aid separately from debt and uses official public context", async () => {
  const source = await readFile(new URL("../app/tools/CounterOfferEngine.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/scorecard/route.ts", import.meta.url), "utf8");
  assert.match(source, /Loans and work-study are not gift aid/);
  assert.match(source, /Potential comparison gap/i);
  assert.match(source, /This is a request—not a promise or entitlement/);
  assert.match(source, /Your award letters stay on this device/);
  assert.match(route, /api\.data\.gov\/ed\/collegescorecard/);
  assert.match(route, /latest\.cost\.avg_net_price\.overall/);
});

test("award decoder keeps documents in-browser and includes editable funding inputs", async () => {
  const source = await readFile(new URL("../app/tools/page.tsx", import.meta.url), "utf8");
  assert.match(source, /import\("pdfjs-dist"\)/);
  assert.match(source, /Your document stays on this device/);
  assert.match(source, /Average work hours each week/);
  assert.match(source, /STILL NEEDED/);
  assert.match(source, /special-circumstances/);
});

test("renders the complete student defense suite and all thirteen engines", async () => {
  const response = await render("/defense");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const title of [
    "What Do I Do First?",
    "SAP Appeal Builder",
    "Grade Rescue Calculator",
    "Bursar Fee Review",
    "Employer Tuition Finder",
    "Transcript Hold Navigator",
    "Syllabus Collision Map",
    "Course Sequence Checker",
    "Reverse Transfer Navigator",
    "Housing Evidence Builder",
    "Grade Grievance Builder",
    "Micro-Hold Rescue",
    "Campus Reality Receipt",
  ]) assert.match(html, new RegExp(title));
  assert.match(html, /No account needed/);
});

test("student defense tools preserve human decisions and cite official baselines", async () => {
  const source = await readFile(new URL("../app/defense/DefenseSuite.tsx", import.meta.url), "utf8");
  assert.match(source, /school—not this tool—sets the appeal process/i);
  assert.match(source, /does not pay a balance, issue a card, promise EFF funding/i);
  assert.match(source, /does not guarantee a credential/i);
  assert.match(source, /fsapartners\.ed\.gov\/knowledge-center\/fsa-handbook/);
  assert.match(source, /irs\.gov\/publications\/p15b/);
  assert.match(source, /processed in this browser/i);
});

test("renders a de-identified outcome check-in and protects sensitive fields", async () => {
  const response = await render("/outcome");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /WHAT HAPPENED NEXT/);
  assert.match(html, /de-identified, aggregate impact reporting/i);
  assert.match(html, /Please do not enter/i);
  const route = await readFile(new URL("../app/api/outcomes/route.ts", import.meta.url), "utf8");
  assert.match(route, /student_defense_outcomes/);
  assert.doesNotMatch(route, /email|student_id|social_security/i);
});
