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


## v1.0.0

### Added
- Production MVP release notes.
- Final QA checklist.
- GitHub Release draft.
- Version badges.

### Changed
- Updated version to v1.0.0.
- Updated roadmap for post-release development.
- Marked HengGou AI Platform as Production MVP.


## v1.1.0

### Added
- Added local Admin passcode gate.
- Added `admin/js/admin-auth.js`.
- Added follow-up timeline rendering helper.
- Added admin access documentation.

### Changed
- Admin page now requires a local passcode before showing dashboard.
- Lead detail drawer timeline is more structured.

### Security Note
- This is only a frontend local gate, not production-grade authentication.
- Server-side authentication is planned for future versions.


## v1.1.1-clean
- Rebuilt admin/index.html into a clean baseline.
- Added clean project guide.
- Added local server testing note.

## v1.2.0-alpha.1

### Added
- Added `packages/core` shared library.
- Added API client.
- Added Config module.
- Added Logger module.
- Added Memory Cache.
- Added structured error classes.
- Added validation / formatter / date / string utilities.
- Added unified ID generator.
- Added required files check script.
- Added B001 smoke test document.
- Added Core Library engineering document.
## v1.2.0-alpha.2

### Added
- Added `packages/ai` AI Provider Layer.
- Added `BaseProvider`.
- Added `OpenRouterProvider`.
- Added provider factory.
- Added AI configuration module.
- Added AI error class.
- Added token estimator.
- Added provider factory test.
- Added OpenRouter provider test.
- Added local Developer Console at `/developer/`.
- Added B002 smoke test.
- Added B002 required files check script.

### Notes
- Only OpenRouter `chat()` is implemented in B002.
- API keys must not be committed.
## v1.2.0-alpha.3

### Added
- Added Prompt Engine.
- Added template renderer.
- Added variable extractor.
- Added prompt validator.
- Added prompt registry.
- Added default prompts.
- Added local Prompt Engine test.
- Added OpenRouter Prompt Engine live test.
- Updated Developer Console to run through Prompt Engine.
- Added B003 smoke test and engineering documentation.
## v1.2.0-alpha.4

### Added
- Added Context Builder.
- Added context schema.
- Added context normalizers.
- Added timeline context builder.
- Added knowledge context builder.
- Added playbook context builder.
- Added context preview utility.
- Added Context Builder tests.
- Updated Developer Console to use Context Builder + Prompt Engine.
- Added B004 smoke test and engineering documentation.
## v1.2.0-alpha.5

### Added
- Added Business Unit Registry.
- Added Business Unit Classifier.
- Added HengGou multi-business unit definitions.
- Added AI context integration for Business Unit.
- Added tests for registry, classifier, and context integration.
- Updated default prompts to include Business Unit context.
- Updated Developer Console to classify business lines.

### Changed
- HengGou OS positioning updated from AI-only platform to multi-business operating platform.
## v1.2.0-alpha.6

### Added
- Added Product / Service Catalog.
- Added Product Registry.
- Added Product Classifier.
- Added Pricing Guidance Rules.
- Added Product Catalog AI context integration.
- Added Product Catalog tests.
- Updated default prompts to include product/service and pricing guidance.
- Updated Developer Console to show detected business unit and product.

### Fixed
- Updated Prompt Engine test context to support Business Unit and Product Catalog variables.
## v1.2.0-alpha.7

### Added
- Added Lead Intake Classification.
- Added Lead normalization and validation.
- Added Lead missing information analysis.
- Added Lead scoring, priority, and confidence.
- Added next action rules.
- Added Lead Intake AI context integration.
- Added Lead Intake tests.
- Updated default prompts to use Lead Intake summary.
- Updated Developer Console to show Lead Intake results.

## v1.2.0-alpha.8

### Added
- Added AI Cache.
- Added AI Usage Log.
- Added AI Cost Estimator.
- Added AI Execution Engine.
- Added cached OpenRouter test.
- Updated Developer Console to show cache and usage summary.

### Changed
- AI feature execution should now go through AIExecutionEngine instead of calling PromptEngine directly.

## v1.2.0-alpha.9

### Added
- Added Proposal Generator.
- Added Proposal Templates by Business Unit.
- Added Proposal Markdown Renderer.
- Added AI Proposal Generator.
- Added PRM-000003 Proposal Polish prompt.
- Added Proposal Generator tests.
- Updated Developer Console to generate proposals.

### Rule
- Deterministic proposal is the source of truth; AI only polishes.

## v1.2.0-alpha.10

### Added
- Added Gmail Draft Generator.
- Added deterministic email draft builder.
- Added proposal email draft generation.
- Added AI Gmail Draft Generator.
- Added PRM-000004 Gmail Draft Polish prompt.
- Added Gmail draft tests.
- Updated Developer Console to generate Gmail drafts.

### Rule
- System only creates drafts. It does not send emails automatically.

## v1.2.0-alpha.11

### Added
- Added Admin Dashboard AI Actions.
- Added Admin Lead Actions adapter.
- Added Analyze Lead button in Lead Drawer.
- Added Generate Proposal button in Lead Drawer.
- Added Generate Missing Info Email button in Lead Drawer.
- Added Generate Proposal Email button in Lead Drawer.
- Added copy/download output actions.
- Added Admin AI Actions tests.

### Security
- Admin Dashboard does not expose OpenRouter API keys in browser.
- Live AI calls remain in CLI / Developer Console for now.

## v1.2.0-rc.1

### Release Candidate
- Productized B001-B011 into the first internal production release candidate.
- Added Admin AI output local persistence.
- Added clear output action.
- Added saved timestamp.
- Added production user guide, deployment runbook, and productization checklist.
- Updated version from alpha to release candidate.

### Boundary
- Browser Admin remains deterministic and does not expose OpenRouter API keys.
- Gmail drafts are generated for review only; no automatic sending.

## v1.2.0-rc.2

### Fixed
- Admin Lead table rows are now clickable.
- Lead ID is now a clickable button.
- Added keyboard access for Lead rows.
- Added `HGOpenLeadDrawer()` console helper for troubleshooting.
