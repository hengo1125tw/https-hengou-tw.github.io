# Smoke Test B004

## Required Files

```powershell
node .\scripts\check-b004-files.mjs
```

Expected:

```text
B004 required files check passed.
```

## Context Builder Test

```powershell
node .\packages\ai\testing\testContextBuilder.mjs
```

Expected:

```text
Context builder check passed.
```

## Prompt + Context Test

```powershell
node .\packages\ai\testing\testPromptWithContextBuilder.mjs
```

Expected:

```text
Prompt + Context Builder check passed.
```

## Existing Tests

```powershell
node .\scripts\check-required-files.mjs
node .\scripts\check-b002-files.mjs
node .\scripts\check-b003-files.mjs
node .\packages\ai\testing\testProviderFactory.mjs
node .\packages\ai\testing\testPromptEngine.mjs
```
