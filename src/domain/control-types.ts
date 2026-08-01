import { z } from "zod";

export const requirementIds = [
  "CV-R1", "CV-R2", "CV-R3", "CV-R4", "CV-R5", "CV-R6",
  "CV-R7", "CV-R8", "CV-R9", "CV-R10", "CV-R11", "CV-R12",
] as const;

export type RequirementId = (typeof requirementIds)[number];
export type Decision = "PASS" | "REJECT" | "INDETERMINATE";

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
  facts: z.record(z.string(), z.boolean()),
});

export type ControlFixture = z.infer<typeof controlFixtureSchema>;

export type Detector = {
  id: `DET-${RequirementId}`;
  requirementId: RequirementId;
  issueCode: string;
  ruleVersion: "1.0.0";
  requiredFacts: readonly string[];
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
