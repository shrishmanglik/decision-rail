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
| Standalone handoff GET returned `ACCEPTED` | Exact decision approval now emits a tamper-evident continuation proof bound to tenant, builder, operator, approver, evidence digest, decision receipt, and recovery receipt; standalone GET returns typed `409` |
| Membership/workspace policies recursively queried each other | Automatic creator-membership trigger plus bounded empty-search-path role helpers remove direct policy-table recursion |
| Downstream IDs were not tenant-bound | Composite same-workspace foreign keys bind opportunity → experiment → decision → handoff |
| Decision SQL trusted caller builder identity | Experiment records builder/operator roles and a decision trigger derives both lineage fields before policy evaluation |
| Persistence consent/source constraints were weaker | Source enum, non-empty bounded consent scope, pseudonym length, and verified-redaction compatibility are SQL checks; sandbox intake accepts synthetic source only |
| Malformed JSON and route IDs could escape as HTTP 500 | All mutation routes parse JSON through a typed `400` boundary; dynamic identifiers and versions validate before domain parsing |

A third distinct review remains required. No prior `REVISE` is converted into approval by this builder trace.
