# Smoke Test B009

```powershell
node .\scripts\check-b009-files.mjs
node .\packages\business\testing\testProposalGenerator.mjs
node .\packages\ai\testing\testAiProposalGenerator.mjs
```

Expected:

```text
B009 required files check passed.
Proposal Generator check passed.
AI Proposal Generator check passed.
```

Optional OpenRouter test:

```powershell
$env:HG_OPENROUTER_API_KEY="your_key"
node .\packages\ai\testing\testAiProposalOpenRouter.mjs
```
