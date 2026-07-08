# B001 Core Library

## Purpose

`packages/core` is the shared foundation for HengGou OS modules.

## Modules

- `api`: API client and response format.
- `config`: application constants and environment access.
- `logger`: unified logging interface.
- `cache`: memory cache and cache key utilities.
- `utils`: date, string, validation, formatter, ID generator.
- `errors`: structured errors.

## Dependency Rule

Allowed:

```text
CRM -> Core
AI -> Core
Automation -> Core
Admin -> Core
Website -> Core
```

Not allowed:

```text
Core -> CRM
Core -> AI
CRM -> AI
AI -> CRM
```

## Acceptance Criteria

- Core files exist.
- Required file check passes.
- ID generator returns expected IDs.
- Existing website/admin behavior remains unchanged.
