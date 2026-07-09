import fs from "fs";

const requiredFiles = [
  "packages/business/index.js",
  "packages/business/units/businessUnits.js",
  "packages/business/units/businessUnitSchema.js",
  "packages/business/units/businessUnitRegistry.js",
  "packages/business/units/businessUnitClassifier.js",
  "packages/business/testing/testBusinessUnitRegistry.mjs",
  "packages/business/testing/testBusinessUnitClassifier.mjs",
  "packages/ai/context/businessUnitContext.js",
  "packages/ai/testing/testContextBusinessUnit.mjs",
  "docs/engineering/BUSINESS_UNIT_REGISTRY.md",
  "tests/smoke/SMOKE_TEST_B005.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B005 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B005 required files check passed.");
