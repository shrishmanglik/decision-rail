import type { Detector, RequirementId } from "@/src/domain/control-types";
import { customerEvidenceDetector } from "./customer-evidence.detector";
import { opportunityScopeDetector } from "./opportunity-scope.detector";
import { researchSynthesisDetector } from "./research-synthesis.detector";
import { experimentContractDetector } from "./experiment-contract.detector";
import { prototypeVersionDetector } from "./prototype-version.detector";
import { aiAuthorityDetector } from "./ai-authority.detector";
import { decisionGateDetector } from "./decision-gate.detector";
import { deliveryContractDetector } from "./delivery-contract.detector";
import { outcomeLineageDetector } from "./outcome-lineage.detector";
import { failureLearningDetector } from "./failure-learning.detector";
import { dataPolicyDetector } from "./data-policy.detector";
import { handoffEconomicsDetector } from "./handoff-economics.detector";

const detectors: Detector[] = [
  customerEvidenceDetector, opportunityScopeDetector, researchSynthesisDetector,
  experimentContractDetector, prototypeVersionDetector, aiAuthorityDetector,
  decisionGateDetector, deliveryContractDetector, outcomeLineageDetector,
  failureLearningDetector, dataPolicyDetector, handoffEconomicsDetector,
];

export const detectorRegistry = Object.fromEntries(
  detectors.map((detector) => [detector.requirementId, detector]),
) as Record<RequirementId, Detector>;
