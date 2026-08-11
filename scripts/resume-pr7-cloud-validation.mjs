const required = ["PR7_TEST_IDENTITY_FINGERPRINT", "PR7_TEST_CLOUD_PROJECT_FINGERPRINT", "PR7_TEST_OAUTH_AVAILABLE", "PR7_TEST_APPS_SCRIPT_API", "PR7_TEST_SHEETS_API", "PR7_TEST_GMAIL_API"];
const missing = required.filter(name => !process.env[name]);
const identityMissing = missing.includes("PR7_TEST_IDENTITY_FINGERPRINT");
console.log(JSON.stringify({ ready: false, missing, state: identityMissing ? "PR7_TEST_IDENTITY_REQUIRED" : "PR7_CREDENTIAL_RESUME_NOT_READY", secretValuesPrinted: false }));
process.exitCode = 0;
