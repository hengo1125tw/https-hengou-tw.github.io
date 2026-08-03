# PR7 真實瀏覽器 E2E 報告

真實 Chromium 已驗證首頁、GPU 與 Automation 正常流程。每頁只送出一次 POST，使用固定 requestToken，status 依序涵蓋 not_found、processing、saved；Sheet mock 一列、Gmail mock 一封，subject marker 與 requestId 一致。

另驗證 timeout、confirmed error、空 requestId、Cache saved persistence failure 的 Sheet reconciliation，以及 Clipboard API 不可用時的手動複製提示。Google Cloud 真實整合仍為 `CLOUD_AUTOMATION_BLOCKED_CREDENTIALS`。
