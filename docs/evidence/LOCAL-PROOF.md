# Local proof receipt

Date: 2026-08-01 (America/Toronto)

| Command | Exit | Exact result |
| --- | ---: | --- |
| `npm run typecheck` | 0 | TypeScript emitted no errors |
| `npm run lint` | 0 | ESLint emitted no errors or warnings |
| `npm run test:controls` run 1 | 0 | 1 file, 25/25 tests passed |
| `npm run test:controls` run 2 | 0 | 1 file, 25/25 tests passed |
| `npm run test:mutation` | 0 | 1 file, 12/12 detector-disable mutations passed |
| `npm run test:security` | 0 | 1 file, 3/3 RLS/segregation tests passed |
| `npm run test:recovery` | 0 | 1 file, 1/1 damaged-state recovery test passed |
| `npm run test` | 0 | 5 files, 42/42 tests passed |
| `npm run build` | 0 | Next.js 16.2.12 production build; 9/9 static pages generated; dynamic sandbox API route compiled |
| `npm run test:e2e` | 0 | Desktop and mobile Chromium, 2/2 primary journeys passed |
| `npm run test:accessibility` | 0 | Desktop and mobile axe WCAG A/AA, 2/2 passed after source repair |
| `npm run audit:prod` | 0 | 0 vulnerabilities |

## Valid failures retained

- Initial control run: exit 1, 12 known-bad controls falsely passed. Repaired in the detector engine.
- Initial accessibility run: exit 1 on `aria-prohibited-attr` and `scrollable-region-focusable`. Repaired with a real progressbar role and keyboard-focusable mobile rail.
- Initial production audit: exit 1, 3 high inherited advisories in pinned nested PostCSS/Sharp. Narrow safe-version overrides applied; final audit is zero.
- First final E2E rerun: port `3210` was owned by another authorized repository's Next server. That process was preserved; DecisionRail moved its isolated Playwright port to `43120` and passed.

## Claim ceiling

These commands prove local source behavior. They do not prove GitHub-hosted CI, deployment, Supabase application, auth, customer usage, commercial results, or revenue.
