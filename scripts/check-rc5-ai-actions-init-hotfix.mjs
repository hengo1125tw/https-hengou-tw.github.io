
import fs from "fs";

const ai = fs.readFileSync("admin/js/admin-ai-actions.js", "utf8");
const html = fs.readFileSync("admin/index.html", "utf8");
const version = fs.readFileSync("VERSION", "utf8").trim();
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const checks = [
  ["version file rc5", version === "v1.2.0-rc.5"],
  ["package rc5", pkg.version === "1.2.0-rc.5"],
  ["admin html rc5", html.includes("v1.2.0-rc.5")],
  ["script tag is non-module", html.includes('src="js/admin-ai-actions.js?v=rc5"') && !html.includes('type="module" src="js/admin-ai-actions.js"')],
  ["immediate init", ai.includes('document.readyState === "loading"') && ai.includes("initAiActions();")],
  ["init guard", ai.includes("aiActionsInitialized")],
  ["delegated click fallback", ai.includes('document.addEventListener("click"') && ai.includes("event.target.closest")],
  ["ready flag", ai.includes("window.HGAiActionsReady = true")],
  ["manual test function", ai.includes("window.HGRunAiActionTest")]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("RC5 AI Actions Init Hotfix checks failed:");
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log("RC5 AI Actions Init Hotfix check passed.");
console.log(JSON.stringify(Object.fromEntries(checks), null, 2));
