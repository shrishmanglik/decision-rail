import { create } from "zustand";
import type { WorkspaceRunReceipt } from "@/src/application/workspace-service";
import { createDemoApprovalReceipt, createDemoHandoffReceipt } from "@/src/domain/human-authority";

type WorkspaceState = {
  receipt: WorkspaceRunReceipt | null;
  loading: boolean;
  error: string | null;
  approvalReceipt: string | null;
  approvalError: string | null;
  handoffReceipt: string | null;
  handoffError: string | null;
  runControls: () => Promise<void>;
  recordApproval: (approverId: string) => void;
  acceptHandoff: (operatorId: string) => void;
  reset: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  receipt: null,
  loading: false,
  error: null,
  approvalReceipt: null,
  approvalError: null,
  handoffReceipt: null,
  handoffError: null,
  runControls: async () => {
    set({ loading: true, error: null, approvalReceipt: null, approvalError: null, handoffReceipt: null, handoffError: null });
    try {
      const response = await fetch("/api/workspace/run", { method: "POST" });
      if (!response.ok) throw new Error(`Control run failed with HTTP ${response.status}`);
      set({ receipt: await response.json(), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown control failure", loading: false });
    }
  },
  recordApproval: (approverId) => {
    const receipt = get().receipt;
    if (receipt?.state !== "READY_FOR_HUMAN_DECISION") return;
    const result = createDemoApprovalReceipt({ builderId: receipt.builderId, approverId, controlDigest: receipt.controlDigest });
    if (!result.ok) {
      set({ approvalReceipt: null, approvalError: result.reason });
      return;
    }
    set({ approvalReceipt: result.receipt, approvalError: null });
  },
  acceptHandoff: (operatorId) => {
    const { receipt, approvalReceipt } = get();
    if (!receipt || !approvalReceipt) return;
    const result = createDemoHandoffReceipt({ builderId: receipt.builderId, operatorId, approvalReceipt, controlDigest: receipt.controlDigest, recoveryReceiptId: receipt.recoveryReceiptId });
    if (!result.ok) {
      set({ handoffReceipt: null, handoffError: result.reason });
      return;
    }
    set({ handoffReceipt: result.receipt, handoffError: null });
  },
  reset: () => set({ receipt: null, loading: false, error: null, approvalReceipt: null, approvalError: null, handoffReceipt: null, handoffError: null }),
}));
