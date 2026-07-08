# Clean Project v1.1.1

本版目標：清理版本混雜問題，建立乾淨可測試版本。

## 本機測試方式

請在專案根目錄執行：

```powershell
cd C:\Users\JASON\Projects\HengGou-Website-Official
python -m http.server 8000
```

然後開：

```text
http://localhost:8000/
http://localhost:8000/admin/
```

不要直接開 `admin` 資料夾，否則可能看到 Directory Listing。

Admin 預設密碼：

```text
henggou-admin
```
