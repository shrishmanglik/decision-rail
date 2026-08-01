import { z } from "zod";

const digest = z.string().regex(/^[a-f0-9]{64}$/);
const identifier = z.string().min(3).max(80);

export const customerEvidenceSchema = z.object({
  schemaVersion: z.literal("CustomerEvidence.v1"),
  tenantId: identifier,
  evidenceId: identifier,
  sourceClass: z.enum(["INTERVIEW", "OBSERVATION", "OPERATIONAL_RECORD", "SYNTHETIC_FIXTURE"]),
  participantPseudonym: identifier,
  capturedAt: z.string().datetime(),
  consentScope: z.array(z.enum(["SYNTHESIS", "EXPERIMENT", "EXPORT"])).min(1),
  sha256: digest,
  redactionState: z.enum(["REDACTED", "NOT_REQUIRED"]),
  status: z.enum(["CAPTURED", "VERIFIED", "REJECTED", "SUPERSEDED"]),
});

export const opportunitySchema = z.object({
  schemaVersion: z.literal("OpportunityContract.v1"),
  tenantId: identifier,
  opportunityId: identifier,
  segmentId: identifier,
  problem: z.string().min(20),
  currentWorkaround: z.string().min(10),
  evidenceIds: z.array(identifier).min(1),
  baseline: z.string().min(10),
  ownerId: identifier,
  nonGoals: z.array(z.string().min(3)).min(1),
  expiresAt: z.string().datetime(),
  status: z.enum(["DRAFT", "REVIEW", "APPROVED", "REJECTED", "PARKED"]),
});

export const experimentSchema = z.object({
  schemaVersion: z.literal("ExperimentRun.v1"),
  tenantId: identifier,
  experimentId: identifier,
  opportunityVersion: z.literal(1),
  prototypeDigest: digest,
  fixtureSetDigest: digest,
  cohortRule: z.string().min(10),
  primaryMetric: z.string().min(10),
  guardrails: z.array(z.string().min(3)).min(1),
  decisionRule: z.string().min(10),
  stopConditions: z.array(z.string().min(3)).min(1),
  status: z.enum(["DRAFT", "APPROVED", "RUNNING", "PASSED", "FAILED", "INDETERMINATE", "STOPPED"]),
});

export const decisionSchema = z.object({
  schemaVersion: z.literal("ProductDecision.v1"),
  tenantId: identifier,
  decisionId: identifier,
  experimentId: identifier,
  decision: z.enum(["KILL", "PARK", "ITERATE", "DELIVER"]),
  evidenceDigest: digest,
  approverId: identifier,
  builderId: identifier,
  reason: z.string().min(20),
  rollback: z.string().min(10),
  createdAt: z.string().datetime(),
}).superRefine((value, context) => {
  if (value.approverId === value.builderId) {
    context.addIssue({ code: "custom", message: "Approver must be independent from builder", path: ["approverId"] });
  }
});

export type CustomerEvidence = z.infer<typeof customerEvidenceSchema>;
export type OpportunityContract = z.infer<typeof opportunitySchema>;
export type ExperimentRun = z.infer<typeof experimentSchema>;
export type ProductDecision = z.infer<typeof decisionSchema>;
