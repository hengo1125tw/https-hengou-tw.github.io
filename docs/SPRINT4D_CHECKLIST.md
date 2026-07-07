# Sprint 4D Deployment Checklist

## 1. Apps Script

- [ ] 到 Google Apps Script 建立專案
- [ ] 貼上 `backend/google-apps-script/Code.gs`
- [ ] 貼上 `backend/google-apps-script/appsscript.json`
- [ ] 修改 `HG_CONFIG.API_KEY`
- [ ] 執行 `setupHengGouCRM`
- [ ] 完成授權
- [ ] 部署為 Web App
- [ ] 存取權設定為「任何人」
- [ ] 複製 Web App URL

## 2. Website

修改 `js/config.js`：

```js
API_BASE: "你的 Web App URL",
API_KEY: "與 Code.gs 相同的 API Key"
```

## 3. Test

- [ ] 本機打開 `index.html`
- [ ] 填寫 Waiting List
- [ ] 送出後看到成功 Toast
- [ ] Google Sheets / Leads 有新增資料
- [ ] API Logs 有 success
- [ ] Gmail 有收到通知
- [ ] Telegram 有收到通知（若已設定）

## 4. Git

```powershell
git add .
git commit -m "feat: sprint4D integration release candidate"
git push
```
