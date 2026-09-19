import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";
import test, {after, before} from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 3219;
const origin = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: root,
    stdio: "ignore",
  });

  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js test server exited with code ${server.exitCode}.`);
    }
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next.js test server did not become ready.");
});

after(() => {
  server?.kill();
});

async function render(pathname = "/") {
  return fetch(`${origin}${pathname}`, {
    headers: {accept: "text/html"},
    redirect: "follow",
  });
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
