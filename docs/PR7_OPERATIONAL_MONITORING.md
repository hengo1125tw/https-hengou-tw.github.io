# PR7 營運監控

處理健康分級函式 `pr7ProcessingHealth_`：0–15 秒 normal、16–30 秒 slow、31–60 秒 observe、超過 60 秒 abnormal。

`auditStage2FormOperationsPr7(rows)` 僅讀取並報告：重複 token/requestId、token 對應多 ID、processing 超時、saved 無 ID、非法 final_status、通知未成功、測試混入 pipeline、來源／聯絡／note 缺失。processing timeout 以 `current time - processing_started_at` 計算，即使 duration 空白仍可偵測。Sheet boolean 接受 `true`、`TRUE`、`"true"`、`1`；其他值依明確 false 契約處理。Gmail 有通知但 Sheet 無列需由管理者以 mailbox 與 audit 匯出交叉比對；程式不自動寄信、刪除、合併或修正。

所有時間解析共用 `pr7TimestampMs_`，接受 Date、epoch milliseconds number、numeric string 與 ISO datetime；成功回傳有限毫秒，空白回傳 `TIMESTAMP_EMPTY`，其他無效值回傳 `TIMESTAMP_INVALID`。Recovery 與 audit 都不得寫入 NaN。
