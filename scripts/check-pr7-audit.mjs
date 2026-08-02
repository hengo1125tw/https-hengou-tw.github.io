import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(new URL("../backend/google-apps-script/PR7FormOperations.gs", import.meta.url), "utf8"); const ops = { Object, String, Number, Math, Date, JSON, isFinite }; ops.globalThis = ops; vm.runInNewContext(source, ops);
const now = Date.parse("2026-08-02T00:02:00Z");
const fixtures = [
  { request_token: "t1", requestId: "HG-1", final_status: "processing", processing_started_at: now - 61000, source: "x", email: "a@b.invalid", note: "x" },
  { request_token: "t2", requestId: "HG-2", final_status: "saved", notification_status: "sending", notification_claimed_at: "", source: "x", email: "a@b.invalid", note: "x" },
  { request_token: "t3", requestId: "", final_status: "saved", source: "", email: "", note: "" },
  { request_token: "t4", requestId: "HG-4", final_status: "saved", is_test: "TRUE", excluded_from_pipeline: "false", source: "x", email: "a@b.invalid", note: "x" },
  { request_token: "t5", requestId: "HG-5", final_status: "saved", notification_status: "metadata_pending", source: "x", email: "a@b.invalid", note: "x" }
];
const audit = ops.auditStage2FormOperationsPr7(fixtures, [], now); assert.ok(audit.findings.length >= 5); assert.ok(audit.findings.some(item => item.code === "PROCESSING_OVER_60S")); assert.ok(audit.findings.some(item => item.code === "INVALID_NOTIFICATION_CLAIM_TIMESTAMP")); assert.ok(audit.findings.some(item => item.code === "TEST_IN_PIPELINE")); console.log(JSON.stringify({ result: "PR7_AUDIT_PASS", fixtureCount: fixtures.length, findingCount: audit.findings.length }));
