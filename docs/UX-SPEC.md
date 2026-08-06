# DecisionRail — UX specification

Reflects the implemented surfaces at the current `main`, verified by the E2E and
accessibility suites and an anonymous production smoke (2026-08-06).

## Route map

| Route | Purpose |
| --- | --- |
| `/` (workspace) | The complete reference journey: evidence card, opportunity contract form, P0 control workbench, human authority gate, control result shape, commercial boundary. |
| `/workspace` | Workspace entry (same journey surface). |
| `/records` | Typed record inspection for the synthetic run. |
| `/proof` | Reproducibility contract: local gate commands, adjacent-check defence, truth boundary. |
| `/connections` | Proposed adapters, explicitly labelled proposed. |
| `/settings` | Local demo configuration. |

## The three-minute journey

1. **Orient (≤30 s).** Headline states the thesis ("Make the decision replayable"); the
   evidence-boundary banner declares synthetic fixtures and UNKNOWN commercial state
   before any interaction.
2. **Act (≤2 min).** "Run 24 controls" turns all 12 CV-R rows to `2/2` (bad reject ·
   clean pass), emits a receipt (`DecisionRailWorkspaceRun.v1`, SHA-256 digest,
   `externalMutation=false`), and advances the workbench to `READY FOR HUMAN DECISION`.
3. **Understand the boundary (≤30 s).** The human authority gate remains blocked: an
   approver distinct from the builder must be named; the commercial boundary panel keeps
   demand/outcomes at `UNKNOWN`.

## Interaction states

Every consequential region renders explicit states: `NOT RUN` / `PENDING` / `2 / 2`,
`NOT RECORDED`, `Blocked before authority` / `Awaiting human decision`, `No run receipt`
/ receipt with timestamp and digest. Validation failures preserve valid fields. "Reset
local run" restores the known fixture state deterministically.

## Responsive and accessibility behavior

- Verified no horizontal overflow at 375 px; primary controls render and operate at
  mobile width (E2E mobile project + production probe).
- Automated WCAG A/AA checks pass on desktop and mobile (`npm run test:accessibility`).
- Semantic landmarks (banner, navigation, main, complementary regions), labelled form
  controls, a progressbar for workflow readiness, and non-color status text (state words
  accompany every colored badge).

## Visual system

Domain-derived: rail/stage motif for the six workflow stages, receipt-styled monospace
evidence blocks, restrained status palette. No template hero, no marketing carousel, no
fabricated metrics anywhere in the UI.
