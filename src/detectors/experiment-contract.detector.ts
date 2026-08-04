import { z } from "zod";
import { createDetector } from "./factory";

export const experimentContractDetector = createDetector("CV-R4", "EXPERIMENT_CONTRACT_INCOMPLETE", z.object({
  hypothesis: z.string().min(10),
  cohortRule: z.string().min(10),
  baseline: z.string().min(10),
  treatment: z.string().min(3),
  primaryMetric: z.string().min(10),
  guardrails: z.array(z.string().min(3)).min(1),
  sampleRule: z.string().min(10),
  decisionRule: z.string().min(10),
  stopConditions: z.array(z.string().min(3)).min(1),
}).strict());
