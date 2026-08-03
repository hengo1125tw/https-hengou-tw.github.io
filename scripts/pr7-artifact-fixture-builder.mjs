import { zipSync } from "fflate";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const TEST_TITLES = [
  "home real Chromium saved flow",
  "gpu real Chromium saved flow",
  "automation real Chromium saved flow",
  "timeout preserves single POST without false success",
  "confirmed error and empty requestId never show success",
  "saved reconciliation succeeds after cache persistence failure",
  "clipboard unavailable uses visible manual fallback without exception",
  "responsive real Chromium 9 viewport/page combinations"
];
const sha256 = value => createHash("sha256").update(value).digest("hex");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type); const output = Buffer.alloc(data.length + 12);
  output.writeUInt32BE(data.length, 0); name.copy(output, 4); data.copy(output, 8); output.writeUInt32BE(crc32(Buffer.concat([name, data])), data.length + 8); return output;
}
function png(width, height = 1) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const scanline = Buffer.alloc((width * 4 + 1) * height);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(scanline)), chunk("IEND", Buffer.alloc(0))]);
}
function writeJson(path, value) { writeFileSync(path, JSON.stringify(value, null, 2) + "\n"); }
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => { const path = join(dir, entry.name); return entry.isDirectory() ? walk(path) : [path]; }); }

export function buildCanonicalPr7ArtifactFixture(root) {
  for (const dir of ["test-results", "playwright-report", "screenshots", "traces", "failure-logs"]) mkdirSync(join(root, dir), { recursive: true });
  const cases = TEST_TITLES.map((title, index) => `<testcase name="${title}" classname="tests/pr7-browser/forms.spec.mjs" time="${index + 1}.000"></testcase>`).join("");
  writeFileSync(join(root, "test-results/junit.xml"), `<?xml version="1.0" encoding="UTF-8"?><testsuites tests="8" failures="0" errors="0" skipped="0"><testsuite name="chromium" tests="8" failures="0" errors="0" skipped="0">${cases}</testsuite></testsuites>`);
  const specs = TEST_TITLES.map(title => ({ title, tests: [{ status: "expected", results: [{ projectName: "chromium", status: "passed" }] }] }));
  writeJson(join(root, "test-results/playwright-results.json"), { config: { projects: [{ name: "chromium" }] }, suites: [{ title: "forms.spec.mjs", specs }] });
  const htmlReport = { files: [{ fileName: "tests/pr7-browser/forms.spec.mjs", tests: TEST_TITLES.map(title => ({ title, ok: true, outcome: "expected", projectName: "chromium" })) }] };
  const encoded = Buffer.from(zipSync(
    { "report.json": Buffer.from(JSON.stringify(htmlReport)) },
    { mtime: new Date("1980-01-01T00:00:00.000Z") }
  )).toString("base64");
  writeFileSync(join(root, "playwright-report/index.html"), `<!doctype html><html><body><script>const report="data:application/zip;base64,${encoded}";</script></body></html>`);
  writeJson(join(root, "test-results/pr7-test-summary.json"), { status: "PASS", gitHeadSha: "FIXTURE", playwrightTests: 8, browserFailures: 0, realChromium: true, browser: "chromium", forms: 3, responsivePassed: 9, responsiveTotal: 9, consoleErrors: 0, consoleWarnings: 0, pageErrors: 0, failedRequests: 0, cloud: "CLOUD_AUTOMATION_BLOCKED_CREDENTIALS" });
  writeJson(join(root, "test-results/pr7-migration-summary.json"), { status: "PASS", fixtures: Array.from({ length: 8 }, (_, index) => ({ name: `fixture-${index + 1}`, secondRunAddedCount: 0, oldDataChangedCount: 0, formulaChangedCount: 0, rowDelta: 0 })) });
  writeJson(join(root, "test-results/pr7-audit-summary.json"), { status: "PASS", result: "PR7_AUDIT_PASS", fixtureCount: 5, findingCount: 9 });
  writeJson(join(root, "test-results/pr7-runtime-summary.json"), { status: "PASS", result: "PR7_RUNTIME_EMULATOR_PASS" });
  for (const page of ["home", "gpu", "automation"]) {
    for (const width of [390, 768, 1440]) writeFileSync(join(root, `screenshots/${page}-${width}-initial.png`), png(width));
    for (const state of ["processing", "success", "timeout"]) writeFileSync(join(root, `screenshots/${page}-${state}.png`), png(1280));
  }
  const files = walk(root).sort();
  return { fileCount: files.length, fingerprint: sha256(files.map(path => `${relative(root, path).replaceAll("\\", "/")}:${statSync(path).size}:${sha256(readFileSync(path))}`).join("\n")) };
}
