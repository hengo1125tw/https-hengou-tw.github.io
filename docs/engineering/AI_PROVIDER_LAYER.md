# B002 AI Provider Layer

## Purpose

B002 introduces a provider abstraction layer for HengGou OS AI functions.

The goal is to prevent CRM, Prompt Engine, Proposal Generator, Gmail Draft Generator, and Automation from depending directly on a single AI vendor.

## Implemented Provider

- OpenRouter

## Provider Interface

Every provider should expose the same high-level interface:

```javascript
chat()
embedding()
vision()
image()
```

B002 only implements `chat()` for OpenRouter.

## Files

```text
packages/ai/
├── config/aiConfig.js
├── errors/AIError.js
├── providers/BaseProvider.js
├── providers/OpenRouterProvider.js
├── providers/providerFactory.js
├── utils/tokenEstimator.js
├── testing/testProviderFactory.mjs
├── testing/testOpenRouterProvider.mjs
└── index.js
```

## Environment Variables

```powershell
$env:HG_OPENROUTER_API_KEY="your_openrouter_api_key"
$env:HG_AI_MODEL="openai/gpt-4o-mini"
```

## Test

```powershell
node .\scripts\check-b002-files.mjs
node .\packages\ai\testing\testProviderFactory.mjs
node .\packages\ai\testing\testOpenRouterProvider.mjs
```

## Security

Do not commit API keys.

API keys should be provided through environment variables or manually in the local Developer Console during testing.
