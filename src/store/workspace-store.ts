import { create } from "zustand";
import type { WorkspaceRunReceipt } from "@/src/application/workspace-service";

type WorkspaceState = {
  receipt: WorkspaceRunReceipt | null;
  loading: boolean;
  error: string | null;
  approvalReceipt: string | null;
  runControls: () => Promise<void>;
  recordApproval: (approverId: string) => void;
  reset: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  receipt: null,
  loading: false,
  error: null,
  approvalReceipt: null,
  runControls: async () => {
    set({ loading: true, error: null, approvalReceipt: null });
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
    if (receipt?.state !== "READY_FOR_HUMAN_DECISION" || approverId.trim().length < 3) return;
    set({ approvalReceipt: `DEMO-APPROVAL:${approverId.trim()}:${receipt.controlDigest.slice(0, 16)}` });
  },
  reset: () => set({ receipt: null, loading: false, error: null, approvalReceipt: null }),
}));
