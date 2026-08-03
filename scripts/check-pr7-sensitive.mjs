import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const collectFiles = path => {
  const absolute = join(root, path);
  if (!existsSync(absolute)) return [];
  if (statSync(absolute).isFile()) return [path];
  return readdirSync(absolute).flatMap(name => collectFiles(`${path}/${name}`));
};
const diffFile = process.env.PR7_SECURITY_DIFF_FILE;
let sources;
if (diffFile) {
  sources = [{ path: "pull-request-added-lines", text: readFileSync(diffFile, "utf8").split(/\r?\n/).filter(line => /^\+(?!\+\+\+)/.test(line)).join("\n") }];
} else {
  const localPaths = [
    "backend/google-apps-script/PR7FormOperations.gs", "package.json", "package-lock.json", "playwright.config.mjs", ".github/workflows/pr-validation.yml",
    ...readdirSync(join(root, "scripts")).filter(name => name.startsWith("check-pr7-")).map(name => `scripts/${name}`),
    ...readdirSync(join(root, "docs")).filter(name => name.startsWith("PR7_")).map(name => `docs/${name}`),
    ...collectFiles("tests/pr7-browser"), ...collectFiles("playwright-report"), ...collectFiles("test-results"), ...collectFiles("screenshots"), ...collectFiles("traces"), ...collectFiles("failure-logs")
  ].filter(path => path !== "scripts/check-pr7-sensitive.mjs");
  sources = [...new Set(localPaths)].map(path => ({ path, text: readFileSync(join(root, path)).toString("utf8") }));
}
const patterns = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /ya29\.[A-Za-z0-9_-]+/g,
  /AKfycb[A-Za-z0-9_-]+/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /C:\\Users\\/g,
  /(api[_-]?key|access[_-]?token|client[_-]?secret|spreadsheet[_-]?id)\s*[:=]\s*["'][^"']+["']/gi
];
let count = 0;
const hitFiles = new Set();
for (const file of sources) {
  const text = file.text;
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)].length;
    if (matches) hitFiles.add(file.path);
    count += matches;
  }
}
if (count) throw new Error(`Sensitive leak count: ${count}; files: ${[...hitFiles].join(", ")}`);
console.log(`PR7 sensitive scan passed: 0 leaks (${sources.length} sources)`);
