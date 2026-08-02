import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const clientSource = readFileSync(new URL("../js/form-client.js", import.meta.url), "utf8");
const ENDPOINT = "https://script.google.com/macros/s/REDACTED_TEST_DEPLOYMENT/exec";

async function runActualClient(savedAtMs, statusResolver) {
  let now = 0, nextTimer = 1, settled = false, result;
  const timers = new Map(), statusUrls = [], posts = [], progressStates = [];
  class FakeDate extends Date { static now() { return now; } }
  const setTimeoutFake = (callback, delay = 0) => { const id = nextTimer++; timers.set(id, { at: now + Math.max(0, Number(delay)), callback }); return id; };
  const clearTimeoutFake = id => timers.delete(id);
  const window = {
    HG_FORM_CONFIG: { ENDPOINT, STATUS_TIMEOUT_MS: 60000, STATUS_REQUEST_TIMEOUT_MS: 5000, STATUS_FAST_PHASE_MS: 15000, STATUS_FAST_POLL_INTERVAL_MS: 800, STATUS_SLOW_POLL_INTERVAL_MS: 2500 },
    location: { search: "?utm_source=test", href: "https://example.test/", assign() {} },
    setTimeout: setTimeoutFake, clearTimeout: clearTimeoutFake,
    open() { return {}; }, crypto: { randomUUID: () => "12345678-1234-4234-8234-123456789abc" }
  };
  const document = {
    referrer: "https://referrer.test/",
    createElement() { return { remove() {} }; },
    head: { appendChild(script) {
      const url = new URL(script.src); statusUrls.push({ at: now, url });
      const status = statusResolver ? statusResolver(now, statusUrls.length) : { ok: now >= savedAtMs, state: now >= savedAtMs ? "saved" : "processing", requestId: now >= savedAtMs ? "HG-ACTUAL-1" : "" };
      queueMicrotask(() => window[url.searchParams.get("prefix")](status));
    } }
  };
  const fetch = (_url, options) => { posts.push(JSON.parse(options.body)); return new Promise(() => {}); };
  vm.runInNewContext(clientSource, { window, document, navigator: { userAgent: "test", language: "zh-TW", onLine: true }, Intl, URLSearchParams, URL, fetch, Date: FakeDate, Math });
  window.HGFormClient.submit({ formType: "general" }, { onStatus: status => progressStates.push(status.state) }).then(value => { settled = true; result = value; });
  let idleTurns = 0;
  for (let guard = 0; !settled && guard < 2000; guard += 1) {
    await Promise.resolve(); await Promise.resolve();
    if (settled) break;
    const pending = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (!pending) { idleTurns += 1; assert.ok(idleTurns < 20, "actual client stalled without a timer"); continue; }
    idleTurns = 0;
    timers.delete(pending[0]); now = pending[1].at; pending[1].callback();
  }
  assert.ok(settled, "actual client did not settle");
  return { result, statusUrls, posts, progressStates };
}

for (const seconds of [5, 15, 30, 45, 60]) {
  const run = await runActualClient(seconds * 1000);
  assert.equal(run.result.ok, true, `${seconds}s saved must succeed`);
  assert.equal(run.result.requestId, "HG-ACTUAL-1");
  assert.equal(run.posts.length, 1, "actual client must POST once");
  assert.ok(run.statusUrls.length <= 40, "actual client must not create a request storm");
  assert.equal(new Set(run.statusUrls.map(item => item.url.searchParams.get("requestToken"))).size, 1);
  assert.equal(new Set(run.statusUrls.map(item => item.url.searchParams.get("_ts"))).size, run.statusUrls.length);
  assert.equal(run.statusUrls.at(-1).at >= seconds * 1000, true);
}

const timeout = await runActualClient(Number.POSITIVE_INFINITY);
assert.equal(timeout.result.code, "status_timeout");
assert.equal(timeout.posts.length, 1, "timeout must not retry POST");
assert.equal(timeout.statusUrls.at(-1).at, 60000);
const before = timeout.statusUrls.length;
await Promise.resolve();
assert.equal(timeout.statusUrls.length, before, "settled timeout must stop polling");

const earlySaved = await runActualClient(5000);
assert.equal(earlySaved.statusUrls.filter(item => item.at > earlySaved.statusUrls.at(-1).at).length, 0, "saved must stop polling");

const competingInvocation = { state: "invocation_error", code: "LOCK_TIMEOUT", invocationOnly: true };
const contentionIntegration = await runActualClient(800, (time, pollNumber) => pollNumber === 1
  ? { ok: false, state: "processing", requestId: "" }
  : { ok: true, state: "saved", requestId: "HG-ACTUAL-1" });
assert.equal(competingInvocation.code, "LOCK_TIMEOUT");
assert.deepEqual(contentionIntegration.progressStates, ["processing", "processing"]);
assert.equal(contentionIntegration.result.ok, true);
assert.equal(contentionIntegration.result.requestId, "HG-ACTUAL-1");
assert.equal(contentionIntegration.progressStates.includes("error"), false, "invocation-only lock timeout must not reach frontend status polling");
console.log("PR7 actual form-client polling checks passed (5/15/30/45/60/timeout)");
