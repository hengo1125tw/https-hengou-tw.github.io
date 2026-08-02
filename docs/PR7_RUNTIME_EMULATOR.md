# PR7 Runtime Emulator

`scripts/check-pr7-runtime-emulator.mjs` supplies deterministic substitutes for ScriptLock, CacheService, Sheet rows, Mail delivery, time, identifiers, and warnings. It loads `PR7FormOperations.gs` directly and keeps a side-effect ledger for Sheet reads/writes, Cache reads/writes, lock attempts, mail sends, property writes, and external calls.

It verifies canonical tokens, invalid-token isolation, saved-state reconciliation, notification failures, idempotency, subject markers, and migration reruns. It does not claim parity with the Google Apps Script runtime.
