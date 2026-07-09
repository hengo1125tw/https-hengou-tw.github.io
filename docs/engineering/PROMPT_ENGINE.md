# B003 Prompt Engine

## Purpose

B003 adds a Prompt Engine to HengGou OS.

The Prompt Engine converts reusable prompt templates into provider-ready AI messages.

## Features

- Extract variables from templates.
- Render `{{variable}}` placeholders.
- Support nested context values such as `{{company.name}}`.
- Validate prompt metadata.
- Validate required prompt context.
- Build provider-ready messages.
- Run prompts through the AI Provider Layer.
- Provide default prompt examples.

## Files

```text
packages/ai/prompt/
├── promptEngine.js
├── templateRenderer.js
├── variableExtractor.js
├── promptValidator.js
├── promptRegistry.js
└── defaultPrompts.js
```

## Example Variables

```text
{{company.name}}
{{contact.email}}
{{lead.requirement}}
{{product.businessUnit}}
{{timeline.latest}}
```

## Local Test

```powershell
node .\scripts\check-b003-files.mjs
node .\packages\ai\testing\testPromptEngine.mjs
```

## OpenRouter Live Test

```powershell
$env:HG_OPENROUTER_API_KEY="your_key"
node .\packages\ai\testing\testPromptEngineOpenRouter.mjs
```

## Security

Do not commit API keys.
