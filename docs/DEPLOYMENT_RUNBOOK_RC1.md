# Deployment Runbook v1.2.0-rc.1

## 1. Apply Package

Unzip this package into:

```powershell
C:\Users\JASON\Projects\HengGou-Website-Official
```

## 2. Run Tests

```powershell
node .\scripts\check-b012-files.mjs
node .\packages\admin\testing\testAdminLeadActions.mjs
node .\packages\business\testing\testProposalGenerator.mjs
node .\packages\business\testing\testEmailDraftGenerator.mjs
```

## 3. Browser Test

Use a local server instead of opening files directly:

```powershell
npx serve .
```

Open the displayed local URL, then test:

- Website home page
- Admin page
- Lead drawer
- Admin AI Actions

## 4. Commit

```powershell
git status
git add .
git commit -m "chore(release): prepare v1.2.0 rc1"
git push
```

## 5. GitHub Pages

Confirm GitHub Pages deployment completes and the public site loads.
