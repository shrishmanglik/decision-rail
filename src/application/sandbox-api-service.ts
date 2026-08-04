import {
  apiContextSchema, customerEvidenceCreateSchema, experimentRunRequestSchema,
  opportunityCreateSchema, productDecisionApprovalSchema, type ApiContext, type ApiResult,
} from "@/src/contracts/api-contracts";
import { sha256 } from "@/src/domain/digest";
import {
  customerEvidenceSchema, decisionSchema, experimentSchema, handoffBundleSchema,
  opportunitySchema, type CustomerEvidence, type ExperimentRun, type HandoffBundle,
  type OpportunityContract, type ProductDecision,
} from "@/src/domain/workspace-contracts";
import { Buffer } from "node:buffer";
import { z } from "zod";

const routeIdentifierSchema = z.string().trim().min(3).max(80);

function denied<T>(code: string, message: string): ApiResult<T> {
  return { ok: false, status: 403, error: { code, retryable: false, message }, externalMutation: false };
}

function invalid<T>(code: string, message: string): ApiResult<T> {
  return { ok: false, status: 400, error: { code, retryable: false, message }, externalMutation: false };
}

function context(input: unknown): ApiContext | null {
  const parsed = apiContextSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

function receiptId(operationKey: string, data: unknown) {
  return `receipt-${sha256({ operationKey, data }).slice(0, 20)}`;
}

function success<T>(status: number, data: T, operationKey: string): ApiResult<T> {
  return { ok: true, status, data, receiptId: receiptId(operationKey, data), externalMutation: false, synthetic: true };
}

const handoffProofBaseSchema = z.object({
  schemaVersion: z.literal("DecisionRailHandoffPrerequisite.v1"),
  tenantId: z.string().min(3), decisionId: z.string().min(3), builderId: z.string().min(3),
  operatorId: z.string().min(3), approverId: z.string().min(3), evidenceDigest: z.string().regex(/^[a-f0-9]{64}$/),
  decisionReceiptId: z.string().startsWith("receipt-"), recoveryReceiptId: z.string().startsWith("recovery-"),
});
type HandoffProofBase = z.infer<typeof handoffProofBaseSchema>;
const handoffProofSchema = handoffProofBaseSchema.extend({ proofDigest: z.string().regex(/^[a-f0-9]{64}$/) });

function encodeHandoffProof(base: HandoffProofBase) {
  return Buffer.from(JSON.stringify({ ...base, proofDigest: sha256(base) }), "utf8").toString("base64url");
}

function decodeHandoffProof(token: string | null): HandoffProofBase | null {
  if (!token) return null;
  try {
    const parsed = handoffProofSchema.parse(JSON.parse(Buffer.from(token, "base64url").toString("utf8")));
    const { proofDigest, ...base } = parsed;
    return proofDigest === sha256(base) ? base : null;
  } catch {
    return null;
  }
}

export type ApprovedDecisionEnvelope = { decision: ProductDecision; handoffProof: string };

export function captureCustomerEvidence(contextInput: unknown, input: unknown): ApiResult<CustomerEvidence> {
  const actor = context(contextInput);
  if (!actor || !["researcher", "builder"].includes(actor.role)) return denied("EVIDENCE_CONSENT_DENIED", "Researcher or builder authority is required.");
  const parsed = customerEvidenceCreateSchema.safeParse(input);
  if (!parsed.success || !actor.operationKey) return invalid("EVIDENCE_SCHEMA_INVALID", "Evidence input and operation key are required.");
  const data = customerEvidenceSchema.parse({
    schemaVersion: "CustomerEvidence.v1", tenantId: actor.tenantId,
    evidenceId: `evidence-${sha256(parsed.data).slice(0, 16)}`, ...parsed.data,
    participantPseudonym: parsed.data.participantPseudonym ?? "synthetic-record",
    status: "VERIFIED",
  });
  return success(201, data, actor.operationKey);
}

export function createOpportunity(contextInput: unknown, input: unknown): ApiResult<OpportunityContract> {
  const actor = context(contextInput);
  if (!actor || actor.role !== "builder") return denied("OPPORTUNITY_EVIDENCE_FORBIDDEN", "Builder authority is required.");
  const parsed = opportunityCreateSchema.safeParse(input);
  if (!parsed.success || !actor.operationKey) return invalid("OPPORTUNITY_SCOPE_INVALID", "Opportunity input and operation key are required.");
  const data = opportunitySchema.parse({
    schemaVersion: "OpportunityContract.v1", tenantId: actor.tenantId,
    opportunityId: `opportunity-${sha256(parsed.data).slice(0, 16)}`, ...parsed.data, status: "REVIEW",
  });
  return success(201, data, actor.operationKey);
}

export function queueExperiment(contextInput: unknown, experimentId: string, input: unknown): ApiResult<ExperimentRun> {
  const actor = context(contextInput);
  if (!actor || !["builder", "operator"].includes(actor.role)) return denied("EXPERIMENT_SANDBOX_AUTHORITY_MISSING", "Sandbox operator authority is required.");
  const parsed = experimentRunRequestSchema.safeParse(input);
  if (!parsed.success || !actor.operationKey || !routeIdentifierSchema.safeParse(experimentId).success) return invalid("EXPERIMENT_SCHEMA_INVALID", "Experiment input, identifier, and operation key are required.");
  const data = experimentSchema.parse({
    schemaVersion: "ExperimentRun.v1", tenantId: actor.tenantId, experimentId,
    ...parsed.data, operatorId: actor.actorId, status: "APPROVED",
  });
  return success(202, data, actor.operationKey);
}

export function approveProductDecision(contextInput: unknown, decisionId: string, input: unknown): ApiResult<ApprovedDecisionEnvelope> {
  const actor = context(contextInput);
  if (!actor || actor.role !== "approver") return denied("PRODUCT_DECISION_SEGREGATION_FAILED", "Approver authority is required.");
  const parsed = productDecisionApprovalSchema.safeParse(input);
  if (!parsed.success || !actor.operationKey || !routeIdentifierSchema.safeParse(decisionId).success) return invalid("PRODUCT_DECISION_SCHEMA_INVALID", "Decision input, identifier, and operation key are required.");
  if ([parsed.data.builderId, parsed.data.experimentOperatorId].some((id) => id.toLocaleLowerCase() === actor.actorId.toLocaleLowerCase())) {
    return denied("PRODUCT_DECISION_SEGREGATION_FAILED", "Approver must be distinct from builder and experiment operator.");
  }
  const data = decisionSchema.parse({
    schemaVersion: "ProductDecision.v1", tenantId: actor.tenantId, decisionId,
    experimentId: parsed.data.experimentId, decision: parsed.data.decision,
    evidenceDigest: parsed.data.evidenceDigest, approverId: actor.actorId,
    builderId: parsed.data.builderId, experimentOperatorId: parsed.data.experimentOperatorId,
    recoveryReceiptId: parsed.data.recoveryReceiptId, reason: parsed.data.reason, rollback: parsed.data.rollback,
    createdAt: "2026-08-01T12:00:00.000Z",
  });
  const decisionReceiptId = receiptId(actor.operationKey, data);
  const handoffProof = encodeHandoffProof({
    schemaVersion: "DecisionRailHandoffPrerequisite.v1", tenantId: actor.tenantId,
    decisionId, builderId: data.builderId, operatorId: data.experimentOperatorId,
    approverId: data.approverId, evidenceDigest: data.evidenceDigest,
    decisionReceiptId, recoveryReceiptId: data.recoveryReceiptId,
  });
  return { ok: true, status: 200, data: { decision: data, handoffProof }, receiptId: decisionReceiptId, externalMutation: false, synthetic: true };
}

export function getHandoffBundle(contextInput: unknown, bundleId: string, version: number, proofToken: string | null = null): ApiResult<HandoffBundle> {
  const actor = context(contextInput);
  if (!actor || !["operator", "auditor", "approver"].includes(actor.role)) return denied("HANDOFF_EXPORT_SCOPE_DENIED", "Receiving operator, auditor, or approver authority is required.");
  if (!routeIdentifierSchema.safeParse(bundleId).success || !Number.isInteger(version) || version < 1) return invalid("HANDOFF_QUERY_INVALID", "A valid bundle identifier and positive version are required.");
  if (actor.actorId.toLocaleLowerCase() === "builder-local-demo") return denied("HANDOFF_INDEPENDENCE_UNPROVEN", "Receiving operator must be distinct from builder.");
  if (bundleId !== "handoff-synthetic-001" || version !== 1) {
    return { ok: false, status: 404, error: { code: "HANDOFF_BUNDLE_VERSION_MISSING", retryable: false, message: "Exact synthetic bundle version not found." }, externalMutation: false };
  }
  const proof = decodeHandoffProof(proofToken);
  if (!proof || proof.tenantId !== actor.tenantId || proof.operatorId.toLocaleLowerCase() !== actor.actorId.toLocaleLowerCase()) {
    return { ok: false, status: 409, error: { code: "HANDOFF_PREREQUISITES_UNRESOLVED", retryable: false, message: "Exact decision and recovery continuation proof is required." }, externalMutation: false };
  }
  const data = handoffBundleSchema.parse({
    schemaVersion: "HandoffBundle.v1", tenantId: actor.tenantId, bundleId, version,
    opportunityVersion: 1, decisionId: proof.decisionId,
    receiptIds: [proof.decisionReceiptId, proof.recoveryReceiptId], builderId: proof.builderId,
    operatorId: actor.actorId, recoveryPlan: "Restore the exact fixture digest and rerun all controls.",
    recoveryReceiptId: proof.recoveryReceiptId, recoveryStatus: "PASSED",
    costLedgerDigest: sha256("synthetic-cost-ledger-no-commercial-claim"), status: "ACCEPTED", synthetic: true,
  });
  return success(200, data, `get-${bundleId}-v${version}`);
}
