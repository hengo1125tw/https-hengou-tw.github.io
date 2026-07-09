# Smoke Test B006

## Required Files

```powershell
node .\scripts\check-b006-files.mjs
```

Expected:

```text
B006 required files check passed.
```

## Product Registry

```powershell
node .\packages\business\testing\testProductRegistry.mjs
```

Expected:

```text
Product Registry check passed.
```

## Product Classifier

```powershell
node .\packages\business\testing\testProductClassifier.mjs
```

Expected:

```text
Product Classifier check passed.
```

## AI Context Integration

```powershell
node .\packages\ai\testing\testProductCatalogContext.mjs
```

Expected:

```text
Product Catalog Context check passed.
```

## Full Regression

```powershell
node .\scripts\check-required-files.mjs
node .\scripts\check-b002-files.mjs
node .\scripts\check-b003-files.mjs
node .\scripts\check-b004-files.mjs
node .\scripts\check-b005-files.mjs
node .\scripts\check-b006-files.mjs
node .\packages\ai\testing\testProviderFactory.mjs
node .\packages\ai\testing\testPromptEngine.mjs
node .\packages\ai\testing\testContextBuilder.mjs
node .\packages\ai\testing\testPromptWithContextBuilder.mjs
node .\packages\business\testing\testBusinessUnitRegistry.mjs
node .\packages\business\testing\testBusinessUnitClassifier.mjs
node .\packages\business\testing\testProductRegistry.mjs
node .\packages\business\testing\testProductClassifier.mjs
node .\packages\ai\testing\testContextBusinessUnit.mjs
node .\packages\ai\testing\testProductCatalogContext.mjs
```
