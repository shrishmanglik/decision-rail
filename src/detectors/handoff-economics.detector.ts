import { z } from "zod";
import { createDetector } from "./factory";

export const handoffEconomicsDetector = createDetector("CV-R12", "HANDOFF_ECONOMICS_UNPROVEN", z.object({
  operatorId: z.string().min(3),
  recoveryReceiptId: z.string().min(3),
  buyerAcceptanceState: z.literal("ACCEPTED"),
  deliveryCostState: z.literal("OBSERVED"),
  paymentAuthorityState: z.literal("COMMITTED"),
  repeatDecisionState: z.literal("YES"),
}).strict());
