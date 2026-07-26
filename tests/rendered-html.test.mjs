import assert from "node:assert/strict";
import test from "node:test";

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
