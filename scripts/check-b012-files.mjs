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
if (!["v1.2.0-rc.1", "v1.2.0-rc.2", "v1.2.0-rc.3", "v1.2.0-rc.4", "v1.2.0-rc.5", "v1.2.0-rc.6"].includes(version)) {
  console.error(`Expected VERSION v1.2.0-rc.1 / rc.2 / rc.3, got ${version}`);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (!["1.2.0-rc.1", "1.2.0-rc.2", "1.2.0-rc.3", "1.2.0-rc.4", "1.2.0-rc.5", "1.2.0-rc.6"].includes(packageJson.version)) {
  console.error(`Expected package version 1.2.0-rc.1 / rc.2 / rc.3, got ${packageJson.version}`);
  process.exit(1);
}

console.log("B012 required files check passed.");
