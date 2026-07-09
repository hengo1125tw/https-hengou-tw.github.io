import fs from "fs";

const requiredFiles = [
  "packages/ai/context/contextSchema.js",
  "packages/ai/context/contextNormalizer.js",
  "packages/ai/context/contextBuilder.js",
  "packages/ai/context/contextPreview.js",
  "packages/ai/context/timelineContext.js",
  "packages/ai/context/knowledgeContext.js",
  "packages/ai/context/playbookContext.js",
  "packages/ai/testing/testContextBuilder.mjs",
  "packages/ai/testing/testPromptWithContextBuilder.mjs",
  "docs/engineering/CONTEXT_BUILDER.md",
  "tests/smoke/SMOKE_TEST_B004.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B004 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B004 required files check passed.");
