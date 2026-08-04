import { z } from "zod";
import { createDetector } from "./factory";

export const decisionGateDetector = createDetector("CV-R7", "DECISION_GATE_INCOMPLETE", z.object({
  inputs: z.array(z.string().min(3)).min(1),
  weights: z.record(z.string(), z.number()).refine((value) => Object.keys(value).length > 0),
  assumptions: z.array(z.string().min(3)).min(1),
  opportunityCost: z.string().min(3),
  ownerId: z.string().min(3),
  dissent: z.array(z.string().min(3)).min(1),
  reversibility: z.enum(["REVERSIBLE", "PARTIALLY_REVERSIBLE", "IRREVERSIBLE"]),
  approvalState: z.literal("PENDING_HUMAN"),
}).strict());
