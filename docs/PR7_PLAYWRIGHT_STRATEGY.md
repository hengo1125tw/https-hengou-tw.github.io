# PR7 Playwright 策略

測試使用真實 Playwright Chromium、單一 worker、虛構資料及只綁定 `127.0.0.1` 的自動埠 HTTP emulator。瀏覽器把測試用 Apps Script 網址攔截並轉送至本機 emulator；正式 Endpoint 不會被讀取或呼叫。

每次測試均蒐集 console error、warning、pageerror 與 failed request。失敗保留 trace 與 screenshot；成功保留三頁基線、processing、success 與 timeout screenshot。
