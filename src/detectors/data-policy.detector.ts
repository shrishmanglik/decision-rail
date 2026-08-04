import { z } from "zod";
import { createDetector } from "./factory";

export const dataPolicyDetector = createDetector("CV-R11", "DATA_POLICY_VIOLATION", z.object({
  classification: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]),
  consentScope: z.array(z.string().min(3)).min(1),
  minimizedFields: z.array(z.string().min(3)).min(1),
  redactionState: z.enum(["REDACTED", "NOT_REQUIRED"]),
  tenantId: z.string().min(3),
  retentionDays: z.number().int().positive(),
  deletionAuthorityId: z.string().min(3),
  exportPolicy: z.enum(["BLOCKED", "APPROVAL_REQUIRED", "ALLOWED"]),
}).strict());
