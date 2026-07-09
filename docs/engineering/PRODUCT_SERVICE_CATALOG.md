# B006 Product / Service Catalog

## Purpose

B006 adds a Product / Service Catalog to HengGou OS.

B005 defines business units. B006 defines what each business unit actually sells or delivers.

## Architecture

```text
Business Unit Registry
        ↓
Product / Service Catalog
        ↓
Context Builder
        ↓
Prompt Engine
        ↓
AI Provider
```

## Included Categories

- AI Platform
- AOI Software
- ProtoFab 3D Printing
- Tools Procurement
- Packaging Materials
- COSMO Equipment Agency
- General Equipment Agency
- Logistics Customs
- Website System Development
- Other

## Files

```text
packages/business/products/
├── productConstants.js
├── products.js
├── productSchema.js
├── productRegistry.js
├── productClassifier.js
└── pricingRules.js
```

## Context Integration

B006 adds:

```text
context.productCatalog.selected
context.productCatalog.pricingGuidance
context.productCatalog.classification
```

## Local Test

```powershell
node .\scripts\check-b006-files.mjs
node .\packages\business\testing\testProductRegistry.mjs
node .\packages\business\testing\testProductClassifier.mjs
node .\packages\ai\testing\testProductCatalogContext.mjs
```

## Next

B007 should add Lead Intake Classification so website/admin leads can automatically assign:

- Business Unit
- Product / Service
- Priority
- Missing Information
- Next Action
