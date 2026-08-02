# PR7 部署計畫

1. 人工確認 PR #6 測試 requestId 在 Sheet 恰好一列且已排除商機。
2. 備份 Apps Script 來源及 Sheet 表頭；在 Sheet 副本執行 migration 兩次並比對。
3. 將 `PR7FormOperations.gs` 整合到非公開正式 Apps Script 的現有 doPost/doGet adapter，保留原 Endpoint、Spreadsheet、Gmail 與 LINE。
4. 在測試部署驗證重複與並行 token、狀態持久性、單列單信、通知失敗。
5. 人工核准後才建立 Apps Script 版本及發布網站；本 PR 不執行部署、Trigger 或正式送出。
