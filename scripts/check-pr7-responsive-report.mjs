import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const summaryPath = "test-results/pr7-test-summary.json";
assert.ok(existsSync(summaryPath), "PR7 browser summary is missing; run check:pr7-browser first");
assert.ok(existsSync("test-results/junit.xml"), "Playwright JUnit report is missing");
assert.ok(existsSync("test-results/playwright-results.json"), "Playwright JSON report is missing");
assert.ok(existsSync("playwright-report/index.html"), "Playwright HTML report is missing");

const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
assert.equal(summary.status, "PASS");
assert.equal(summary.playwrightTests, 8);
assert.equal(summary.browserFailures, 0);
assert.equal(summary.responsivePassed, 9);
assert.equal(summary.responsiveTotal, 9);
assert.equal(summary.consoleErrors, 0);
assert.equal(summary.consoleWarnings, 0);
assert.equal(summary.pageErrors, 0);
assert.equal(summary.failedRequests, 0);

console.log(JSON.stringify({ result: "PR7_RESPONSIVE_REPORT_PASS", responsive: "9/9", playwrightTests: 8 }));
