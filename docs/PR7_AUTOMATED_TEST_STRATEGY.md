# PR7 Automated Test Strategy

PR7 uses deterministic Node.js verification because no Google test credentials are available. The gate loads the production PR7 core and public form client, records observable side effects, and never contacts Google, Gmail, Sheets, or the production endpoint.

The authoritative local command is `npm run check:pr7-maximum`. Cloud acceptance remains `CLOUD_AUTOMATION_BLOCKED_CREDENTIALS`.
