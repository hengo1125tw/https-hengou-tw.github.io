# PR8 Production Isolation

Every future live run must compare TEST resource references with non-secret Production fingerprints. Identity, project, Spreadsheet, Script project, deployment, endpoint, and Gmail route collisions are terminal. Missing Production fingerprints block execution; they are never interpreted as safe.
