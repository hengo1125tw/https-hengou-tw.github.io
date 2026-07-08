# packages/ai

B002 AI Provider Layer.

## Current Scope

Only OpenRouter is implemented.

## Exports

- `createProvider()`
- `listSupportedProviders()`
- `OpenRouterProvider`
- `BaseProvider`
- `AIError`
- `estimateTokens()`

## Environment Variables

```powershell
$env:HG_OPENROUTER_API_KEY="your_api_key"
$env:HG_AI_MODEL="openai/gpt-4o-mini"
```

## Local Test

```powershell
node .\packages\ai\testing\testProviderFactory.mjs
node .\packages\ai\testing\testOpenRouterProvider.mjs
```

Do not commit API keys.
