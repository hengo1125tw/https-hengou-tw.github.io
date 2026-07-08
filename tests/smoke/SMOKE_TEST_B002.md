# Smoke Test B002

## Required Files

- [ ] `node .\scripts\check-b002-files.mjs` passes.
- [ ] `node .\packages\ai\testing\testProviderFactory.mjs` passes.

## OpenRouter Provider

Set environment variable:

```powershell
$env:HG_OPENROUTER_API_KEY="your_openrouter_api_key"
```

Then run:

```powershell
node .\packages\ai\testing\testOpenRouterProvider.mjs
```

Expected result:

- JSON output is printed.
- `provider` is `openrouter`.
- `output` contains an AI response.
- `usage` exists.

## Developer Console

Open:

```text
http://localhost:8000/developer/
```

Manual check:

- [ ] Page loads.
- [ ] API key can be pasted.
- [ ] Prompt can be submitted.
- [ ] Response or structured error appears.
