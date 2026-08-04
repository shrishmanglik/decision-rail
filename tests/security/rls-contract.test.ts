import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/001_decision_rail.sql"), "utf8");
const tables = [...migration.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);
const policySql = migration.slice(migration.indexOf("create policy workspaces_member_select"));

describe("Supabase security contract", () => {
  it("enables and forces RLS on every table", () => {
    expect(tables).toHaveLength(8);
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
    expect(migration).toContain("cardinality(consent_scope) > 0");
    expect(migration).toContain("consent_scope <@ array['synthesis', 'experiment', 'export']::text[]");
    expect(migration).toContain("status <> 'verified' or redaction_state in ('redacted', 'not_required')");
  });
});
