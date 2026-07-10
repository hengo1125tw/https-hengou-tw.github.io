# v1.2.0-rc.6 Email Template Hotfix

## Purpose

This version replaces `admin/js/admin-ai-actions.js` with a full stable browser file and updates both email templates:

- Generate Missing Info Email
- Generate Proposal Email

## Signature

Both email drafts now end with:

```text
恒構企業社
宋先生
Email：hengo1125.tw@gmail.com
Line：@749ivaeq
電話：0978353910
```

## Cache busting

`admin/index.html` now loads:

```html
<script src="js/admin-ai-actions.js?v=rc6-email-template"></script>
```

## Test

```powershell
node .\scripts\check-rc6-email-template-hotfix.mjs
node --check .\admin\js\admin-ai-actions.js
```

## Browser test

Open:

```text
https://hengo1125tw.github.io/https-hengou-tw.github.io/admin/index.html?v=rc6-email-template
```

Then:

1. Open one Lead.
2. Click 清除.
3. Generate Missing Info Email.
4. Generate Proposal Email.
