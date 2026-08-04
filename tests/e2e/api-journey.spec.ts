import { expect, test } from "@playwright/test";

const digest = "a".repeat(64);
const headers = (role: string, actor: string, operation: string) => ({
  "x-decisionrail-tenant-id": "fixture-tenant",
  "x-decisionrail-actor-id": actor,
  "x-decisionrail-role": role,
  "idempotency-key": operation,
});

test("runs the five sandbox API boundaries through accepted handoff", async ({ request }) => {
  const evidence = await request.post("/api/v1/customer-evidence", {
    headers: headers("researcher", "researcher-local", "op-evidence-001"),
    data: { sourceClass: "SYNTHETIC_FIXTURE", capturedAt: "2026-08-01T12:00:00.000Z", consentScope: ["SYNTHESIS"], sha256: digest, redactionState: "NOT_REQUIRED" },
  });
  expect(evidence.status()).toBe(201);

  const opportunity = await request.post("/api/v1/opportunities", {
    headers: headers("builder", "builder-local-demo", "op-opportunity-001"),
    data: { segmentId: "synthetic-segment", problem: "Synthetic evidence cannot be replayed independently.", currentWorkaround: "Manual reconciliation only.", evidenceIds: ["synthetic-evidence-1"], baseline: "UNKNOWN external baseline.", ownerId: "builder-local-demo", nonGoals: ["No production write"], expiresAt: "2026-08-31T23:59:59.000Z" },
  });
  expect(opportunity.status()).toBe(201);

  const experiment = await request.post("/api/v1/experiments/experiment-synthetic-001/runs", {
    headers: headers("operator", "operator-local", "op-experiment-001"),
    data: { opportunityVersion: 1, prototypeDigest: digest, fixtureSetDigest: digest, cohortRule: "Synthetic fixtures only.", primaryMetric: "All controls have their declared decision.", guardrails: ["No external mutation"], decisionRule: "Continue only when every control passes.", stopConditions: ["Any detector unavailable"] },
  });
  expect(experiment.status()).toBe(202);

  const decision = await request.post("/api/v1/product-decisions/decision-synthetic-001/approve", {
    headers: headers("approver", "reviewer-local", "op-decision-001"),
    data: { experimentId: "experiment-synthetic-001", decision: "DELIVER", evidenceDigest: digest, builderId: "builder-local-demo", experimentOperatorId: "operator-local", reason: "All synthetic controls passed with no external mutation.", rollback: "Revert to the last accepted fixture digest." },
  });
  expect(decision.status()).toBe(200);

  const handoff = await request.get("/api/v1/handoff-bundles/handoff-synthetic-001?version=1", {
    headers: headers("operator", "operator-local", "op-handoff-001"),
  });
  expect(handoff.status()).toBe(200);
  expect(await handoff.json()).toMatchObject({ ok: true, data: { status: "ACCEPTED", recoveryStatus: "PASSED", synthetic: true }, externalMutation: false });
});
