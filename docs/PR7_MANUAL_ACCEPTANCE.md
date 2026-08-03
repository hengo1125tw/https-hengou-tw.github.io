# PR7 人工驗收

在核准的測試環境依序測試首頁、GPU、Automation，各只點一次：確認按鈕立即鎖定、秒數更新、requestId 顯示與複製、成功後重置、單列單信。再以同 token 重送確認 requestId 不變且無新增列／信。

逐筆核對 source、三個 UTM、landing_page、referrer、各表單專屬 note、is_test、excluded_from_pipeline、lead_status。另驗證 60 秒畫面、Clipboard 缺失 fallback、390/768/1440 無溢位與 Console 0 error/warning/unhandled rejection。PR #6 Sheet Gate 未確認前不得正式部署。
