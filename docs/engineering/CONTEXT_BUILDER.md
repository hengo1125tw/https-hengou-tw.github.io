# B004 Context Builder

## Purpose

B004 adds Context Builder to HengGou OS.

The Context Builder converts CRM / Knowledge / Playbook data into a consistent AI-ready context object.

## Why

Prompt Engine should not consume raw CRM data directly.

Correct flow:

```text
CRM / Knowledge / Playbook
        ↓
Context Builder
        ↓
Prompt Engine
        ↓
AI Provider
```

## Files

```text
packages/ai/context/
├── contextSchema.js
├── contextNormalizer.js
├── contextBuilder.js
├── contextPreview.js
├── timelineContext.js
├── knowledgeContext.js
└── playbookContext.js
```

## Context Shape

```json
{
  "company": {},
  "contact": {},
  "lead": {},
  "product": {},
  "opportunity": {},
  "timeline": {
    "latest": "",
    "items": []
  },
  "knowledge": [],
  "playbook": {},
  "meta": {}
}
```

## Local Test

```powershell
node .\scripts\check-b004-files.mjs
node .\packages\ai\testing\testContextBuilder.mjs
node .\packages\ai\testing\testPromptWithContextBuilder.mjs
```

## Next

B005 should add AI Cache + Usage Log / Cost Monitor before building Proposal Generator.
