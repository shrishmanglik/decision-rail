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
import { controlFixtureSchema } from "@/src/domain/control-types";
import { runSyntheticWorkspace } from "@/src/application/workspace-service";
import fixturesJson from "@/tests/fixtures/controls.json";
import { randomBytes } from "node:crypto";
import { z } from "zod";

const routeIdentifierSchema = z.string().trim().min(3).max(80);

function denied<T>(code: string, message: string): ApiResult<T> {
  return { ok: false, status: 403, error: { code, retryable: false, message }, externalMutation: false };
}

function invalid<T>(code: string, message: string): ApiResult<T> {
  return { ok: false, status: 400, error: { code, retryable: false, message }, externalMutation: false };
}

function conflict<T>(code: string, message: string): ApiResult<T> {
  return { ok: false, status: 409, error: { code, retryable: false, message }, externalMutation: false };
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

const syntheticFixtures = fixturesJson.map((fixture) => controlFixtureSchema.parse(fixture));

const canonicalDecisionInput = {
  experimentId: "experiment-synthetic-001",
  decision: "DELIVER" as const,
  builderId: "builder-local-demo",
  experimentOperatorId: "operator-local",
  reason: "All synthetic controls passed with no external mutation.",
  rollback: "Revert to the last accepted fixture digest.",
};

function authoritativeSyntheticDecision() {
  const workspace = runSyntheticWorkspace(syntheticFixtures);
  return decisionSchema.parse({
    schemaVersion: "ProductDecision.v1",
    tenantId: "fixture-tenant",
    decisionId: "decision-synthetic-001",
    ...canonicalDecisionInput,
    evidenceDigest: workspace.controlDigest,
    approverId: "reviewer-local",
    recoveryReceiptId: workspace.recoveryReceiptId,
    createdAt: "2026-08-01T12:00:00.000Z",
  });
}

function authoritativeHandoffPrerequisite() {
  const decision = authoritativeSyntheticDecision();
  const decisionReceiptId = receiptId("canonical-synthetic-decision-v1", decision);
  const commitment = {
    schemaVersion: "DecisionRailHandoffPrerequisite.v1" as const,
    tenantId: decision.tenantId,
    decisionId: decision.decisionId,
    builderId: decision.builderId,
    operatorId: decision.experimentOperatorId,
    approverId: decision.approverId,
    evidenceDigest: decision.evidenceDigest,
    decisionReceiptId,
    recoveryReceiptId: decision.recoveryReceiptId,
    decisionDigest: sha256(decision),
  };
  return { decision, decisionReceiptId, commitment };
}

type HandoffCommitment = ReturnType<typeof authoritativeHandoffPrerequisite>["commitment"];
type ApprovalState = {
  operationKey: string;
  envelope: ApprovedDecisionEnvelope;
  receiptId: string;
};
const approvedHandoffCapabilities = new Map<string, HandoffCommitment>();
const approvalByDecision = new Map<string, ApprovalState>();

function issueHandoffCapability(commitment: HandoffCommitment) {
  const token = `drhp1_${randomBytes(32).toString("base64url")}`;
  approvedHandoffCapabilities.set(token, commitment);
  return token;
}

function matchesAuthoritativeDecision(input: z.infer<typeof productDecisionApprovalSchema>, actor: ApiContext, decisionId: string) {
  const expected = authoritativeSyntheticDecision();
  return actor.tenantId === expected.tenantId
    && actor.actorId.toLocaleLowerCase() === expected.approverId.toLocaleLowerCase()
    && decisionId === expected.decisionId
    && input.experimentId === expected.experimentId
    && input.decision === expected.decision
    && input.evidenceDigest === expected.evidenceDigest
    && input.builderId.toLocaleLowerCase() === expected.builderId.toLocaleLowerCase()
    && input.experimentOperatorId.toLocaleLowerCase() === expected.experimentOperatorId.toLocaleLowerCase()
    && input.recoveryReceiptId === expected.recoveryReceiptId
    && input.reason === expected.reason
    && input.rollback === expected.rollback;
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
  if (!matchesAuthoritativeDecision(parsed.data, actor, decisionId)) {
    return conflict("PRODUCT_DECISION_PREREQUISITES_UNRESOLVED", "Decision, evidence, recovery, actor, and fixture lineage must match the authoritative synthetic workspace run.");
  }
  const { decision, decisionReceiptId, commitment } = authoritativeHandoffPrerequisite();
  const decisionKey = `${decision.tenantId}:${decision.decisionId}`;
  const existing = approvalByDecision.get(decisionKey);
  if (existing) {
    if (existing.operationKey !== actor.operationKey) {
      return conflict("PRODUCT_DECISION_ALREADY_APPROVED", "The synthetic decision already has an immutable approval operation.");
    }
    return { ok: true, status: 200, data: existing.envelope, receiptId: existing.receiptId, externalMutation: false, synthetic: true };
  }
  const handoffProof = issueHandoffCapability(commitment);
  const envelope = { decision, handoffProof };
  approvalByDecision.set(decisionKey, { operationKey: actor.operationKey, envelope, receiptId: decisionReceiptId });
  return { ok: true, status: 200, data: envelope, receiptId: decisionReceiptId, externalMutation: false, synthetic: true };
}

export function getHandoffBundle(contextInput: unknown, bundleId: string, version: number, proofToken: string | null = null): ApiResult<HandoffBundle> {
  const actor = context(contextInput);
  if (!actor || actor.role !== "operator") return denied("HANDOFF_EXPORT_SCOPE_DENIED", "Receiving operator authority is required.");
  if (!routeIdentifierSchema.safeParse(bundleId).success || !Number.isInteger(version) || version < 1) return invalid("HANDOFF_QUERY_INVALID", "A valid bundle identifier and positive version are required.");
  if (actor.actorId.toLocaleLowerCase() === "builder-local-demo") return denied("HANDOFF_INDEPENDENCE_UNPROVEN", "Receiving operator must be distinct from builder.");
  if (bundleId !== "handoff-synthetic-001" || version !== 1) {
    return { ok: false, status: 404, error: { code: "HANDOFF_BUNDLE_VERSION_MISSING", retryable: false, message: "Exact synthetic bundle version not found." }, externalMutation: false };
  }
  const commitment = proofToken ? approvedHandoffCapabilities.get(proofToken) : null;
  if (!proofToken
    || !commitment
    || commitment.tenantId !== actor.tenantId
    || commitment.operatorId.toLocaleLowerCase() !== actor.actorId.toLocaleLowerCase()) {
    return conflict("HANDOFF_PREREQUISITES_UNRESOLVED", "Exact authoritative synthetic decision and recovery commitment is required.");
  }
  approvedHandoffCapabilities.delete(proofToken);
  const data = handoffBundleSchema.parse({
    schemaVersion: "HandoffBundle.v1", tenantId: actor.tenantId, bundleId, version,
    opportunityVersion: 1, decisionId: commitment.decisionId,
    receiptIds: [commitment.decisionReceiptId, commitment.recoveryReceiptId], builderId: commitment.builderId,
    operatorId: actor.actorId, recoveryPlan: "Restore the exact fixture digest and rerun all controls.",
    recoveryReceiptId: commitment.recoveryReceiptId, recoveryStatus: "PASSED",
    costLedgerDigest: sha256("synthetic-cost-ledger-no-commercial-claim"), status: "ACCEPTED", synthetic: true,
  });
  return success(200, data, `get-${bundleId}-v${version}`);
}
