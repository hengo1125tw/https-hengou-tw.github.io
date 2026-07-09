import fs from "fs";

const requiredFiles = [
  "packages/business/proposals/proposalConstants.js",
  "packages/business/proposals/proposalTemplates.js",
  "packages/business/proposals/proposalTemplateRegistry.js",
  "packages/business/proposals/proposalSchema.js",
  "packages/business/proposals/proposalBuilder.js",
  "packages/business/proposals/proposalRenderer.js",
  "packages/business/proposals/proposalGenerator.js",
  "packages/business/testing/testProposalGenerator.mjs",
  "packages/ai/proposal/aiProposalGenerator.js",
  "packages/ai/testing/testAiProposalGenerator.mjs",
  "packages/ai/testing/testAiProposalOpenRouter.mjs",
  "docs/engineering/PROPOSAL_GENERATOR.md",
  "tests/smoke/SMOKE_TEST_B009.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B009 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B009 required files check passed.");
