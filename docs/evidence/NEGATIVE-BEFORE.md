# Negative-before receipt

Command: `npm run test:controls`

Pre-fix state: `evaluateControl` returned `PASS` after parsing, without inspecting the detector's required facts. This is the adjacent-check failure the control is intended to catch: a valid envelope was mistaken for valid evidence.

Observed result:

```text
exit code: 1
Test Files  1 failed (1)
Tests       12 failed | 13 passed (25)

CV-R1 NEGATIVE through CV-R12 NEGATIVE:
expected 'PASS' to be 'REJECT'
```

The failure reached the exact assertion in `tests/acceptance/control-suite.test.ts`; it was not an import, dependency, or skipped-test failure.

Passing-after on the same command:

```text
exit code: 0
Test Files  1 passed (1)
Tests       25 passed (25)
```

The current repaired implementation imports every named detector module, executes its domain-shaped Zod evidence contract, emits its requirement-specific issue code, and fails closed with `DETECTOR_UNAVAILABLE` when the module is absent. Mutations now disable each evaluator as well as remove each module.
