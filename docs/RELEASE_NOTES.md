# Release Notes

## v1.2.0-alpha.2｜B002 AI Provider Layer

This release adds the first AI Provider Layer for HengGou OS.

## Added

- `packages/ai`
- `BaseProvider`
- `OpenRouterProvider`
- `providerFactory`
- `AIError`
- `aiConfig`
- `tokenEstimator`
- AI Provider test scripts
- Developer Console `/developer/`
- B002 smoke test
- B002 required files check

## Scope

Implemented:

- OpenRouter chat completions

Not implemented yet:

- Embeddings
- Vision
- Image generation
- AI cache
- Cost monitor
- Prompt Engine

## Test

```powershell
node .\scripts\check-required-files.mjs
node .\scripts\check-b002-files.mjs
node .\packages\ai\testing\testProviderFactory.mjs
```

Optional OpenRouter live test:

```powershell
$env:HG_OPENROUTER_API_KEY="your_openrouter_api_key"
node .\packages\ai\testing\testOpenRouterProvider.mjs
```
