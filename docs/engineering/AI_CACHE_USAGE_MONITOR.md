# B008 AI Cache + Usage Monitor

B008 adds AI Cache and Usage Monitor.

## Flow

```text
Prompt Engine
↓
AI Execution Engine
↓
Cache Check
↓
AI Provider
↓
Usage Log
↓
Cost Estimate
```

## Files

```text
packages/ai/usage/
├── aiUsageConstants.js
├── stableStringify.js
├── aiCache.js
├── aiCostEstimator.js
├── aiUsageLog.js
└── aiExecutionEngine.js
```

## Test

```powershell
node .\scripts\check-b008-files.mjs
node .\packages\ai\testing\testAiCache.mjs
node .\packages\ai\testing\testAiUsageLog.mjs
node .\packages\ai\testing\testAiExecutionEngine.mjs
```

Live OpenRouter test:

```powershell
$env:HG_OPENROUTER_API_KEY="your_key"
node .\packages\ai\testing\testPromptEngineOpenRouterCached.mjs
```

Business features should call `AIExecutionEngine.runPrompt()` rather than calling AI providers directly.
