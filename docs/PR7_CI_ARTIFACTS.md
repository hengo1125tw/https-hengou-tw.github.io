# PR7 CI Artifacts

PR Validation 無論成功或失敗均嘗試上傳 `test-results/`、`playwright-report/`、`screenshots/`、`traces/`、`failure-logs/`，保存 14 天。內容包括 JUnit、JSON summary、HTML report、成功基線 screenshot，以及失敗時的 trace、screenshot 與錯誤內容。

上述路徑全部由 `.gitignore` 排除，且在上傳前納入敏感資訊掃描；不包含 node_modules、正式 Endpoint、憑證或真實個資。
