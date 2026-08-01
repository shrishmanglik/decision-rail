# DecisionRail operator runbook

## Start clean

```powershell
npm ci
npm run typecheck
npm run test
npm run dev
```

No environment file is required. Do not add real customer evidence, secrets, or provider credentials to the reference workflow.

## Primary journey

1. Open `/workspace`.
2. Confirm the `SYNTHETIC` and commercial `UNKNOWN` labels.
3. Edit and validate the opportunity contract. Invalid fields retain valid work and expose a labeled recovery message.
4. Select **Run 24 controls**.
5. Confirm all 12 rows show `2 / 2` and the receipt states `READY_FOR_HUMAN_DECISION` plus `externalMutation=false`.
6. Inspect the evidence digest, issue-code coverage, non-goals, and rollback boundary.
7. Enter a human approver ID distinct from `builder-local-demo` and record the local demo approval.

The approval receipt is intentionally memory-only. Refreshing or selecting **Reset local run** removes it.

## Errors and retry

| State | Meaning | Operator action |
| --- | --- | --- |
| Validation error | The local contract is incomplete | Correct the labeled field; retained values are not discarded |
| API error | The sandbox control route did not return a receipt | Keep the form state, inspect the server output, retry once after correction |
| `INDETERMINATE` | A detector or required state is unavailable | Do not approve; restore the detector or last trusted fixture set |
| Digest mismatch | Two complete runs differ | Stop; compare inputs and canonical serialization before retry |
| Accessibility failure | The workflow is not operable for required users | Fix source, rerun desktop and mobile accessibility checks |

## Recovery drill

`npm run test:recovery` damages the clean CV-R9 outcome-lineage fixture, proves the workspace blocks, restores the fixture, and proves the accepted digest returns exactly.

Manual recovery:

1. Stop approval and retain the failed receipt.
2. Restore the last reviewed fixture set from Git.
3. Run `npm run test:controls` twice.
4. Compare the normalized digest from both runs.
5. Run `npm run test:mutation`.
6. Reopen the human decision only if all controls pass.

## Release boundary

Local proof permits a PR for independent review. It does not permit merge, deployment, Supabase application, customer data, provider connection, or a commercial-result claim.
