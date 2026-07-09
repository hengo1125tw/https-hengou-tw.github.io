import fs from "fs";

const requiredFiles = [
  "packages/business/leads/leadConstants.js",
  "packages/business/leads/leadNormalizer.js",
  "packages/business/leads/leadIntakeSchema.js",
  "packages/business/leads/leadClassifier.js",
  "packages/business/leads/missingInfoAnalyzer.js",
  "packages/business/leads/leadScoring.js",
  "packages/business/leads/nextActionRules.js",
  "packages/business/leads/leadIntakeEngine.js",
  "packages/business/leads/leadSummary.js",
  "packages/business/testing/testLeadIntakeEngine.mjs",
  "packages/business/testing/testLeadMissingInfo.mjs",
  "packages/ai/context/leadIntakeContext.js",
  "packages/ai/testing/testLeadIntakeContext.mjs",
  "docs/engineering/LEAD_INTAKE_CLASSIFICATION.md",
  "tests/smoke/SMOKE_TEST_B007.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B007 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B007 required files check passed.");
