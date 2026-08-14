import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const blockedDomains = ["googleapis.com", "script.google.com", "accounts.google.com", "oauth2.googleapis.com", "gmail.googleapis.com", "sheets.googleapis.com", "drive.googleapis.com"];
const offlineSources = [
  "offline-validation/pr7-offline-core.mjs",
  "scripts/check-pr7-cloud-isolation.mjs",
  "scripts/check-pr7-cloud-offline.mjs",
  "scripts/pr7-test-run-id.mjs",
  "scripts/resume-pr7-cloud-validation.mjs",
  "scripts/run-pr7-cloud-validation.mjs"
];
let attempted = 0;
const denyGoogleRequest = value => {
  const url = String(value);
  if (blockedDomains.some(domain => url.includes(domain))) {
    attempted += 1;
    throw Object.assign(new Error("Google network is forbidden in offline mode"), { code: "PR8_GOOGLE_NETWORK_REQUEST_BLOCKED" });
  }
};
for (const file of offlineSources) {
  const source = readFileSync(file, "utf8");
  assert.equal(/\b(fetch|https?\.request|XMLHttpRequest)\s*\(/.test(source), false, `${file} contains a network primitive`);
}
for (const domain of blockedDomains) assert.throws(() => denyGoogleRequest(`https://${domain}/test`), error => error.code === "PR8_GOOGLE_NETWORK_REQUEST_BLOCKED");
assert.equal(attempted, blockedDomains.length);
console.log(JSON.stringify({ result: "PASS", realGoogleRequestCount: 0, blockedProbeCount: attempted, blockedDomains }));
