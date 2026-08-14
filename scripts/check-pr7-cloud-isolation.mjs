import { checkIsolation, createTestDescriptor, generateTestRunId, productionFingerprints, sha256 } from "../offline-validation/pr7-offline-core.mjs";
const descriptor = createTestDescriptor(generateTestRunId({ now: "2026-08-11T00:00:00Z", random: "00000000-0000-4000-8000-000000000001" }));
const result = checkIsolation(descriptor, productionFingerprints);
console.log(JSON.stringify(result));
if (!result.ok) process.exitCode = 1;
