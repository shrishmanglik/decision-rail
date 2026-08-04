# Security and privacy boundary

## Current exposure

The reference build processes only repository-owned synthetic fixtures. It uses no authentication token, secret, customer record, external model, provider database, or production write. The local human approval receipt is not persisted.

## Threat model

| Threat | Current control | Remaining proof |
| --- | --- | --- |
| Invented research | Domain-shaped evidence schemas, semantic negative fixtures, typed rejection | Real customer-source evaluation remains proposed |
| Cross-tenant access | RLS on every proposed table and membership policies | Provider-applied role matrix remains `UNKNOWN` |
| AI authority escalation | No runtime AI; human gate after deterministic proof | Future model-route eval remains proposed |
| Duplicate effect | No external effect; future operation keys in contract | Provider reconciliation remains proposed |
| Stale decision replay | Version/digest-bearing contracts | Persisted version conflict proof remains proposed |
| Sensitive export | Synthetic exact-version handoff route returns metadata only | Client scope, expiry, deletion, and signed export remain proposed |
| Builder self-approval | Executed local/API guards, Zod contract, SQL check, and RLS policy separate IDs | Authenticated live-role proof remains proposed |

## Data classification

- Public: public product documentation.
- Synthetic: repository fixtures; safe for local demo.
- Internal/confidential/personal: prohibited from the reference workflow.
- Secrets/restricted client data: prohibited from source, logs, exports, and model context.

## Supabase contract

The migration is a source artifact, not proof of provider state. Tests assert:

- eight tables are present;
- every table has `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`;
- no `service_role`, `BYPASSRLS`, or `USING (true)` bypass exists;
- builder/approver separation exists in schema and policy;
- accepted decisions and control receipts are append-only to authenticated clients.

Before provider application, require a separate migration authority, forward and rollback plan, role-matrix fixtures, known-denial controls, clean controls, second run, policy mutation, and dashboard/provider evidence.
