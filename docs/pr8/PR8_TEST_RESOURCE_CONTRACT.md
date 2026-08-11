# PR8 TEST Resource Contract

TEST descriptors use `TEST_ONLY_*` references and a canonical `PR7T-<UTC_DATE>-<UUID>` run identifier. Sheet migration is append-only. Gmail subjects use `[PR7_TEST_ONLY][RUN:<testRunId>][REQUEST:<requestId>]`. Cleanup is scoped only to the exact run identifier.
