# PR7 自動化發布 Gate

自動化 Gate 要求：lockfile 可由 `npm ci` 重現、真實 Chromium 三表單及 responsive 9/9 通過、PR7 core/adapter/runtime/concurrency/migration/audit 與既有回歸通過、敏感資訊為 0、Production diff 為 0、同一 CI job 的 Artifact verifier PASS，之後才上傳完整 artifacts。

Artifact download 因授權不可用，改採上傳前 In-CI verification，並未降低驗收標準。Verifier failure 會使 CI failure。本 Gate 通過只能標記 `PR7_IN_CI_ARTIFACT_VERIFICATION_PASS` 與 `PR7_REPRODUCIBLE_BROWSER_CI_PASS`，並須同時保留 `CLOUD_AUTOMATION_BLOCKED_CREDENTIALS`。
