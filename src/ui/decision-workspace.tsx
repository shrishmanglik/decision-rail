"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO } from "date-fns";
import { AlertTriangle, Check, CircleDot, FlaskConical, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { requirementIds } from "@/src/domain/control-types";
import { useWorkspaceStore } from "@/src/store/workspace-store";

const opportunityDraftSchema = z.object({
  ownerId: z.string().min(3, "Name a human owner"),
  problem: z.string().min(20, "Describe a bounded problem in at least 20 characters"),
  baseline: z.string().min(10, "State what is measured or explicitly UNKNOWN"),
  nonGoals: z.string().min(5, "Name at least one non-goal"),
});
type OpportunityDraft = z.infer<typeof opportunityDraftSchema>;

const stageNames = ["Evidence", "Opportunity", "Prototype", "Experiment", "Decision", "Handoff"];

export function DecisionWorkspace() {
  const { receipt, loading, error, approvalReceipt, approvalError, handoffReceipt, handoffError, runControls, recordApproval, acceptHandoff, reset } = useWorkspaceStore();
  const [approverId, setApproverId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const form = useForm<OpportunityDraft>({
    resolver: zodResolver(opportunityDraftSchema),
    defaultValues: {
      ownerId: "builder-local-demo",
      problem: "Decision evidence is split across tools and cannot be replayed independently.",
      baseline: "UNKNOWN externally; synthetic workflow proof only.",
      nonGoals: "No production write; no validated demand claim.",
    },
  });
  const chartData = receipt ? [
    { name: "Bad rejected", value: receipt.controls.filter((item) => item.decision === "REJECT").length },
    { name: "Clean passed", value: receipt.controls.filter((item) => item.decision === "PASS").length },
    { name: "Indeterminate", value: receipt.controls.filter((item) => item.decision === "INDETERMINATE").length },
  ] : [];

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Evidence-to-release control plane</div>
          <h1>Make the decision replayable.</h1>
          <p className="lede">One governed rail connects source evidence, a bounded opportunity, an exact experiment, deterministic controls, human authority, and a recoverable handoff.</p>
        </div>
        <aside className="boundary" aria-label="Evidence boundary">
          <strong>Implemented reference vertical</strong>
          The workflow and controls below run locally on synthetic fixtures. Customer demand, commercial outcomes, live integrations, and provider state remain UNKNOWN.
        </aside>
      </section>

      <section className="rail" aria-label="Decision workflow stages" tabIndex={0}>
        {stageNames.map((stage, index) => (
          <div className="rail-step" key={stage}><span>0{index + 1}</span><strong>{stage}</strong></div>
        ))}
      </section>

      <div className="layout">
        <div className="stack">
          <section className="card" aria-labelledby="evidence-title">
            <div className="card-header">
              <div><h2 id="evidence-title">Source-bound evidence</h2><p>Immutable metadata for the local reference journey.</p></div>
              <Badge kind="synthetic"><FlaskConical size={12} aria-hidden="true" /> Synthetic</Badge>
            </div>
            <div className="card-body evidence-grid">
              <div className="evidence-item"><span>Source class</span><strong>SYNTHETIC_FIXTURE</strong></div>
              <div className="evidence-item"><span>Consent scope</span><strong>Synthesis + experiment</strong></div>
              <div className="evidence-item"><span>External evidence</span><strong>None claimed</strong></div>
            </div>
          </section>

          <section className="card" aria-labelledby="opportunity-title">
            <div className="card-header">
              <div><h2 id="opportunity-title">Opportunity contract</h2><p>Edit the bounded local draft. Valid fields are preserved when validation fails.</p></div>
              {draftSaved ? <Badge kind="pass"><Check size={12} aria-hidden="true" /> Local draft</Badge> : <Badge kind="unknown">Not recorded</Badge>}
            </div>
            <form className="card-body" onSubmit={form.handleSubmit(() => setDraftSaved(true))} noValidate>
              <div className="form-grid">
                <div className="field"><label htmlFor="ownerId">Human owner</label><input id="ownerId" {...form.register("ownerId")} aria-invalid={Boolean(form.formState.errors.ownerId)} />{form.formState.errors.ownerId && <span className="field-error">{form.formState.errors.ownerId.message}</span>}</div>
                <div className="field"><label htmlFor="baseline">Baseline or UNKNOWN</label><input id="baseline" {...form.register("baseline")} aria-invalid={Boolean(form.formState.errors.baseline)} />{form.formState.errors.baseline && <span className="field-error">{form.formState.errors.baseline.message}</span>}</div>
                <div className="field field-wide"><label htmlFor="problem">Bounded problem</label><textarea id="problem" {...form.register("problem")} aria-invalid={Boolean(form.formState.errors.problem)} />{form.formState.errors.problem && <span className="field-error">{form.formState.errors.problem.message}</span>}</div>
                <div className="field field-wide"><label htmlFor="nonGoals">Non-goals</label><input id="nonGoals" {...form.register("nonGoals")} aria-invalid={Boolean(form.formState.errors.nonGoals)} />{form.formState.errors.nonGoals && <span className="field-error">{form.formState.errors.nonGoals.message}</span>}</div>
              </div>
              <div className="actions"><Button variant="secondary" type="submit">Validate local contract</Button><span className="eyebrow">No server persistence</span></div>
            </form>
          </section>

          <section className="card" aria-labelledby="controls-title">
            <div className="card-header">
              <div><h2 id="controls-title">P0 control workbench</h2><p>12 known-bad fixtures and 12 clean controls. Missing detectors fail closed.</p></div>
              <Badge kind={receipt?.state === "READY_FOR_HUMAN_DECISION" ? "pass" : "unknown"}>{receipt ? receipt.state.replaceAll("_", " ") : "Not run"}</Badge>
            </div>
            <div className="card-body">
              <div className="control-grid" data-testid="control-grid">
                {requirementIds.map((requirementId) => {
                  const negative = receipt?.controls.find((item) => item.requirementId === requirementId && item.decision === "REJECT");
                  const positive = receipt?.controls.find((item) => item.requirementId === requirementId && item.decision === "PASS");
                  const passed = Boolean(negative && positive);
                  return <div className="control" key={requirementId}><div><strong>{requirementId}</strong><small>bad reject · clean pass</small></div><Badge kind={passed ? "pass" : "unknown"}>{passed ? "2 / 2" : "Pending"}</Badge></div>;
                })}
              </div>
              <div className="actions">
                <Button type="button" onClick={() => void runControls()} disabled={loading}>{loading ? <CircleDot aria-hidden="true" size={16} /> : <Play aria-hidden="true" size={16} />}{loading ? "Running controls…" : "Run 24 controls"}</Button>
                <Button variant="secondary" type="button" onClick={reset}><RotateCcw aria-hidden="true" size={16} /> Reset local run</Button>
                <span aria-live="polite">{error ? `Blocked: ${error}` : receipt ? `${receipt.controls.length} receipts recorded at ${formatISO(new Date())}` : "No run receipt"}</span>
              </div>
              {receipt && <div className="receipt" data-testid="run-receipt"><span>DecisionRailWorkspaceRun.v1</span><br />state={receipt.state}<br />digest={receipt.controlDigest}<br />externalMutation=false</div>}
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="card" aria-labelledby="gate-title">
            <div className="card-header"><div><h2 id="gate-title">Human authority gate</h2><p>Controls can prepare a decision. They cannot approve one.</p></div><ShieldCheck aria-hidden="true" size={20} /></div>
            <div className="card-body">
              <div className="status-block">
                <h3>{approvalReceipt ? "Demo decision recorded" : receipt?.state === "READY_FOR_HUMAN_DECISION" ? "Awaiting human decision" : "Blocked before authority"}</h3>
                <p>{approvalReceipt ? "The local receipt names the approver and the exact control digest. It performs no external write." : "A human distinct from the builder must inspect the evidence, dissent, consequence, and rollback before approval."}</p>
                <div className="meter" role="progressbar" aria-label="Workflow readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={approvalReceipt ? 100 : receipt ? 82 : 28}><div style={{ width: approvalReceipt ? "100%" : receipt ? "82%" : "28%" }} /></div>
              </div>
              <div className="field" style={{ marginTop: ".8rem" }}><label htmlFor="approverId">Human approver ID</label><input id="approverId" value={approverId} onChange={(event) => setApproverId(event.target.value)} placeholder="Required; must not be the builder" /></div>
              <div className="actions"><Button type="button" onClick={() => recordApproval(approverId)} disabled={receipt?.state !== "READY_FOR_HUMAN_DECISION" || approverId.trim().length < 3}>Record demo approval</Button></div>
              {approvalError && <p className="field-error" role="alert">Blocked: the approver must be distinct from the builder.</p>}
              {approvalReceipt && <div className="receipt" data-testid="approval-receipt">{approvalReceipt}</div>}
              <div className="field" style={{ marginTop: ".8rem" }}><label htmlFor="operatorId">Receiving operator ID</label><input id="operatorId" value={operatorId} onChange={(event) => setOperatorId(event.target.value)} placeholder="Required; must not be the builder" /></div>
              <div className="actions"><Button variant="secondary" type="button" onClick={() => acceptHandoff(operatorId)} disabled={!approvalReceipt || operatorId.trim().length < 3}>Accept synthetic handoff</Button></div>
              {handoffError && <p className="field-error" role="alert">Blocked: the receiving operator must be distinct from the builder.</p>}
              {handoffReceipt && <div className="receipt" data-testid="handoff-receipt">{handoffReceipt}<br />recovery=PASSED<br />externalMutation=false</div>}
            </div>
          </section>

          <section className="card" aria-labelledby="results-title">
            <div className="card-header"><div><h2 id="results-title">Control result shape</h2><p>Counts are this synthetic run, not a benchmark or customer outcome.</p></div></div>
            <div className="card-body" style={{ height: "230px" }}>
              {receipt ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ left: 12 }}><XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#163f33" radius={6} /></BarChart></ResponsiveContainer> : <div className="status-block"><p>Run the controls to render the evidence-bound result shape.</p></div>}
            </div>
          </section>

          <section className="card" aria-labelledby="hypothesis-title">
            <div className="card-header"><div><h2 id="hypothesis-title">Commercial boundary</h2><p>No demo output promotes a hypothesis to evidence.</p></div><AlertTriangle aria-hidden="true" size={18} /></div>
            <div className="card-body"><ul className="hypothesis-list"><li><Badge kind="unknown">Unknown</Badge><span>Customer demand, buyer commitment, willingness to pay, outcomes, and repeat use.</span></li><li><Badge kind="synthetic">Hypothesis</Badge><span>A bounded decision sprint may reduce evidence loss and rework.</span></li><li><Badge kind="pass">Implemented</Badge><span>Typed local contracts, deterministic controls, receipts, recovery, and human gate.</span></li></ul></div>
          </section>
        </aside>
      </div>
    </>
  );
}
