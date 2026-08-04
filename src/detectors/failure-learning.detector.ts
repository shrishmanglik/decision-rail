import { z } from "zod";
import { createDetector } from "./factory";

export const failureLearningDetector = createDetector("CV-R10", "FAILURE_NOT_PROMOTED", z.object({
  redactedFixtureId: z.string().min(3),
  detectorId: z.string().regex(/^DET-CV-R\d+$/),
  ownerId: z.string().min(3),
  preFixExitCode: z.number().int().positive(),
  postFixExitCode: z.literal(0),
  mutationExitCode: z.literal(0),
}).strict());
