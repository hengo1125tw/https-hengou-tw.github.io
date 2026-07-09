# B007 Lead Intake Classification

## Purpose

B007 adds Lead Intake Classification to HengGou OS.

The goal is to analyze incoming leads and automatically determine:

- Business Unit
- Product / Service
- Status
- Priority
- Score
- Confidence
- Missing Information
- Next Action
- Pricing Guidance

## Flow

```text
Lead Input
    ↓
Normalize
    ↓
Validate
    ↓
Business Unit Classification
    ↓
Product / Service Classification
    ↓
Missing Info Analysis
    ↓
Score / Priority / Confidence
    ↓
Next Action
    ↓
AI Context
```

## Files

```text
packages/business/leads/
├── leadConstants.js
├── leadNormalizer.js
├── leadIntakeSchema.js
├── leadClassifier.js
├── missingInfoAnalyzer.js
├── leadScoring.js
├── nextActionRules.js
├── leadIntakeEngine.js
└── leadSummary.js
```

## Context Integration

B007 adds:

```text
context.leadIntake.result
context.leadIntake.summary
```

## Local Test

```powershell
node .\scripts\check-b007-files.mjs
node .\packages\business\testing\testLeadIntakeEngine.mjs
node .\packages\business\testing\testLeadMissingInfo.mjs
node .\packages\ai\testing\testLeadIntakeContext.mjs
```

## Next

B008 should connect Lead Intake Classification to the existing website/admin flow or add AI Usage Log + Cache before live automation.
