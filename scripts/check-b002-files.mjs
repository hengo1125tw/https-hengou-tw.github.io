import fs from "fs";

const requiredFiles = [
  "packages/ai/index.js",
  "packages/ai/config/aiConfig.js",
  "packages/ai/errors/AIError.js",
  "packages/ai/providers/BaseProvider.js",
  "packages/ai/providers/OpenRouterProvider.js",
  "packages/ai/providers/providerFactory.js",
  "packages/ai/utils/tokenEstimator.js",
  "packages/ai/testing/testProviderFactory.mjs",
  "developer/index.html",
  "developer/developer.js",
  "docs/engineering/AI_PROVIDER_LAYER.md",
  "tests/smoke/SMOKE_TEST_B002.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B002 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B002 required files check passed.");
