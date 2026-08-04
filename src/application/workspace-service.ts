import type { ControlFixture, ControlReceipt } from "@/src/domain/control-types";
import { sha256 } from "@/src/domain/digest";
import { customerEvidenceSchema, experimentSchema, opportunitySchema } from "@/src/domain/workspace-contracts";
import { verifyAcceptanceSuite } from "@/src/application/control-service";

export type WorkspaceRunReceipt = {
  receiptVersion: "DecisionRailWorkspaceRun.v1";
  state: "READY_FOR_HUMAN_DECISION" | "BLOCKED";
  synthetic: true;
  externalMutation: false;
  controls: ControlReceipt[];
  controlDigest: string;
  evidenceDigest: string;
  opportunityDigest: string;
  experimentDigest: string;
  failures: string[];
  builderId: string;
};

export function runSyntheticWorkspace(fixtures: ControlFixture[]): WorkspaceRunReceipt {
  const evidence = customerEvidenceSchema.parse({
    schemaVersion: "CustomerEvidence.v1",
    tenantId: "fixture-tenant",
    evidenceId: "evidence-synthetic-001",
    sourceClass: "SYNTHETIC_FIXTURE",
    participantPseudonym: "participant-synthetic-a",
    capturedAt: "2026-08-01T12:00:00.000Z",
    consentScope: ["SYNTHESIS", "EXPERIMENT"],
    sha256: sha256("Synthetic redacted product-workflow observation"),
    redactionState: "NOT_REQUIRED",
    status: "VERIFIED",
  });
  const opportunity = opportunitySchema.parse({
    schemaVersion: "OpportunityContract.v1",
    tenantId: "fixture-tenant",
    opportunityId: "opportunity-synthetic-001",
    segmentId: "segment-product-operators",
    problem: "Decision evidence is split across tools and cannot be replayed independently.",
    currentWorkaround: "Operators reconcile documents and tickets manually.",
    evidenceIds: [evidence.evidenceId],
    baseline: "No authenticated external baseline; synthetic workflow proof only.",
    ownerId: "builder-local-demo",
    nonGoals: ["No production write", "No validated demand claim"],
    expiresAt: "2026-08-31T23:59:59.000Z",
    status: "REVIEW",
  });
  const experiment = experimentSchema.parse({
    schemaVersion: "ExperimentRun.v1",
    tenantId: "fixture-tenant",
    experimentId: "experiment-synthetic-001",
    opportunityVersion: 1,
    prototypeDigest: sha256("decision-rail-local-prototype-v1"),
    fixtureSetDigest: sha256(fixtures),
    cohortRule: "Synthetic fixture tenant only; no external participants.",
    primaryMetric: "All 12 P0 controls reject bad input and pass clean input.",
    guardrails: ["No external mutation", "No invented evidence", "Independent human approval required"],
    decisionRule: "Ready only when all 24 controls pass and repeat digests match.",
    stopConditions: ["Any detector unavailable", "Any false success", "Any digest drift"],
    status: "APPROVED",
  });
  const suite = verifyAcceptanceSuite(fixtures);
  return {
    receiptVersion: "DecisionRailWorkspaceRun.v1",
    state: suite.passed ? "READY_FOR_HUMAN_DECISION" : "BLOCKED",
    synthetic: true,
    externalMutation: false,
    controls: suite.receipts,
    controlDigest: suite.normalizedDigest,
    evidenceDigest: sha256(evidence),
    opportunityDigest: sha256(opportunity),
    experimentDigest: sha256(experiment),
    failures: suite.failures,
    builderId: opportunity.ownerId,
  };
}
