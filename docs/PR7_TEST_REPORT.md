# PR7 測試報告

本地自動測試涵蓋 token 缺失／格式、效能分級、正常保存、循序重複、單列單信、通知失敗仍 saved、Sheet 失敗不寄信、測試商機隔離、安全 JSONP、append-only migration 與唯讀 audit。

本次結果：JavaScript syntax、PR7 operations、PR7 polling 5/15/30/45/60/timeout、Stage 2、Automation、Required files、RC6 全部 PASS。B002–B012 亦 PASS。歷史 RC2 獨立檢查因要求舊 admin 版本標記而在現行 RC6 基線失敗，未修改期待值掩蓋。

本機瀏覽器渲染首頁、GPU、Automation：390／768／1440 共九組均無水平溢位，圖片載入失敗 0，Console error/warning 0。真實 Sheet、Gmail 與正式三表單未送出，列入人工驗收。
