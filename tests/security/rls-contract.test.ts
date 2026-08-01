import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/001_decision_rail.sql"), "utf8");
const tables = [...migration.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);

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
    expect(migration).toContain("builder_id <> auth.uid()");
  });
});
