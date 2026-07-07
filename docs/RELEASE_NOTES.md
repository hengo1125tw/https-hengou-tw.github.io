# Release Notes

## v0.5.0-sprint4D

Sprint 4D 是 Sprint 4 的整合測試版（Release Candidate）。

### 本版重點

- 前端 Waiting List 已可送出到 Google Apps Script Web App。
- `js/api.js` 改為 Google Apps Script 相容送出模式。
- API Key 改由 payload 傳送，避免瀏覽器 preflight 造成 Apps Script CORS 問題。
- 新增 `backend/google-apps-script/appsscript.json`。
- 補齊部署檢查清單。
- 更新 API / DEPLOY / INSTALL 文件。

### 注意

GitHub Pages → Google Apps Script Web App 屬於跨來源請求。為避免 CORS 阻擋，本版前端採用 `mode: "no-cors"` 送出，因此前端會採「送出成功」的樂觀提示。真正收件結果以 Google Sheets 的 Leads / API Logs 為準。
