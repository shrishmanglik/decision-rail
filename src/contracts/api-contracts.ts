import { z } from "zod";

const identifier = z.string().trim().min(3).max(80);
const digest = z.string().regex(/^[a-f0-9]{64}$/);

export const apiContextSchema = z.object({
  tenantId: identifier,
  actorId: identifier,
  role: z.enum(["builder", "researcher", "approver", "operator", "auditor"]),
  operationKey: identifier.optional(),
});

export const customerEvidenceCreateSchema = z.object({
  sourceClass: z.enum(["INTERVIEW", "OBSERVATION", "OPERATIONAL_RECORD", "SYNTHETIC_FIXTURE"]),
  capturedAt: z.string().datetime(),
  consentScope: z.array(z.enum(["SYNTHESIS", "EXPERIMENT", "EXPORT"])).min(1),
  sha256: digest,
  redactionState: z.enum(["REDACTED", "NOT_REQUIRED"]),
  participantPseudonym: identifier.optional(),
});

export const opportunityCreateSchema = z.object({
  segmentId: identifier,
  problem: z.string().min(20),
  currentWorkaround: z.string().min(10),
  evidenceIds: z.array(identifier).min(1),
  baseline: z.string().min(10),
  ownerId: identifier,
  nonGoals: z.array(z.string().min(3)).min(1),
  expiresAt: z.string().datetime(),
});

export const experimentRunRequestSchema = z.object({
  opportunityVersion: z.number().int().positive(),
  prototypeDigest: digest,
  fixtureSetDigest: digest,
  cohortRule: z.string().min(10),
  primaryMetric: z.string().min(10),
  guardrails: z.array(z.string().min(3)).min(1),
  decisionRule: z.string().min(10),
  stopConditions: z.array(z.string().min(3)).min(1),
});

export const productDecisionApprovalSchema = z.object({
  experimentId: identifier,
  decision: z.enum(["KILL", "PARK", "ITERATE", "DELIVER"]),
  evidenceDigest: digest,
  builderId: identifier,
  experimentOperatorId: identifier,
  reason: z.string().min(20),
  rollback: z.string().min(10),
});

export type ApiContext = z.infer<typeof apiContextSchema>;

export type ApiResult<T> =
  | { ok: true; status: number; data: T; receiptId: string; externalMutation: false; synthetic: true }
  | { ok: false; status: number; error: { code: string; retryable: boolean; message: string }; externalMutation: false };
