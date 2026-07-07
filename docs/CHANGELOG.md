# CHANGELOG

## v0.5.0-sprint3

### Added
- 新增 AI Cloud Beta Waiting List 區塊。
- 新增 Waiting List 表單版型與預留 Google Form action。
- 新增 `pages/cases.html` 案例展示頁。
- 新增 `robots.txt` 與 `sitemap.xml`。
- 新增 JSON-LD Organization 基礎結構化資料。
- 新增 Case Study CTA。

### Changed
- AI Cloud CTA 改為導向 Waiting List。
- 首頁案例區增加完整案例頁導流。


## v0.5.0-sprint4A
- Added config.js
- Added api.js
- Added validation.js
- Prepared frontend API architecture.


## v0.5.0-sprint4A-2
- Added functional lead form IDs.
- Added AJAX submit handler in js/app.js.
- Added loading overlay and toast UI.
- Added honeypot anti-spam field.
- Added UTM and device tracking payload.
- Improved validation.js and api.js.


## v0.5.0-sprint4B
- Added Google Apps Script backend.
- Added Lead API with API key validation.
- Added Google Sheets CRM creation.
- Added Gmail notification.
- Added Telegram notification.
- Added API logs.
- Added API / INSTALL / DEPLOY docs.


## v0.5.0-sprint4C
- Added setupHengGouCRM() initializer.
- Added CRM Dashboard refresh function.
- Added Config sheet seeding.
- Added Leads status data validation.
- Added docs/CRM.md.
- Updated deployment documentation.


## v0.5.0-sprint4D

### Added
- Added Sprint 4D Release Candidate documentation.
- Added `backend/google-apps-script/appsscript.json`.
- Added `docs/RELEASE_NOTES.md`.
- Added `docs/SPRINT4D_CHECKLIST.md`.

### Changed
- Updated `js/api.js` to Google Apps Script compatible no-cors mode.
- Moved API Key delivery to JSON payload for Apps Script compatibility.
- Updated API / DEPLOY / INSTALL docs.


## v0.6.0

### Added
- Added `/admin` dashboard.
- Added mock Leads table.
- Added CRM pipeline UI.
- Added analytics charts with Chart.js.
- Added dark / light mode toggle.
- Added API Logs and AI Agent placeholder sections.

### Changed
- Added Admin link to main navigation.


## v0.6.1

### Added
- Added Admin API settings panel.
- Added `admin/js/admin-api.js`.
- Added API health check UI.
- Added refresh Leads from Google Sheets API.
- Added `doGet?action=listLeads` support in Google Apps Script backend.

### Changed
- Admin Dashboard can now switch between mock data and API data.


## v0.7.0

### Added
- Lead search filter.
- Lead status filter.
- Lead status update from Admin Dashboard.
- API Logs viewer.
- Apps Script `listLogs` action.
- Apps Script `updateLeadStatus` action.

### Changed
- Admin Leads table now supports editable status controls.
- Admin Dashboard is closer to real CRM workflow.


## v0.8.0

### Added
- Lead detail drawer.
- Follow-up date editing.
- Internal note editing.
- CSV export.
- Apps Script `updateLeadFollowUp` action.

### Changed
- Leads table includes detail action.
- Admin dashboard now supports lightweight CRM follow-up workflow.


## v0.9.0
- Added favicon SVG.
- Added manifest.webmanifest.
- Added canonical and Twitter Card metadata.
- Added Service JSON-LD.
- Added QA checklist.
- Updated robots.txt and sitemap.xml.
- Improved mobile and accessibility styles.
