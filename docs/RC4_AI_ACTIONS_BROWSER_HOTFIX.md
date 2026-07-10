# v1.2.0-rc.4 AI Actions Browser Hotfix

## Problem

On GitHub Pages, Lead update and Follow-up work, but AI Actions buttons may not respond.

Likely cause: the browser module `admin/js/admin-ai-actions.js` depended on package imports. If any imported module fails to load on GitHub Pages, click handlers are not attached and the buttons appear unresponsive.

## Fix

`admin/js/admin-ai-actions.js` is now browser-bundled and has no static imports.

The Admin AI Actions now run entirely in the browser page file:

- Analyze Lead
- Generate Proposal
- Generate Missing Info Email
- Generate Proposal Email
- Copy
- Download TXT
- Clear
- Local per-Lead persistence

## Verification

```powershell
node .\scripts\check-rc4-ai-actions-browser-hotfix.mjs
node .\scripts\check-rc3-apps-script-api-hotfix.mjs
node .\scripts\check-b012-files.mjs
node .\packages\admin\testing\testAdminLeadActions.mjs
```

## Browser check

Open:

```text
/admin/index.html?v=rc4
```

Then open DevTools Console and confirm:

```javascript
window.HGAiActionsReady
```

Expected:

```javascript
true
```

If needed, run:

```javascript
HGRunAiActionTest()
```

This should render Lead Analysis in the AI Actions output box.
