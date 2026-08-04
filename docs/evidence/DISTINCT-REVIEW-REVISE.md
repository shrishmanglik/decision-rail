# Distinct review — REVISE and correction trace

The independent REVIEWER session bound its verdict to PR #1 head `83e41f7b08d1b2e7fc462f560f17b3e980832c2d` and blocked merge.

| Finding | Reproduced state | Corrective implementation |
| --- | --- | --- |
| P0 detector bypass | Fixture-supplied boolean facts drove decisions; named detector modules were dead exports | Every named module now owns an executable Zod evidence contract and is imported by the registry; scenario prose cannot override malformed evidence |
| P0 ineffective mutation | Tests only deleted registry entries | Twelve evaluator-disable mutations and twelve missing-module mutations must fail acceptance |
| P0 builder self-approval | `builder-local-demo` could create an approval receipt | Pure authority guard rejects exact and case-variant self-approval; UI, API, unit, and E2E controls exercise the denial |
| P1 role bootstrap | Creator could insert only self-membership | Creator policies can bootstrap and provision distinct roles; static source contract test binds the policy shape; provider execution remains UNKNOWN |
| P1 test impurity | E2E overwrote the tracked README screenshot | E2E no longer writes tracked source; before/after tracked-diff digest is identical |
| P1 incomplete slice | Four contracts and one API; no accepted handoff | Five authoritative contracts, five versioned sandbox APIs, and a non-builder recovery-bound accepted synthetic handoff are implemented |

The corrective head must receive a fresh distinct-session review. This file records the prior verdict and builder response; it is not an approval.

## Second distinct review

The next REVIEWER bound `REVISE` to `5f70bb4c839b95d2c4a5b3bc1525995672b4a642`. It confirmed the first correction set but found additional adjacent checks:

| Finding | Corrective implementation after `5f70bb4c` |
| --- | --- |
| Standalone or forged handoff GET returned `ACCEPTED` | Exact synthetic decision approval is constrained to the authoritative workspace digest, recovery receipt, actors, and decision and issues a random one-time process-local capability. Standalone, caller-forged, and replayed requests return typed `409`. Durable provider authentication remains proposed. |
| Membership/workspace policies recursively queried each other | Automatic creator-membership trigger plus bounded empty-search-path role helpers remove direct policy-table recursion |
| Downstream IDs were not tenant-bound | Composite same-workspace foreign keys bind opportunity → experiment → decision → handoff |
| Decision SQL trusted caller builder identity | Experiment records builder/operator roles and a decision trigger derives both lineage fields before policy evaluation |
| Persistence consent/source constraints were weaker | Source enum, non-empty bounded consent scope, pseudonym length, and verified-redaction compatibility are SQL checks; sandbox intake accepts synthetic source only |
| Malformed JSON and route IDs could escape as HTTP 500 | All mutation routes parse JSON through a typed `400` boundary; dynamic identifiers and versions validate before domain parsing |

A third distinct review remains required. No prior `REVISE` is converted into approval by this builder trace.

## Third distinct review

The third REVIEWER bound `REVISE` to `9e61a5635cc5bf96ec9c8d4d3fb922c90b0e4353`. It bypassed the checksum-based continuation token without approval or recovery and joined the SQL migration against the Zod contracts.

| Finding | Corrective implementation after `9e61a563` |
| --- | --- |
| Public SHA-256 allowed a caller to fabricate arbitrary decision and recovery fields | Approval now requires the exact authoritative workspace digest, recovery receipt, decision, and actor lineage, then stores a random one-time capability in the running process. Handoff rejects missing, forged, cross-actor, and replayed capabilities. Durable provider authentication remains explicitly proposed. |
| Persistence model was weaker than application contracts | Evidence pseudonyms and opportunity/experiment/decision/handoff minimums now match application constraints. Experiment fields are typed columns rather than opaque JSON. Evidence membership is a normalized same-workspace relation with composite foreign keys and a deferred at-least-one-evidence constraint. |

These corrections require a fresh distinct review at the immutable pushed head.

## Fourth distinct review

The fourth REVIEWER bound `REVISE` to `7bb6ea3b33b03b6b6fe29c7789eb41dbdc35c8ee`. It confirmed every HTTP capability attack was closed, then found three source-join defects plus stale table-count prose.

| Finding | Corrective implementation after `7bb6ea3` |
| --- | --- |
| Handoff persistence allowed workspace-valid but decision-invalid builder/recovery substitution | A before-insert trigger derives builder, operator, and recovery receipt from the same-workspace linked product decision; insertion authority is therefore evaluated against derived lineage. |
| SQL array helper accepted `NULL` elements | The immutable helper explicitly rejects `item is null` before the minimum-length check; the security contract binds that behavior. |
| Build and dev silently alternated tracked `next-env.d.ts` imports | The generated Next.js file is removed from Git and ignored; `npm run typecheck` first runs `next typegen`, so fresh-clone type generation is explicit while build/dev cannot mutate tracked source. |
| Public docs still said eight tables | README, architecture, and security documentation now state the normalized nine-table contract. |

These corrections require another fresh distinct review; the green CI run at the reviewed SHA does not supersede `REVISE`.

## Fifth distinct review

The fifth REVIEWER bound `REVISE` to `01003964655809b3531ec1dd022b34025b4e3fb8`. It confirmed every fourth-review correction, then replayed the exact approval request and substituted non-operator roles at the HTTP boundary.

| Finding | Corrective implementation after `0100396` |
| --- | --- |
| Identical approval replay minted a second usable one-time capability | Approval state is keyed by tenant and decision. The same idempotency key returns the exact original envelope/token; a different operation conflicts; after consumption, replay still returns only the consumed token and cannot reopen handoff. |
| Auditor or approver role with the operator actor ID could accept | Accepted handoff now requires `actor.role === "operator"`; role substitution returns typed `403` before capability lookup and cannot consume it. |

Unit and real HTTP E2E controls cover same-key idempotency, different-key conflict, non-operator substitution, exact acceptance, same-token replay, and approval-after-consumption replay. Fresh exact-head review remains required.
