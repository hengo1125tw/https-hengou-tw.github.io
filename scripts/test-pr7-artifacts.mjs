import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { unzipSync, zipSync } from "fflate";
import { verifyArtifactDirectory } from "./check-pr7-artifacts.mjs";
import { normalizePr7Artifacts } from "./normalize-pr7-artifacts.mjs";

const sourceRoot = process.cwd();
const tempRoot = mkdtempSync(join(sourceRoot, ".pr7-verifier-tmp-"));
console.log("PR7 artifact verifier fixtures: start");
const artifactDirs = ["test-results", "playwright-report", "screenshots", "traces", "failure-logs"];
const copyTree = (from, to) => { if (statSync(from).isDirectory()) { mkdirSync(to, { recursive: true }); for (const name of readdirSync(from)) copyTree(join(from, name), join(to, name)); } else writeFileSync(to, readFileSync(from)); };
const makeFixture = name => { const dir = join(tempRoot, name); mkdirSync(dir, { recursive: true }); for (const source of artifactDirs) { const from = join(sourceRoot, source); if (existsSync(from)) copyTree(from, join(dir, source)); else mkdirSync(join(dir, source), { recursive: true }); } for (const generated of ["pr7-artifact-verification.json", "pr7-artifact-verification.txt", "pr7-artifact-file-list.json", "pr7-artifact-sha256.txt"]) { const file = join(dir, "test-results", generated); if (existsSync(file)) unlinkSync(file); } return dir; };
const verify = dir => verifyArtifactDirectory(dir, { writeReports: false, gitHeadSha: "FIXTURE" });
const diagnostic = (fixture, result) => ({ fixture, status: result.overallStatus, blockers: result.blockers, findingTypes: [...new Set(result.sensitiveScan.findings.map(item => item.type))], findingPaths: [...new Set(result.sensitiveScan.findings.map(item => item.path))], junitPaths: result.junit.paths, jsonSummaryPaths: result.jsonSummaries.paths, playwrightReportPath: result.playwright.path, screenshotCount: result.screenshots.count });
const expectFail = (name, mutate, code) => { const dir = makeFixture(name); mutate(dir); const result = verify(dir); console.log(JSON.stringify(diagnostic(name, result))); assert.equal(result.overallStatus, "FAIL", name); assert.ok(result.blockers.some(item => item.startsWith(code)), `${name}: ${result.blockers.join(",")}`); return result; };

const complete = makeFixture("complete"); console.log("fixture: complete"); assert.equal(verify(complete).overallStatus, "PASS");
expectFail("missing-junit", dir => unlinkSync(join(dir, "test-results/junit.xml")), "PR7_ARTIFACT_JUNIT_MISSING");
expectFail("junit-failure", dir => { const path = join(dir, "test-results/junit.xml"); writeFileSync(path, readFileSync(path, "utf8").replace('failures="0"', 'failures="1"').replace("</testcase>", "<failure>fixture</failure></testcase>")); }, "PR7_ARTIFACT_JUNIT_INVALID");
expectFail("json-conflict", dir => { const path = join(dir, "test-results/pr7-test-summary.json"); const value = JSON.parse(readFileSync(path)); value.responsivePassed = 8; writeFileSync(path, JSON.stringify(value)); }, "PR7_ARTIFACT_REPORT_INCONSISTENT");
expectFail("missing-playwright-json", dir => unlinkSync(join(dir, "test-results/playwright-results.json")), "PR7_ARTIFACT_PLAYWRIGHT_JSON_MISSING");
expectFail("playwright-json-conflict", dir => { const path = join(dir, "test-results/playwright-results.json"); const value = JSON.parse(readFileSync(path)); value.suites = []; writeFileSync(path, JSON.stringify(value)); }, "PR7_ARTIFACT_PLAYWRIGHT_JSON_INCONSISTENT");
expectFail("html-json-count-conflict", dir => { const path = join(dir, "playwright-report/index.html"); const html = readFileSync(path, "utf8"); const match = html.match(/data:application\/zip;base64,([A-Za-z0-9+/=]+)/); assert.ok(match); const zip = unzipSync(Buffer.from(match[1], "base64")); const report = JSON.parse(Buffer.from(zip["report.json"]).toString("utf8")); report.files[0].tests = report.files[0].tests.slice(0, 1); zip["report.json"] = Buffer.from(JSON.stringify(report)); writeFileSync(path, html.replace(match[1], Buffer.from(zipSync(zip)).toString("base64"))); }, "PR7_ARTIFACT_PLAYWRIGHT_REPORT_INCONSISTENT");
expectFail("missing-report", dir => unlinkSync(join(dir, "playwright-report/index.html")), "PR7_ARTIFACT_PLAYWRIGHT_REPORT_MISSING");
expectFail("corrupt-screenshot", dir => { const file = join(dir, "screenshots", "home-390-initial.png"); writeFileSync(file, "not a png"); }, "PR7_ARTIFACT_SCREENSHOT_INVALID");
expectFail("missing-viewport", dir => unlinkSync(join(dir, "screenshots", "home-390-initial.png")), "PR7_ARTIFACT_SCREENSHOT_EVIDENCE_MISSING");
const secret = expectFail("fake-secret", dir => { mkdirSync(join(dir, "failure-logs"), { recursive: true }); writeFileSync(join(dir, "failure-logs/fake-secret.log"), "Authorization: Bearer ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"); }, "PR7_ARTIFACT_SENSITIVE_LEAK"); assert.ok(secret.sensitiveScan.findings.every(item => !item.masked.includes("AAAAAAAAAAAAAAAAAAAA")));
const noTrace = makeFixture("no-trace"); rmSync(join(noTrace, "traces"), { recursive: true, force: true }); mkdirSync(join(noTrace, "traces")); const noTraceResult = verify(noTrace); assert.equal(noTraceResult.overallStatus, "PASS"); assert.equal(noTraceResult.traces.status, "NOT_GENERATED_ON_SUCCESS");
expectFail("failure-log", dir => { mkdirSync(join(dir, "failure-logs"), { recursive: true }); writeFileSync(join(dir, "failure-logs/error.log"), "Unhandled exception in failed test"); }, "PR7_ARTIFACT_FAILURE_LOG_ERROR");
const deterministic = makeFixture("deterministic"); assert.equal(verify(deterministic).bundleSha256, verify(deterministic).bundleSha256);
expectFail("absolute-path", dir => { mkdirSync(join(dir, "failure-logs"), { recursive: true }); writeFileSync(join(dir, "failure-logs/path.txt"), "C:\\Users\\RealUser\\private.txt"); }, "PR7_ARTIFACT_SENSITIVE_LEAK");

const injectHtmlMetadata = (dir, value) => { const path = join(dir, "playwright-report/index.html"); const html = readFileSync(path, "utf8"); const match = html.match(/data:application\/zip;base64,([A-Za-z0-9+/=]+)/); assert.ok(match); const archive = unzipSync(Buffer.from(match[1], "base64")); const report = JSON.parse(Buffer.from(archive["report.json"]).toString("utf8")); report.metadata = { ...(report.metadata || {}), fixturePath: value }; archive["report.json"] = Buffer.from(JSON.stringify(report)); writeFileSync(path, html.replace(match[1], Buffer.from(zipSync(archive)).toString("base64"))); };
const linuxWorkspace = "/home/runner/work/example/example";
const linuxFixture = makeFixture("linux-workspace-normalization");
for (const file of ["junit.xml", "playwright-results.json", "pr7-test-summary.json"]) { const path = join(linuxFixture, "test-results", file); const content = readFileSync(path, "utf8"); writeFileSync(path, file.endsWith(".xml") ? content.replace("classname=\"", `classname=\"${linuxWorkspace}/`) : JSON.stringify({ ...JSON.parse(content), fixturePath: `${linuxWorkspace}/tests/pr7-browser/forms.spec.mjs` })); }
injectHtmlMetadata(linuxFixture, `${linuxWorkspace}/tests/pr7-browser/forms.spec.mjs`);
assert.equal(verify(linuxFixture).overallStatus, "FAIL");
const linuxNormalized = normalizePr7Artifacts(linuxFixture, { workspace: linuxWorkspace, checkoutRoot: linuxWorkspace });
assert.ok(linuxNormalized.replacements >= 4); assert.equal(verify(linuxFixture).overallStatus, "PASS");
for (const file of ["junit.xml", "playwright-results.json", "pr7-test-summary.json"]) assert.ok(readFileSync(join(linuxFixture, "test-results", file), "utf8").includes("<WORKSPACE>"));
const normalizedAgain = normalizePr7Artifacts(linuxFixture, { workspace: linuxWorkspace, checkoutRoot: linuxWorkspace }); assert.equal(normalizedAgain.replacements, 0); assert.equal(normalizedAgain.fingerprint, linuxNormalized.fingerprint);

const runnerTempFixture = makeFixture("runner-temp-normalization"); const runnerTempPath = join(runnerTempFixture, "test-results/pr7-test-summary.json"); const runnerTempJson = JSON.parse(readFileSync(runnerTempPath)); runnerTempJson.fixturePath = "/home/runner/work/_temp/pr7/output.json"; writeFileSync(runnerTempPath, JSON.stringify(runnerTempJson)); normalizePr7Artifacts(runnerTempFixture, { runnerTemp: "/home/runner/work/_temp" }); assert.equal(verify(runnerTempFixture).overallStatus, "PASS"); assert.ok(readFileSync(runnerTempPath, "utf8").includes("<RUNNER_TEMP>"));
expectFail("arbitrary-runner-private-path", dir => { const path = join(dir, "test-results/pr7-test-summary.json"); const value = JSON.parse(readFileSync(path)); value.fixturePath = "/home/runner/private/customer.txt"; writeFileSync(path, JSON.stringify(value)); normalizePr7Artifacts(dir, { workspace: linuxWorkspace, runnerTemp: "/home/runner/work/_temp" }); }, "PR7_ARTIFACT_SENSITIVE_LEAK");

rmSync(tempRoot, { recursive: true, force: true });
console.log(JSON.stringify({ result: "PR7_ARTIFACT_VERIFIER_TESTS_PASS", cases: 19 }));
