import { z } from "zod";
import { createDetector } from "./factory";

export const aiAuthorityDetector = createDetector("CV-R6", "AI_AUTHORITY_EXCEEDED", z.object({
  citedInputDigests: z.array(z.string().regex(/^[a-f0-9]{64}$/)).min(1),
  validationReceiptId: z.string().min(3),
  humanApproverId: z.string().min(3),
  consequentialWriteState: z.literal("BLOCKED_PENDING_HUMAN"),
}).strict());
