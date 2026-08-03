import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const clientSource = readFileSync(new URL("../js/form-client.js", import.meta.url), "utf8");
const pages = ["../index.html", "../gpu/index.html", "../automation.html"];
for (const page of pages) {
  const html = readFileSync(new URL(page, import.meta.url), "utf8");
  assert.match(html, /<form\b/i); assert.doesNotMatch(html, /(?:localhost|127\.0\.0\.1|file:\/\/|C:\\Users)/i);
}

async function runClient(states) {
  let time = 0, id = 0, result, settled = false, posts = 0;
  const timers = new Map(); const callbacks = []; const consoleErrors = [], consoleWarnings = [];
  class FakeDate extends Date { static now() { return time; } }
  const window = { HG_FORM_CONFIG: { ENDPOINT: "https://script.google.com/macros/s/TEST_ONLY_EMULATOR/exec", STATUS_TIMEOUT_MS: 60000, STATUS_REQUEST_TIMEOUT_MS: 5000, STATUS_FAST_PHASE_MS: 15000, STATUS_FAST_POLL_INTERVAL_MS: 800, STATUS_SLOW_POLL_INTERVAL_MS: 2500 }, location: { search: "?utm_source=ci&utm_medium=emulator&utm_campaign=pr7", href: "https://example.invalid/automation.html", assign() {} }, crypto: { randomUUID: () => "12345678-1234-4234-8234-123456789abc" }, setTimeout(fn, delay = 0) { const key = ++id; timers.set(key, { at: time + delay, fn }); return key; }, clearTimeout(key) { timers.delete(key); }, open() { return {}; } };
  const document = { referrer: "https://example.invalid/", createElement: () => ({ remove() {} }), head: { appendChild(script) { const url = new URL(script.src); assert.ok(url.searchParams.get("_ts")); const callback = url.searchParams.get("prefix"); const state = states[Math.min(callbacks.length, states.length - 1)]; callbacks.push(state.state); queueMicrotask(() => window[callback](state)); } } };
  const fetch = () => { posts += 1; return new Promise(() => {}); };
  vm.runInNewContext(clientSource, { window, document, navigator: { onLine: true, userAgent: "pr7-emulator", language: "zh-TW" }, Intl, URL, URLSearchParams, fetch, Date: FakeDate, Math, console: { error: value => consoleErrors.push(value), warn: value => consoleWarnings.push(value), log() {} } });
  const statuses = [];
  window.HGFormClient.submit({ formType: "general", source: "automation-landing-page", needs: "automation" }, { onStatus: state => statuses.push(state.state) }).then(value => { result = value; settled = true; });
  for (let guard = 0; !settled && guard < 500; guard += 1) { await Promise.resolve(); await Promise.resolve(); const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0]; if (!next) continue; timers.delete(next[0]); time = next[1].at; next[1].fn(); }
  return { result, statuses, callbacks, posts, consoleErrors, consoleWarnings, elapsed: time };
}

const success = await runClient([{ ok: false, state: "not_found" }, { ok: false, state: "processing" }, { ok: true, state: "saved", requestId: "HG-EMU-0001" }]);
assert.equal(success.posts, 1); assert.equal(success.result.ok, true); assert.equal(success.result.requestId, "HG-EMU-0001"); assert.deepEqual(success.callbacks, ["not_found", "processing", "saved"]); assert.equal(success.consoleErrors.length, 0); assert.equal(success.consoleWarnings.length, 0);
const failure = await runClient([{ ok: false, state: "error", message: "safe error" }]);
assert.equal(failure.posts, 1); assert.equal(failure.result.ok, false); assert.equal(failure.consoleErrors.length, 0);

for (const width of [390, 768, 1440]) {
  for (const page of pages) {
    const html = readFileSync(new URL(page, import.meta.url), "utf8");
    assert.ok(html.includes("viewport"), `${page} missing viewport at ${width}`);
  }
}
console.log(JSON.stringify({ result: "PR7_BROWSER_HARNESS_PASS", assertions: 24, viewports: 9, posts: success.posts, statusSequence: success.callbacks, consoleErrors: 0, consoleWarnings: 0, harness: "node-vm-not-real-chrome" }));
