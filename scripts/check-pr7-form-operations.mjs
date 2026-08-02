import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../backend/google-apps-script/PR7FormOperations.gs", import.meta.url), "utf8");
const context = { console, Object, String, Number, Math, Date, isFinite };
context.globalThis = context;
vm.runInNewContext(source, context, { filename: "PR7FormOperations.gs" });
const TOKEN = "12345678-1234-4234-8234-123456789abc";

function harness(failures = {}) {
  const rows = [], statuses = new Map(), mail = [], events = [];
  const counts = {};
  let now = 0, locked = false;
  const fail = name => {
    counts[name] = (counts[name] || 0) + 1;
    const configured = failures[name];
    if (configured === true || (Array.isArray(configured) && configured.includes(counts[name])) || (!Array.isArray(configured) && (Number(configured) || 0) >= counts[name])) {
      const error = new Error(name);
      error.code = name === "lockTimeout" ? "LOCK_TIMEOUT" : name.toUpperCase();
      throw error;
    }
  };
  const deps = {
    now: () => (now += 1000),
    withLock(timeout, callback) {
      assert.equal(timeout, 10000);
      if (locked) { const error = new Error("lock busy"); error.code = "LOCK_TIMEOUT"; throw error; }
      locked = true; events.push("lock-acquired");
      try { failures.onLock?.(); return callback(); } finally { locked = false; events.push("lock-released"); }
    },
    findByToken(token) { fail("findByToken"); return rows.find(row => row.operations.request_token === token); },
    findByRequestId(id) { return rows.find(row => row.requestId === id); },
    createRequestId() { return `HG-TEST-${String(rows.length + 1).padStart(4, "0")}`; },
    appendRequest(payload, operations, requestId) { fail("appendRequest"); rows.push({ payload, operations: { ...operations }, requestId }); },
    updateRequest(id, patch) { fail("updateRequest"); const row = rows.find(item => item.requestId === id); if (!row) throw new Error("row missing"); Object.assign(row.operations, patch); },
    putStatus(token, value) { fail("putStatus"); const prior = statuses.get(token); if (prior?.state === "saved" && value.state !== "saved") throw new Error("status regression"); statuses.set(token, { ...value }); },
    sendNotification(id) { fail("sendNotification"); mail.push(id); }
  };
  return { deps, rows, statuses, mail, events, failures, counts };
}

assert.equal(context.pr7ValidateRequestToken_("").code, "REQUEST_TOKEN_REQUIRED");
assert.equal(context.pr7ValidateRequestToken_("bad").code, "REQUEST_TOKEN_INVALID");
assert.deepEqual([0, 15001, 30001, 60001].map(context.pr7ProcessingHealth_), ["normal", "slow", "observe", "abnormal"]);
for (const value of [true, "true", "TRUE", 1]) assert.equal(context.pr7Boolean_(value), true);
for (const value of [false, "false", "FALSE", 0, ""]) assert.equal(context.pr7Boolean_(value), false);

const normal = harness();
const first = context.pr7ProcessSubmission_(normal.deps, { requestToken: TOKEN });
const duplicate = context.pr7ProcessSubmission_(normal.deps, { requestToken: TOKEN });
assert.equal(normal.rows.length, 1); assert.equal(normal.mail.length, 1);
assert.equal(first.requestId, duplicate.requestId); assert.equal(duplicate.state, "already_saved");
assert.equal(normal.statuses.get(TOKEN).state, "saved");

const findFailure = harness({ findByToken: true });
assert.equal(context.pr7ProcessSubmission_(findFailure.deps, { requestToken: TOKEN }).code, "SHEET_READ_FAILED");
assert.equal(findFailure.rows.length, 0); assert.equal(findFailure.mail.length, 0);

const statusFailure = harness({ putStatus: true });
assert.equal(context.pr7ProcessSubmission_(statusFailure.deps, { requestToken: TOKEN }).code, "STATUS_WRITE_FAILED");
assert.equal(statusFailure.rows.length, 0);

const partial = harness({ updateRequest: 1 });
const partialResult = context.pr7ProcessSubmission_(partial.deps, { requestToken: TOKEN });
assert.equal(partialResult.code, "PARTIAL_WRITE_PENDING"); assert.equal(partialResult.rowExists, true);
assert.equal(partial.rows.length, 1); assert.equal(partial.mail.length, 0);
partial.failures.updateRequest = 0;
const recovered = context.pr7ProcessSubmission_(partial.deps, { requestToken: TOKEN });
assert.equal(recovered.state, "saved"); assert.equal(recovered.requestId, partialResult.requestId);
assert.equal(partial.rows.length, 1); assert.equal(partial.mail.length, 1);

const repeatedPartial = harness({ updateRequest: true });
assert.equal(context.pr7ProcessSubmission_(repeatedPartial.deps, { requestToken: TOKEN }).code, "PARTIAL_WRITE_PENDING");
assert.equal(context.pr7ProcessSubmission_(repeatedPartial.deps, { requestToken: TOKEN }).code, "PARTIAL_WRITE_RECOVERY_FAILED");
assert.equal(repeatedPartial.rows.length, 1); assert.equal(repeatedPartial.mail.length, 0);

const gmailSuccessMetadataFailure = harness({ updateRequest: [2] });
const metadataPending = context.pr7ProcessSubmission_(gmailSuccessMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(metadataPending.recovery_code, "NOTIFICATION_METADATA_UPDATE_FAILED");
assert.equal(metadataPending.notification_status, "sent_metadata_pending");
assert.equal(gmailSuccessMetadataFailure.mail.length, 1);
const metadataRetry = context.pr7ProcessSubmission_(gmailSuccessMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(metadataRetry.state, "already_saved");
assert.equal(gmailSuccessMetadataFailure.mail.length, 1, "metadata recovery must never resend an already-sent Gmail");

const gmailFailureMetadataFailure = harness({ sendNotification: true, updateRequest: [2] });
const unknownNotification = context.pr7ProcessSubmission_(gmailFailureMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(unknownNotification.recovery_code, "NOTIFICATION_ERROR_METADATA_UPDATE_FAILED");
assert.equal(gmailFailureMetadataFailure.mail.length, 0);

let secondWhileLocked;
const contention = harness();
contention.failures.onLock = () => { if (!secondWhileLocked) secondWhileLocked = context.pr7ProcessSubmission_(contention.deps, { requestToken: TOKEN }); };
const contentionFirst = context.pr7ProcessSubmission_(contention.deps, { requestToken: TOKEN });
delete contention.failures.onLock;
const contentionRetry = context.pr7ProcessSubmission_(contention.deps, { requestToken: TOKEN });
assert.equal(secondWhileLocked.code, "LOCK_TIMEOUT");
assert.ok(contention.events.includes("lock-acquired"));
assert.equal(contention.rows.length, 1); assert.equal(contention.mail.length, 1);
assert.equal(contentionFirst.requestId, contentionRetry.requestId);
assert.equal(contention.statuses.get(TOKEN).state, "saved");

const testLead = harness();
context.pr7ProcessSubmission_(testLead.deps, { requestToken: TOKEN, is_test: "TRUE" });
assert.equal(testLead.rows[0].operations.lead_status, "系統測試");
assert.equal(testLead.rows[0].operations.excluded_from_pipeline, true);

const auditNow = Date.parse("2026-08-02T00:02:00Z");
const audit = context.auditStage2FormOperationsPr7([{ request_token: TOKEN, requestId: "HG-1", final_status: "processing", processing_started_at: "2026-08-02T00:00:00Z", processing_duration_ms: "", is_test: "TRUE", excluded_from_pipeline: "false", source: "x", email: "a@b.co", note: "x" }], [], auditNow);
assert.ok(audit.findings.some(item => item.code === "PROCESSING_OVER_60S"));
assert.ok(audit.findings.some(item => item.code === "TEST_IN_PIPELINE"));

function migrationHarness(initial) {
  const headers = initial.slice(), writes = [];
  return { headers, writes, sheet: { getLastColumn: () => headers.length, getRange(row, col) { if (row === 1 && col === 1 && headers.length) return { getDisplayValues: () => [headers.slice()] }; return { setValues(values) { writes.push({ row, col, values }); headers.push(...values[0]); } }; } } };
}
for (const initial of [[], ["requestId", "source"]]) {
  const migration = migrationHarness(initial);
  context.migrateStage2FormOperationsPr7(migration.sheet);
  assert.equal(migration.writes[0].col, initial.length ? initial.length + 1 : 1);
  assert.equal(context.migrateStage2FormOperationsPr7(migration.sheet).added.length, 0);
}

console.log("PR7 form operations defect checks passed");
