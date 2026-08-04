import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

const digest = "a".repeat(64);
const headers = (role: string, actor: string, operation: string) => ({
  "x-decisionrail-tenant-id": "fixture-tenant",
  "x-decisionrail-actor-id": actor,
  "x-decisionrail-role": role,
  "idempotency-key": operation,
});

test("runs the five sandbox API boundaries through accepted handoff", async ({ request }) => {
  const workspace = await request.post("/api/workspace/run");
  expect(workspace.status()).toBe(200);
  const workspaceReceipt = await workspace.json();

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
    data: { builderId: "builder-local-demo", opportunityVersion: 1, prototypeDigest: digest, fixtureSetDigest: digest, cohortRule: "Synthetic fixtures only.", primaryMetric: "All controls have their declared decision.", guardrails: ["No external mutation"], decisionRule: "Continue only when every control passes.", stopConditions: ["Any detector unavailable"] },
  });
  expect(experiment.status()).toBe(202);

  const decision = await request.post("/api/v1/product-decisions/decision-synthetic-001/approve", {
    headers: headers("approver", "reviewer-local", "op-decision-001"),
    data: { experimentId: "experiment-synthetic-001", decision: "DELIVER", evidenceDigest: workspaceReceipt.controlDigest, builderId: "builder-local-demo", experimentOperatorId: "operator-local", recoveryReceiptId: workspaceReceipt.recoveryReceiptId, reason: "All synthetic controls passed with no external mutation.", rollback: "Revert to the last accepted fixture digest." },
  });
  expect(decision.status()).toBe(200);
  const decisionReceipt = await decision.json();

  const standalone = await request.get("/api/v1/handoff-bundles/handoff-synthetic-001?version=1", {
    headers: headers("operator", "operator-local", "op-handoff-standalone"),
  });
  expect(standalone.status()).toBe(409);

  const handoff = await request.get(`/api/v1/handoff-bundles/handoff-synthetic-001?version=1&proof=${encodeURIComponent(decisionReceipt.data.handoffProof)}`, {
    headers: headers("operator", "operator-local", "op-handoff-001"),
  });
  expect(handoff.status()).toBe(200);
  expect(await handoff.json()).toMatchObject({ ok: true, data: { status: "ACCEPTED", recoveryStatus: "PASSED", synthetic: true }, externalMutation: false });
});

test("returns typed 400 boundaries for malformed JSON and route identifiers", async ({ request }) => {
  const malformed = await request.fetch("/api/v1/customer-evidence", {
    method: "POST",
    headers: { ...headers("researcher", "researcher-local", "op-malformed-001"), "content-type": "application/json" },
    data: Buffer.from("{not-json", "utf8"),
  });
  expect(malformed.status()).toBe(400);
  expect(await malformed.json()).toMatchObject({ error: { code: "REQUEST_JSON_INVALID", retryable: false }, externalMutation: false });

  const invalidId = await request.post("/api/v1/experiments/x/runs", {
    headers: headers("operator", "operator-local", "op-invalid-id-001"),
    data: { builderId: "builder-local-demo", opportunityVersion: 1, prototypeDigest: digest, fixtureSetDigest: digest, cohortRule: "Synthetic fixtures only.", primaryMetric: "All controls have their declared decision.", guardrails: ["No external mutation"], decisionRule: "Continue only when every control passes.", stopConditions: ["Any detector unavailable"] },
  });
  expect(invalidId.status()).toBe(400);
  expect(await invalidId.json()).toMatchObject({ error: { code: "EXPERIMENT_SCHEMA_INVALID", retryable: false }, externalMutation: false });
});
