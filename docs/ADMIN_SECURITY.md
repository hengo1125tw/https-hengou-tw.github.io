# Admin Security

## v1.1.0

本版新增 Admin 本機密碼保護：

```text
admin/js/admin-auth.js
```

預設密碼：

```text
henggou-admin
```

## 重要說明

這只是前端本機保護，用於避免一般訪客直接看到 Admin 畫面。

它不是正式資安機制，不能視為真正的權限控管。

## 後續建議

v1.2.0 之後應評估：

- Google Login
- Cloudflare Access
- GitHub Pages + 外部 Auth Proxy
- 將 Admin 移到非公開部署環境
- 後端 API 加強權限控管
