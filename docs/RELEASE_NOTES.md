# Release Notes

## v1.2.0-rc.1｜Production Release Candidate

This release productizes HengGou OS for internal operational use.

## Highlights

- Admin Dashboard AI Actions
- Persistent Admin AI output per Lead ID
- Proposal Generator
- Gmail Draft Generator
- Lead Intake Classification
- Product / Service Catalog
- AI Cache + Usage Monitor
- Production documentation

## Test

```powershell
node .\scripts\check-b012-files.mjs
node .\packages\admin\testing\testAdminLeadActions.mjs
node .\packages\admin\testing\testAdminAiPersistenceFiles.mjs
node .\packages\business\testing\testProposalGenerator.mjs
node .\packages\business\testing\testEmailDraftGenerator.mjs
```


## v1.2.0-rc.2｜Lead Row Hotfix

Fixes Admin Dashboard Lead row opening behavior.

Test:

```powershell
node .\scripts\check-rc2-lead-row-hotfix.mjs
```
