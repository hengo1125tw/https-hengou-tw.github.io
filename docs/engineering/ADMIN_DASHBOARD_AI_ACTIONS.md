# B011 Admin Dashboard AI Actions

## Purpose

B011 connects the existing HengGou OS business engines to the Admin Dashboard.

This sprint does not expose OpenRouter API keys in the browser. Admin AI Actions are deterministic local actions:

- Analyze Lead
- Generate Proposal
- Generate Missing Info Gmail Draft
- Generate Proposal Gmail Draft
- Copy / Download output

## Flow

```text
Admin Lead Drawer
  ↓
admin-ai-actions.js
  ↓
packages/admin/actions/adminLeadActions.js
  ↓
Lead Intake / Proposal / Email Draft Generators
  ↓
Dashboard Output
```

## Files

```text
packages/admin/actions/adminLeadActions.js
packages/admin/testing/testAdminLeadActions.mjs
admin/js/admin-ai-actions.js
scripts/check-b011-files.mjs
```

## Browser Use

Open Admin Dashboard, open any Lead detail drawer, then use:

- Analyze Lead
- Generate Proposal
- Generate Missing Info Email
- Generate Proposal Email

## Rule

OpenRouter live calls stay in CLI / Developer Console for now. Browser Admin must not store or expose production API keys.
