# PR7 Concurrency Test

The core operations suite uses controlled lock ownership and deterministic interleaving. A competing invocation receives invocation-only `LOCK_TIMEOUT`; shared status remains processing until the owner writes saved. Final invariants are one row, one requestId, at most one mail, and no terminal status regression.
