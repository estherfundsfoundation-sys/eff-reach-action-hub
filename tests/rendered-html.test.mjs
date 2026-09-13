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

test("renders all eleven private student action tools", async () => {
  const response = await render("/tools");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const title of [
    "Award Letter &amp; Balance Decoder",
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
  for (const id of ["award", "essay", "scholarship", "fafsa", "aid", "balance", "reminders", "family", "friend", "campus", "persist"]) {
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

test("award decoder keeps documents in-browser and includes editable funding inputs", async () => {
  const source = await readFile(new URL("../app/tools/page.tsx", import.meta.url), "utf8");
  assert.match(source, /import\("pdfjs-dist"\)/);
  assert.match(source, /Your document stays on this device/);
  assert.match(source, /Average work hours each week/);
  assert.match(source, /STILL NEEDED/);
  assert.match(source, /special-circumstances/);
});
