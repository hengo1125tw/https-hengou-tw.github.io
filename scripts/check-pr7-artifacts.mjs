import { XMLParser } from "fast-xml-parser";
import { unzipSync } from "fflate";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { inflateSync } from "node:zlib";
import { pathToFileURL } from "node:url";

const VERSION = "1.0.0";
const GENERATED = new Set(["test-results/pr7-artifact-verification.json", "test-results/pr7-artifact-verification.txt", "test-results/pr7-artifact-file-list.json", "test-results/pr7-artifact-sha256.txt"]);
const textExtensions = new Set([".xml", ".json", ".html", ".js", ".css", ".txt", ".log", ".md", ".yml", ".yaml"]);
const allowEmails = new Set(["test@example.invalid", "a@b.invalid"]);
const normalizePath = value => value.split(sep).join("/");
const sha256 = value => createHash("sha256").update(value).digest("hex");
const array = value => value == null ? [] : Array.isArray(value) ? value : [value];

function walk(root, dir = root) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = join(dir, entry.name);
    return entry.isDirectory() ? walk(root, absolute) : [{ absolute, path: normalizePath(relative(root, absolute)), size: statSync(absolute).size }];
  });
}
const artifactFiles = root => ["test-results", "playwright-report", "screenshots", "traces", "failure-logs"].flatMap(dir => walk(root, join(root, dir))).map(file => ({ ...file, path: normalizePath(relative(root, file.absolute)) }));

function parseJUnit(root, blockers) {
  const files = artifactFiles(root).filter(file => /(?:^|\/)junit[^/]*\.xml$/i.test(file.path));
  if (!files.some(file => file.path === "test-results/junit.xml")) blockers.push("PR7_ARTIFACT_JUNIT_MISSING");
  const totals = { paths: files.map(file => file.path), suites: 0, tests: 0, failures: 0, errors: 0, skipped: 0, duration: 0 };
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", preserveOrder: false });
  for (const file of files) {
    const raw = readFileSync(file.absolute, "utf8");
    if (/([A-Za-z]:\\Users\\|\/home\/runner\/)/i.test(raw)) blockers.push("PR7_ARTIFACT_JUNIT_ABSOLUTE_PATH");
    let parsed; try { parsed = parser.parse(raw); } catch { blockers.push("PR7_ARTIFACT_JUNIT_INVALID"); continue; }
    const suites = parsed.testsuites ? array(parsed.testsuites.testsuite) : parsed.testsuite ? array(parsed.testsuite) : [];
    totals.suites += suites.length;
    for (const suite of suites) {
      const cases = array(suite.testcase); totals.tests += cases.length;
      totals.failures += cases.filter(item => item.failure != null).length;
      totals.errors += cases.filter(item => item.error != null).length;
      totals.skipped += cases.filter(item => item.skipped != null).length;
      totals.duration += cases.reduce((sum, item) => sum + Number(item["@_time"] || 0), 0);
      if (cases.some(item => !String(item["@_name"] || "").trim())) blockers.push("PR7_ARTIFACT_JUNIT_TEST_NAME_MISSING");
    }
  }
  if (totals.suites < 1 || totals.tests < 1 || totals.failures || totals.errors) blockers.push("PR7_ARTIFACT_JUNIT_INVALID");
  return totals;
}

function parseJsonSummaries(root, blockers) {
  const candidates = artifactFiles(root).filter(file => file.path.startsWith("test-results/") && /(?:summary|verification).*\.json$/i.test(file.path) && !GENERATED.has(file.path));
  const parsed = {};
  for (const file of candidates) { try { parsed[file.path] = JSON.parse(readFileSync(file.absolute, "utf8")); } catch { blockers.push("PR7_ARTIFACT_JSON_INVALID:" + file.path); } }
  const test = parsed["test-results/pr7-test-summary.json"];
  const migration = parsed["test-results/pr7-migration-summary.json"];
  const audit = parsed["test-results/pr7-audit-summary.json"];
  const runtime = parsed["test-results/pr7-runtime-summary.json"];
  if (!test || !migration || !audit || !runtime) blockers.push("PR7_ARTIFACT_JSON_SUMMARY_MISSING");
  if (test && !(test.playwrightTests === 8 && test.browserFailures === 0 && test.responsivePassed === 9 && test.responsiveTotal === 9 && test.consoleErrors === 0 && test.consoleWarnings === 0 && test.pageErrors === 0 && test.failedRequests === 0)) blockers.push("PR7_ARTIFACT_REPORT_INCONSISTENT");
  if (migration) {
    if (!Array.isArray(migration.fixtures) || migration.fixtures.length !== 8 || migration.fixtures.some(item => item.secondRunAddedCount !== 0 || item.oldDataChangedCount !== 0 || item.formulaChangedCount !== 0 || item.rowDelta !== 0)) blockers.push("PR7_ARTIFACT_REPORT_INCONSISTENT");
  }
  if (audit && !(audit.fixtureCount === 5 && audit.status === "PASS")) blockers.push("PR7_ARTIFACT_REPORT_INCONSISTENT");
  if (runtime && runtime.status !== "PASS") blockers.push("PR7_ARTIFACT_REPORT_INCONSISTENT");
  return { paths: Object.keys(parsed), reports: parsed, valid: !blockers.some(item => item.startsWith("PR7_ARTIFACT_JSON") || item === "PR7_ARTIFACT_REPORT_INCONSISTENT") };
}

function parsePlaywright(root, blockers) {
  const path = join(root, "playwright-report", "index.html");
  if (!existsSync(path) || statSync(path).size === 0) { blockers.push("PR7_ARTIFACT_PLAYWRIGHT_REPORT_MISSING"); return { path: "playwright-report/index.html", tests: 0, failures: 0, skipped: 0, browser: "" }; }
  const html = readFileSync(path, "utf8"); const match = html.match(/data:application\/zip;base64,([A-Za-z0-9+/=]+)/);
  if (!match) { blockers.push("PR7_ARTIFACT_PLAYWRIGHT_REPORT_INVALID"); return { path: "playwright-report/index.html", tests: 0, failures: 0, skipped: 0, browser: "" }; }
  let report;
  try { const zip = unzipSync(Buffer.from(match[1], "base64")); report = JSON.parse(Buffer.from(zip["report.json"]).toString("utf8")); }
  catch { blockers.push("PR7_ARTIFACT_PLAYWRIGHT_REPORT_INVALID"); return { path: "playwright-report/index.html", tests: 0, failures: 0, skipped: 0, browser: "" }; }
  const tests = array(report.files).flatMap(file => array(file.tests)); const titles = tests.map(item => item.title); const failures = tests.filter(item => !item.ok || item.outcome === "unexpected").length; const skipped = tests.filter(item => item.outcome === "skipped").length; const browser = tests.every(item => item.projectName === "chromium") ? "chromium" : "unknown";
  if (tests.length !== 8 || failures || skipped || browser !== "chromium" || !["home real Chromium saved flow", "gpu real Chromium saved flow", "automation real Chromium saved flow"].every(title => titles.includes(title))) blockers.push("PR7_ARTIFACT_PLAYWRIGHT_REPORT_INCONSISTENT");
  if (/AKfycb[A-Za-z0-9_-]+/.test(html)) blockers.push("PR7_ARTIFACT_PRODUCTION_ENDPOINT_FOUND");
  return { path: "playwright-report/index.html", tests: tests.length, failures, skipped, browser, titles };
}

function parsePlaywrightJson(root, blockers) {
  const path = join(root, "test-results/playwright-results.json");
  if (!existsSync(path) || statSync(path).size === 0) {
    blockers.push("PR7_ARTIFACT_PLAYWRIGHT_JSON_MISSING");
    return { path: "test-results/playwright-results.json", tests: 0, failures: 0, skipped: 0 };
  }
  let report;
  try { report = JSON.parse(readFileSync(path, "utf8")); }
  catch { blockers.push("PR7_ARTIFACT_PLAYWRIGHT_JSON_INVALID"); return { path: "test-results/playwright-results.json", tests: 0, failures: 0, skipped: 0 }; }
  const specs = [];
  const collect = suites => { for (const suite of array(suites)) { specs.push(...array(suite.specs)); collect(suite.suites); } };
  collect(report.suites);
  const tests = specs.flatMap(spec => array(spec.tests));
  const failures = tests.filter(test => !["expected", "flaky"].includes(test.status)).length;
  const skipped = tests.filter(test => test.status === "skipped").length;
  if (tests.length !== 8 || failures || skipped) blockers.push("PR7_ARTIFACT_PLAYWRIGHT_JSON_INCONSISTENT");
  return { path: "test-results/playwright-results.json", tests: tests.length, failures, skipped };
}

function decodePng(buffer) {
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error("PNG_SIGNATURE_INVALID");
  let offset = 8, width = 0, height = 0; const idat = []; let ended = false;
  while (offset + 12 <= buffer.length) { const length = buffer.readUInt32BE(offset); const type = buffer.toString("ascii", offset + 4, offset + 8); const start = offset + 8, end = start + length; if (end + 4 > buffer.length) throw new Error("PNG_CHUNK_INVALID"); if (type === "IHDR") { width = buffer.readUInt32BE(start); height = buffer.readUInt32BE(start + 4); } if (type === "IDAT") idat.push(buffer.subarray(start, end)); if (type === "IEND") { ended = true; break; } offset = end + 4; }
  if (!width || !height || !ended || !idat.length || inflateSync(Buffer.concat(idat)).length === 0) throw new Error("PNG_DECODE_INVALID"); return { width, height };
}

function inspectScreenshots(root, blockers) {
  const files = artifactFiles(root).filter(file => file.path.startsWith("screenshots/") && [".png", ".jpg", ".jpeg", ".webp"].includes(extname(file.path).toLowerCase())); const decoded = [];
  for (const file of files) { try { if (extname(file.path).toLowerCase() !== ".png") throw new Error("UNSUPPORTED_IMAGE"); decoded.push({ path: file.path, ...decodePng(readFileSync(file.absolute)) }); } catch { blockers.push("PR7_ARTIFACT_SCREENSHOT_INVALID:" + file.path); } }
  const pages = ["home", "gpu", "automation"], widths = [390, 768, 1440];
  const viewportEvidence = pages.every(page => widths.every(width => decoded.some(item => item.path.includes(`${page}-${width}-initial`) && item.width === width)));
  const stateEvidence = pages.every(page => ["processing", "success", "timeout"].every(state => decoded.some(item => item.path.includes(`${page}-${state}`))));
  if (files.length < 18 || !viewportEvidence || !stateEvidence) blockers.push("PR7_ARTIFACT_SCREENSHOT_EVIDENCE_MISSING");
  return { count: files.length, decodedCount: decoded.length, viewportEvidence, stateEvidence, images: decoded };
}

function inspectOptional(root, blockers) {
  const traces = walk(join(root, "traces")).filter(file => file.path.endsWith(".zip"));
  for (const trace of traces) try { unzipSync(readFileSync(trace.absolute)); } catch { blockers.push("PR7_ARTIFACT_TRACE_INVALID"); }
  const logs = walk(join(root, "failure-logs")); let exceptionCount = 0;
  for (const log of logs) if (/unhandled exception|failed test/i.test(readFileSync(log.absolute, "utf8"))) exceptionCount += 1;
  if (exceptionCount) blockers.push("PR7_ARTIFACT_FAILURE_LOG_ERROR");
  return { traces: { count: traces.length, size: traces.reduce((sum, file) => sum + file.size, 0), status: traces.length ? "PRESENT" : "NOT_GENERATED_ON_SUCCESS" }, failureLogs: { count: logs.length, status: logs.length ? "PRESENT" : "EMPTY_ON_SUCCESS", exceptionCount } };
}

function sensitiveScan(root) {
  const findings = []; const patterns = [
    ["OAUTH_TOKEN", /ya29\.[A-Za-z0-9_-]+/g], ["GITHUB_TOKEN", /gh[pousr]_[A-Za-z0-9]{20,}/g], ["PRIVATE_KEY", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g], ["BEARER", /Bearer\s+[A-Za-z0-9._-]{20,}/gi], ["AUTHORIZATION", /Authorization\s*[:=]\s*[^\s<]+/gi], ["APPS_SCRIPT_ENDPOINT", /https:\/\/script\.google\.com\/macros\/s\/AKfycb[A-Za-z0-9_-]+\/exec/g], ["LOCAL_WINDOWS_PATH", /[A-Za-z]:\\Users\\[^\s"'<]+/g], ["RUNNER_HOME_PATH", /\/home\/runner\/[^\s"'<]+/g], ["GMAIL_ADDRESS", /[A-Z0-9._%+-]+@gmail\.com/gi], ["SECRET_ASSIGNMENT", /(?:client[_-]?secret|api[_-]?key|spreadsheet[_-]?id|script[_-]?id|deployment[_-]?id|line[_-]?token)\s*[:=]\s*["'][^"']+["']/gi]
  ];
  const scanText = (path, text) => { for (const [type, pattern] of patterns) for (const match of text.matchAll(pattern)) findings.push({ type, path, position: match.index, masked: `${match[0].slice(0, 4)}…${match[0].slice(-3)}` }); for (const email of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) if (!allowEmails.has(email[0].toLowerCase()) && !email[0].toLowerCase().endsWith("@example.invalid")) findings.push({ type: "NON_FIXTURE_EMAIL", path, position: email.index, masked: `${email[0].slice(0, 2)}…@…` }); };
  for (const file of artifactFiles(root)) {
    if (textExtensions.has(extname(file.path).toLowerCase())) scanText(file.path, readFileSync(file.absolute, "utf8"));
    if (file.path.endsWith(".zip")) try { for (const [name, bytes] of Object.entries(unzipSync(readFileSync(file.absolute)))) if (textExtensions.has(extname(name).toLowerCase())) scanText(`${file.path}!${name}`, Buffer.from(bytes).toString("utf8")); } catch { /* trace integrity is reported separately */ }
    scanText(`filename:${file.path}`, file.path);
  }
  return { leakCount: findings.length, findings };
}

function makeManifest(root) {
  const files = artifactFiles(root).filter(file => !GENERATED.has(file.path)).sort((a, b) => a.path.localeCompare(b.path)).map(file => ({ path: file.path, size: file.size, sha256: sha256(readFileSync(file.absolute)) }));
  const lines = files.map(file => `${file.path}\t${file.size}\t${file.sha256}`); return { files, size: files.reduce((sum, file) => sum + file.size, 0), bundleSha256: sha256(lines.join("\n")) };
}

export function verifyArtifactDirectory(inputRoot, options = {}) {
  const root = resolve(inputRoot); const blockers = [], warnings = [];
  const junit = parseJUnit(root, blockers); const jsonSummaries = parseJsonSummaries(root, blockers); const playwright = parsePlaywright(root, blockers); const playwrightJson = parsePlaywrightJson(root, blockers); const screenshots = inspectScreenshots(root, blockers); const optional = inspectOptional(root, blockers); const sensitiveScanResult = sensitiveScan(root); if (sensitiveScanResult.leakCount) blockers.push("PR7_ARTIFACT_SENSITIVE_LEAK");
  const summaryTests = jsonSummaries.reports["test-results/pr7-test-summary.json"]?.playwrightTests;
  if (junit.tests !== playwright.tests || junit.tests !== playwrightJson.tests || junit.tests !== summaryTests) blockers.push("PR7_ARTIFACT_REPORT_INCONSISTENT");
  const manifest = makeManifest(root); const verification = { schemaVersion: "1.0", generatedAt: new Date().toISOString(), gitHeadSha: options.gitHeadSha || process.env.PR7_HEAD_SHA || "LOCAL", workflowName: "PR Validation", verifierVersion: VERSION, overallStatus: blockers.length ? "FAIL" : "PASS", junit, jsonSummaries: { paths: jsonSummaries.paths, valid: jsonSummaries.valid }, playwright, playwrightJson, screenshots, traces: optional.traces, failureLogs: optional.failureLogs, migration: jsonSummaries.reports["test-results/pr7-migration-summary.json"] || null, responsive: jsonSummaries.reports["test-results/pr7-test-summary.json"] || null, audit: jsonSummaries.reports["test-results/pr7-audit-summary.json"] || null, console: jsonSummaries.reports["test-results/pr7-test-summary.json"] || null, sensitiveScan: sensitiveScanResult, fileCount: manifest.files.length, extractedSize: manifest.size, bundleSha256: manifest.bundleSha256, blockers, warnings };
  if (options.writeReports !== false) {
    mkdirSync(join(root, "test-results"), { recursive: true }); writeFileSync(join(root, "test-results/pr7-artifact-file-list.json"), JSON.stringify({ files: manifest.files }, null, 2)); writeFileSync(join(root, "test-results/pr7-artifact-sha256.txt"), manifest.files.map(file => `${file.sha256}  ${file.path}`).join("\n") + `\nBUNDLE  ${manifest.bundleSha256}\n`); writeFileSync(join(root, "test-results/pr7-artifact-verification.json"), JSON.stringify(verification, null, 2)); writeFileSync(join(root, "test-results/pr7-artifact-verification.txt"), `Artifact Gate: ${verification.overallStatus}\nFiles: ${verification.fileCount}\nSize: ${verification.extractedSize}\nBundle SHA-256: ${verification.bundleSha256}\nSensitive leaks: ${verification.sensitiveScan.leakCount}\nBlockers: ${verification.blockers.join(", ") || "none"}\n`);
    const finalSensitiveScan = sensitiveScan(root);
    verification.sensitiveScan = finalSensitiveScan;
    if (finalSensitiveScan.leakCount && !verification.blockers.includes("PR7_ARTIFACT_SENSITIVE_LEAK")) verification.blockers.push("PR7_ARTIFACT_SENSITIVE_LEAK");
    verification.overallStatus = verification.blockers.length ? "FAIL" : "PASS";
    writeFileSync(join(root, "test-results/pr7-artifact-verification.json"), JSON.stringify(verification, null, 2));
  }
  return verification;
}

function writeStepSummary(result) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## PR7 Artifact Gate\n\n- Head SHA: \`${result.gitHeadSha}\`\n- JUnit: ${result.junit.tests} tests, ${result.junit.failures} failures, ${result.junit.errors} errors\n- Playwright: ${result.playwright.tests} tests, ${result.playwright.failures} failures\n- Responsive: ${result.responsive?.responsivePassed || 0}/${result.responsive?.responsiveTotal || 0}\n- Migration fixtures: ${result.migration?.fixtures?.length || 0}\n- Audit fixtures: ${result.audit?.fixtureCount || 0}\n- Screenshots: ${result.screenshots.count}\n- Traces: ${result.traces.status}\n- Failure logs: ${result.failureLogs.status}\n- Files: ${result.fileCount}\n- Size: ${result.extractedSize}\n- Bundle SHA-256: \`${result.bundleSha256}\`\n- Sensitive leaks: ${result.sensitiveScan.leakCount}\n- Artifact Gate: **${result.overallStatus}**\n`);
}

function safeDiagnosticMessage(error) {
  return String(error?.message || error || "UNKNOWN_VERIFIER_ERROR")
    .replace(/[A-Za-z]:\\Users\\[^\\\s]+/gi, "<LOCAL_USER>")
    .replace(/\/home\/runner\/[^\s"']+/gi, "<RUNNER_PATH>")
    .replace(/https?:\/\/[^\s"']+/gi, "<URL>")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "<EMAIL>");
}

function writeEmergencyVerification(root, error) {
  const verification = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    gitHeadSha: process.env.PR7_HEAD_SHA || "LOCAL",
    workflowName: "PR Validation",
    verifierVersion: VERSION,
    overallStatus: "FAIL",
    lifecycle: { phase: "verification", errorName: error?.name || "Error", message: safeDiagnosticMessage(error) },
    sensitiveScan: { leakCount: 0, findings: [] },
    fileCount: 0,
    extractedSize: 0,
    bundleSha256: "",
    blockers: ["PR7_ARTIFACT_VERIFIER_EXCEPTION"],
    warnings: []
  };
  mkdirSync(join(root, "test-results"), { recursive: true });
  writeFileSync(join(root, "test-results/pr7-artifact-verification.json"), JSON.stringify(verification, null, 2));
  writeFileSync(join(root, "test-results/pr7-artifact-verification.txt"), `Artifact Gate: FAIL\nBlockers: PR7_ARTIFACT_VERIFIER_EXCEPTION\nLifecycle phase: verification\nError: ${verification.lifecycle.message}\n`);
  return verification;
}

export function runArtifactVerifierCli(inputRoot = process.cwd()) {
  const root = resolve(inputRoot);
  let result;
  try {
    result = verifyArtifactDirectory(root);
  } catch (error) {
    try {
      result = writeEmergencyVerification(root, error);
    } catch (reportError) {
      console.error(JSON.stringify({ result: "FAIL", blocker: "PR7_ARTIFACT_REPORT_WRITE_FAILED", verifierError: safeDiagnosticMessage(error), reportError: safeDiagnosticMessage(reportError) }));
      return 1;
    }
  }
  try { writeStepSummary(result); } catch (error) { console.error(JSON.stringify({ warning: "PR7_ARTIFACT_STEP_SUMMARY_WRITE_FAILED", message: safeDiagnosticMessage(error) })); }
  console.log(JSON.stringify({ result: result.overallStatus, fileCount: result.fileCount, size: result.extractedSize, bundleSha256: result.bundleSha256, leakCount: result.sensitiveScan?.leakCount ?? 0, blockers: result.blockers }));
  return result.overallStatus === "PASS" ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = runArtifactVerifierCli(process.argv[2] || process.cwd());
