# v1.2.0-rc.2 Lead Row Hotfix

## Problem

In Admin Dashboard, users may not see or successfully click the `詳細` button in the operation column, especially on narrow screens or when the table is visually compressed.

## Fix

- Make the entire Lead row clickable.
- Make Lead ID itself clickable.
- Preserve the original `詳細` button.
- Add keyboard access: Enter / Space opens the Lead drawer.
- Add browser console helper:

```javascript
HGOpenLeadDrawer("HG-20260706-0001")
```

## Test

```powershell
node .\scripts\check-rc2-lead-row-hotfix.mjs
node .\scripts\check-b012-files.mjs
node .\packages\admin\testing\testAdminLeadActions.mjs
```

## Manual Test

1. Open `/admin/` through local server.
2. Click any Lead ID.
3. Click blank area inside any Lead row.
4. Confirm Lead drawer opens.
5. Confirm AI Actions are visible.
