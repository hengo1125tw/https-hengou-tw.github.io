# Smoke Test B007

## Required Files

```powershell
node .\scripts\check-b007-files.mjs
```

Expected:

```text
B007 required files check passed.
```

## Lead Intake Engine

```powershell
node .\packages\business\testing\testLeadIntakeEngine.mjs
```

Expected:

```text
Lead Intake Engine check passed.
```

## Missing Info

```powershell
node .\packages\business\testing\testLeadMissingInfo.mjs
```

Expected:

```text
Lead Missing Info check passed.
```

## AI Context Integration

```powershell
node .\packages\ai\testing\testLeadIntakeContext.mjs
```

Expected:

```text
Lead Intake Context check passed.
```

## Recommended Regression

```powershell
node .\scripts\check-required-files.mjs
node .\scripts\check-b002-files.mjs
node .\scripts\check-b003-files.mjs
node .\scripts\check-b004-files.mjs
node .\scripts\check-b005-files.mjs
node .\scripts\check-b006-files.mjs
node .\scripts\check-b007-files.mjs
node .\packages\ai\testing\testProviderFactory.mjs
node .\packages\ai\testing\testPromptEngine.mjs
node .\packages\business\testing\testBusinessUnitClassifier.mjs
node .\packages\business\testing\testProductClassifier.mjs
node .\packages\business\testing\testLeadIntakeEngine.mjs
node .\packages\business\testing\testLeadMissingInfo.mjs
node .\packages\ai\testing\testLeadIntakeContext.mjs
```
