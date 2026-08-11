import { createHash, randomUUID } from "node:crypto";

export const TEST_PREFIX = "TEST_ONLY_";
export const TEST_SHEET_HEADERS = ["requestToken", "requestId", "status", "processingTimestamp", "savedTimestamp", "notificationStatus", "notificationClaim", "notificationTimestamp", "testRunId", "errorCode", "errorMessage", "createdAt"];
export const sha256 = value => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");

export function generateTestRunId({ now = new Date(), random = randomUUID() } = {}) {
  const date = new Date(now);
  if (!Number.isFinite(date.getTime())) throw Object.assign(new Error("invalid UTC date"), { code: "PR7_TEST_RUN_ID_INVALID" });
  const suffix = String(random).trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (!/^[A-Z0-9][A-Z0-9-]{7,63}$/.test(suffix)) throw Object.assign(new Error("invalid random suffix"), { code: "PR7_TEST_RUN_ID_INVALID" });
  return `PR7T-${date.toISOString().slice(0, 10).replaceAll("-", "")}-${suffix}`;
}

export function canonicalTestRunId(value) {
  const id = String(value || "").trim().toUpperCase();
  if (!/^PR7T-\d{8}-[A-Z0-9][A-Z0-9-]{7,63}$/.test(id)) throw Object.assign(new Error("invalid testRunId"), { code: "PR7_TEST_RUN_ID_INVALID" });
  return id;
}

export function createTestDescriptor(testRunId) {
  return {
    testRunId: canonicalTestRunId(testRunId), testIdentityFingerprint: "TEST_ONLY_IDENTITY_FP", cloudProjectFingerprint: "TEST_ONLY_PROJECT_FP",
    oauthClientFingerprint: "TEST_ONLY_OAUTH_FP", claspProfile: "pr7-test", spreadsheetIdReference: "TEST_ONLY_SPREADSHEET",
    scriptProjectIdReference: "TEST_ONLY_SCRIPT_PROJECT", deploymentIdReference: "TEST_ONLY_DEPLOYMENT", deploymentUrlReference: "TEST_ONLY_ENDPOINT",
    gmailRouteReference: "TEST_ONLY_GMAIL_ROUTE", propertiesNamespace: `TEST_ONLY_PROPERTIES_${testRunId}`, cacheNamespace: `TEST_ONLY_CACHE_${testRunId}`,
    testSheetName: `TEST_ONLY_REQUESTS_${testRunId}`, createdAt: "2026-08-11T00:00:00.000Z", isolationChecks: [], cleanupStatus: "pending"
  };
}

const isolationFields = [
  ["testIdentityFingerprint", "identity"], ["cloudProjectFingerprint", "project"], ["spreadsheetIdReference", "spreadsheet"],
  ["scriptProjectIdReference", "scriptProject"], ["deploymentIdReference", "deployment"], ["deploymentUrlReference", "endpoint"], ["gmailRouteReference", "gmailRoute"]
];
export function checkIsolation(descriptor, production = {}, { mode = "offline" } = {}) {
  if (!descriptor) return { ok: false, state: "FAIL", code: "PR7_TEST_RESOURCE_DESCRIPTOR_REQUIRED", checks: [] };
  const checks = [];
  for (const [field, prodField] of isolationFields) {
    const testValue = descriptor[field]; const prodValue = production[prodField];
    if (!prodValue) return { ok: false, state: "BLOCKED", code: "PR7_PRODUCTION_FINGERPRINT_REQUIRED", field, checks };
    if (!testValue || !String(testValue).startsWith(TEST_PREFIX)) return { ok: false, state: "FAIL", code: "PR7_PRODUCTION_LIKE_TEST_RESOURCE", field, checks };
    const match = sha256(String(testValue)) === prodValue || String(testValue) === prodValue;
    checks.push({ field, productionMatch: match });
    if (match) return { ok: false, state: "FAIL", code: "PR7_TEST_PRODUCTION_RESOURCE_COLLISION", field, checks };
  }
  return { ok: true, state: "PASS", mode, productionMatch: false, checks };
}

export function migrateSheet(sheet) {
  const before = structuredClone(sheet.rows); const headers = sheet.rows[0] || [];
  const added = TEST_SHEET_HEADERS.filter(header => !headers.includes(header));
  if (!sheet.rows.length) sheet.rows.push([]);
  sheet.rows[0].push(...added);
  return { added, addedCount: added.length, rowDelta: sheet.rows.length - Math.max(1, before.length), oldDataChanged: before.slice(1).some((row, i) => JSON.stringify(row) !== JSON.stringify(sheet.rows[i + 1]?.slice(0, row.length))), formulaChanged: false };
}

export function verifyExactOneRow(before, after, { requestToken, requestId, testRunId, duplicate = false }) {
  const rows = after.filter(row => row.requestToken === requestToken || row.requestId === requestId || row.testRunId === testRunId);
  const delta = after.length - before.length;
  const result = { rowDelta: delta, requestTokenCount: after.filter(r => r.requestToken === requestToken).length, requestIdCount: after.filter(r => r.requestId === requestId).length, testRunIdCount: after.filter(r => r.testRunId === testRunId).length };
  result.ok = result.requestTokenCount === 1 && result.requestIdCount === 1 && result.testRunIdCount === 1 && delta === (duplicate ? 0 : 1) && rows.length === 1;
  return result;
}

export const gmailMarker = (testRunId, requestId) => `[PR7_TEST_ONLY][RUN:${canonicalTestRunId(testRunId)}][REQUEST:${String(requestId)}]`;

export class MockGoogleAdapter {
  constructor({ faults = {} } = {}) { this.rows = []; this.messages = []; this.statuses = new Map(); this.properties = new Map(); this.triggers = []; this.deployments = []; this.faults = faults; this.networkRequests = 0; this.locked = false; this.sequence = 0; }
  createTestSpreadsheet(descriptor) { return { reference: descriptor.spreadsheetIdReference, rows: this.rows }; }
  createTestScriptProject(descriptor) { return { reference: descriptor.scriptProjectIdReference }; }
  deployTestWebApp(descriptor) { return { reference: descriptor.deploymentIdReference, url: descriptor.deploymentUrlReference }; }
  createRequestId(testRunId) { return `HG-TEST-${testRunId.slice(5, 13)}-${String(++this.sequence).padStart(4, "0")}`; }
  postTestRequest(payload) {
    if (this.faults.lockTimeout || this.locked) return { ok: false, code: "LOCK_TIMEOUT", invocationOnly: true };
    this.locked = true;
    try {
      const token = String(payload.requestToken || "").trim().toLowerCase();
      if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(token)) return { ok: false, code: "REQUEST_TOKEN_INVALID" };
      const existing = this.rows.find(row => row.requestToken === token);
      if (existing) return { ok: true, state: "saved", requestId: existing.requestId, duplicate: true };
      if (this.faults.sheetRead) return { ok: false, code: "SHEET_READ_FAILED" };
      const requestId = this.createRequestId(payload.testRunId);
      this.statuses.set(token, { ok: false, state: "processing" });
      if (this.faults.sheetWrite) return { ok: false, code: "SHEET_WRITE_FAILED" };
      const row = { ...payload, requestToken: token, requestId, status: "saved", notificationStatus: "pending" }; this.rows.push(row);
      if (!this.faults.notificationClaim) row.notificationStatus = "sending";
      if (!this.faults.crashAfterClaim && !this.faults.notificationClaim) {
        if (this.faults.gmailSend) row.notificationStatus = "error";
        else { this.sendNotification(requestId, payload, gmailMarker(payload.testRunId, requestId)); row.notificationStatus = "sent"; }
      }
      if (!this.faults.cacheWrite && !this.faults.statusPersistence) this.statuses.set(token, { ok: true, state: "saved", requestId });
      return { ok: true, state: "saved", requestId, warning: this.faults.statusPersistence ? "SAVED_STATUS_PERSISTENCE_FAILED" : undefined };
    } finally { this.locked = false; }
  }
  getStatus(token) {
    const canonical = String(token || "").trim().toLowerCase();
    if (this.faults.cacheRead) return this.reconcile(canonical);
    const status = this.statuses.get(canonical);
    if (!status || status.state === "processing" || this.faults.statusPersistence) return this.reconcile(canonical) || status || { ok: false, state: "not_found" };
    return status;
  }
  reconcile(token) { const row = this.rows.find(item => item.requestToken === token); return row?.status === "saved" ? { ok: true, state: "saved", requestId: row.requestId, reconciled: true } : null; }
  listSheetRows() { if (this.faults.sheetRead) throw Object.assign(new Error("sheet read"), { code: "SHEET_READ_FAILED" }); return structuredClone(this.rows); }
  sendNotification(requestId, payload, subject) { if (this.messages.some(m => m.requestId === requestId)) return; this.messages.push({ requestId, testRunId: payload.testRunId, subject, archived: false }); }
  searchTestGmail(marker) { return this.messages.filter(message => message.subject.includes(marker)); }
  cleanupTestRows(testRunId) { if (this.faults.cleanup) return { ok: false, code: "PR7_TEST_CLEANUP_INCOMPLETE" }; const before = this.rows.length; this.rows = this.rows.filter(row => row.testRunId !== testRunId); return { ok: true, removed: before - this.rows.length }; }
  cleanupTestMessages(testRunId) { if (this.faults.cleanup) return { ok: false, code: "PR7_TEST_CLEANUP_INCOMPLETE" }; const before = this.messages.length; this.messages = this.messages.filter(m => m.testRunId !== testRunId); return { ok: true, removed: before - this.messages.length }; }
  cleanupTestTriggers(testRunId) { const before = this.triggers.length; this.triggers = this.triggers.filter(t => t.testRunId !== testRunId); return { ok: true, removed: before - this.triggers.length }; }
  deleteOrRetainDeployment(reference, action = "retain") { return { ok: true, reference, action }; }
}

export class LiveGoogleAdapter {
  constructor() { throw Object.assign(new Error("live credentials required"), { code: "PR7_LIVE_MODE_BLOCKED_CREDENTIALS" }); }
}

export function cleanupRun(adapter, descriptor) {
  const rows = adapter.cleanupTestRows(descriptor.testRunId); const messages = adapter.cleanupTestMessages(descriptor.testRunId); const triggers = adapter.cleanupTestTriggers(descriptor.testRunId);
  for (const key of [...adapter.statuses.keys()]) if (key.includes(descriptor.testRunId)) adapter.statuses.delete(key);
  for (const key of [...adapter.properties.keys()]) if (key.includes(descriptor.testRunId)) adapter.properties.delete(key);
  const ok = rows.ok && messages.ok && triggers.ok;
  return { ok, code: ok ? undefined : "PR7_TEST_CLEANUP_INCOMPLETE", rows, messages, triggers, productionSelected: false };
}

export const productionFingerprints = Object.fromEntries(["identity", "project", "spreadsheet", "scriptProject", "deployment", "endpoint", "gmailRoute"].map(k => [k, sha256(`PRODUCTION_REFERENCE_${k}`)]));
