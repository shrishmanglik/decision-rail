import { z } from "zod";
import { createDetector } from "./factory";

export const outcomeLineageDetector = createDetector("CV-R9", "OUTCOME_LINEAGE_BROKEN", z.object({
  subjectId: z.string().min(3),
  cohortId: z.string().min(3),
  treatmentVersion: z.string().min(1),
  exposedAt: z.string().datetime(),
  eventSchemaVersion: z.string().min(1),
  denominator: z.number().int().positive(),
  observationWindow: z.string().min(3),
}).strict());
