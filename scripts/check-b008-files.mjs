import fs from "fs";
const requiredFiles = [
  "packages/ai/usage/aiUsageConstants.js",
  "packages/ai/usage/stableStringify.js",
  "packages/ai/usage/aiCache.js",
  "packages/ai/usage/aiCostEstimator.js",
  "packages/ai/usage/aiUsageLog.js",
  "packages/ai/usage/aiExecutionEngine.js",
  "packages/ai/testing/testAiCache.mjs",
  "packages/ai/testing/testAiUsageLog.mjs",
  "packages/ai/testing/testAiExecutionEngine.mjs",
  "packages/ai/testing/testPromptEngineOpenRouterCached.mjs",
  "docs/engineering/AI_CACHE_USAGE_MONITOR.md",
  "tests/smoke/SMOKE_TEST_B008.md"
];
const missing = requiredFiles.filter(file => !fs.existsSync(file));
if (missing.length) {
  console.error("Missing B008 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}
console.log("B008 required files check passed.");
