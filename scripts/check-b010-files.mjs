import fs from "fs";

const requiredFiles = [
  "packages/business/email/emailConstants.js",
  "packages/business/email/emailSubjectBuilder.js",
  "packages/business/email/emailDraftBuilder.js",
  "packages/business/email/emailDraftRenderer.js",
  "packages/business/email/emailDraftGenerator.js",
  "packages/business/testing/testEmailDraftGenerator.mjs",
  "packages/business/testing/testProposalEmailDraft.mjs",
  "packages/ai/gmail/aiGmailDraftGenerator.js",
  "packages/ai/testing/testAiGmailDraftGenerator.mjs",
  "packages/ai/testing/testAiGmailDraftOpenRouter.mjs",
  "docs/engineering/GMAIL_DRAFT_GENERATOR.md",
  "tests/smoke/SMOKE_TEST_B010.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B010 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B010 required files check passed.");
