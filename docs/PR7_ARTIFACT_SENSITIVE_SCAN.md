# PR7 Artifact 敏感資訊掃描

掃描範圍涵蓋 XML、JSON、HTML、JS、CSS、文字/log/Markdown、檔名，以及 trace ZIP 內文字 metadata。檢查 OAuth/GitHub token、private key、Bearer/Authorization、正式 Apps Script Endpoint、Gmail、secret assignments、runner與Windows絕對路徑。

固定虛構地址 `test@example.invalid` 與 `a@b.invalid` 為 allowlist。命中只記錄類型、相對路徑、位置與遮罩片段，不輸出完整秘密。
