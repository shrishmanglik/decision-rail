import { canonicalIssueCodes, controlFixtureSchema, type ControlFixture, type ControlReceipt, type Detector, type RequirementId } from "@/src/domain/control-types";
import { sha256 } from "@/src/domain/digest";
import { detectorRegistry } from "@/src/detectors/registry";

export type DetectorRegistry = Partial<Record<RequirementId, Detector>>;

export function evaluateControl(
  input: ControlFixture,
  registry: DetectorRegistry = detectorRegistry,
): ControlReceipt {
  const fixture = controlFixtureSchema.parse(input);
  const detector = registry[fixture.requirementId];
  if (!detector) {
    return {
      receiptVersion: "ProductControlDecision.v1",
      requirementId: fixture.requirementId,
      detectorId: fixture.detectorId,
      decision: "INDETERMINATE",
      issueCode: "DETECTOR_UNAVAILABLE",
      ruleVersion: "unknown",
      missingFacts: [],
      evidenceDigest: sha256({ fixture, decision: "INDETERMINATE", issueCode: "DETECTOR_UNAVAILABLE" }),
      externalMutation: false,
    };
  }

  const evaluation = detector.evaluate(fixture.evidence);
  const missingFacts = evaluation.missingEvidence;
  const decision = evaluation.passed ? "PASS" as const : "REJECT" as const;
  const issueCode = decision === "REJECT" ? detector.issueCode : null;
  const receiptBase = {
    receiptVersion: "ProductControlDecision.v1" as const,
    requirementId: fixture.requirementId,
    detectorId: detector.id,
    decision,
    issueCode,
    ruleVersion: detector.ruleVersion,
    missingFacts,
    externalMutation: false as const,
  };
  return { ...receiptBase, evidenceDigest: sha256({ fixture, ...receiptBase }) };
}

export type AcceptanceVerification = {
  passed: boolean;
  receipts: ControlReceipt[];
  failures: string[];
  normalizedDigest: string;
};

export function verifyAcceptanceSuite(
  fixtures: ControlFixture[],
  registry: DetectorRegistry = detectorRegistry,
): AcceptanceVerification {
  const receipts = fixtures.map((fixture) => evaluateControl(fixture, registry));
  const failures = receipts.flatMap((receipt, index) => {
    const fixture = fixtures[index];
    const expected = fixture.controlKind === "NEGATIVE" ? "REJECT" : "PASS";
    if (receipt.decision !== expected) {
      return [`${fixture.requirementId}:${fixture.controlKind}:expected-${expected}:received-${receipt.decision}`];
    }
    const expectedIssueCode = canonicalIssueCodes[fixture.requirementId];
    if (expected === "REJECT" && receipt.issueCode !== expectedIssueCode) {
      return [`${fixture.requirementId}:expected-issue-${expectedIssueCode}:received-${receipt.issueCode}`];
    }
    return [];
  });
  return {
    passed: failures.length === 0,
    receipts,
    failures,
    normalizedDigest: sha256(receipts),
  };
}
