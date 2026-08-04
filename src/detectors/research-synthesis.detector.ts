import { z } from "zod";
import { createDetector } from "./factory";

export const researchSynthesisDetector = createDetector("CV-R3", "SYNTHESIS_PROVENANCE_MISSING", z.object({
  sourceEvidenceIds: z.array(z.string().min(3)).min(1),
  sampleBoundary: z.string().min(10),
  counterEvidence: z.array(z.string().min(3)).min(1),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  unresolvedQuestions: z.array(z.string().min(3)).min(1),
}).strict());
