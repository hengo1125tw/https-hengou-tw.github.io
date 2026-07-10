import fs from "fs";

const ai = fs.readFileSync("admin/js/admin-ai-actions.js", "utf8");
const html = fs.readFileSync("admin/index.html", "utf8");
const version = fs.readFileSync("VERSION", "utf8").trim();
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const checks = [
  ["version file rc4", ["v1.2.0-rc.4", "v1.2.0-rc.5", "v1.2.0-rc.6"].includes(version)],
  ["package rc4", ["1.2.0-rc.4", "1.2.0-rc.5", "1.2.0-rc.6"].includes(pkg.version)],
  ["admin html rc4", (html.includes("v1.2.0-rc.4") || html.includes("v1.2.0-rc.5", "v1.2.0-rc.6"))],
  ["no static imports", !/^import\s/m.test(ai)],
  ["browser bundle marker", ai.includes("Browser-bundled Admin AI Actions")],
  ["analyze function exists", ai.includes("function analyzeLead")],
  ["proposal renderer exists", ai.includes("function renderProposal")],
  ["missing email renderer exists", ai.includes("function renderMissingInfoEmail")],
  ["proposal email renderer exists", ai.includes("function renderProposalEmail")],
  ["click handlers exist", ai.includes('analyzeButton.addEventListener("click"') && ai.includes('proposalButton.addEventListener("click"')],
  ["error output exists", ai.includes("AI Actions Error")],
  ["ready flag exists", ai.includes("window.HGAiActionsReady")]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("RC4 AI Actions Browser Hotfix checks failed:");
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log("RC4 AI Actions Browser Hotfix check passed.");
console.log(JSON.stringify(Object.fromEntries(checks), null, 2));
