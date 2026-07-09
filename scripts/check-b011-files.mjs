import fs from "fs";

const requiredFiles = [
  "packages/admin/actions/adminLeadActions.js",
  "packages/admin/testing/testAdminLeadActions.mjs",
  "admin/js/admin-ai-actions.js",
  "docs/engineering/ADMIN_DASHBOARD_AI_ACTIONS.md",
  "tests/smoke/SMOKE_TEST_B011.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B011 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

const adminIndex = fs.readFileSync("admin/index.html", "utf8");
const adminCss = fs.readFileSync("admin/css/admin.css", "utf8");
const adminApi = fs.readFileSync("admin/js/admin-api.js", "utf8");

const requiredSnippets = [
  ["admin/index.html", adminIndex, "Admin AI Actions"],
  ["admin/index.html", adminIndex, "admin-ai-actions.js"],
  ["admin/css/admin.css", adminCss, "Admin AI Actions"],
  ["admin/js/admin-api.js", adminApi, "hg:lead-drawer-opened"]
];

const missingSnippets = requiredSnippets.filter(([, content, snippet]) => !content.includes(snippet));

if (missingSnippets.length) {
  console.error("Missing B011 snippets:");
  missingSnippets.forEach(([file,, snippet]) => console.error(`- ${file}: ${snippet}`));
  process.exit(1);
}

console.log("B011 required files check passed.");
