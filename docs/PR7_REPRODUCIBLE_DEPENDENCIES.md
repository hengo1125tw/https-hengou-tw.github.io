# PR7 可重現依賴

專案維持 npm，提交唯一的 `package-lock.json`，並將 `@playwright/test` 固定為 1.61.1。CI 與本機重現均使用 `npm ci`，不使用其他套件管理器或全域 Playwright。

本機 `npm audit` 結果為 0 個漏洞。Playwright 1.62.1 的對應瀏覽器在本機下載逾時，因此採用已可完整啟動 Chromium 的穩定版 1.61.1；未使用系統 Chrome 代替。
