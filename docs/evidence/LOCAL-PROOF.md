# Local proof receipt

Date: 2026-08-03 (America/Toronto)

| Command | Exit | Exact result |
| --- | ---: | --- |
| `npm run test:controls` run 1 | 0 | 1 file, 26/26 tests passed |
| `npm run test:controls` run 2 | 0 | 1 file, 26/26 tests passed |
| `npm run test:mutation` | 0 | 1 file, 36/36 evaluator-disable, missing-module, and wrong-issue-code mutations passed |
| `npm run test:security` | 0 | 2 files, 13/13 non-recursive RLS, derived decision/handoff lineage, normalized evidence-integrity, null-safe persistence-parity, and human-authority tests passed |
| `npm run test:recovery` | 0 | 1 file, 1/1 damaged-state recovery test passed |
| `npm run test` | 0 | 7 files, 83/83 tests passed |
| `npm run typecheck` | 0 | TypeScript emitted no errors |
| `npm run lint` | 0 | ESLint emitted no errors or warnings |
| `npm run build` | 0 | Next.js 16.2.12 production build; 11/11 pages generated; five versioned sandbox APIs plus combined workspace API compiled |
| `npm run test:e2e` | 0 | Desktop immutable-approval/role-substitution/five-API/typed-error journeys plus desktop and mobile primary UI: 4/4 passed |
| `npm run test:accessibility` | 0 | Desktop and mobile axe WCAG A/AA: 2/2 passed |
| `npm run audit:prod` | 0 | 0 vulnerabilities |
| tracked-diff purity control | 0 | Git diff digest `b8316e54cda251e9f7eb81fb970218726c9eb7b1` was identical before/after audit, typegen, typecheck, lint, build, E2E, and accessibility runs |

## Valid failures retained

- Original pre-fix control run: exit 1, 12 known-bad controls falsely passed.
- Distinct review of `83e41f7b...` found the original repair still trusted fixture-supplied booleans and did not execute named detector modules; verdict `REVISE`.
- Distinct review of `5f70bb4c...` found standalone accepted handoff, recursive RLS policy shape, weak tenant/authority lineage, weak persisted evidence constraints, and untyped HTTP failures; verdict `REVISE`.
- Distinct review of `9e61a563...` reproduced a forged accepted handoff from a caller-computed checksum and found application/persistence contract drift; verdict `REVISE`. The correction replaces the checksum with a one-time random runtime capability, adds forged/replay/cross-lineage failures, normalizes same-workspace evidence links, and strengthens SQL parity constraints.
- Distinct review of `7bb6ea3b...` confirmed the HTTP attack closures but found substitutable persisted handoff lineage, a null-array SQL escape, generated Next.js source oscillation, and stale eight-table prose; verdict `REVISE`. The correction derives handoff lineage, rejects null array items, untracks the generated file, and reconciles all public schema counts.
- Distinct review of `01003964...` confirmed those corrections but found identical approval replay minted a second capability and non-operator roles could accept by actor-ID substitution; verdict `REVISE`. The correction makes approval issuance immutable/idempotent and requires the operator role before capability lookup.
- Corrective E2E first run: exit 1 because a broad `alert` locator also matched Next.js route-announcer. The locator was narrowed to the exact authority error; the same browser suite then passed 4/4.
- Initial accessibility run: exit 1 on `aria-prohibited-attr` and `scrollable-region-focusable`; repaired controls remain green.
- Initial production audit: exit 1 on 3 inherited advisories; narrow safe-version overrides remain at 0 vulnerabilities.

## Claim ceiling

These commands prove local source behavior. Hosted CI, merge, deployment, provider configuration, customer usage, commercial results, and revenue require separate evidence.
