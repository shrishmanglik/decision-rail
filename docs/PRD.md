# DecisionRail — product requirements

Status: reflects the implemented reference vertical at the current `main`. This is a
contract for what the product must do and must not claim, not a roadmap promise.

## Problem

Product teams make ship/no-ship decisions from evidence scattered across research notes,
analytics, issue trackers, and meetings. The chain from source evidence to the decision
cannot be replayed, so decisions cannot be audited, contested, or recovered when they go
wrong.

## Primary user and job

A Product Builder / Product Manager who owns one problem end to end, and needs to answer:
*"can I show exactly why we decided this, and could someone else replay it?"*

A secondary audience is a technical evaluator (for example, a recruiter or hiring
manager) assessing the builder's judgment: the product must be legible in three minutes
without credentials or setup.

## Governing constraint

**No decision without replayable evidence; controls prepare, humans approve.** Every
capability in the product exists to serve this constraint:

- Evidence carries source class, consent scope, and an immutable digest.
- The opportunity is bounded, owned, and expires; unknown baselines are recorded as
  `UNKNOWN`, never invented.
- Deterministic detectors evaluate known-bad and clean fixtures and fail closed when a
  detector is missing.
- Receipts are canonically serialized and digest-bound so a second run must reproduce
  the first.
- Approval requires a human distinct from the builder; handoff requires a distinct
  receiving operator; neither can be replayed or forged.

## Acceptance criteria (implemented and tested)

1. Zero-login recruiter journey: land, run 24 controls, inspect the receipt, observe the
   blocked human gate — under three minutes.
2. All 12 known-bad fixtures reject with their named issue codes; all 12 clean fixtures
   pass in the same run.
3. Two complete runs produce byte-identical normalized digests.
4. Disabling each evaluator, removing each detector module, or replacing each issue code
   makes acceptance fail (36/36 mutations).
5. Damaging a fixture blocks the run; restoring it returns the exact accepted digest.
6. Builder/approver/operator segregation is enforced; forged, replayed, or
   role-substituted handoffs are denied.
7. Desktop and mobile primary journeys pass automated WCAG A/AA checks.
8. No environment variables, credentials, provider accounts, AI runtime, or external
   writes anywhere in the demo path.

## Non-goals

No authentication, no persistence, no integrations, no AI runtime, no employer branding
or data, no multi-tenant platform build-out. Proposed adapters and the Supabase schema
remain design contracts until separately authorized (see README "Implemented versus
roadmap").

## Claim ceiling

`SOTA_CANDIDATE`. Live-product claims are bounded by the evidence manifest; commercial
claims remain prohibited until the conditions in README "Commercial hypothesis" are met.

## Documentation map

This repository predates the fleet artifact-contract naming and keeps its coherent
canonical structure. Equivalences:

| Fleet contract artifact | This repository |
| --- | --- |
| `docs/PRD.md` | this file |
| `docs/ARCHITECTURE.md` | `docs/ARCHITECTURE.md` |
| `docs/ADR-*.md` | `docs/ADR-001-DETERMINISTIC-VERTICAL.md` |
| `docs/UX-SPEC.md` | `docs/UX-SPEC.md` |
| `docs/SECURITY-PRIVACY.md` | `docs/SECURITY-PRIVACY.md` |
| `docs/CLAIM-LEDGER.md` | `docs/EVIDENCE-MANIFEST.md` (claims with states and evidence) |
| `docs/BENCHMARK.md` | `docs/BENCHMARK.md` |
| `docs/OPERATIONS.md` | `docs/OPERATOR-RUNBOOK.md` |
| `docs/RELEASE-RECEIPT.md` | `docs/EVIDENCE-MANIFEST.md` §"Post-merge publication and deployment" |
| `docs/screenshots/` | `docs/screenshots/` |
