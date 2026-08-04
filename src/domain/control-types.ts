import { z } from "zod";

export const requirementIds = [
  "CV-R1", "CV-R2", "CV-R3", "CV-R4", "CV-R5", "CV-R6",
  "CV-R7", "CV-R8", "CV-R9", "CV-R10", "CV-R11", "CV-R12",
] as const;

export type RequirementId = (typeof requirementIds)[number];
export type Decision = "PASS" | "REJECT" | "INDETERMINATE";

export const canonicalIssueCodes: Record<RequirementId, string> = {
  "CV-R1": "CUSTOMER_EVIDENCE_UNBOUND",
  "CV-R2": "OPPORTUNITY_SCOPE_INVALID",
  "CV-R3": "SYNTHESIS_PROVENANCE_MISSING",
  "CV-R4": "EXPERIMENT_CONTRACT_INCOMPLETE",
  "CV-R5": "PROTOTYPE_VERSION_UNBOUND",
  "CV-R6": "AI_AUTHORITY_EXCEEDED",
  "CV-R7": "DECISION_GATE_INCOMPLETE",
  "CV-R8": "DELIVERY_CONTRACT_UNRESOLVED",
  "CV-R9": "OUTCOME_LINEAGE_BROKEN",
  "CV-R10": "FAILURE_NOT_PROMOTED",
  "CV-R11": "DATA_POLICY_VIOLATION",
  "CV-R12": "HANDOFF_ECONOMICS_UNPROVEN",
};

export const controlFixtureSchema = z.object({
  schemaVersion: z.literal("v1"),
  requirementId: z.enum(requirementIds),
  detectorId: z.string().regex(/^DET-CV-R\d+$/),
  detectorInputContract: z.string().min(3),
  productArea: z.literal("bounded-product-decision"),
  tenantId: z.literal("fixture-tenant"),
  controlKind: z.enum(["NEGATIVE", "POSITIVE"]),
  scenario: z.string().min(10),
  fixtureIndex: z.number().int().min(1).max(12),
  evidence: z.record(z.string(), z.unknown()),
});

export type ControlFixture = z.infer<typeof controlFixtureSchema>;

export type Detector = {
  id: `DET-${RequirementId}`;
  requirementId: RequirementId;
  issueCode: string;
  ruleVersion: "1.0.0";
  evaluate: (evidence: Record<string, unknown>) => DetectorEvaluation;
};

export type DetectorEvaluation = {
  passed: boolean;
  missingEvidence: string[];
};

export type ControlReceipt = {
  receiptVersion: "ProductControlDecision.v1";
  requirementId: RequirementId;
  detectorId: string;
  decision: Decision;
  issueCode: string | null;
  ruleVersion: string;
  missingFacts: string[];
  evidenceDigest: string;
  externalMutation: false;
};
