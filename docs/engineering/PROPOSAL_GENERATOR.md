# B009 Proposal Generator

## Purpose

B009 adds Proposal Generator to HengGou OS.

It generates a deterministic proposal from Lead Intake results, then optionally uses AI to polish the proposal.

## Flow

```text
Lead
  ↓
Lead Intake Engine
  ↓
Proposal Generator
  ↓
Markdown Proposal
  ↓
AI Proposal Generator
  ↓
AIExecutionEngine
  ↓
AI Provider
```

## Files

```text
packages/business/proposals/
├── proposalConstants.js
├── proposalTemplates.js
├── proposalTemplateRegistry.js
├── proposalSchema.js
├── proposalBuilder.js
├── proposalRenderer.js
└── proposalGenerator.js

packages/ai/proposal/
└── aiProposalGenerator.js
```

## Local Test

```powershell
node .\scripts\check-b009-files.mjs
node .\packages\business\testing\testProposalGenerator.mjs
node .\packages\ai\testing\testAiProposalGenerator.mjs
```

## OpenRouter Live Test

```powershell
$env:HG_OPENROUTER_API_KEY="your_key"
node .\packages\ai\testing\testAiProposalOpenRouter.mjs
```

## Rule

The deterministic proposal is the source of truth.

AI may polish language, but must not invent price, delivery date, warranty, legal terms, or technical claims.
