# PR8 Offline Cloud Architecture

PR8 uses deterministic local fixtures, an in-memory Sheet emulator, a mock Gmail mailbox, and a mock Google adapter. No offline entry point authenticates, deploys, sends mail, creates resources, or calls Google. Live mode is an intentionally blocked interface until a separate TEST identity is authorized.
