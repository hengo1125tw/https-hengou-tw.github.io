# PR7 安全掃描

掃描範圍包含 API key、OAuth/token、Spreadsheet ID、Deployment/Admin 憑證、`.env`、client secret、本機絕對路徑、LINE token、私有 Apps Script Endpoint、測試個資與 request body dump。

報告只允許 Endpoint fingerprint，不輸出正式網址全文。公開 `form-config.js` 的既有公開 Web App URL、聯絡 Gmail 與 LINE 連結屬受保護基線，須以 git diff 證明未變；不得複製進本報告或新增測試輸出。

本次 added-content 掃描結果為 0；`form-config.js`、既有 `Code.gs` 與 Pages workflow 相對基線均為 0 diff，tracked secret file 為 0。
