import fs from "fs";

const requiredFiles = [
  "docs/PRODUCTION_RELEASE_CANDIDATE.md",
  "docs/USER_GUIDE_ADMIN_AI_ACTIONS.md",
  "docs/PRODUCTIZATION_CHECKLIST.md",
  "docs/DEPLOYMENT_RUNBOOK_RC1.md",
  "packages/admin/testing/testAdminAiPersistenceFiles.mjs",
  "tests/smoke/SMOKE_TEST_B012.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B012 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

const version = fs.readFileSync("VERSION", "utf8").trim();
if (version !== "v1.2.0-rc.1") {
  console.error(`Expected VERSION v1.2.0-rc.1, got ${version}`);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (packageJson.version !== "1.2.0-rc.1") {
  console.error(`Expected package version 1.2.0-rc.1, got ${packageJson.version}`);
  process.exit(1);
}

console.log("B012 required files check passed.");
