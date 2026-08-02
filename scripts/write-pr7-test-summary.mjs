import { readFileSync, writeFileSync } from "node:fs";

const report = JSON.parse(readFileSync("test-results/playwright-results.json", "utf8"));
const summary = JSON.parse(readFileSync("test-results/pr7-test-summary.json", "utf8"));
const specs = [];
const collect = suites => {
  for (const suite of suites || []) {
    specs.push(...(suite.specs || []));
    collect(suite.suites);
  }
};
collect(report.suites);
const tests = specs.flatMap(spec => spec.tests || []);
const failed = tests.filter(test => !["expected", "flaky"].includes(test.status)).length;
const skipped = tests.filter(test => test.status === "skipped").length;
const projects = new Set(tests.flatMap(test => (test.results || []).map(result => result.projectName).filter(Boolean)));

writeFileSync("test-results/pr7-test-summary.json", JSON.stringify({
  ...summary,
  status: failed === 0 ? "PASS" : "FAIL",
  playwrightTests: tests.length,
  browserFailures: failed,
  skipped,
  browser: projects.size === 1 ? [...projects][0] : summary.browser
}, null, 2));

console.log(JSON.stringify({ result: "PR7_TEST_SUMMARY_WRITTEN", tests: tests.length, failed, skipped }));
