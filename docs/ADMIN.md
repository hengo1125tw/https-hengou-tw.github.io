# Admin Dashboard

URL:

```text
/admin/
```

## v0.6.1

新增 API 連線設定。

### 使用方式

1. 部署 Google Apps Script Web App。
2. 進入 `/admin/`。
3. 到 Settings。
4. 填入：
   - Apps Script Web App URL
   - API Key
5. 按「儲存設定」。
6. 按「測試 API」。
7. 按「重新整理 Leads」。

API 設定儲存在瀏覽器 localStorage，不會 commit 到 GitHub。
