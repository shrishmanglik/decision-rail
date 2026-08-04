import { describe, expect, it } from "vitest";
import {
  approveProductDecision, captureCustomerEvidence, createOpportunity,
  getHandoffBundle, queueExperiment,
} from "@/src/application/sandbox-api-service";

const digest = "a".repeat(64);
const context = (role: string, actorId: string, operationKey = "operation-synthetic-001") => ({
  tenantId: "fixture-tenant", actorId, role, operationKey,
});

describe("five sandbox API contracts", () => {
  it("captures typed customer evidence with a durable deterministic receipt shape", () => {
    const result = captureCustomerEvidence(context("researcher", "researcher-local"), {
      sourceClass: "SYNTHETIC_FIXTURE", capturedAt: "2026-08-01T12:00:00.000Z",
      consentScope: ["SYNTHESIS"], sha256: digest, redactionState: "NOT_REQUIRED",
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(201);
    expect(result.externalMutation).toBe(false);
  });

  it("creates a bounded opportunity only for builder authority", () => {
    const result = createOpportunity(context("builder", "builder-local-demo"), {
      segmentId: "synthetic-segment", problem: "Synthetic evidence cannot be replayed independently.",
      currentWorkaround: "Manual reconciliation only.", evidenceIds: ["synthetic-evidence-1"],
      baseline: "UNKNOWN external baseline.", ownerId: "builder-local-demo",
      nonGoals: ["No production write"], expiresAt: "2026-08-31T23:59:59.000Z",
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(201);
  });

  it("queues an exact sandbox experiment without an external mutation", () => {
    const result = queueExperiment(context("operator", "operator-local"), "experiment-synthetic-001", {
      opportunityVersion: 1, prototypeDigest: digest, fixtureSetDigest: digest,
      cohortRule: "Synthetic fixtures only.", primaryMetric: "All controls have their declared decision.",
      guardrails: ["No external mutation"], decisionRule: "Continue only when every control passes.",
      stopConditions: ["Any detector unavailable"],
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
  });

  it("rejects self-approval and accepts distinct approver authority", () => {
    const body = {
      experimentId: "experiment-synthetic-001", decision: "DELIVER", evidenceDigest: digest,
      builderId: "builder-local-demo", experimentOperatorId: "operator-local",
      reason: "All synthetic controls passed with no external mutation.",
      rollback: "Revert to the last accepted fixture digest.",
    };
    const rejected = approveProductDecision(context("approver", "builder-local-demo"), "decision-synthetic-001", body);
    expect(rejected).toMatchObject({ ok: false, status: 403, error: { code: "PRODUCT_DECISION_SEGREGATION_FAILED" } });
    const accepted = approveProductDecision(context("approver", "reviewer-local"), "decision-synthetic-001", body);
    expect(accepted).toMatchObject({ ok: true, status: 200, externalMutation: false });
  });

  it("returns an accepted exact-version bundle only to a non-builder receiving role", () => {
    const result = getHandoffBundle(context("operator", "operator-local"), "handoff-synthetic-001", 1);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toMatchObject({ status: "ACCEPTED", recoveryStatus: "PASSED", synthetic: true });
    const builder = getHandoffBundle(context("operator", "builder-local-demo"), "handoff-synthetic-001", 1);
    expect(builder).toMatchObject({ ok: false, status: 403, error: { code: "HANDOFF_INDEPENDENCE_UNPROVEN" } });
  });
});
