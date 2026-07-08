import fs from "fs";

const requiredFiles = [
  "index.html",
  "admin/index.html",
  "js/config.js",
  "backend/google-apps-script/Code.gs",
  "packages/core/index.js",
  "packages/core/api/apiClient.js",
  "packages/core/logger/logger.js",
  "packages/core/utils/idGenerator.js",
  "docs/engineering/CORE_LIBRARY.md",
  "tests/smoke/SMOKE_TEST_B001.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));
if (missing.length) {
  console.error("Missing required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}
console.log("Required files check passed.");
