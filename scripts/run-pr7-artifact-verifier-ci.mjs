import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runArtifactVerifierCli } from "./check-pr7-artifacts.mjs";

const root = resolve(process.argv[2] || process.cwd());
const reportPath = join(root, "test-results", "pr7-artifact-verification.json");
const diagnosticPath = join(root, "test-results", "pr7-artifact-verifier-ci-diagnostic.json");
const diagnosticTextPath = join(root, "test-results", "pr7-artifact-verifier-ci-diagnostic.txt");
const mask = value => String(value || "").replace(/[A-Za-z]:\\Users\\[^\\\s]+/gi, "<LOCAL_USER>").replace(/\/home\/runner\/[^\s"']+/gi, "<RUNNER_PATH>").replace(/https?:\/\/[^\s"']+/gi, "<URL>").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "<EMAIL>");

let exitCode = 1;
let invocationError = "";
try {
  exitCode = runArtifactVerifierCli(root);
} catch (error) {
  invocationError = mask(error?.message);
}

let report = null;
let reportReadError = "";
try { if (existsSync(reportPath)) report = JSON.parse(readFileSync(reportPath, "utf8")); } catch (error) { reportReadError = mask(error?.message); }
const diagnostic = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  headSha: process.env.PR7_HEAD_SHA || "LOCAL",
  verifierExitCode: exitCode,
  invocationError,
  reportExists: existsSync(reportPath),
  reportReadable: Boolean(report),
  reportReadError,
  overallStatus: report?.overallStatus || "UNAVAILABLE",
  blockers: Array.isArray(report?.blockers) ? report.blockers : [],
  lifecycle: report?.lifecycle || null,
  junit: report?.junit ? { paths: report.junit.paths, tests: report.junit.tests, failures: report.junit.failures, errors: report.junit.errors } : null,
  playwright: report?.playwright ? { path: report.playwright.path, tests: report.playwright.tests, failures: report.playwright.failures } : null,
  playwrightJson: report?.playwrightJson || null,
  screenshots: report?.screenshots ? { count: report.screenshots.count, decodedCount: report.screenshots.decodedCount } : null,
  sensitiveLeakCount: report?.sensitiveScan?.leakCount ?? null,
  sensitiveFindings: Array.isArray(report?.sensitiveScan?.findings) ? report.sensitiveScan.findings.map(item => ({ type: item.type, path: mask(item.path) })) : [],
  stderr: invocationError
};

try {
  mkdirSync(join(root, "test-results"), { recursive: true });
  writeFileSync(diagnosticPath, JSON.stringify(diagnostic, null, 2));
  writeFileSync(diagnosticTextPath, `Verifier exit: ${exitCode}\nReport: ${diagnostic.reportReadable ? "readable" : "unavailable"}\nStatus: ${diagnostic.overallStatus}\nBlockers: ${diagnostic.blockers.join(", ") || "none"}\nLifecycle: ${diagnostic.lifecycle ? JSON.stringify(diagnostic.lifecycle) : "none"}\n`);
} catch (error) {
  console.error(JSON.stringify({ blocker: "PR7_ARTIFACT_CI_DIAGNOSTIC_WRITE_FAILED", message: mask(error?.message) }));
}

const summary = { verifierExitCode: exitCode, reportExists: diagnostic.reportExists, reportReadable: diagnostic.reportReadable, overallStatus: diagnostic.overallStatus, blockers: diagnostic.blockers, lifecycle: diagnostic.lifecycle, sensitiveLeakCount: diagnostic.sensitiveLeakCount, sensitiveFindings: diagnostic.sensitiveFindings };
console.log(`PR7_ARTIFACT_CI_DIAGNOSTIC ${JSON.stringify(summary)}`);
if (exitCode !== 0) console.error(`::error title=PR7 artifact verification failed::${mask(JSON.stringify(summary))}`);
process.exitCode = exitCode;
