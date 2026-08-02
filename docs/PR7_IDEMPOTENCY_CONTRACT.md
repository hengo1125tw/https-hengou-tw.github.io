# PR7 冪等性契約

- `requestToken` 必填且須為 UUID；它是後端正式冪等鍵。
- ScriptLock 最長等待 10 秒。鎖內先查 token，再產生並檢查 requestId，最後只 append 一列並立即公布 `saved`。
- 同 token 再送回傳既有 requestId 與 `already_saved`，不新增列、不換 requestId、不再寄信。
- Gmail 在解鎖後寄送；失敗記為 `notification_error`，但 Sheet 已儲存的 `saved` 與 requestId 不回退。
- Sheet append 失敗不得標示 saved，也不得寄成功通知。前端維持單次 POST，絕不自動 retry。
- 正式整合 adapter 必須將 token 狀態持久保存；Cache 僅可作加速層，不能是唯一真實來源。

## Partial-write recovery

`appendRequest` 成功後，該 token/requestId 即視為已占用，不得再次 append。若 saved metadata 更新失敗，回傳 `PARTIAL_WRITE_PENDING` 與既有 requestId；安全重試在鎖內以 token 找回該列、補齊 saved metadata，再以原 requestId 繼續通知。修復持續失敗則為 `PARTIAL_WRITE_RECOVERY_FAILED`，明確標示 row 已存在。

## Notification recovery

寄信與 metadata 更新分開處理。寄信失敗為 `NOTIFICATION_SEND_FAILED`；寄信已成功但 metadata 更新失敗為 `metadata_pending / NOTIFICATION_METADATA_UPDATE_FAILED`。後者只能人工核對後補 metadata，不得自動重寄。通知失敗狀態本身寫入失敗則為 `NOTIFICATION_ERROR_METADATA_UPDATE_FAILED`。

通知所有權狀態為 `pending → sending → sent`，寄送失敗為 `error`，已寄送但 metadata 待補為 `metadata_pending`。只有在 ScriptLock 內將 pending 原子更新為 sending 的 invocation 可以在解鎖後寄信；看到 sending、sent 或 metadata_pending 的重送一律不得寄信。即使 saved status store 寫入失敗，已取得所有權的 invocation 仍完成唯一一次寄送。

Lock acquisition timeout 是 invocation-only error，只回傳 `LOCK_TIMEOUT`，不得呼叫共享 `putStatus`，因此不會覆蓋同 token 的 received、processing 或 saved。

## Saved status persistence

Sheet saved 後以 `pr7PutSavedStatus_` 最多嘗試 3 次，只寫 status store，不重新 POST、append 或寄信。三次皆失敗時記錄 `SAVED_STATUS_PERSISTENCE_FAILED` warning。`pr7ResolveStatus_` 作為 doGet status adapter：status 缺失、仍在 processing 或 persistence failure 時，依 requestToken 唯讀回查 Sheet；若 Sheet 已有 saved/requestId，即回傳正式 saved，不修改 Sheet、不寄信。

POST 與 status 查詢都先用 `pr7ValidateRequestToken_`：UUID trim 後轉小寫成 canonical token。空白／格式錯誤直接回 `REQUEST_TOKEN_REQUIRED`／`REQUEST_TOKEN_INVALID`，不得呼叫 status store 或 Sheet adapter。大寫與小寫 UUID 必須映射同一列與 requestId。

## Crash-after-claim

正式採 **at-most-once**。claim 在鎖內寫入 `notification_status=sending`、唯一 `notification_claim_id`、`notification_claimed_at` 與遞增的 `notification_attempt_count`，Gmail 在解鎖後寄送。sending 超過 5 分鐘列為 `STALE_NOTIFICATION_CLAIM`，不得自動重寄；管理者須以固定 `[HG-REQUEST:<requestId>]` subject marker 搜尋 Gmail Sent，確認已寄或未寄後再依人工程序修復。此契約可能漏信，但避免不確定狀態下重複寄送，不宣稱 GmailApp exactly-once。

實際 `sendNotification(requestId, payload, subject)` adapter contract 的第三參數由 `pr7NotificationSubject_` 產生，必定包含不可由 payload 覆蓋的完整 marker。sending 的 claimed_at 空白或無效時直接報 `INVALID_NOTIFICATION_CLAIM_TIMESTAMP` 並進人工 Gmail Sent reconciliation，不自動寄信或重設 pending。
