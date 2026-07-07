# DEPLOY

## Website

1. 解壓 ZIP。
2. 覆蓋本機 Git Repository。
3. 確認 `js/config.js` 已填入：
   - `API_BASE`
   - `API_KEY`
4. Commit / Push。
5. GitHub Pages 更新後測試。

## Google Apps Script

1. 到 https://script.google.com
2. 建立新專案
3. 建立 `Code.gs`，貼上：

```text
backend/google-apps-script/Code.gs
```

4. 建立 `appsscript.json`，貼上：

```text
backend/google-apps-script/appsscript.json
```

5. 修改 `Code.gs`：

```js
API_KEY: 'CHANGE_ME_TO_A_LONG_RANDOM_KEY'
```

6. 執行：

```text
setupHengGouCRM
```

7. 完成授權。

8. 部署：

```text
部署 > 新增部署作業 > 網路應用程式
```

建議設定：

```text
執行身分：我
誰可以存取：任何人
```

9. 複製 Web App URL，填回網站 `js/config.js` 的 `API_BASE`。

## Test

送出 Waiting List 後檢查：

- Leads
- API Logs
- Gmail
- Telegram
