# Smoke Test B003

## Required Files

```powershell
node .\scripts\check-b003-files.mjs
```

Expected:

```text
B003 required files check passed.
```

## Prompt Engine Build Test

```powershell
node .\packages\ai\testing\testPromptEngine.mjs
```

Expected:

```text
Prompt engine build check passed.
```

## OpenRouter Live Test

```powershell
$env:HG_OPENROUTER_API_KEY="your_openrouter_api_key"
node .\packages\ai\testing\testPromptEngineOpenRouter.mjs
```

Expected:

- `ok` is `true`.
- AI output appears.
- usage/meta data appears.

## Developer Console

Open:

```text
http://localhost:8000/developer/
```

Expected:

- Prompt Engine runs through OpenRouter.
- Output shows promptId, AI response, usage, meta, and messages.
