import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const operationsSource = readFileSync(new URL("../backend/google-apps-script/PR7FormOperations.gs", import.meta.url), "utf8");
const clientSource = readFileSync(new URL("../js/form-client.js", import.meta.url), "utf8");
const ops = { Object, String, Number, Math, Date, isFinite };
ops.globalThis = ops;
vm.runInNewContext(operationsSource, ops);
const TOKEN = "12345678-1234-4234-8234-123456789abc";
const ENDPOINT = "https://script.google.com/macros/s/REDACTED_ADAPTER_TEST/exec";

async function integration({ failSavedStatus = false, failOwnership = false } = {}) {
  let now = 0, timerId = 0, locked = false, settled = false, frontendResult, competingResult;
  const timers = new Map(), rows = [], mail = [], statuses = new Map(), warnings = [], frontendStates = [];
  class FakeDate extends Date { static now() { return now; } }
  const setTimer = (fn, delay = 0) => { const id = ++timerId; timers.set(id, { at: now + Number(delay), fn }); return id; };
  const deps = {
    now: () => now,
    withLock(_timeout, callback) { if (locked) { const e = new Error("busy"); e.code = "LOCK_TIMEOUT"; throw e; } locked = true; try { return callback(); } finally { locked = false; } },
    findByToken: token => rows.find(row => row.operations.request_token === token),
    findByRequestId: id => rows.find(row => row.requestId === id),
    createRequestId: () => "HG-INTEGRATION-1",
    createNotificationClaimId: () => "claim-integration-1",
    appendRequest(payload, operations, requestId) { rows.push({ payload, operations: { ...operations }, requestId }); },
    updateRequest(id, patch) {
      if (failOwnership && patch.notification_status === "sending") throw new Error("ownership metadata unavailable");
      Object.assign(rows.find(row => row.requestId === id).operations, patch);
    },
    putStatus(token, status) {
      if (failSavedStatus && status.state === "saved") throw new Error("saved status unavailable");
      statuses.set(token, { ...status });
      if (status.state === "processing" && !competingResult) competingResult = ops.pr7ProcessSubmission_(deps, { requestToken: token });
    },
    getStatus: token => statuses.get(token),
    recordWarning: warning => warnings.push({ ...warning }),
    sendNotification: id => mail.push(id)
  };
  const window = {
    HG_FORM_CONFIG: { ENDPOINT, STATUS_TIMEOUT_MS: 60000, STATUS_REQUEST_TIMEOUT_MS: 5000, STATUS_FAST_PHASE_MS: 15000, STATUS_FAST_POLL_INTERVAL_MS: 800, STATUS_SLOW_POLL_INTERVAL_MS: 2500 },
    location: { search: "", href: "https://example.test/", assign() {} },
    setTimeout: setTimer, clearTimeout: id => timers.delete(id), open() { return {}; },
    crypto: { randomUUID: () => TOKEN }
  };
  const document = {
    referrer: "",
    createElement: () => ({ remove() {} }),
    head: { appendChild(script) {
      const url = new URL(script.src);
      const status = ops.pr7ResolveStatus_(deps, url.searchParams.get("requestToken"));
      queueMicrotask(() => window[url.searchParams.get("prefix")](status));
    } }
  };
  const fetch = (_url, options) => {
    const payload = JSON.parse(options.body);
    setTimer(() => ops.pr7ProcessSubmission_(deps, payload), 1000);
    return new Promise(() => {});
  };
  vm.runInNewContext(clientSource, { window, document, navigator: { userAgent: "adapter-test", language: "zh-TW", onLine: true }, Intl, URLSearchParams, URL, fetch, Date: FakeDate, Math });
  window.HGFormClient.submit({ formType: "general" }, { onStatus: status => frontendStates.push(status.state) }).then(value => { frontendResult = value; settled = true; });
  for (let guard = 0, idle = 0; !settled && guard < 2000; guard += 1) {
    await Promise.resolve(); await Promise.resolve();
    const pending = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (!pending) { if (++idle > 20) throw new Error("integration stalled"); continue; }
    idle = 0; timers.delete(pending[0]); now = pending[1].at; pending[1].fn();
  }
  assert.ok(settled);
  return { frontendResult, frontendStates, competingResult, rows, mail, statuses, warnings, deps };
}

const reconciled = await integration({ failSavedStatus: true });
assert.equal(reconciled.competingResult.code, "LOCK_TIMEOUT");
assert.equal(reconciled.competingResult.invocationOnly, true);
assert.equal(reconciled.rows.length, 1); assert.equal(reconciled.mail.length, 1);
assert.equal(reconciled.frontendResult.ok, true); assert.equal(reconciled.frontendResult.requestId, "HG-INTEGRATION-1");
assert.equal(reconciled.frontendResult.code, undefined);
assert.equal(reconciled.frontendStates.includes("error"), false);
assert.ok(reconciled.warnings.some(item => item.code === "SAVED_STATUS_PERSISTENCE_FAILED"));
assert.equal(ops.pr7ResolveStatus_(reconciled.deps, TOKEN).state, "saved");

const ownership = await integration({ failOwnership: true });
assert.equal(ownership.frontendResult.ok, true); assert.equal(ownership.frontendResult.requestId, "HG-INTEGRATION-1");
assert.equal(ownership.rows.length, 1); assert.equal(ownership.mail.length, 0);
assert.ok(ownership.warnings.some(item => item.code === "NOTIFICATION_OWNERSHIP_FAILED"));
assert.equal(ops.pr7ResolveStatus_(ownership.deps, TOKEN).state, "saved");

console.log("PR7 adapter integration checks passed");
