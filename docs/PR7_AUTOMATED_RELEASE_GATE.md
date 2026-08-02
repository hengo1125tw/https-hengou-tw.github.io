# PR7 Automated Release Gate

Automated readiness requires all PR7 and regression checks, zero sensitive leaks, zero production-setting differences, an open unmerged PR, and no deployment side effects.

`PR7_AUTOMATED_TEST_PASS` means only that the deterministic local/CI gate passed. It does not mean production-ready. Production approval additionally requires isolated Google test deployment and controlled three-form acceptance; currently that gate is `CLOUD_AUTOMATION_BLOCKED_CREDENTIALS`.
