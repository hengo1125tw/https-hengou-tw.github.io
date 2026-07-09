# HengGou OS v1.2.0-rc.1 Production Release Candidate

## Release Position

This package is the first productized release candidate based on B001-B011.

It is not only an engineering sprint package. It is prepared as a usable internal product for HengGou Admin operations.

## Included Capabilities

- Website MVP
- Waiting List / Google Apps Script / CRM base
- Admin Dashboard
- Lead Intake Classification
- Business Unit Registry
- Product / Service Catalog
- Proposal Generator
- Gmail Draft Generator
- AI Cache + Usage Monitor
- Admin Dashboard AI Actions
- Local persistence for Admin AI outputs

## Important Boundaries

- Admin Dashboard does not expose OpenRouter API keys.
- Gmail integration creates drafts conceptually, but the current product does not send email automatically.
- AI-generated output must be reviewed before sending to customers.
- Deterministic outputs are the source of truth; AI polishing must not invent price, warranty, delivery date, legal or technical commitments.

## Production Use

1. Open Admin Dashboard.
2. Open a Lead drawer.
3. Click Analyze Lead.
4. Generate Proposal or Gmail Draft.
5. Copy or download the output.
6. Manually review before customer use.

## Release Criteria

This release candidate is acceptable for internal use if:

- `check:b012` passes.
- Admin Lead Actions test passes.
- Browser manual smoke test passes.
- GitHub Pages deployment displays the public website correctly.
- Admin Dashboard loads and login works.
