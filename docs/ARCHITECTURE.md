# DecisionRail architecture

Status: implemented reference vertical; production adapters and provider state are not implemented.

## Decision

DecisionRail uses a deterministic domain core inside a Next.js 16 application. The primary workflow is runnable without AI, credentials, customer data, or provider access. The Supabase migration is an executable design contract but is not applied by this build.

## Dependency direction

```text
app + src/ui
    -> app/api + src/application
        -> src/domain + src/detectors

supabase/migrations       provider contract, not runtime authority
tests/fixtures            synthetic source inputs
tests/acceptance          exact bad/good/repeat/mutation proof
tests/security            schema/RLS proof
tests/recovery            last-trusted-state proof
tests/e2e                 real browser workflow + accessibility
```

The domain layer contains typed Zod contracts and canonical SHA-256 serialization. It imports no UI, database, provider, or AI library. The application layer orchestrates evidence, opportunity, experiment, decision, handoff, and control receipts. The UI keeps synthetic approval and accepted handoff receipts only in client memory.

## Implemented contracts

| Contract | Required authority | Current implementation |
| --- | --- | --- |
| `CustomerEvidence.v1` | Researcher with consent and data-class authority | Synthetic fixture only; Zod validation and digest |
| `OpportunityContract.v1` | Builder plus named product owner | Local editable form and server-validated reference contract |
| `ExperimentRun.v1` | Sandbox experiment operator | Fixed synthetic cohort, metric, guardrails, rules, and digests |
| `ProductControlDecision.v1` | Deterministic detector | 12 issue-code-bearing fail-closed receipts |
| `ProductDecision.v1` | Human approver distinct from builder | Schema plus local demo receipt; no persisted decision |
| `HandoffBundle.v1` | Receiving operator distinct from builder | Accepted synthetic bundle with recovery receipt; no persisted decision |
| Supabase records | Authenticated tenant roles | SQL/RLS contract supplied, not applied |

## Control engine

Each named detector module declares one requirement ID, issue code, rule version, and a domain-shaped Zod evidence contract. Evaluation is a pure function:

1. Parse the fixture schema.
2. Resolve the exact detector.
3. Return `INDETERMINATE / DETECTOR_UNAVAILABLE` when missing.
4. Execute the detector module against structured evidence, not fixture assertions or scenario prose.
5. Return `REJECT` plus the requirement-specific issue code when the evidence contract fails.
6. Return `PASS` only when the domain-shaped evidence parses successfully.
7. Canonically order the receipt and calculate SHA-256.

The acceptance suite separately checks the expected decision and expected issue code, preventing an adjacent rejection from satisfying the wrong control.

## API boundary

Implemented as stateless synthetic boundaries:

- `POST /api/v1/customer-evidence`
- `POST /api/v1/opportunities`
- `POST /api/v1/experiments/{id}/runs`
- `POST /api/v1/product-decisions/{id}/approve`
- `GET /api/v1/handoff-bundles/{id}?version=1`
- `POST /api/workspace/run` for the combined repository-owned control journey

Each versioned response carries `synthetic: true` and `externalMutation: false`; typed role or segregation failures are fail-closed. Authentication, persistence, durable outbox delivery, and production connector effects remain proposed.

## Persistence and RLS

`supabase/migrations/001_decision_rail.sql` defines eight tenant-scoped tables. Every table enables and forces RLS. Policies require `auth.uid()` membership and role checks. The workspace creator can bootstrap membership and provision distinct approver/operator/auditor roles. `product_decisions` enforces `builder_id <> approver_id`; update and delete are revoked for decisions and receipts.

Provider application, auth configuration, policy execution against real roles, backup/PITR, residency, retention, and deletion proof remain `UNKNOWN`.

## Failure, retry, and rollback

- Schema error: reject with retained local form values and the first labeled error.
- Detector missing: `INDETERMINATE`, never pass.
- Digest drift: block human decision and restore the last accepted fixture set.
- API error: retain form state and allow a bounded retry.
- Provider timeout after a possible future write: remain indeterminate until reconciliation.
- Rollback: reset the local run, restore repository fixtures, rerun twice, and compare the accepted digest.

## Quality-reference trace

The governed current Vedic Astro Studio source was read-only reference input. DecisionRail borrows its standards of deterministic engine separation, explicit route/build smokes, claim ceilings below provider proof, RLS per table, and recovery-aware release gates. No astrology domain code or stale status was copied.
