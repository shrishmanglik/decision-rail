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
  builderId: identifier,
  operatorId: identifier,
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
  experimentOperatorId: identifier,
  recoveryReceiptId: identifier,
  reason: z.string().min(20),
  rollback: z.string().min(10),
  createdAt: z.string().datetime(),
}).superRefine((value, context) => {
  if (value.approverId === value.builderId) {
    context.addIssue({ code: "custom", message: "Approver must be independent from builder", path: ["approverId"] });
  }
  if (value.approverId === value.experimentOperatorId) {
    context.addIssue({ code: "custom", message: "Approver must be independent from experiment operator", path: ["approverId"] });
  }
});

export const handoffBundleSchema = z.object({
  schemaVersion: z.literal("HandoffBundle.v1"),
  tenantId: identifier,
  bundleId: identifier,
  version: z.number().int().positive(),
  opportunityVersion: z.number().int().positive(),
  decisionId: identifier,
  receiptIds: z.array(identifier).min(1),
  builderId: identifier,
  operatorId: identifier,
  recoveryPlan: z.string().min(10),
  recoveryReceiptId: identifier,
  recoveryStatus: z.literal("PASSED"),
  costLedgerDigest: digest,
  status: z.literal("ACCEPTED"),
  synthetic: z.literal(true),
}).superRefine((value, context) => {
  if (value.operatorId.toLocaleLowerCase() === value.builderId.toLocaleLowerCase()) {
    context.addIssue({ code: "custom", message: "Receiving operator must be independent from builder", path: ["operatorId"] });
  }
});

export type CustomerEvidence = z.infer<typeof customerEvidenceSchema>;
export type OpportunityContract = z.infer<typeof opportunitySchema>;
export type ExperimentRun = z.infer<typeof experimentSchema>;
export type ProductDecision = z.infer<typeof decisionSchema>;
export type HandoffBundle = z.infer<typeof handoffBundleSchema>;
