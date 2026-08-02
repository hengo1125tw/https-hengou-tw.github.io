import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../backend/google-apps-script/PR7FormOperations.gs", import.meta.url), "utf8");
const context = { console, Object, String, Number, Math, Date, isFinite };
context.globalThis = context;
vm.runInNewContext(source, context, { filename: "PR7FormOperations.gs" });
const TOKEN = "12345678-1234-4234-8234-123456789abc";

function harness(failures = {}) {
  const rows = [], statuses = new Map(), mail = [], events = [], warnings = [];
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
    createNotificationClaimId(id) { return `${id}-claim-${counts.updateRequest || 0}`; },
    appendRequest(payload, operations, requestId) { fail("appendRequest"); rows.push({ payload, operations: { ...operations }, requestId }); },
    updateRequest(id, patch) { fail("updateRequest"); const row = rows.find(item => item.requestId === id); if (!row) throw new Error("row missing"); Object.assign(row.operations, patch); if (patch.notification_status === "sending") failures.onSending?.(); },
    putStatus(token, value) { fail("putStatus"); const prior = statuses.get(token); if (prior?.state === "saved" && value.state !== "saved") throw new Error("status regression"); statuses.set(token, { ...value }); if (value.state === "processing") failures.onProcessing?.(); },
    getStatus(token) { fail("getStatus"); return statuses.get(token); },
    recordWarning(warning) { warnings.push({ ...warning }); },
    beforeNotificationSend(id) { failures.beforeNotificationSend?.(id); },
    sendNotification(id, payload, subject) { fail("sendNotification"); mail.push({ id, payload, subject }); }
  };
  return { deps, rows, statuses, mail, events, failures, counts, warnings };
}

assert.equal(context.pr7ValidateRequestToken_("").code, "REQUEST_TOKEN_REQUIRED");
assert.equal(context.pr7ValidateRequestToken_("bad").code, "REQUEST_TOKEN_INVALID");
assert.deepEqual([0, 15001, 30001, 60001].map(context.pr7ProcessingHealth_), ["normal", "slow", "observe", "abnormal"]);
for (const value of [true, "true", "TRUE", 1]) assert.equal(context.pr7Boolean_(value), true);
for (const value of [false, "false", "FALSE", 0, ""]) assert.equal(context.pr7Boolean_(value), false);
const timestampCases = [[new Date(1234), 1234], [1234, 1234], ["1234", 1234], ["2026-08-02T00:00:00Z", Date.parse("2026-08-02T00:00:00Z")]];
for (const [value, expected] of timestampCases) assert.deepEqual(JSON.parse(JSON.stringify(context.pr7TimestampMs_(value))), { ok: true, value: expected });
assert.equal(context.pr7TimestampMs_("").code, "TIMESTAMP_EMPTY");
assert.equal(context.pr7TimestampMs_("invalid").code, "TIMESTAMP_INVALID");

const normal = harness();
const first = context.pr7ProcessSubmission_(normal.deps, { requestToken: TOKEN });
const duplicate = context.pr7ProcessSubmission_(normal.deps, { requestToken: TOKEN });
assert.equal(normal.rows.length, 1); assert.equal(normal.mail.length, 1);
assert.equal(first.requestId, duplicate.requestId); assert.equal(duplicate.state, "already_saved");
assert.equal(normal.statuses.get(TOKEN).state, "saved");
assert.match(normal.mail[0].subject, /^\[HG-REQUEST:HG-TEST-0001\]/);
assert.equal(context.pr7NotificationSubjectHasMarker_(normal.mail[0].subject, "HG-TEST-0001"), true);
assert.equal(context.pr7NotificationSubjectHasMarker_("一般通知", "HG-TEST-0001"), false, "subject without marker must fail the adapter contract");
assert.equal(context.pr7NotificationSubject_("HG-ONE", { notificationSubject: "[HG-REQUEST:ATTACK] Custom" }).startsWith("[HG-REQUEST:HG-ONE]"), true);
assert.notEqual(context.pr7NotificationSubjectMarker_("HG-ONE"), context.pr7NotificationSubjectMarker_("HG-TWO"));

const uppercase = harness();
const uppercaseSaved = context.pr7ProcessSubmission_(uppercase.deps, { requestToken: TOKEN.toUpperCase() });
const uppercaseStatus = context.pr7ResolveStatus_(uppercase.deps, TOKEN.toUpperCase());
assert.equal(uppercaseStatus.state, "saved"); assert.equal(uppercaseStatus.requestId, uppercaseSaved.requestId);
context.pr7ProcessSubmission_(uppercase.deps, { requestToken: `  ${TOKEN.toUpperCase()}  ` });
assert.equal(uppercase.rows.length, 1); assert.equal(uppercase.rows[0].operations.request_token, TOKEN);

for (const [invalidToken, code] of [["", "REQUEST_TOKEN_REQUIRED"], ["invalid", "REQUEST_TOKEN_INVALID"]]) {
  const invalid = harness();
  const invalidResult = context.pr7ResolveStatus_(invalid.deps, invalidToken);
  assert.equal(invalidResult.code, code);
  assert.equal(invalid.counts.getStatus || 0, 0); assert.equal(invalid.counts.findByToken || 0, 0);
}

const findFailure = harness({ findByToken: true });
assert.equal(context.pr7ProcessSubmission_(findFailure.deps, { requestToken: TOKEN }).code, "SHEET_READ_FAILED");
assert.equal(findFailure.rows.length, 0); assert.equal(findFailure.mail.length, 0);

const statusFailure = harness({ putStatus: [1] });
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

const gmailSuccessMetadataFailure = harness({ updateRequest: [3] });
const metadataPending = context.pr7ProcessSubmission_(gmailSuccessMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(metadataPending.recovery_code, "NOTIFICATION_METADATA_UPDATE_FAILED");
assert.equal(metadataPending.notification_status, "metadata_pending");
assert.equal(metadataPending.metadataRecorded, true);
assert.equal(gmailSuccessMetadataFailure.mail.length, 1);
const metadataRetry = context.pr7ProcessSubmission_(gmailSuccessMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(metadataRetry.state, "already_saved");
assert.equal(gmailSuccessMetadataFailure.mail.length, 1, "metadata recovery must never resend an already-sent Gmail");

const repeatedMetadataFailure = harness({ updateRequest: [3, 4] });
const repeatedMetadataPending = context.pr7ProcessSubmission_(repeatedMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(repeatedMetadataPending.metadataRecorded, false);
assert.equal(repeatedMetadataFailure.mail.length, 1);
context.pr7ProcessSubmission_(repeatedMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(repeatedMetadataFailure.mail.length, 1, "repeated metadata failure must not resend Gmail");

const gmailFailureMetadataFailure = harness({ sendNotification: true, updateRequest: [3] });
const unknownNotification = context.pr7ProcessSubmission_(gmailFailureMetadataFailure.deps, { requestToken: TOKEN });
assert.equal(unknownNotification.recovery_code, "NOTIFICATION_ERROR_METADATA_UPDATE_FAILED");
assert.equal(gmailFailureMetadataFailure.mail.length, 0);

let secondWhileLocked, middleStatus;
const contention = harness();
contention.failures.onProcessing = () => { if (!secondWhileLocked) { middleStatus = contention.statuses.get(TOKEN); secondWhileLocked = context.pr7ProcessSubmission_(contention.deps, { requestToken: TOKEN }); } };
const contentionFirst = context.pr7ProcessSubmission_(contention.deps, { requestToken: TOKEN });
delete contention.failures.onProcessing;
const contentionRetry = context.pr7ProcessSubmission_(contention.deps, { requestToken: TOKEN });
assert.equal(secondWhileLocked.code, "LOCK_TIMEOUT");
assert.equal(secondWhileLocked.invocationOnly, true);
assert.equal(middleStatus.state, "processing");
assert.ok(contention.events.includes("lock-acquired"));
assert.equal(contention.rows.length, 1); assert.equal(contention.mail.length, 1);
assert.equal(contentionFirst.requestId, contentionRetry.requestId);
assert.equal(contention.statuses.get(TOKEN).state, "saved");

const savedStatusFailure = harness({ putStatus: [3] });
const savedDespiteStatusFailure = context.pr7ProcessSubmission_(savedStatusFailure.deps, { requestToken: TOKEN });
assert.equal(savedDespiteStatusFailure.state, "saved"); assert.equal(savedStatusFailure.mail.length, 1);
const savedStatusRetry = context.pr7ProcessSubmission_(savedStatusFailure.deps, { requestToken: TOKEN });
assert.equal(savedStatusRetry.requestId, savedDespiteStatusFailure.requestId); assert.equal(savedStatusFailure.mail.length, 1);
assert.equal(savedStatusFailure.statuses.get(TOKEN).ok, true);
assert.equal(savedStatusFailure.statuses.get(TOKEN).state, "saved");
assert.equal(savedStatusFailure.statuses.get(TOKEN).requestId, savedDespiteStatusFailure.requestId);

const persistentStatusFailure = harness({ putStatus: [3, 4, 5] });
const sheetSavedStatusMissing = context.pr7ProcessSubmission_(persistentStatusFailure.deps, { requestToken: TOKEN });
assert.equal(persistentStatusFailure.rows[0].operations.final_status, "notification_sent");
assert.equal(persistentStatusFailure.mail.length, 1);
assert.equal(persistentStatusFailure.statuses.get(TOKEN).state, "processing");
const reconciledStatus = context.pr7ResolveStatus_(persistentStatusFailure.deps, TOKEN);
assert.equal(reconciledStatus.ok, true); assert.equal(reconciledStatus.state, "saved");
assert.equal(reconciledStatus.requestId, sheetSavedStatusMissing.requestId);
assert.ok(persistentStatusFailure.warnings.some(item => item.code === "SAVED_STATUS_PERSISTENCE_FAILED"));

const partialStatusFailure = harness({ updateRequest: [1], putStatus: [4] });
const partialBeforeRetry = context.pr7ProcessSubmission_(partialStatusFailure.deps, { requestToken: TOKEN });
assert.equal(partialBeforeRetry.code, "PARTIAL_WRITE_PENDING");
const partialAfterRetry = context.pr7ProcessSubmission_(partialStatusFailure.deps, { requestToken: TOKEN });
assert.equal(partialAfterRetry.state, "saved"); assert.equal(partialStatusFailure.mail.length, 1);
context.pr7ProcessSubmission_(partialStatusFailure.deps, { requestToken: TOKEN });
assert.equal(partialStatusFailure.rows.length, 1); assert.equal(partialStatusFailure.mail.length, 1);

const ownershipFailure = harness({ updateRequest: [2] });
const savedWithOwnershipWarning = context.pr7ProcessSubmission_(ownershipFailure.deps, { requestToken: TOKEN });
assert.equal(savedWithOwnershipWarning.ok, true); assert.equal(savedWithOwnershipWarning.state, "saved");
assert.equal(savedWithOwnershipWarning.warning, "NOTIFICATION_OWNERSHIP_FAILED");
assert.equal(ownershipFailure.mail.length, 0); assert.equal(ownershipFailure.rows.length, 1);
assert.equal(context.pr7ResolveStatus_(ownershipFailure.deps, TOKEN).state, "saved");
const ownershipAudit = context.auditStage2FormOperationsPr7(ownershipFailure.rows.map(row => ({ ...row.operations, requestId: row.requestId, source: "x", email: "a@b.co", note: "x" })), ownershipFailure.warnings, ownershipFailure.deps.now());
assert.ok(ownershipAudit.findings.some(item => item.code === "NOTIFICATION_OWNERSHIP_FAILED"));

let ownershipCompetitor;
const ownership = harness();
ownership.failures.onSending = () => { if (!ownershipCompetitor) ownershipCompetitor = context.pr7ProcessSubmission_(ownership.deps, { requestToken: TOKEN }); };
const ownershipWinner = context.pr7ProcessSubmission_(ownership.deps, { requestToken: TOKEN });
delete ownership.failures.onSending;
assert.equal(ownershipCompetitor.code, "LOCK_TIMEOUT"); assert.equal(ownershipWinner.state, "saved");
assert.equal(ownership.rows.length, 1); assert.equal(ownership.mail.length, 1);
ownership.rows[0].operations.notification_status = "sending";
context.pr7ProcessSubmission_(ownership.deps, { requestToken: TOKEN });
assert.equal(ownership.mail.length, 1, "sending ownership must block a second Gmail");

const crashAfterClaim = harness({ beforeNotificationSend() { const error = new Error("runtime terminated"); error.code = "RUNTIME_TERMINATED"; throw error; } });
assert.throws(() => context.pr7ProcessSubmission_(crashAfterClaim.deps, { requestToken: TOKEN }), /runtime terminated/);
assert.equal(crashAfterClaim.rows.length, 1); assert.equal(crashAfterClaim.mail.length, 0);
assert.equal(crashAfterClaim.rows[0].operations.notification_status, "sending");
const crashRequestId = crashAfterClaim.rows[0].requestId;
delete crashAfterClaim.failures.beforeNotificationSend;
const crashRetry = context.pr7ProcessSubmission_(crashAfterClaim.deps, { requestToken: TOKEN });
assert.equal(crashRetry.requestId, crashRequestId); assert.equal(crashAfterClaim.mail.length, 0, "at-most-once retry must not blindly resend a stale claim");
const staleNow = Number(crashAfterClaim.rows[0].operations.notification_claimed_at) + 300001;
const staleAudit = context.auditStage2FormOperationsPr7(crashAfterClaim.rows.map(row => ({ ...row.operations, requestId: row.requestId, source: "x", email: "a@b.co", note: "x" })), [], staleNow);
assert.ok(staleAudit.findings.some(item => item.code === "STALE_NOTIFICATION_CLAIM"));
const recoveryPlan = context.pr7NotificationRecoveryPlan_(crashAfterClaim.rows[0], staleNow);
assert.equal(recoveryPlan.action, "manual_reconcile_gmail_sent"); assert.match(recoveryPlan.subjectMarker, new RegExp(crashRequestId));
assert.equal(recoveryPlan.subjectMarker, context.pr7NotificationSubjectMarker_(crashRequestId));

for (const [claimedAt, timestampCode] of [["", "TIMESTAMP_EMPTY"], ["invalid", "TIMESTAMP_INVALID"]]) {
  const invalidClaimRow = { requestId: "HG-CLAIM-1", operations: { notification_status: "sending", notification_claimed_at: claimedAt } };
  const plan = context.pr7NotificationRecoveryPlan_(invalidClaimRow, staleNow);
  assert.equal(plan.required, true); assert.equal(plan.action, "manual_reconcile_gmail_sent");
  assert.equal(plan.code, "INVALID_NOTIFICATION_CLAIM_TIMESTAMP"); assert.equal(plan.timestampCode, timestampCode);
  assert.equal(plan.requestId, "HG-CLAIM-1"); assert.equal(plan.subjectMarker, "[HG-REQUEST:HG-CLAIM-1]");
  const claimAudit = context.auditStage2FormOperationsPr7([{ ...invalidClaimRow.operations, requestId: invalidClaimRow.requestId, source: "x", email: "a@b.co", note: "x" }], [], staleNow);
  assert.ok(claimAudit.findings.some(item => item.code === "INVALID_NOTIFICATION_CLAIM_TIMESTAMP"));
}
const activePlan = context.pr7NotificationRecoveryPlan_({ requestId: "HG-ACTIVE", operations: { notification_status: "sending", notification_claimed_at: staleNow - 1000 } }, staleNow);
assert.equal(activePlan.required, false); assert.equal(activePlan.code, "CLAIM_ACTIVE");

const testLead = harness();
context.pr7ProcessSubmission_(testLead.deps, { requestToken: TOKEN, is_test: "TRUE" });
assert.equal(testLead.rows[0].operations.lead_status, "系統測試");
assert.equal(testLead.rows[0].operations.excluded_from_pipeline, true);

const auditNow = Date.parse("2026-08-02T00:02:00Z");
const audit = context.auditStage2FormOperationsPr7([{ request_token: TOKEN, requestId: "HG-1", final_status: "processing", processing_started_at: "2026-08-02T00:00:00Z", processing_duration_ms: "", is_test: "TRUE", excluded_from_pipeline: "false", source: "x", email: "a@b.co", note: "x" }], [], auditNow);
assert.ok(audit.findings.some(item => item.code === "PROCESSING_OVER_60S"));
assert.ok(audit.findings.some(item => item.code === "TEST_IN_PIPELINE"));
const numericAudit = context.auditStage2FormOperationsPr7([{ requestId: "HG-2", final_status: "processing", processing_started_at: String(auditNow - 61000), source: "x", email: "a@b.co", note: "x" }], [], auditNow);
assert.ok(numericAudit.findings.some(item => item.code === "PROCESSING_OVER_60S"));

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
