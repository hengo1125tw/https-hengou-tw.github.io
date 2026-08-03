import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { unzipSync, zipSync } from "fflate";
import { verifyArtifactDirectory } from "./check-pr7-artifacts.mjs";
import { normalizePr7Artifacts } from "./normalize-pr7-artifacts.mjs";
import { buildCanonicalPr7ArtifactFixture } from "./pr7-artifact-fixture-builder.mjs";

const tempRoot = mkdtempSync(join(process.cwd(), ".pr7-verifier-tmp-"));
const mask = value => String(value || "").replace(/[A-Za-z]:\\Users\\[^\s;]+|\/home\/runner\/[^\s;]+|https?:\/\/[^\s;]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "<MASKED>").slice(0, 500);
const diagnostic = (fixture, phase, expected, result, error) => ({ fixture, phase, expected, actualStatus: result?.overallStatus || null, blockers: result?.blockers || [], findingTypes: [...new Set(result?.sensitiveScan?.findings?.map(item => item.type) || [])], findingPaths: [...new Set(result?.sensitiveScan?.findings?.map(item => item.path) || [])], assertion: error?.operator || null, errorName: error?.name || null, maskedMessage: mask(error?.message) });
const annotate = detail => { const text = JSON.stringify(detail); console.error(text); if (process.env.GITHUB_ACTIONS === "true") console.error(`::error title=PR7 verifier fixture failed::fixture=${detail.fixture};phase=${detail.phase};blockers=${detail.blockers.join("|") || "none"};findingTypes=${detail.findingTypes.join("|") || "none"};findingPaths=${detail.findingPaths.join("|") || "none"}`); };
const makeFixture = name => { const dir = join(tempRoot, name); mkdirSync(dir, { recursive: true }); buildCanonicalPr7ArtifactFixture(dir); return dir; };
const verify = dir => verifyArtifactDirectory(dir, { writeReports: false, gitHeadSha: "FIXTURE" });

async function runFixture(name, execute) {
  let result;
  try { return await execute(makeFixture(name), value => { result = value; return value; }); }
  catch (error) { annotate(diagnostic(name, "execute", "fixture contract", result, error)); throw error; }
}
const expectFail = async (name, mutate, code) => runFixture(name, async (dir, capture) => { mutate(dir); const result = capture(verify(dir)); assert.equal(result.overallStatus, "FAIL"); assert.ok(result.blockers.some(item => item.startsWith(code)), result.blockers.join(",")); return result; });

try {
  console.log("PR7 deterministic artifact verifier fixtures: start");
  await runFixture("complete", async (dir, capture) => { const result = capture(verify(dir)); assert.equal(result.overallStatus, "PASS"); });
  await expectFail("missing-junit", dir => unlinkSync(join(dir, "test-results/junit.xml")), "PR7_ARTIFACT_JUNIT_MISSING");
  await expectFail("junit-failure", dir => { const path = join(dir, "test-results/junit.xml"); writeFileSync(path, readFileSync(path, "utf8").replace('failures="0"', 'failures="1"').replace("</testcase>", "<failure>fixture</failure></testcase>")); }, "PR7_ARTIFACT_JUNIT_INVALID");
  await expectFail("json-conflict", dir => { const path = join(dir, "test-results/pr7-test-summary.json"); const value = JSON.parse(readFileSync(path)); value.responsivePassed = 8; writeFileSync(path, JSON.stringify(value)); }, "PR7_ARTIFACT_REPORT_INCONSISTENT");
  await expectFail("missing-playwright-json", dir => unlinkSync(join(dir, "test-results/playwright-results.json")), "PR7_ARTIFACT_PLAYWRIGHT_JSON_MISSING");
  await expectFail("playwright-json-conflict", dir => { const path = join(dir, "test-results/playwright-results.json"); const value = JSON.parse(readFileSync(path)); value.suites = []; writeFileSync(path, JSON.stringify(value)); }, "PR7_ARTIFACT_PLAYWRIGHT_JSON_INCONSISTENT");
  await expectFail("html-json-count-conflict", dir => { const path = join(dir, "playwright-report/index.html"); const html = readFileSync(path, "utf8"); const match = html.match(/data:application\/zip;base64,([A-Za-z0-9+/=]+)/); assert.ok(match); const archive = unzipSync(Buffer.from(match[1], "base64")); const report = JSON.parse(Buffer.from(archive["report.json"]).toString("utf8")); report.files[0].tests = report.files[0].tests.slice(0, 1); archive["report.json"] = Buffer.from(JSON.stringify(report)); writeFileSync(path, html.replace(match[1], Buffer.from(zipSync(archive)).toString("base64"))); }, "PR7_ARTIFACT_PLAYWRIGHT_REPORT_INCONSISTENT");
  await expectFail("missing-report", dir => unlinkSync(join(dir, "playwright-report/index.html")), "PR7_ARTIFACT_PLAYWRIGHT_REPORT_MISSING");
  await expectFail("corrupt-screenshot", dir => writeFileSync(join(dir, "screenshots/home-390-initial.png"), "not a png"), "PR7_ARTIFACT_SCREENSHOT_INVALID");
  await expectFail("missing-viewport", dir => unlinkSync(join(dir, "screenshots/home-390-initial.png")), "PR7_ARTIFACT_SCREENSHOT_EVIDENCE_MISSING");
  await expectFail("fake-secret", dir => { mkdirSync(join(dir, "failure-logs"), { recursive: true }); writeFileSync(join(dir, "failure-logs/fake-secret.log"), "Authorization: Bearer ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"); }, "PR7_ARTIFACT_SENSITIVE_LEAK");
  await runFixture("no-trace", async (dir, capture) => { rmSync(join(dir, "traces"), { recursive: true, force: true }); mkdirSync(join(dir, "traces")); const result = capture(verify(dir)); assert.equal(result.overallStatus, "PASS"); assert.equal(result.traces.status, "NOT_GENERATED_ON_SUCCESS"); });
  await expectFail("failure-log", dir => writeFileSync(join(dir, "failure-logs/error.log"), "Unhandled exception in failed test"), "PR7_ARTIFACT_FAILURE_LOG_ERROR");
  await runFixture("deterministic", async (dir, capture) => { const first = capture(verify(dir)); const second = verify(dir); assert.equal(first.bundleSha256, second.bundleSha256); });
  await expectFail("absolute-path", dir => writeFileSync(join(dir, "failure-logs/path.txt"), "C:\\Users\\RealUser\\private.txt"), "PR7_ARTIFACT_SENSITIVE_LEAK");
  const injectHtmlMetadata = (dir, value) => { const path = join(dir, "playwright-report/index.html"); const html = readFileSync(path, "utf8"); const match = html.match(/data:application\/zip;base64,([A-Za-z0-9+/=]+)/); assert.ok(match); const archive = unzipSync(Buffer.from(match[1], "base64")); const report = JSON.parse(Buffer.from(archive["report.json"]).toString("utf8")); report.metadata = { fixturePath: value }; archive["report.json"] = Buffer.from(JSON.stringify(report)); writeFileSync(path, html.replace(match[1], Buffer.from(zipSync(archive)).toString("base64"))); };
  const linuxWorkspace = "/home/runner/work/example/example";
  await runFixture("linux-workspace-normalization", async (dir, capture) => { for (const file of ["junit.xml", "playwright-results.json", "pr7-test-summary.json"]) { const path = join(dir, "test-results", file); const content = readFileSync(path, "utf8"); writeFileSync(path, file.endsWith(".xml") ? content.replace('classname="tests/', `classname="${linuxWorkspace}/tests/`) : JSON.stringify({ ...JSON.parse(content), fixturePath: `${linuxWorkspace}/tests/pr7-browser/forms.spec.mjs` })); } injectHtmlMetadata(dir, `${linuxWorkspace}/tests/pr7-browser/forms.spec.mjs`); assert.equal(verify(dir).overallStatus, "FAIL"); const normalized = normalizePr7Artifacts(dir, { workspace: linuxWorkspace, checkoutRoot: linuxWorkspace }); assert.ok(normalized.replacements >= 4); assert.equal(capture(verify(dir)).overallStatus, "PASS"); const again = normalizePr7Artifacts(dir, { workspace: linuxWorkspace, checkoutRoot: linuxWorkspace }); assert.equal(again.replacements, 0); assert.equal(again.fingerprint, normalized.fingerprint); });
  await runFixture("runner-temp-normalization", async (dir, capture) => { const path = join(dir, "test-results/pr7-test-summary.json"); const value = JSON.parse(readFileSync(path)); value.fixturePath = "/home/runner/work/_temp/pr7/output.json"; writeFileSync(path, JSON.stringify(value)); normalizePr7Artifacts(dir, { runnerTemp: "/home/runner/work/_temp" }); assert.equal(capture(verify(dir)).overallStatus, "PASS"); });
  await expectFail("arbitrary-runner-private-path", dir => { const path = join(dir, "test-results/pr7-test-summary.json"); const value = JSON.parse(readFileSync(path)); value.fixturePath = "/home/runner/private/customer.txt"; writeFileSync(path, JSON.stringify(value)); normalizePr7Artifacts(dir, { workspace: linuxWorkspace, runnerTemp: "/home/runner/work/_temp" }); }, "PR7_ARTIFACT_SENSITIVE_LEAK");
  await runFixture("normalizer-idempotency", async (dir, capture) => { const first = normalizePr7Artifacts(dir, { workspace: linuxWorkspace }); const second = normalizePr7Artifacts(dir, { workspace: linuxWorkspace }); assert.equal(second.replacements, 0); assert.equal(second.fingerprint, first.fingerprint); assert.equal(capture(verify(dir)).overallStatus, "PASS"); });
  const fingerprintA = buildCanonicalPr7ArtifactFixture(join(tempRoot, "fingerprint-a")).fingerprint; const fingerprintB = buildCanonicalPr7ArtifactFixture(join(tempRoot, "fingerprint-b")).fingerprint; assert.equal(fingerprintA, fingerprintB);
  console.log(JSON.stringify({ result: "PR7_ARTIFACT_VERIFIER_TESTS_PASS", cases: 19, canonicalFingerprint: fingerprintA }));
} finally { rmSync(tempRoot, { recursive: true, force: true }); }
