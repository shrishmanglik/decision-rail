import { describe, expect, it } from "vitest";
import { createDemoApprovalReceipt, createDemoHandoffReceipt } from "@/src/domain/human-authority";

const digest = "a".repeat(64);

describe("human authority gate", () => {
  it("rejects exact and case-variant builder self-approval", () => {
    expect(createDemoApprovalReceipt({ builderId: "builder-local-demo", approverId: "builder-local-demo", controlDigest: digest }))
      .toEqual({ ok: false, reason: "APPROVER_NOT_INDEPENDENT" });
    expect(createDemoApprovalReceipt({ builderId: "builder-local-demo", approverId: "BUILDER-LOCAL-DEMO", controlDigest: digest }))
      .toEqual({ ok: false, reason: "APPROVER_NOT_INDEPENDENT" });
  });

  it("accepts a distinct named approver and binds the control digest", () => {
    expect(createDemoApprovalReceipt({ builderId: "builder-local-demo", approverId: "reviewer-local", controlDigest: digest }))
      .toEqual({ ok: true, receipt: `DEMO-APPROVAL:reviewer-local:${"a".repeat(16)}` });
  });

  it("requires a non-builder receiving operator for accepted handoff", () => {
    const base = { builderId: "builder-local-demo", approvalReceipt: `DEMO-APPROVAL:reviewer-local:${"a".repeat(16)}`, controlDigest: digest, recoveryReceiptId: "recovery-synthetic-001" };
    expect(createDemoHandoffReceipt({ ...base, operatorId: "builder-local-demo" }))
      .toEqual({ ok: false, reason: "OPERATOR_NOT_INDEPENDENT" });
    expect(createDemoHandoffReceipt({ ...base, operatorId: "operator-local" }))
      .toEqual({ ok: true, receipt: `DEMO-HANDOFF:ACCEPTED:operator-local:${"a".repeat(16)}:recovery-synthetic-001` });
  });

  it("rejects a forged or digest-mismatched approval prefix", () => {
    const base = { builderId: "builder-local-demo", operatorId: "operator-local", controlDigest: digest, recoveryReceiptId: "recovery-synthetic-001" };
    expect(createDemoHandoffReceipt({ ...base, approvalReceipt: "DEMO-APPROVAL:reviewer-local:bbbbbbbbbbbbbbbb" }))
      .toEqual({ ok: false, reason: "APPROVAL_RECEIPT_INVALID" });
    expect(createDemoHandoffReceipt({ ...base, approvalReceipt: "DEMO-APPROVAL:builder-local-demo:aaaaaaaaaaaaaaaa" }))
      .toEqual({ ok: false, reason: "APPROVAL_RECEIPT_INVALID" });
  });
});
