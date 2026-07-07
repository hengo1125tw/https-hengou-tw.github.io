# HengGou AI Platform｜Google Apps Script Backend

Version: v0.5.0-sprint4B

## 功能

- Web App API
- Lead 接收
- API Key 驗證
- Google Sheets CRM
- Gmail 通知
- Telegram 通知
- API Logs

## 部署步驟

1. 到 https://script.google.com 建立新專案。
2. 貼上 `Code.gs`。
3. 修改 `HG_CONFIG.API_KEY`，請使用長隨機字串。
4. 如需 Telegram，填入 `TELEGRAM_BOT_TOKEN` 與 `TELEGRAM_CHAT_ID`。
5. 部署 → 新增部署作業 → 類型選「網路應用程式」。
6. 執行身分：我。
7. 誰可以存取：任何人。
8. 複製 Web App URL。
9. 回到網站 `js/config.js`，填入：
   - `API_BASE`
   - `API_KEY`

## 測試

開啟 Web App URL，若看到 JSON：

```json
{
  "ok": true,
  "service": "HengGou AI Platform Lead API"
}
```

代表 API 已啟動。


## 初始化 CRM

部署前或部署後，請在 Apps Script 手動執行：

```text
setupHengGouCRM
```

此函式會建立 CRM 表格、Dashboard 與狀態下拉選單。
