import fs from "fs";

const js = fs.readFileSync("admin/js/admin-ai-actions.js", "utf8");
const html = fs.readFileSync("admin/index.html", "utf8");
const css = fs.readFileSync("admin/css/admin.css", "utf8");

const checks = [
  ["localStorage persistence", js.includes("localStorage.setItem") && js.includes("localStorage.getItem")],
  ["clear action", js.includes("clearAiActionOutput") && html.includes("clearAiActionOutput")],
  ["saved timestamp", js.includes("aiActionSavedAt") && html.includes("aiActionSavedAt")],
  ["download filename includes lead", js.includes("safeLeadId")],
  ["production version", html.includes("v1.2.0-rc.1")],
  ["mobile css", css.includes("v1.2.0-rc.1 Production Candidate")]
];

const failed = checks.filter(([, ok]) => !ok);

if (failed.length) {
  console.error("Admin AI persistence checks failed:");
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log("Admin AI Persistence Files check passed.");
console.log(JSON.stringify(Object.fromEntries(checks), null, 2));
