import { z } from "zod";

const approvalInputSchema = z.object({
  builderId: z.string().trim().min(3).max(80),
  approverId: z.string().trim().min(3).max(80),
  controlDigest: z.string().regex(/^[a-f0-9]{64}$/),
});

export type ApprovalResult =
  | { ok: true; receipt: string }
  | { ok: false; reason: "APPROVER_INVALID" | "APPROVER_NOT_INDEPENDENT" };

export function createDemoApprovalReceipt(input: unknown): ApprovalResult {
  const parsed = approvalInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "APPROVER_INVALID" };
  const { builderId, approverId, controlDigest } = parsed.data;
  if (builderId.toLocaleLowerCase() === approverId.toLocaleLowerCase()) {
    return { ok: false, reason: "APPROVER_NOT_INDEPENDENT" };
  }
  return { ok: true, receipt: `DEMO-APPROVAL:${approverId}:${controlDigest.slice(0, 16)}` };
}

const handoffInputSchema = z.object({
  builderId: z.string().trim().min(3).max(80),
  operatorId: z.string().trim().min(3).max(80),
  approvalReceipt: z.string().regex(/^DEMO-APPROVAL:[^:]+:[a-f0-9]{16}$/),
  controlDigest: z.string().regex(/^[a-f0-9]{64}$/),
  recoveryReceiptId: z.string().startsWith("recovery-"),
});

export type HandoffResult =
  | { ok: true; receipt: string }
  | { ok: false; reason: "OPERATOR_INVALID" | "OPERATOR_NOT_INDEPENDENT" | "APPROVAL_RECEIPT_INVALID" };

export function createDemoHandoffReceipt(input: unknown): HandoffResult {
  const parsed = handoffInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "OPERATOR_INVALID" };
  const { builderId, operatorId, controlDigest, recoveryReceiptId, approvalReceipt } = parsed.data;
  const [, approverId, approvalDigest] = approvalReceipt.split(":");
  if (approvalDigest !== controlDigest.slice(0, 16) || approverId.toLocaleLowerCase() === builderId.toLocaleLowerCase()) {
    return { ok: false, reason: "APPROVAL_RECEIPT_INVALID" };
  }
  if (builderId.toLocaleLowerCase() === operatorId.toLocaleLowerCase()) {
    return { ok: false, reason: "OPERATOR_NOT_INDEPENDENT" };
  }
  return { ok: true, receipt: `DEMO-HANDOFF:ACCEPTED:${operatorId}:${controlDigest.slice(0, 16)}:${recoveryReceiptId}` };
}
