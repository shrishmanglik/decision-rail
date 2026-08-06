# DecisionRail — benchmark and differentiation

Reference set inspected 2026-08-06 (read-only, public documentation; text-level
observations, no vendor affiliation). Claim ceiling for this product remains
`SOTA_CANDIDATE`: this matrix records position, not superiority.

## Reference set

### 1. LaunchDarkly Release Pipelines

Source: <https://launchdarkly.com/docs/home/releases/release-pipelines> (accessed 2026-08-06).

Sequential release phases per flag with environment/audience targeting, optional
approval gates, and guarded rollouts to prevent regressions. Strengths: mature staged
progression model; phase status surfaced in a sidebar with API-queryable state.
Observed limits for our comparison: approval semantics are optional and lightly
specified in the public docs; evidence for *why* a phase may proceed is the rollout
metrics themselves, not a replayable evidence chain. Not copied: flag-centric IA;
enterprise-gated feature framing.

### 2. dbt Cloud Continuous Integration

Source: <https://docs.getdbt.com/docs/deploy/continuous-integration> (accessed 2026-08-06).

PR-triggered build-and-test in an ephemeral schema, with pass/fail status pushed to the
git provider and merge-blocking delegated to git-native approvals. Strengths: clean
binding of checks to a release decision point; ephemeral, recoverable test state; stale
runs auto-cancelled. Observed limits: human approval lives entirely outside the product
(git provider); the evidence trail is a CI log, not a typed, digest-bound receipt.
Not copied: deferral of the authority boundary to an external system.

### 3. GrowthBook experiment results

Source: <https://docs.growthbook.io/app/experiment-results> (accessed 2026-08-06).

Experiment evidence presented for ship/no-ship judgment: Bayesian/frequentist result
states (clear winner / clear loser / inconclusive), automated health guardrails (sample
ratio mismatch, pre-exposure bias, multiple exposures), and explicit human-judgment
entry points. Strengths: honest inconclusive state; statistical guardrails run
automatically; human judgment is named as the bridge from evidence to action.
Observed limits: the decision itself is unmodelled — no authority separation, no
recoverable handoff, no replay protection. Not copied: statistics-first IA that assumes
an analyst reader.

## Differentiated position

DecisionRail occupies the seam the three references leave open: the **decision itself as
a governed, replayable artifact**. Concretely, in the first three minutes a visitor sees:

1. a typed, digest-bound receipt for a complete control run (none of the three produce a
   canonical receipt an outsider can re-derive);
2. an in-product human authority gate with builder/approver/operator segregation and
   replay/forgery denial (LaunchDarkly makes approvals optional; dbt delegates them;
   GrowthBook stops at judgment entry points);
3. fail-closed detector semantics — a missing check blocks, it does not silently pass;
4. an explicit commercial truth boundary (UNKNOWN / HYPOTHESIS / IMPLEMENTED) rendered
   in the product surface itself.

## Flagship comparison

Compared against The AGI Studio flagship product surfaces for depth-of-workflow and
trust presentation (not visual cloning): DecisionRail matches the flagship bar of
"every claim carries a verification state" by rendering states in the UI and binding
them to receipts, and follows the same one-primary-CTA, no-fabricated-metrics
discipline. It is intentionally narrower: one vertical, one journey, no tenancy.

## Honest gaps against the references

- No staged multi-environment rollout model (LaunchDarkly's core strength).
- No git-provider integration or CI-status push (dbt's core strength).
- No statistical engine; fixtures are deterministic, not sampled experiments
  (GrowthBook's core strength). A future experiment adapter is a proposed design only.
