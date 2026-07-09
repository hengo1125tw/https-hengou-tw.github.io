# B005 Business Unit Registry

## Purpose

B005 makes HengGou OS a multi-business operating platform.

AI is not the only business line. AI should serve all HengGou business units.

## Included Business Units

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

## Architecture

```text
Lead / CRM Input
      ↓
Business Unit Classifier
      ↓
Context Builder
      ↓
Prompt Engine
      ↓
AI Provider
```

## Files

```text
packages/business/
├── index.js
├── units/
│   ├── businessUnits.js
│   ├── businessUnitSchema.js
│   ├── businessUnitRegistry.js
│   └── businessUnitClassifier.js
└── testing/
    ├── testBusinessUnitRegistry.mjs
    └── testBusinessUnitClassifier.mjs
```

## Local Test

```powershell
node .\scripts\check-b005-files.mjs
node .\packages\business\testing\testBusinessUnitRegistry.mjs
node .\packages\business\testing\testBusinessUnitClassifier.mjs
node .\packages\ai\testing\testContextBusinessUnit.mjs
```

## Rule

Business Unit is a first-class domain.

CRM, Product Catalog, Proposal Generator, AI Analysis, Gmail Draft, and Dashboard should all reference Business Unit.
