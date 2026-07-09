# Smoke Test B008

```powershell
node .\scripts\check-b008-files.mjs
node .\packages\ai\testing\testAiCache.mjs
node .\packages\ai\testing\testAiUsageLog.mjs
node .\packages\ai\testing\testAiExecutionEngine.mjs
```

Expected:

```text
B008 required files check passed.
AI Cache check passed.
AI Usage Log check passed.
AI Execution Engine check passed.
```
