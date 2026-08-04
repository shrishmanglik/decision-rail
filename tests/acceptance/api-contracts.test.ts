import { describe, expect, it } from "vitest";
import {
  approveProductDecision, captureCustomerEvidence, createOpportunity,
  getHandoffBundle, queueExperiment,
} from "@/src/application/sandbox-api-service";
import { runSyntheticWorkspace } from "@/src/application/workspace-service";
import { controlFixtureSchema } from "@/src/domain/control-types";
import fixturesJson from "@/tests/fixtures/controls.json";

const digest = "a".repeat(64);
const authoritativeWorkspace = runSyntheticWorkspace(fixturesJson.map((fixture) => controlFixtureSchema.parse(fixture)));
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
    const unsupported = captureCustomerEvidence(context("researcher", "researcher-local", "operation-real-source"), {
      sourceClass: "INTERVIEW", capturedAt: "2026-08-01T12:00:00.000Z",
      consentScope: ["SYNTHESIS"], sha256: digest, redactionState: "NOT_REQUIRED",
    });
    expect(unsupported).toMatchObject({ ok: false, status: 400, error: { code: "EVIDENCE_SCHEMA_INVALID" } });
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
      builderId: "builder-local-demo", opportunityVersion: 1, prototypeDigest: digest, fixtureSetDigest: digest,
      cohortRule: "Synthetic fixtures only.", primaryMetric: "All controls have their declared decision.",
      guardrails: ["No external mutation"], decisionRule: "Continue only when every control passes.",
      stopConditions: ["Any detector unavailable"],
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
  });

  it("rejects self-approval and accepts distinct approver authority", () => {
    const body = {
      experimentId: "experiment-synthetic-001", decision: "DELIVER", evidenceDigest: authoritativeWorkspace.controlDigest,
      builderId: "builder-local-demo", experimentOperatorId: "operator-local",
      recoveryReceiptId: authoritativeWorkspace.recoveryReceiptId,
      reason: "All synthetic controls passed with no external mutation.",
      rollback: "Revert to the last accepted fixture digest.",
    };
    const rejected = approveProductDecision(context("approver", "builder-local-demo"), "decision-synthetic-001", body);
    expect(rejected).toMatchObject({ ok: false, status: 403, error: { code: "PRODUCT_DECISION_SEGREGATION_FAILED" } });
    const accepted = approveProductDecision(context("approver", "reviewer-local"), "decision-synthetic-001", body);
    expect(accepted).toMatchObject({ ok: true, status: 200, externalMutation: false });
    if (!accepted.ok) throw new Error("Expected distinct approval to pass");

    const standalone = getHandoffBundle(context("operator", "operator-local"), "handoff-synthetic-001", 1);
    expect(standalone).toMatchObject({ ok: false, status: 409, error: { code: "HANDOFF_PREREQUISITES_UNRESOLVED" } });

    const forged = `${accepted.data.handoffProof.slice(0, -1)}${accepted.data.handoffProof.endsWith("0") ? "1" : "0"}`;
    expect(getHandoffBundle(context("operator", "operator-local"), "handoff-synthetic-001", 1, forged))
      .toMatchObject({ ok: false, status: 409, error: { code: "HANDOFF_PREREQUISITES_UNRESOLVED" } });

    const handoff = getHandoffBundle(context("operator", "operator-local"), "handoff-synthetic-001", 1, accepted.data.handoffProof);
    expect(handoff.ok).toBe(true);
    if (handoff.ok) expect(handoff.data).toMatchObject({ status: "ACCEPTED", recoveryStatus: "PASSED", synthetic: true });
    expect(getHandoffBundle(context("operator", "operator-local"), "handoff-synthetic-001", 1, accepted.data.handoffProof))
      .toMatchObject({ ok: false, status: 409, error: { code: "HANDOFF_PREREQUISITES_UNRESOLVED" } });
  });

  it("never returns accepted handoff to the builder even with a missing proof", () => {
    const builder = getHandoffBundle(context("operator", "builder-local-demo"), "handoff-synthetic-001", 1);
    expect(builder).toMatchObject({ ok: false, status: 403, error: { code: "HANDOFF_INDEPENDENCE_UNPROVEN" } });
  });

  it("rejects approval when evidence, recovery, identity, or decision lineage differs from the authoritative run", () => {
    const canonical = {
      experimentId: "experiment-synthetic-001", decision: "DELIVER", evidenceDigest: authoritativeWorkspace.controlDigest,
      builderId: "builder-local-demo", experimentOperatorId: "operator-local",
      recoveryReceiptId: authoritativeWorkspace.recoveryReceiptId,
      reason: "All synthetic controls passed with no external mutation.",
      rollback: "Revert to the last accepted fixture digest.",
    };
    for (const mutation of [
      { evidenceDigest: "b".repeat(64) },
      { recoveryReceiptId: "recovery-forged-001" },
      { experimentId: "experiment-forged-001" },
      { builderId: "builder-forged" },
      { experimentOperatorId: "operator-forged" },
    ]) {
      const result = approveProductDecision(
        context("approver", "reviewer-local"),
        "decision-synthetic-001",
        { ...canonical, ...mutation },
      );
      expect(result).toMatchObject({ ok: false, status: 409, error: { code: "PRODUCT_DECISION_PREREQUISITES_UNRESOLVED" } });
    }
  });
});
