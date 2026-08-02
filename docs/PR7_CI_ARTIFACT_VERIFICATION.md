# PR7 CI Artifact 內容驗證

GitHub Artifact download API 需要授權，而本專案不要求人工登入或提供 Token。因此 Artifact Gate 改在同一個 PR Validation job、上傳前執行。

`scripts/check-pr7-artifacts.mjs` 會解析 JUnit、JSON summaries 與 Playwright 內嵌 report，驗證 screenshots、trace/failure-log 狀態，建立檔案 manifest 與 bundle SHA-256，並掃描全部 artifact 敏感資訊。任一 blocker 會回傳非零 exit code，使 CI failure；`upload-artifact` 仍以 `always()` 保存失敗證據。
