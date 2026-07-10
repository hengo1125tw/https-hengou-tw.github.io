import fs from "fs";

const ai = fs.readFileSync("admin/js/admin-ai-actions.js", "utf8");
const html = fs.readFileSync("admin/index.html", "utf8");
const version = fs.readFileSync("VERSION", "utf8").trim();
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const checks = [
  ["version file rc6", version === "v1.2.0-rc.6"],
  ["package rc6", pkg.version === "1.2.0-rc.6"],
  ["admin html rc6", html.includes("v1.2.0-rc.6")],
  ["cache buster rc6", html.includes("js/admin-ai-actions.js?v=rc6-email-template")],
  ["ai actions version marker", ai.includes("v1.2.0-rc.6-email-template")],
  ["missing info template subject", ai.includes("關於${analysis.product}需求資訊確認｜恒構企業社")],
  ["proposal template subject", ai.includes("${analysis.product}初步合作說明｜恒構企業社")],
  ["company signature", ai.includes("恒構企業社") && ai.includes("宋先生")],
  ["contact signature", ai.includes("hengo1125.tw@gmail.com") && ai.includes("@749ivaeq") && ai.includes("0978353910")],
  ["name fallback", ai.includes("function safeContactName") && ai.includes("function isInvalidName")],
  ["no static imports", !/^import\\s/m.test(ai)],
  ["ready flag", ai.includes("window.HGAiActionsReady = true")]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("RC6 Email Template Hotfix checks failed:");
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log("RC6 Email Template Hotfix check passed.");
console.log(JSON.stringify(Object.fromEntries(checks), null, 2));
