# DecisionRail evidence manifest

Evidence date: 2026-08-03 (America/Toronto)

## Source and authority

| Claim | State | Evidence |
| --- | --- | --- |
| Governed blueprint consumed completely | VERIFIED | 1,803 lines; 116,120 bytes; SHA-256 `93E70E6AB873F950BF4CDCD1335EE8A34B35FE8DC117B0003EBE1D9530EA90CF`. The private source file is not committed. |
| Public repository | VERIFIED | `https://github.com/shrishmanglik/decision-rail`, GitHub visibility `PUBLIC` before clone. |
| Clean base | VERIFIED | `origin/main` at `d9128a58fb205587cbab0c25eee91857bdf028e4`; clean clone before branch creation. |
| Task branch | VERIFIED | `dev/decision-rail-initial-build`; founder authorized merge and deployment on 2026-08-03, gated by a fresh distinct approval. |
| Reviewed implementation commit | VERIFIED / REVIEWED | `17f5c47ee3ba9fcac29d61dc6b99c58b6bfd4162`; sixth distinct review found no remaining implementation, security, persistence, replay, browser, or purity blocker. Its documentation verdict remained `REVISE` because this manifest still named older GitHub truth. |
| Current publication head | GITHUB-RESOLVED | This file cannot embed the SHA of the commit that contains itself. Resolve PR #1 `headRefOid` and exact-head CI from GitHub; the PR conversation records both after every push. |
| Pull request | VERIFIED | `https://github.com/shrishmanglik/decision-rail/pull/1`; open against `main`, not merged. |
| Authority root correction | GAP CORRECTED | Original dispatch named the retired authority root; founder correction and current canon resolved the migrated Tier 1 root. No mirror or frozen snapshot was used. |
| Development task registration | GAP | `feature-build` is the schedule-resolved workflow, but no DecisionRail-specific backlog row/task file exists. The founder dispatch supplies scope and proof gates. |
| First distinct review | BLOCKED / CORRECTED LOCALLY | REVIEWER verdict `REVISE` at `83e41f7b...`; exact findings and builder corrections are recorded in `docs/evidence/DISTINCT-REVIEW-REVISE.md`. Fresh review remains required. |
| Second distinct review | BLOCKED / CORRECTED LOCALLY | REVIEWER verdict `REVISE` at `5f70bb4c...`; it found standalone accepted handoff, recursive RLS policy shape, weak tenant lineage/invariants, and untyped HTTP failures. Corrections are recorded in the same review trace. |
| Third distinct review | BLOCKED / CORRECTED LOCALLY | REVIEWER verdict `REVISE` at `9e61a563...`; it reproduced an accepted forged checksum token without approval/recovery and found SQL weaker than application contracts. Current corrections use a one-time runtime capability, same-workspace evidence links, and parity constraints; fresh review remains required. |
| Fourth distinct review | BLOCKED / CORRECTED LOCALLY | REVIEWER verdict `REVISE` at `7bb6ea3b...`; runtime attacks were closed, but persisted handoff lineage, SQL null-array parity, tracked generated-file purity, and three stale table-count claims remained. Current local corrections close those joins; fresh review remains required. |
| Fifth distinct review | BLOCKED / CORRECTED LOCALLY | REVIEWER verdict `REVISE` at `01003964...`; prior findings were closed, but identical approval replay minted another capability and non-operator roles could accept by substituting the operator actor ID. Current local corrections make approval issuance immutable/idempotent and require the operator role. |
| Sixth distinct review | BLOCKED / CORRECTED LOCALLY | REVIEWER verdict `REVISE` at `17f5c47e...` only because the recruiter-facing latest manifest/report still described the older corrective head and CI as pending. All code, attack, SQL/Zod/RLS, QA, secret, and purity gates passed. Publication truth is corrected here without claiming a self-referential commit SHA. |

## Failing-before and passing-after

| Claim | State | Evidence |
| --- | --- | --- |
| Negative controls fail on the pre-fix detector | VERIFIED | `npm run test:controls` exited 1: 12 negative controls received `PASS` instead of `REJECT`; summary `12 failed | 13 passed (25)`. |
| Negative and clean controls pass after repair | VERIFIED | Same command run twice: `26 passed (26)` both times, including a scenario-forgery regression. |
| Complete deterministic suite | VERIFIED | `npm run test`: 7 files, 83 tests passed. |
| Repeatability | VERIFIED | Two complete runs produce byte-identical normalized digests. |
| Mutation | VERIFIED | Disabling each evaluator, removing each module, and replacing each canonical issue code makes acceptance fail: 36/36. |
| Recovery | VERIFIED | Damaged CV-R9 clean fixture blocks; restoration returns the exact accepted digest. |
| RLS source contract | VERIFIED | 9/9 tables enable and force RLS; non-recursive policy shape, normalized same-workspace evidence links, deferred evidence requirement, derived decision/handoff lineage, null-safe application-parity constraints, and human authority pass 13/13 security tests. Provider execution remains UNKNOWN. |
| Browser journey | VERIFIED | Desktop API journey covers immutable approval, different-key conflict, role substitution, exact handoff, and terminal replay; primary UI runs on desktop and mobile; typed errors run on desktop: 4/4 passed. |
| Accessibility | VERIFIED | Initial run failed on progress-role and scroll-focus defects; after source repair desktop and mobile axe checks passed 2/2. |
| Production dependency audit | VERIFIED | Initial audit found 3 high inherited advisories; narrow PostCSS/Sharp overrides applied; `npm install` reported 0 vulnerabilities. Final audit is rerun at closeout. |
| Hosted PR validation | VERIFIED | GitHub Actions run `30700734808`, job `91371180770`, completed in 1m32s at implementation commit `9c0acc0d`; install, production audit, typecheck, lint, test, build, Playwright browser install, E2E, and accessibility steps all executed and passed. |
| First corrective hosted validation | VERIFIED | GitHub Actions run `30866129661` executed all real validation steps and passed at `5f70bb4c`; the distinct review still returned REVISE because those checks were adjacent to causal handoff and recursive-policy defects. |
| Second corrective hosted validation | VERIFIED BUT SUPERSEDED | GitHub Actions run `30867222677` executed all real validation steps and passed at `9e61a563`; the third distinct review still reproduced a forged handoff and blocked merge. |
| Third corrective hosted validation | VERIFIED BUT SUPERSEDED | GitHub Actions run `30868139821` executed all real validation steps and passed at `7bb6ea3b`; the fourth distinct review still found persistence-lineage, null-array, and tracked-file purity defects. |
| Fourth corrective hosted validation | VERIFIED BUT SUPERSEDED | GitHub Actions run `30868969761` executed all real validation steps and passed at `01003964`; the fifth distinct review still reproduced approval replay and role-substitution defects. |
| Fifth corrective hosted validation | VERIFIED | GitHub Actions run `30869677929` executed real install, audit, typegen/typecheck, lint, 83-test Vitest, build, 4-test E2E, and 2-test accessibility steps successfully at reviewed implementation SHA `17f5c47e...`. |
| Documentation-only publication validation | GITHUB-RESOLVED | Resolve the current PR head and exact-head run from GitHub. This row intentionally avoids a self-referential SHA; merge still requires that run and a fresh distinct review. |

## Truth layers

| Layer | State |
| --- | --- |
| Local source and tests | Reviewed implementation SHA `17f5c47e...` passed the complete proof stack listed above |
| GitHub branch/commit/PR | Public branch and open PR verified; merge authorized only after fresh distinct approval |
| Hosted CI | One full PR validation executed real steps and passed at implementation commit `9c0acc0d`; no inference about provider billing beyond this run |
| Deployment/provider/auth/schema | NOT PERFORMED / UNKNOWN |
| Customer use, demand, outcomes, revenue | UNKNOWN; no claim made |

## Post-merge publication and deployment (updated 2026-08-06)

This section supersedes the "Pull request", "Current publication head", and
"Deployment/provider" rows above, which described pre-merge truth.

| Claim | State | Evidence |
| --- | --- | --- |
| PR #1 merged to `main` | VERIFIED | Merge commit `ce7548499c8652f5d573e46e1cb2f1b7bb4b1dc6`, 2026-08-03 22:01:43 -0400. `origin/main` resolves to this SHA as of 2026-08-06. |
| Clean exact-SHA reproduction | VERIFIED | Fresh clone of the public repository checked out at `ce75484…`: `npm ci`, 83/83 tests, and production build all passed (2026-08-06). |
| Full local gate chain at `ce75484…` | VERIFIED | typecheck, lint, 83/83 unit/integration tests, production build, 4/4 E2E, 2/2 WCAG A/AA accessibility checks, `npm audit --omit=dev` 0 vulnerabilities (2026-08-06). |
| Production deployment exists and serves the product | VERIFIED | Vercel deployment `dpl_4qCDVKczMj5c6vBxqngv2dCxdjnH`, status Ready, created 2026-08-03 22:02:57 -0400, aliased to `https://decision-rail.vercel.app`. Anonymous browser smoke 2026-08-06: full control-run journey, receipt digest rendered, human gate blocks, zero console errors, no mobile overflow. |
| Production serves exactly `ce75484…` | SUPERSEDED | The 2026-08-03 deployment recorded no git metadata; binding was UNVERIFIED. Superseded by the release receipt below. |

## Release receipt (2026-08-06)

| Claim | State | Evidence |
| --- | --- | --- |
| PR #2 (docs contract) merged | VERIFIED | Merge commit `afa45512478384ec17040092dcf7e13f0fc4242d`; distinct-session review verdict APPROVE at head `2c77c9f…` before merge. |
| Production redeployed git-bound | VERIFIED | Deployment `dpl_5244Eh6fAutnJZ6ozocsaJ6x1npn`, target production, status Ready, created 2026-08-06, published with provider-recorded metadata `githubCommitSha=afa45512478384ec17040092dcf7e13f0fc4242d`, `githubCommitRef=main`. |
| SHA binding provider-verified | VERIFIED | `vercel ls decision-rail -m githubCommitSha=afa4551…` returns the production deployment aliased to `https://decision-rail.vercel.app`. |
| Anonymous post-deploy smoke | VERIFIED | 2026-08-06: desktop and 375 px mobile, zero console errors, no horizontal overflow; full journey (24 controls → receipt → blocked human gate) green. Run digest `5e30aee41cab…` byte-identical to the pre-redeploy run — cross-deployment determinism observed. |
| Docs-ahead caveat | NOTE | Commits merged after `afa4551…` in this repository are documentation-only and do not alter the deployed runtime. Any future runtime change requires a fresh gated release and a new receipt. |

## Claim ceiling

This manifest proves a local and GitHub-source work sample, plus an anonymously
verified production deployment whose exact commit binding remains UNVERIFIED. It does
not prove provider configuration beyond the deployment read-back above, commercial
validation, customer adoption, buyer value, or revenue.
