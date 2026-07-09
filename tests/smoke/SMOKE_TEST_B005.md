# Smoke Test B005

## Required Files

```powershell
node .\scripts\check-b005-files.mjs
```

Expected:

```text
B005 required files check passed.
```

## Registry Test

```powershell
node .\packages\business\testing\testBusinessUnitRegistry.mjs
```

Expected:

```text
Business Unit Registry check passed.
```

## Classifier Test

```powershell
node .\packages\business\testing\testBusinessUnitClassifier.mjs
```

Expected:

```text
Business Unit Classifier check passed.
```

## Context Integration Test

```powershell
node .\packages\ai\testing\testContextBusinessUnit.mjs
```

Expected:

```text
Context Business Unit check passed.
```
