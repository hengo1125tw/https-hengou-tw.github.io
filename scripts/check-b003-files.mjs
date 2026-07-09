import fs from "fs";

const requiredFiles = [
  "packages/ai/prompt/promptEngine.js",
  "packages/ai/prompt/templateRenderer.js",
  "packages/ai/prompt/variableExtractor.js",
  "packages/ai/prompt/promptValidator.js",
  "packages/ai/prompt/promptRegistry.js",
  "packages/ai/prompt/defaultPrompts.js",
  "packages/ai/testing/testPromptEngine.mjs",
  "packages/ai/testing/testPromptEngineOpenRouter.mjs",
  "docs/engineering/PROMPT_ENGINE.md",
  "tests/smoke/SMOKE_TEST_B003.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B003 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B003 required files check passed.");
