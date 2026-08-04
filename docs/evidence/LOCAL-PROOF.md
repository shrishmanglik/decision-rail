# Local proof receipt

Date: 2026-08-03 (America/Toronto)

| Command | Exit | Exact result |
| --- | ---: | --- |
| `npm run test:controls` run 1 | 0 | 1 file, 26/26 tests passed |
| `npm run test:controls` run 2 | 0 | 1 file, 26/26 tests passed |
| `npm run test:mutation` | 0 | 1 file, 24/24 evaluator-disable and missing-module mutations passed |
| `npm run test:security` | 0 | 2 files, 7/7 RLS, human-authority, and handoff-segregation tests passed |
| `npm run test:recovery` | 0 | 1 file, 1/1 damaged-state recovery test passed |
| `npm run test` | 0 | 7 files, 64/64 tests passed |
| `npm run typecheck` | 0 | TypeScript emitted no errors |
| `npm run lint` | 0 | ESLint emitted no errors or warnings |
| `npm run build` | 0 | Next.js 16.2.12 production build; 11/11 pages generated; five versioned sandbox APIs plus combined workspace API compiled |
| `npm run test:e2e` | 0 | Desktop and mobile UI plus five-API handoff journey: 4/4 passed |
| `npm run test:accessibility` | 0 | Desktop and mobile axe WCAG A/AA: 2/2 passed |
| `npm run audit:prod` | 0 | 0 vulnerabilities |
| tracked-diff purity control | 0 | Git diff digest was identical before and after E2E/accessibility runs |

## Valid failures retained

- Original pre-fix control run: exit 1, 12 known-bad controls falsely passed.
- Distinct review of `83e41f7b...` found the original repair still trusted fixture-supplied booleans and did not execute named detector modules; verdict `REVISE`.
- Corrective E2E first run: exit 1 because a broad `alert` locator also matched Next.js route-announcer. The locator was narrowed to the exact authority error; the same browser suite then passed 4/4.
- Initial accessibility run: exit 1 on `aria-prohibited-attr` and `scrollable-region-focusable`; repaired controls remain green.
- Initial production audit: exit 1 on 3 inherited advisories; narrow safe-version overrides remain at 0 vulnerabilities.

## Claim ceiling

These commands prove local source behavior. Hosted CI, merge, deployment, provider configuration, customer usage, commercial results, and revenue require separate evidence.
