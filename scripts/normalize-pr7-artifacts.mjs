import { unzipSync, zipSync } from "fflate";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const TEXT_EXTENSIONS = new Set([".xml", ".json", ".html", ".js", ".css", ".txt", ".log", ".md", ".yml", ".yaml"]);
const normalizeSlash = value => value.replaceAll("\\", "/").replace(/\/$/, "");
const sha256 = value => createHash("sha256").update(value).digest("hex");

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function replacementRules(prefixes) {
  const rules = [];
  const add = (value, marker) => {
    if (!value) return;
    const native = String(value).replace(/[\\/]$/, "");
    const slash = normalizeSlash(native);
    for (const candidate of new Set([native, slash])) if (candidate) rules.push({ candidate, marker });
  };
  add(prefixes.workspace, "<WORKSPACE>");
  add(prefixes.runnerTemp, "<RUNNER_TEMP>");
  add(prefixes.checkoutRoot, "<WORKSPACE>");
  return rules.sort((a, b) => b.candidate.length - a.candidate.length);
}

function replaceExactPrefixes(text, rules) {
  let output = text;
  let replacements = 0;
  for (const { candidate, marker } of rules) {
    let index = output.indexOf(candidate);
    while (index !== -1) {
      output = output.slice(0, index) + marker + output.slice(index + candidate.length);
      replacements += 1;
      index = output.indexOf(candidate, index + marker.length);
    }
  }
  return { output, replacements };
}

function normalizeHtmlReport(path, rules) {
  const original = readFileSync(path, "utf8");
  const match = original.match(/data:application\/zip;base64,([A-Za-z0-9+/=]+)/);
  if (!match) return replaceExactPrefixes(original, rules);
  const archive = unzipSync(Buffer.from(match[1], "base64"));
  let replacements = 0;
  for (const [name, bytes] of Object.entries(archive)) {
    if (!TEXT_EXTENSIONS.has(extname(name).toLowerCase())) continue;
    const normalized = replaceExactPrefixes(Buffer.from(bytes).toString("utf8"), rules);
    replacements += normalized.replacements;
    archive[name] = Buffer.from(normalized.output);
  }
  const outside = replaceExactPrefixes(original.replace(match[1], "__PR7_REPORT_ZIP__"), rules);
  replacements += outside.replacements;
  return { output: outside.output.replace("__PR7_REPORT_ZIP__", Buffer.from(zipSync(archive)).toString("base64")), replacements };
}

export function normalizePr7Artifacts(root, prefixes = {}) {
  const absoluteRoot = resolve(root);
  const rules = replacementRules(prefixes);
  const files = [
    ...walk(join(absoluteRoot, "test-results")),
    ...walk(join(absoluteRoot, "failure-logs")),
    ...walk(join(absoluteRoot, "traces")),
    ...walk(join(absoluteRoot, "playwright-report"))
  ];
  let replacements = 0;
  const changed = [];
  for (const path of files) {
    if (!TEXT_EXTENSIONS.has(extname(path).toLowerCase())) continue;
    const before = readFileSync(path);
    const result = path.endsWith(join("playwright-report", "index.html"))
      ? normalizeHtmlReport(path, rules)
      : replaceExactPrefixes(before.toString("utf8"), rules);
    if (!result.replacements) continue;
    writeFileSync(path, result.output);
    replacements += result.replacements;
    changed.push(relative(absoluteRoot, path).split(sep).join("/"));
  }
  const fingerprint = sha256(files.filter(path => existsSync(path)).sort().map(path => `${relative(absoluteRoot, path)}:${sha256(readFileSync(path))}`).join("\n"));
  return { replacements, changed, fingerprint };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = normalizePr7Artifacts(process.cwd(), {
    workspace: process.env.GITHUB_WORKSPACE || process.cwd(),
    runnerTemp: process.env.RUNNER_TEMP || "",
    checkoutRoot: process.cwd()
  });
  console.log(JSON.stringify({ result: "PR7_ARTIFACT_NORMALIZATION_PASS", ...result }));
}
