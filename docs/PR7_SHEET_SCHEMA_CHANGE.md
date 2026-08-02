# PR7 Sheet Schema 變更

`migrateStage2FormOperationsPr7(sheet)` 可安全重複執行，只把缺少欄位加在最右側；不刪除、不重排、不改名、不覆寫既有列或人工欄位。

新增欄位涵蓋 request token、五個時間點、三個 duration、final/error、商機欄位、測試隔離、通知狀態與健康分級。新正式需求預設「新進需求」；明確測試資料才設 `is_test=true`、`excluded_from_pipeline=true`、`lead_status=系統測試`。owner/next_action 等人工欄位保持空白。

執行前須備份表頭與列數；先在副本執行兩次並比對第二次 added=0。回滾方式是不再讀寫新增欄；不得刪除既有資料或 Sheet。
