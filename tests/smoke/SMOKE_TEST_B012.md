# Smoke Test B012

```powershell
node .\scripts\check-b012-files.mjs
node .\packages\admin\testing\testAdminLeadActions.mjs
node .\packages\admin\testing\testAdminAiPersistenceFiles.mjs
node .\packages\business\testing\testProposalGenerator.mjs
node .\packages\business\testing\testEmailDraftGenerator.mjs
```

Expected:

```text
B012 required files check passed.
Admin Lead Actions check passed.
Admin AI Persistence Files check passed.
Proposal Generator check passed.
Email Draft Generator check passed.
```

Manual browser QA:

1. Open Admin Dashboard.
2. Open a Lead drawer.
3. Click Analyze Lead.
4. Refresh the browser and reopen the same Lead.
5. Confirm output is restored.
6. Click Generate Proposal.
7. Copy output.
8. Download TXT.
9. Clear output.
10. Confirm output resets.
