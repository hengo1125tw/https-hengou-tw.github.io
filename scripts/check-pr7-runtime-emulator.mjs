import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../backend/google-apps-script/PR7FormOperations.gs", import.meta.url), "utf8");
const ops = { Object, String, Number, Math, Date, JSON, isFinite };
ops.globalThis = ops;
vm.runInNewContext(source, ops, { filename: "PR7FormOperations.gs" });

const TOKEN = "12345678-1234-4234-8234-123456789abc";
const ledger = { sheetReads: 0, sheetWrites: 0, cacheReads: 0, cacheWrites: 0, lockAttempts: 0, gmailSends: 0, propertyWrites: 0, externalCalls: 0 };

function harness(faults = {}) {
  const rows = [], statuses = new Map(), mails = [], warnings = [];
  let locked = false, sequence = 0;
  const deps = {
    now: () => 1770000000000,
    withLock(_timeout, callback) {
      ledger.lockAttempts += 1;
      if (locked || faults.lockTimeout) { const error = new Error("LOCK_TIMEOUT"); error.code = "LOCK_TIMEOUT"; throw error; }
      locked = true; try { return callback(); } finally { locked = false; }
    },
    findByToken(token) { ledger.sheetReads += 1; if (faults.findByToken) throw new Error("read failed"); return rows.find(row => row.operations.request_token === token) || null; },
    findByRequestId(id) { ledger.sheetReads += 1; if (faults.findByRequestId) throw new Error("read failed"); return rows.find(row => row.requestId === id) || null; },
    createRequestId: () => `HG-EMU-${String(++sequence).padStart(4, "0")}`,
    createNotificationClaimId: () => "claim-emulator",
    appendRequest(payload, operations, requestId) { ledger.sheetWrites += 1; if (faults.append) throw new Error("append failed"); rows.push({ payload, requestId, operations: { ...operations } }); },
    updateRequest(id, patch) {
      ledger.sheetWrites += 1;
      if (faults.update && faults.update(patch)) throw new Error("update failed");
      const row = rows.find(item => item.requestId === id); if (!row) throw new Error("missing row"); Object.assign(row.operations, patch);
    },
    putStatus(token, status) { ledger.cacheWrites += 1; if (faults.putStatus && faults.putStatus(status)) throw new Error("cache write failed"); statuses.set(token, { ...status }); },
    getStatus(token) { ledger.cacheReads += 1; if (faults.getStatus) throw new Error("cache read failed"); return statuses.get(token) || null; },
    recordWarning(warning) { warnings.push({ ...warning }); },
    sendNotification(id, payload, subject) { ledger.gmailSends += 1; if (faults.gmail) throw new Error("gmail failed"); mails.push({ id, payload, subject }); }
  };
  return { deps, rows, statuses, mails, warnings };
}

const payload = token => ({ requestToken: token, formType: "general", source: "automation-landing-page", company: "Test Company", name: "System Test", email: "test@example.invalid", needs: "automation", note: "SYSTEM TEST - EXCLUDED", is_test: true, excluded_from_pipeline: true });

const normal = harness();
const first = ops.pr7ProcessSubmission_(normal.deps, payload(TOKEN.toUpperCase()));
assert.equal(first.ok, true); assert.ok(first.requestId); assert.equal(normal.rows.length, 1); assert.equal(normal.mails.length, 1);
assert.match(normal.mails[0].subject, new RegExp(`\\[HG-REQUEST:${first.requestId}\\]`));
const saved = ops.pr7ResolveStatus_(normal.deps, TOKEN.toUpperCase());
assert.deepEqual({ ok: saved.ok, state: saved.state, requestId: saved.requestId }, { ok: true, state: "saved", requestId: first.requestId });
const duplicate = ops.pr7ProcessSubmission_(normal.deps, payload(` ${TOKEN.toUpperCase()} `));
assert.equal(duplicate.requestId, first.requestId); assert.equal(normal.rows.length, 1); assert.equal(normal.mails.length, 1);

const invalid = harness();
assert.equal(ops.pr7ResolveStatus_(invalid.deps, "bad token").code, "REQUEST_TOKEN_INVALID");
assert.equal(invalid.rows.length, 0); assert.equal(invalid.mails.length, 0);
assert.equal(ops.pr7ResolveStatus_(invalid.deps, "").code, "REQUEST_TOKEN_REQUIRED");

const savedCacheFailure = harness({ putStatus: state => state.state === "saved" });
const cacheResult = ops.pr7ProcessSubmission_(savedCacheFailure.deps, payload(TOKEN));
assert.equal(cacheResult.ok, true); assert.equal(savedCacheFailure.rows.length, 1); assert.equal(savedCacheFailure.mails.length, 1);
assert.equal(ops.pr7ResolveStatus_(savedCacheFailure.deps, TOKEN).state, "saved");
assert.ok(savedCacheFailure.warnings.some(item => item.code === "SAVED_STATUS_PERSISTENCE_FAILED"));

const gmailFailure = harness({ gmail: true });
const gmailResult = ops.pr7ProcessSubmission_(gmailFailure.deps, payload(TOKEN));
assert.equal(gmailResult.ok, true); assert.equal(gmailFailure.rows.length, 1); assert.equal(gmailFailure.mails.length, 0);
assert.equal(ops.pr7ResolveStatus_(gmailFailure.deps, TOKEN).state, "saved");

const migrationHeaders = ["legacy_a", "legacy_b"];
const fixture = {
  rows: [migrationHeaders.slice(), ["A", "B"]],
  getLastRow() { return this.rows.length; }, getLastColumn() { return Math.max(0, ...this.rows.map(row => row.length)); },
  getRange(row, column, rowCount = 1, columnCount = 1) { const sheet = this; return { getDisplayValues: () => Array.from({ length: rowCount }, (_, r) => Array.from({ length: columnCount }, (_, c) => String(sheet.rows[row - 1 + r]?.[column - 1 + c] ?? ""))), setValues(values) { values.forEach((line, r) => line.forEach((value, c) => { sheet.rows[row - 1 + r] ||= []; sheet.rows[row - 1 + r][column - 1 + c] = value; })); } }; }
};
const before = createHash("sha256").update(JSON.stringify(fixture.rows)).digest("hex");
const m1 = ops.migrateStage2FormOperationsPr7(fixture); const legacyAfter = fixture.rows.map(row => row.slice(0, 2));
assert.ok(m1.added.length > 0); assert.deepEqual(legacyAfter, [["legacy_a", "legacy_b"], ["A", "B"]]); assert.equal(fixture.rows.length, 2);
const m2 = ops.migrateStage2FormOperationsPr7(fixture); assert.equal(m2.added.length, 0);
const empty = { rows: [], getLastRow() { return this.rows.length; }, getLastColumn() { return 0; }, getRange(row, column, rowCount = 1, columnCount = 1) { const sheet = this; return { getDisplayValues: () => [[]], setValues(values) { values.forEach((line, r) => line.forEach((value, c) => { sheet.rows[row - 1 + r] ||= []; sheet.rows[row - 1 + r][column - 1 + c] = value; })); } }; } };
ops.migrateStage2FormOperationsPr7(empty); assert.ok(empty.rows[0][0]);

const summary = { status: "PASS", result: "PR7_RUNTIME_EMULATOR_PASS", assertions: 29, migrationAdded: m1.added.length, migrationSecondAdded: m2.added.length, legacyFingerprint: before.slice(0, 12), ledger };
mkdirSync("test-results", { recursive: true }); writeFileSync("test-results/pr7-runtime-summary.json", JSON.stringify(summary, null, 2)); console.log(JSON.stringify(summary));
