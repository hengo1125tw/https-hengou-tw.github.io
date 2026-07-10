# v1.2.0-rc.3 Apps Script API Hotfix

## Problem

On GitHub Pages, updating Lead status may show `更新狀態失敗`.

Common causes:

1. Apps Script Web App CORS / redirect behavior.
2. Apps Script returns HTML error instead of JSON.
3. Status update succeeds, but dashboard refresh fails after the write.
4. Frontend swallowed the actual backend error message.

## Fix

### Frontend

- Adds robust API request wrapper.
- Adds JSONP fallback for Google Apps Script GET actions.
- Uses JSONP first for write-like Admin actions:
  - `updateLeadStatus`
  - `updateLeadFollowUp`
- Shows clearer API error messages.
- Rolls back status dropdown if update fails.

### Apps Script

- Adds `output_(e, obj)` wrapper.
- Adds JSONP callback support.
- Wraps `doGet()` with try/catch so errors return structured JSON / JSONP.
- Isolates Dashboard refresh failures so Lead writes can still succeed.

## Required deployment step

This hotfix includes a backend change. After uploading the website files to GitHub, also update Google Apps Script:

1. Open `backend/google-apps-script/Code.gs`.
2. Copy the full Code.gs content.
3. Paste it into the existing Apps Script project.
4. Keep your existing:
   - `HG_CONFIG.API_KEY`
   - `HG_CONFIG.SPREADSHEET_ID`
   - notification settings
5. Deploy > Manage deployments > Edit current Web App deployment > New version > Deploy.
6. Keep the same `/exec` Web App URL in Admin Settings.

## Local checks

```powershell
node .\scripts\check-rc3-apps-script-api-hotfix.mjs
node .\scripts\check-b012-files.mjs
node .\packages\admin\testing\testAdminLeadActions.mjs
```

## Manual test

1. Open production `/admin/`.
2. Test API.
3. Refresh Leads.
4. Change Lead status.
5. Refresh page and confirm status persists.
6. Save Follow-up and note.
7. Refresh page and confirm data persists.
