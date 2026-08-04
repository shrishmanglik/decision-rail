import { z } from "zod";
import { createDetector } from "./factory";

export const opportunityScopeDetector = createDetector("CV-R2", "OPPORTUNITY_SCOPE_INVALID", z.object({
  segmentId: z.string().min(3),
  problem: z.string().min(20),
  currentWorkaround: z.string().min(10),
  baseline: z.string().min(10),
  ownerId: z.string().min(3),
  nonGoals: z.array(z.string().min(3)).min(1),
  expiresAt: z.string().datetime(),
  sourceEvidenceIds: z.array(z.string().min(3)).min(1),
}).strict());
