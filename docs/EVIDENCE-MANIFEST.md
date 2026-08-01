# DecisionRail evidence manifest

Evidence date: 2026-08-01 (America/Toronto)

## Source and authority

| Claim | State | Evidence |
| --- | --- | --- |
| Governed blueprint consumed completely | VERIFIED | 1,803 lines; 116,120 bytes; SHA-256 `93E70E6AB873F950BF4CDCD1335EE8A34B35FE8DC117B0003EBE1D9530EA90CF`. The private source file is not committed. |
| Public repository | VERIFIED | `https://github.com/shrishmanglik/decision-rail`, GitHub visibility `PUBLIC` before clone. |
| Clean base | VERIFIED | `origin/main` at `d9128a58fb205587cbab0c25eee91857bdf028e4`; clean clone before branch creation. |
| Task branch | VERIFIED | `dev/decision-rail-initial-build`; merge and deployment not authorized. |
| Implementation commit | VERIFIED | `9c0acc0db6ed3c0533b8cbc4ddfc738ee6e39622`; pushed to the public task branch. |
| Pull request | VERIFIED | `https://github.com/shrishmanglik/decision-rail/pull/1`; open against `main`, not merged. |
| Authority root correction | GAP CORRECTED | Original dispatch named the retired authority root; founder correction and current canon resolved the migrated Tier 1 root. No mirror or frozen snapshot was used. |
| Development task registration | GAP | `feature-build` is the schedule-resolved workflow, but no DecisionRail-specific backlog row/task file exists. The founder dispatch supplies scope and proof gates. |

## Failing-before and passing-after

| Claim | State | Evidence |
| --- | --- | --- |
| Negative controls fail on the pre-fix detector | VERIFIED | `npm run test:controls` exited 1: 12 negative controls received `PASS` instead of `REJECT`; summary `12 failed | 13 passed (25)`. |
| Negative and clean controls pass after repair | VERIFIED | Same command exited 0: `25 passed (25)`. |
| Complete deterministic suite | VERIFIED | `npm run test`: 5 files, 42 tests passed. |
| Repeatability | VERIFIED | Two complete runs produce byte-identical normalized digests. |
| Mutation | VERIFIED | Removing each of 12 detectors makes acceptance fail for its requirement. |
| Recovery | VERIFIED | Damaged CV-R9 clean fixture blocks; restoration returns the exact accepted digest. |
| RLS source contract | VERIFIED | 8/8 tables enable and force RLS; 3 security contract tests pass. |
| Browser journey | VERIFIED | Desktop and mobile Chromium primary flow: 2/2 passed. |
| Accessibility | VERIFIED | Initial run failed on progress-role and scroll-focus defects; after source repair desktop and mobile axe checks passed 2/2. |
| Production dependency audit | VERIFIED | Initial audit found 3 high inherited advisories; narrow PostCSS/Sharp overrides applied; `npm install` reported 0 vulnerabilities. Final audit is rerun at closeout. |
| Hosted PR validation | VERIFIED | GitHub Actions run `30700734808`, job `91371180770`, completed in 1m32s at implementation commit `9c0acc0d`; install, production audit, typecheck, lint, test, build, Playwright browser install, E2E, and accessibility steps all executed and passed. |

## Truth layers

| Layer | State |
| --- | --- |
| Local source and tests | Implemented and locally verified as listed above |
| GitHub branch/commit/PR | Public branch and open PR verified; merge not authorized |
| Hosted CI | One full PR validation executed real steps and passed at implementation commit `9c0acc0d`; no inference about provider billing beyond this run |
| Deployment/provider/auth/schema | NOT PERFORMED / UNKNOWN |
| Customer use, demand, outcomes, revenue | UNKNOWN; no claim made |

## Claim ceiling

This manifest proves a local and GitHub-source work sample when the branch is pushed. It does not prove production readiness, provider configuration, commercial validation, customer adoption, buyer value, or revenue.
