# PR7 冪等性契約

- `requestToken` 必填且須為 UUID；它是後端正式冪等鍵。
- ScriptLock 最長等待 10 秒。鎖內先查 token，再產生並檢查 requestId，最後只 append 一列並立即公布 `saved`。
- 同 token 再送回傳既有 requestId 與 `already_saved`，不新增列、不換 requestId、不再寄信。
- Gmail 在解鎖後寄送；失敗記為 `notification_error`，但 Sheet 已儲存的 `saved` 與 requestId 不回退。
- Sheet append 失敗不得標示 saved，也不得寄成功通知。前端維持單次 POST，絕不自動 retry。
- 正式整合 adapter 必須將 token 狀態持久保存；Cache 僅可作加速層，不能是唯一真實來源。
