
import fs from "fs";

const adminApi = fs.readFileSync("admin/js/admin-api.js", "utf8");
const codeGs = fs.readFileSync("backend/google-apps-script/Code.gs", "utf8");
const version = fs.readFileSync("VERSION", "utf8").trim();
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const adminHtml = fs.readFileSync("admin/index.html", "utf8");

const checks = [
  ["version file rc3", ["v1.2.0-rc.3", "v1.2.0-rc.4", "v1.2.0-rc.5"].includes(version)],
  ["package rc3", ["1.2.0-rc.3", "1.2.0-rc.4", "1.2.0-rc.5"].includes(pkg.version)],
  ["admin html rc3", (adminHtml.includes("v1.2.0-rc.3") || adminHtml.includes("v1.2.0-rc.4") || adminHtml.includes("v1.2.0-rc.5"))],
  ["admin request wrapper", adminApi.includes("async request(action")],
  ["admin jsonp fallback", adminApi.includes("jsonpRequest(action")],
  ["update status prefers jsonp", adminApi.includes('preferJsonp: true')],
  ["non-json api message", adminApi.includes("API 回傳 HTML")],
  ["status select rollback", adminApi.includes("previousValue")],
  ["apps script output wrapper", codeGs.includes("function output_(e, obj)")],
  ["apps script jsonp", codeGs.includes("function jsonp_(callback, obj)")],
  ["apps script handleGet", codeGs.includes("function handleGet_(e)")],
  ["doGet try catch", codeGs.includes("return handleGet_(e);") && codeGs.includes("catch (error)")],
  ["dashboard refresh isolated status", codeGs.includes("dashboard_refresh_failed")],
  ["apps script rc3 service version", codeGs.includes("version: 'v1.2.0-rc.3'")]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("RC3 Apps Script API Hotfix checks failed:");
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log("RC3 Apps Script API Hotfix check passed.");
console.log(JSON.stringify(Object.fromEntries(checks), null, 2));
