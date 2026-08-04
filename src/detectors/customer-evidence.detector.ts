import { z } from "zod";
import { createDetector } from "./factory";

export const customerEvidenceDetector = createDetector("CV-R1", "CUSTOMER_EVIDENCE_UNBOUND", z.object({
  sourceClass: z.enum(["INTERVIEW", "OBSERVATION", "OPERATIONAL_RECORD", "SYNTHETIC_FIXTURE"]),
  participantPseudonym: z.string().min(3),
  capturedAt: z.string().datetime(),
  consentScope: z.array(z.enum(["SYNTHESIS", "EXPERIMENT", "EXPORT"])).min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  redactionState: z.enum(["REDACTED", "NOT_REQUIRED"]),
}).strict());
