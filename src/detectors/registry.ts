import type { Detector, RequirementId } from "@/src/domain/control-types";

const definitions: Array<[RequirementId, string, readonly string[]]> = [
  ["CV-R1", "CUSTOMER_EVIDENCE_UNBOUND", ["sourceClass", "pseudonym", "capturedAt", "consentScope", "immutableDigest", "redactionState"]],
  ["CV-R2", "OPPORTUNITY_SCOPE_INVALID", ["segment", "problemBoundary", "currentWorkaround", "baseline", "owner", "nonGoals", "expiry", "sourceEvidence"]],
  ["CV-R3", "SYNTHESIS_PROVENANCE_MISSING", ["sourceLinks", "sampleBoundary", "dissent", "confidence", "unresolvedQuestions"]],
  ["CV-R4", "EXPERIMENT_CONTRACT_INCOMPLETE", ["hypothesis", "cohort", "baseline", "treatment", "primaryMetric", "guardrails", "sampleRule", "decisionRule", "stopConditions"]],
  ["CV-R5", "PROTOTYPE_VERSION_UNBOUND", ["designDigest", "buildDigest", "promptDigest", "modelDigest", "dataDigest", "featureFlags", "fixtureDigest"]],
  ["CV-R6", "AI_AUTHORITY_EXCEEDED", ["citedInputs", "deterministicValidation", "humanApprover", "consequentialWriteBlocked"]],
  ["CV-R7", "DECISION_GATE_INCOMPLETE", ["inputs", "weights", "assumptions", "opportunityCost", "owner", "dissent", "reversibility", "approval"]],
  ["CV-R8", "DELIVERY_CONTRACT_UNRESOLVED", ["requirements", "acceptanceFixtures", "dependencies", "releaseAuthority", "observability", "rollback", "receivingOwner"]],
  ["CV-R9", "OUTCOME_LINEAGE_BROKEN", ["subject", "cohort", "treatmentVersion", "exposureTime", "eventSchema", "denominator", "observationWindow"]],
  ["CV-R10", "FAILURE_NOT_PROMOTED", ["redactedFixture", "detector", "owner", "preFixFailure", "postFixPass", "mutationProof"]],
  ["CV-R11", "DATA_POLICY_VIOLATION", ["classification", "consent", "minimization", "redaction", "tenantIsolation", "retention", "deletion", "exportPolicy"]],
  ["CV-R12", "HANDOFF_ECONOMICS_UNPROVEN", ["nonBuilderOperation", "recovery", "buyerAcceptance", "deliveryCost", "paymentAuthority", "repeatDecision"]],
];

export const detectorRegistry = Object.fromEntries(
  definitions.map(([requirementId, issueCode, requiredFacts]) => [requirementId, {
    id: `DET-${requirementId}`,
    requirementId,
    issueCode,
    ruleVersion: "1.0.0",
    requiredFacts,
  } satisfies Detector]),
) as Record<RequirementId, Detector>;
