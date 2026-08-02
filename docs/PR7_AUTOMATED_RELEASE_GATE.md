# PR7 自動化發布 Gate

自動化 Gate 要求：lockfile 可由 `npm ci` 重現、真實 Chromium 三表單及 responsive 9/9 通過、PR7 core/adapter/runtime/concurrency/migration/audit 與既有回歸通過、敏感資訊為 0、Production diff 為 0、GitHub PR Validation 與 artifacts 成功。

本 Gate 通過只能標記 `PR7_REPRODUCIBLE_BROWSER_CI_PASS`，並須同時保留 `CLOUD_AUTOMATION_BLOCKED_CREDENTIALS`。不得據此宣告 Production ready、已部署、已合併或 Google 真實整合通過。
