# B010 Gmail Draft Generator

## Purpose

B010 adds Gmail Draft Generator to HengGou OS.

It generates deterministic email drafts from Lead Intake or Proposal results, then optionally uses AI to polish the draft.

## Flow

```text
Lead / Proposal
  ↓
Lead Intake / Proposal Generator
  ↓
Email Draft Generator
  ↓
Deterministic Draft
  ↓
AI Gmail Draft Generator
  ↓
AIExecutionEngine
  ↓
OpenRouter / Provider
```

## Files

```text
packages/business/email/
├── emailConstants.js
├── emailSubjectBuilder.js
├── emailDraftBuilder.js
├── emailDraftRenderer.js
└── emailDraftGenerator.js

packages/ai/gmail/
└── aiGmailDraftGenerator.js
```

## Rule

The system creates drafts only. It must not send emails automatically.

Actual sending requires explicit user action and should go through Gmail integration in a later sprint.

## Local Test

```powershell
node .\scripts\check-b010-files.mjs
node .\packages\business\testing\testEmailDraftGenerator.mjs
node .\packages\business\testing\testProposalEmailDraft.mjs
node .\packages\ai\testing\testAiGmailDraftGenerator.mjs
```

## OpenRouter Live Test

```powershell
$env:HG_OPENROUTER_API_KEY="your_key"
node .\packages\ai\testing\testAiGmailDraftOpenRouter.mjs
```
