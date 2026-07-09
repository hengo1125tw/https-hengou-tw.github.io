# Smoke Test B010

```powershell
node .\scripts\check-b010-files.mjs
node .\packages\business\testing\testEmailDraftGenerator.mjs
node .\packages\business\testing\testProposalEmailDraft.mjs
node .\packages\ai\testing\testAiGmailDraftGenerator.mjs
```

Expected:

```text
B010 required files check passed.
Email Draft Generator check passed.
Proposal Email Draft check passed.
AI Gmail Draft Generator check passed.
```

Optional OpenRouter test:

```powershell
$env:HG_OPENROUTER_API_KEY="your_key"
node .\packages\ai\testing\testAiGmailDraftOpenRouter.mjs
```
