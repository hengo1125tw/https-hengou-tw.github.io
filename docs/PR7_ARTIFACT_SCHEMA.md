# PR7 Artifact Verification Schema

`test-results/pr7-artifact-verification.json` 使用 schemaVersion `1.0`，包含 Head SHA、workflow、verifier version、overallStatus、JUnit、JSON summaries、Playwright、screenshots、traces、failureLogs、migration、responsive、audit、console、sensitiveScan、fileCount、extractedSize、bundleSha256、blockers 與 warnings。

成功契約為 `overallStatus=PASS`、`blockers=[]`、`sensitiveScan.leakCount=0`。時間戳與 verifier 自產生報告不納入 deterministic bundle hash。
