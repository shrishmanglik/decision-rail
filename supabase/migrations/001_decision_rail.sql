-- DecisionRail reference persistence contract.
-- NOT APPLIED by this repository build. Provider state remains UNKNOWN.

create extension if not exists pgcrypto;
create schema if not exists private;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 120),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('builder', 'researcher', 'approver', 'operator', 'auditor')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.customer_evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_class text not null check (source_class in ('interview', 'observation', 'operational_record', 'synthetic_fixture')),
  participant_pseudonym text check (participant_pseudonym is null or char_length(participant_pseudonym) >= 3),
  captured_at timestamptz not null,
  consent_scope text[] not null check (cardinality(consent_scope) > 0 and consent_scope <@ array['synthesis', 'experiment', 'export']::text[]),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  redaction_state text not null check (redaction_state in ('redacted', 'not_required', 'rejected')),
  status text not null check (status in ('captured', 'verified', 'rejected', 'superseded')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (workspace_id, sha256),
  check (status <> 'verified' or redaction_state in ('redacted', 'not_required'))
);

create table public.opportunity_contracts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  segment_id text not null,
  problem text not null,
  baseline text not null,
  owner_id uuid not null references auth.users(id),
  non_goals text[] not null,
  evidence_ids uuid[] not null,
  expires_at timestamptz not null,
  status text not null check (status in ('draft', 'review', 'approved', 'rejected', 'parked', 'superseded')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, id, version)
);

create table public.experiment_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  opportunity_id uuid not null,
  operation_key text not null,
  prototype_digest text not null check (prototype_digest ~ '^[a-f0-9]{64}$'),
  fixture_set_digest text not null check (fixture_set_digest ~ '^[a-f0-9]{64}$'),
  contract jsonb not null,
  status text not null check (status in ('draft', 'approved', 'running', 'passed', 'failed', 'indeterminate', 'stopped')),
  builder_id uuid not null references auth.users(id),
  operator_id uuid not null references auth.users(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, operation_key),
  foreign key (workspace_id, opportunity_id) references public.opportunity_contracts(workspace_id, id)
);

create table public.product_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  experiment_id uuid not null,
  decision text not null check (decision in ('kill', 'park', 'iterate', 'deliver')),
  evidence_digest text not null check (evidence_digest ~ '^[a-f0-9]{64}$'),
  builder_id uuid not null references auth.users(id),
  experiment_operator_id uuid not null references auth.users(id),
  approver_id uuid not null references auth.users(id),
  reason text not null,
  rollback text not null,
  supersedes_id uuid,
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  check (builder_id <> approver_id),
  check (experiment_operator_id <> approver_id),
  foreign key (workspace_id, experiment_id) references public.experiment_runs(workspace_id, id),
  foreign key (workspace_id, supersedes_id) references public.product_decisions(workspace_id, id)
);

create table public.control_receipts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  requirement_id text not null check (requirement_id ~ '^CV-R([1-9]|1[0-2])$'),
  detector_id text not null,
  decision text not null check (decision in ('pass', 'reject', 'indeterminate')),
  issue_code text,
  evidence_digest text not null check (evidence_digest ~ '^[a-f0-9]{64}$'),
  rule_version text not null,
  receipt jsonb not null,
  created_at timestamptz not null default now()
);

create table public.handoff_bundles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  decision_id uuid not null,
  operator_id uuid not null references auth.users(id),
  recovery_plan text not null,
  receipt_digest text not null check (receipt_digest ~ '^[a-f0-9]{64}$'),
  status text not null check (status in ('draft', 'review', 'accepted', 'expired', 'revoked', 'superseded')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, decision_id) references public.product_decisions(workspace_id, id)
);

create or replace function private.user_has_workspace_role(target_workspace_id uuid, target_user_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_memberships m
    where m.workspace_id = target_workspace_id
      and m.user_id = target_user_id
      and m.role = any(allowed_roles)
  );
$$;

create or replace function private.current_user_has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.user_has_workspace_role(target_workspace_id, auth.uid(), allowed_roles);
$$;

create or replace function private.bootstrap_workspace_creator()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_memberships (workspace_id, user_id, role)
  values (new.id, new.created_by, 'builder');
  return new;
end;
$$;

create or replace function private.bind_decision_lineage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select e.builder_id, e.operator_id
  into new.builder_id, new.experiment_operator_id
  from public.experiment_runs e
  where e.workspace_id = new.workspace_id and e.id = new.experiment_id;
  if new.builder_id is null or new.experiment_operator_id is null then
    raise exception 'PRODUCT_DECISION_LINEAGE_INVALID';
  end if;
  return new;
end;
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on function private.user_has_workspace_role(uuid, uuid, text[]) from public;
revoke all on function private.current_user_has_workspace_role(uuid, text[]) from public;
grant execute on function private.user_has_workspace_role(uuid, uuid, text[]) to authenticated;
grant execute on function private.current_user_has_workspace_role(uuid, text[]) to authenticated;

create trigger workspace_creator_membership_after_insert
after insert on public.workspaces
for each row execute function private.bootstrap_workspace_creator();

create trigger product_decision_bind_lineage_before_insert
before insert on public.product_decisions
for each row execute function private.bind_decision_lineage();

alter table public.workspaces enable row level security;
alter table public.workspaces force row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_memberships force row level security;
alter table public.customer_evidence enable row level security;
alter table public.customer_evidence force row level security;
alter table public.opportunity_contracts enable row level security;
alter table public.opportunity_contracts force row level security;
alter table public.experiment_runs enable row level security;
alter table public.experiment_runs force row level security;
alter table public.product_decisions enable row level security;
alter table public.product_decisions force row level security;
alter table public.control_receipts enable row level security;
alter table public.control_receipts force row level security;
alter table public.handoff_bundles enable row level security;
alter table public.handoff_bundles force row level security;

create policy workspaces_member_select on public.workspaces for select to authenticated
using (created_by = auth.uid() or private.current_user_has_workspace_role(id, array['builder', 'researcher', 'approver', 'operator', 'auditor']));
create policy workspaces_creator_insert on public.workspaces for insert to authenticated
with check (created_by = auth.uid());

create policy memberships_self_or_creator_select on public.workspace_memberships for select to authenticated
using (user_id = auth.uid() or private.current_user_has_workspace_role(workspace_id, array['builder']));
create policy memberships_creator_insert on public.workspace_memberships for insert to authenticated
with check (private.current_user_has_workspace_role(workspace_id, array['builder']));
create policy memberships_creator_update on public.workspace_memberships for update to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder']))
with check (private.current_user_has_workspace_role(workspace_id, array['builder']));
create policy memberships_creator_delete on public.workspace_memberships for delete to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder']) and user_id <> auth.uid());

create policy evidence_member_select on public.customer_evidence for select to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder', 'researcher', 'approver', 'auditor']));
create policy evidence_researcher_insert on public.customer_evidence for insert to authenticated
with check (created_by = auth.uid() and private.current_user_has_workspace_role(workspace_id, array['researcher', 'builder']));

create policy opportunity_member_select on public.opportunity_contracts for select to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder', 'researcher', 'approver', 'auditor']));
create policy opportunity_builder_insert on public.opportunity_contracts for insert to authenticated
with check (created_by = auth.uid() and owner_id = auth.uid() and private.current_user_has_workspace_role(workspace_id, array['builder']));

create policy experiment_member_select on public.experiment_runs for select to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder', 'operator', 'approver', 'auditor']));
create policy experiment_builder_insert on public.experiment_runs for insert to authenticated
with check (created_by = auth.uid() and operator_id = auth.uid()
  and private.user_has_workspace_role(workspace_id, builder_id, array['builder'])
  and private.user_has_workspace_role(workspace_id, operator_id, array['operator']));

create policy decision_member_select on public.product_decisions for select to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder', 'operator', 'approver', 'auditor']));
create policy decision_approver_insert on public.product_decisions for insert to authenticated
with check (approver_id = auth.uid() and builder_id <> auth.uid() and experiment_operator_id <> auth.uid()
  and private.user_has_workspace_role(workspace_id, approver_id, array['approver'])
  and private.user_has_workspace_role(workspace_id, builder_id, array['builder'])
  and private.user_has_workspace_role(workspace_id, experiment_operator_id, array['operator']));

create policy receipts_member_select on public.control_receipts for select to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder', 'operator', 'approver', 'auditor']));
create policy receipts_builder_insert on public.control_receipts for insert to authenticated
with check (private.current_user_has_workspace_role(workspace_id, array['builder', 'auditor']));

create policy handoff_member_select on public.handoff_bundles for select to authenticated
using (private.current_user_has_workspace_role(workspace_id, array['builder', 'operator', 'approver', 'auditor']));
create policy handoff_operator_insert on public.handoff_bundles for insert to authenticated
with check (operator_id = auth.uid() and private.current_user_has_workspace_role(workspace_id, array['operator']));

create index customer_evidence_workspace_idx on public.customer_evidence (workspace_id, captured_at desc);
create index opportunity_workspace_idx on public.opportunity_contracts (workspace_id, status, expires_at);
create index experiment_workspace_idx on public.experiment_runs (workspace_id, status, created_at desc);
create index decisions_workspace_idx on public.product_decisions (workspace_id, created_at desc);
create index receipts_workspace_idx on public.control_receipts (workspace_id, requirement_id, created_at desc);

revoke update, delete on public.control_receipts from authenticated;
revoke update, delete on public.product_decisions from authenticated;
