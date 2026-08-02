import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../backend/google-apps-script/PR7FormOperations.gs", import.meta.url), "utf8");
const context = { console, Object, String, Number, Math, Date };
context.globalThis = context;
vm.runInNewContext(source, context, { filename: "PR7FormOperations.gs" });

const TOKEN = "12345678-1234-4234-8234-123456789abc";

function harness({ sheetFails = false, mailFails = false } = {}) {
  const rows = [];
  const statuses = new Map();
  const mail = [];
  let now = 0;
  let lockCalls = 0;
  const deps = {
    now: () => (now += 1000),
    withLock(timeout, callback) { assert.equal(timeout, 10000); lockCalls += 1; return callback(); },
    findByToken(token) { return rows.find(row => row.operations.request_token === token); },
    findByRequestId(id) { return rows.find(row => row.requestId === id); },
    createRequestId() { return `HG-TEST-${String(rows.length + 1).padStart(4, "0")}`; },
    appendRequest(payload, operations, requestId) {
      if (sheetFails) throw new Error("sheet unavailable");
      rows.push({ payload, operations, requestId });
    },
    updateRequest(id, patch) { Object.assign(rows.find(row => row.requestId === id).operations, patch); },
    putStatus(token, value) { statuses.set(token, { ...value }); },
    sendNotification(id) { if (mailFails) throw new Error("mail unavailable"); mail.push(id); }
  };
  return { deps, rows, statuses, mail, getLockCalls: () => lockCalls };
}

assert.equal(context.pr7ValidateRequestToken_("").code, "REQUEST_TOKEN_REQUIRED");
assert.equal(context.pr7ValidateRequestToken_("not-a-uuid").code, "REQUEST_TOKEN_INVALID");
assert.deepEqual([0, 15001, 30001, 60001].map(context.pr7ProcessingHealth_), ["normal", "slow", "observe", "abnormal"]);

const normal = harness();
const first = context.pr7ProcessSubmission_(normal.deps, { requestToken: TOKEN, source: "website-home" });
const duplicate = context.pr7ProcessSubmission_(normal.deps, { requestToken: TOKEN, source: "website-home" });
assert.equal(first.state, "saved");
assert.equal(duplicate.state, "already_saved");
assert.equal(duplicate.requestId, first.requestId);
assert.equal(normal.rows.length, 1, "duplicate token must create one Sheet row");
assert.equal(normal.mail.length, 1, "duplicate token must send one notification");
assert.equal(normal.statuses.get(TOKEN).state, "saved", "saved must never regress");

const concurrent = harness();
const concurrentResults = await Promise.all([
  Promise.resolve().then(() => context.pr7ProcessSubmission_(concurrent.deps, { requestToken: TOKEN })),
  Promise.resolve().then(() => context.pr7ProcessSubmission_(concurrent.deps, { requestToken: TOKEN }))
]);
assert.equal(concurrent.rows.length, 1, "concurrent duplicate must create one row");
assert.equal(concurrent.mail.length, 1, "concurrent duplicate must send one notification");
assert.equal(concurrentResults[0].requestId, concurrentResults[1].requestId);

const mailFailure = harness({ mailFails: true });
const savedWithoutMail = context.pr7ProcessSubmission_(mailFailure.deps, { requestToken: TOKEN, source: "gpu-service-page" });
assert.equal(savedWithoutMail.state, "saved");
assert.equal(mailFailure.rows[0].operations.notification_status, "error");
assert.equal(mailFailure.rows[0].operations.final_status, "notification_error");

const sheetFailure = harness({ sheetFails: true });
const notSaved = context.pr7ProcessSubmission_(sheetFailure.deps, { requestToken: TOKEN });
assert.equal(notSaved.state, "error");
assert.equal(sheetFailure.rows.length, 0);
assert.equal(sheetFailure.mail.length, 0);

const testLead = harness();
context.pr7ProcessSubmission_(testLead.deps, { requestToken: TOKEN, is_test: true, source: "automation-landing-page" });
assert.equal(testLead.rows[0].operations.is_test, true);
assert.equal(testLead.rows[0].operations.excluded_from_pipeline, true);
assert.equal(testLead.rows[0].operations.lead_status, "系統測試");

assert.equal(context.pr7JsonpCallbackIsValid_("HGFormStatus_1[a].b"), true);
assert.equal(context.pr7JsonpCallbackIsValid_("alert(1)"), false);
const safe = context.pr7SafeStatusResponse_({ ok: true, state: "saved", requestId: "HG-1", email: "private" });
assert.equal(safe.email, undefined);

const headerWrites = [];
const currentHeaders = ["requestId", "source"];
const migrationSheet = {
  getLastColumn: () => currentHeaders.length,
  getRange(row, col, rows, cols) {
    if (row === 1 && col === 1) return { getDisplayValues: () => [currentHeaders.slice()] };
    return { setValues: values => { headerWrites.push({ col, cols, values }); currentHeaders.push(...values[0]); } };
  }
};
const migrated = context.migrateStage2FormOperationsPr7(migrationSheet);
assert.equal(migrated.added.length, context.PR7_OPERATIONAL_HEADERS.length);
assert.equal(headerWrites[0].col, 3, "migration must append only on the right");
assert.equal(context.migrateStage2FormOperationsPr7(migrationSheet).added.length, 0, "second migration must add nothing");

const audit = context.auditStage2FormOperationsPr7([{
  request_token: TOKEN, requestId: "", final_status: "saved", notification_status: "error",
  is_test: true, excluded_from_pipeline: false, source: "", email: "", phone: "", note: ""
}], [{ requestId: "HG-NOT-IN-SHEET" }]);
assert.equal(audit.ok, false);
for (const code of ["SAVED_WITHOUT_REQUEST_ID", "NOTIFICATION_NOT_SENT", "TEST_IN_PIPELINE", "SOURCE_MISSING", "CONTACT_MISSING", "NOTE_MISSING"]) {
  assert.ok(audit.findings.some(item => item.code === code), `audit missing ${code}`);
}
assert.ok(audit.findings.some(item => item.code === "NOTIFICATION_WITHOUT_SHEET_ROW"));

console.log("PR7 form operations checks passed (18 assertions groups)");
