# API

## Lead API

Backend:

```text
backend/google-apps-script/Code.gs
```

Frontend:

```text
js/config.js
js/api.js
js/app.js
```

## Endpoint

Google Apps Script Web App URL.

## Method

```text
POST
```

## Browser Compatibility Note

GitHub Pages 到 Google Apps Script Web App 是跨來源請求。Google Apps Script Web App 無法完整自訂 CORS headers，因此本專案前端採用：

```js
fetch(url, {
  method: "POST",
  mode: "no-cors",
  headers: {
    "Content-Type": "text/plain;charset=utf-8"
  },
  body: JSON.stringify(payload)
})
```

因此前端無法讀取後端 JSON 回應，會以「送出成功」作為樂觀提示。真正結果請以 Google Sheets 的 `Leads` 與 `API Logs` 為準。

## Payload

```json
{
  "apiKey": "YOUR_API_KEY",
  "source": "website",
  "company": "公司名稱",
  "name": "姓名",
  "email": "email@example.com",
  "line": "LINE ID",
  "needs": "AI Agent",
  "note": "備註",
  "honeypot": "",
  "tracking": {
    "utm_source": "",
    "utm_medium": "",
    "utm_campaign": "",
    "utm_content": "",
    "utm_term": "",
    "referrer": "",
    "landing_page": "",
    "user_agent": "",
    "device": "desktop"
  }
}
```

## Security

- API Key 驗證
- Honeypot
- Email 驗證
- Input Sanitization
- API Logs
