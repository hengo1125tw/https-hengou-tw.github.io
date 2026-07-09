import fs from "fs";

const api = fs.readFileSync("admin/js/admin-api.js", "utf8");
const css = fs.readFileSync("admin/css/admin.css", "utf8");
const html = fs.readFileSync("admin/index.html", "utf8");
const version = fs.readFileSync("VERSION", "utf8").trim();

const checks = [
  ["lead-row class", api.includes('class="lead-row"')],
  ["row click handler", api.includes('row.addEventListener("click"')],
  ["keyboard handler", api.includes('row.addEventListener("keydown"')],
  ["lead id button", api.includes("lead-id-button")],
  ["console helper", api.includes("window.HGOpenLeadDrawer")],
  ["lead-row css", css.includes(".lead-row")],
  ["rc2 admin version", html.includes("v1.2.0-rc.2")],
  ["rc2 version file", version === "v1.2.0-rc.2"]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("RC2 lead row hotfix checks failed:");
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log("RC2 Lead Row Hotfix check passed.");
console.log(JSON.stringify(Object.fromEntries(checks), null, 2));
