# Stage 2 表單部署說明

公開 Repository 只包含表單前端與可替換的 Endpoint 設定，不包含 Apps Script 部署憑證。

## 人工部署步驟

1. 在受控的非公開位置保管 `HengGou_GPU_Stage2_APPS_SCRIPT.zip`。
2. 由管理者審核其中的 `Code.gs` 與 `appsscript.json`。
3. 在 Google Apps Script 建立或更新獨立專案，設定通知信箱後部署 Web App。
4. 以實際 `/exec` URL 更新 `js/form-config.js` 的 `ENDPOINT`；未部署前保持空字串。
5. 以一般表單與 GPU 表單各測試一次成功、後端拒絕、逾時與離線情境。

## 安全界線

- 不要將 API Key、密碼、OAuth Token、Script Properties 或 Google Sheet ID 提交到公開 Repository。
- 不要在未驗證 Apps Script 回傳 `{ "ok": true }` 前，把前端畫面視為成功。
- Apps Script 後端部署、Google 帳戶權限與正式環境發布均由管理者人工完成。

## 回復

前端可回復到 `backup-before-stage2-form` 分支。Apps Script 應保留上一個部署版本，必要時在 Google Apps Script 管理介面切回。
