# Smoke Test B011

```powershell
node .\scripts\check-b011-files.mjs
node .\packages\admin\testing\testAdminLeadActions.mjs
```

Expected:

```text
B011 required files check passed.
Admin Lead Actions check passed.
```

Manual browser test:

1. Open `admin/index.html` through local server.
2. Login with local admin password.
3. Open a Lead detail drawer.
4. Click `Analyze Lead`.
5. Click `Generate Proposal`.
6. Click `Generate Missing Info Email`.
7. Click `Generate Proposal Email`.
8. Verify output appears and copy/download works.
