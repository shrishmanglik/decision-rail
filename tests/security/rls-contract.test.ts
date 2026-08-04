import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/001_decision_rail.sql"), "utf8");
const tables = [...migration.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);
const policySql = migration.slice(migration.indexOf("create policy workspaces_member_select"));

describe("Supabase security contract", () => {
  it("enables and forces RLS on every table", () => {
    expect(tables).toHaveLength(9);
    for (const table of tables) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
      expect(migration).toContain(`alter table public.${table} force row level security;`);
    }
  });

  it("contains no service-role or RLS-bypass policy", () => {
    expect(migration).not.toMatch(/service_role|bypassrls|using\s*\(\s*true\s*\)/i);
  });

  it("enforces builder and approver separation in schema and policy", () => {
    expect(migration).toContain("check (builder_id <> approver_id)");
    expect(migration).toContain("check (experiment_operator_id <> approver_id)");
    expect(migration).toContain("builder_id <> auth.uid()");
    expect(migration).toContain("experiment_operator_id <> auth.uid()");
    expect(migration).toContain("product_decision_bind_lineage_before_insert");
  });

  it("uses bounded helpers and an automatic trigger without recursive policy subqueries", () => {
    expect(migration).toContain("security definer\nset search_path = ''");
    expect(migration).toContain("workspace_creator_membership_after_insert");
    expect(migration).toContain("private.current_user_has_workspace_role");
    expect(policySql).not.toContain("from public.workspace_memberships");
    expect(policySql).not.toContain("from public.workspaces");
  });

  it("binds every downstream foreign key to the same workspace", () => {
    expect(migration).toContain("foreign key (workspace_id, opportunity_id) references public.opportunity_contracts(workspace_id, id)");
    expect(migration).toContain("foreign key (workspace_id, experiment_id) references public.experiment_runs(workspace_id, id)");
    expect(migration).toContain("foreign key (workspace_id, decision_id) references public.product_decisions(workspace_id, id)");
  });

  it("aligns persisted evidence source, consent, and verified-redaction invariants", () => {
    expect(migration).toContain("source_class in ('interview', 'observation', 'operational_record', 'synthetic_fixture')");
    expect(migration).toContain("participant_pseudonym text not null check (char_length(participant_pseudonym) between 3 and 80)");
    expect(migration).toContain("cardinality(consent_scope) > 0");
    expect(migration).toContain("consent_scope <@ array['synthesis', 'experiment', 'export']::text[]");
    expect(migration).toContain("status <> 'verified' or redaction_state in ('redacted', 'not_required')");
  });

  it("keeps persisted opportunity and experiment constraints at least as strong as application contracts", () => {
    expect(migration).toContain("where item is null or char_length(item) < minimum_length");
    expect(migration).toContain("segment_id text not null check (char_length(segment_id) between 3 and 80)");
    expect(migration).toContain("problem text not null check (char_length(problem) >= 20)");
    expect(migration).toContain("current_workaround text not null check (char_length(current_workaround) >= 10)");
    expect(migration).toContain("baseline text not null check (char_length(baseline) >= 10)");
    expect(migration).toContain("non_goals text[] not null check (private.text_array_items_have_min_length(non_goals, 3))");
    expect(migration).not.toContain("evidence_ids uuid[]");
    expect(migration).toContain("create table public.opportunity_evidence_links");
    expect(migration).toContain("foreign key (workspace_id, evidence_id) references public.customer_evidence(workspace_id, id)");
    expect(migration).toContain("opportunity_requires_evidence_after_insert");
    expect(migration).toContain("deferrable initially deferred");
    expect(migration).not.toContain("contract jsonb");
    expect(migration).toContain("opportunity_version integer not null check (opportunity_version > 0)");
    expect(migration).toContain("cohort_rule text not null check (char_length(cohort_rule) >= 10)");
    expect(migration).toContain("primary_metric text not null check (char_length(primary_metric) >= 10)");
    expect(migration).toContain("guardrails text[] not null check (private.text_array_items_have_min_length(guardrails, 3))");
    expect(migration).toContain("decision_rule text not null check (char_length(decision_rule) >= 10)");
    expect(migration).toContain("stop_conditions text[] not null check (private.text_array_items_have_min_length(stop_conditions, 3))");
  });

  it("persists decision and handoff recovery, authority, and minimum-length invariants", () => {
    expect(migration).toContain("recovery_receipt_id text not null check (char_length(recovery_receipt_id) between 3 and 80)");
    expect(migration).toContain("reason text not null check (char_length(reason) >= 20)");
    expect(migration).toContain("rollback text not null check (char_length(rollback) >= 10)");
    expect(migration).toContain("receipt_ids text[] not null check (private.text_array_items_have_min_length(receipt_ids, 3))");
    expect(migration).toContain("recovery_plan text not null check (char_length(recovery_plan) >= 10)");
    expect(migration).toContain("recovery_status text not null check (recovery_status = 'passed')");
    expect(migration).toContain("cost_ledger_digest text not null check (cost_ledger_digest ~ '^[a-f0-9]{64}$')");
    expect(migration).toContain("check (builder_id <> operator_id)");
    expect(migration).toContain("builder_id <> auth.uid()");
  });

  it("derives persisted handoff builder, operator, and recovery lineage from the linked decision", () => {
    expect(migration).toContain("create or replace function private.bind_handoff_lineage()");
    expect(migration).toContain("select d.builder_id, d.experiment_operator_id, d.recovery_receipt_id");
    expect(migration).toContain("into new.builder_id, new.operator_id, new.recovery_receipt_id");
    expect(migration).toContain("where d.workspace_id = new.workspace_id and d.id = new.decision_id");
    expect(migration).toContain("raise exception 'HANDOFF_LINEAGE_INVALID'");
    expect(migration).toContain("create trigger handoff_bind_lineage_before_insert");
  });
});
