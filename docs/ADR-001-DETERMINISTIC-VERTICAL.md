# ADR-001: Build the first DecisionRail vertical without provider dependency

Status: accepted for the initial public work-sample branch.

## Context

The product must demonstrate a real evidence-to-decision workflow while requiring no secrets, customer data, provider mutation, or fabricated commercial evidence. The blueprint specifies a tenant-isolated control plane but keeps client identity, demand, production authority, and live integration state unknown.

## Options considered

1. **Full Supabase/Auth implementation now.** Stronger persistence proof, but it requires provider configuration, credentials, live RLS verification, and account mutation outside this work order.
2. **Static marketing or dashboard mock.** Fast, but it does not execute the product contract and would be prototype theatre.
3. **Deterministic vertical with sandbox API and executable persistence contract.** Runs the complete control path locally, preserves authority boundaries, and leaves provider work explicit.

## Decision

Choose option 3. Implement the typed domain, all 12 detectors, all 24 fixtures, repeatability, mutation, recovery, RLS schema, human gate, responsive UI, and browser journey. Do not apply the migration or connect a provider.

## Consequences

- A fresh clone can prove product behavior without accounts or secrets.
- Provider-backed auth, tenancy, persistence, and production readiness remain `UNKNOWN`.
- The migration can later be applied and verified behind a separate authority packet without rewriting the domain core.

## Reversibility

Adapters point inward to stable application contracts. A Supabase repository can replace the synthetic fixture source without changing detectors or UI authority semantics. The local sandbox route can remain as a regression and recovery mode.

## Authority

This ADR authorizes only the public source branch and PR defined by the build work order. It does not authorize deployment, provider mutation, commercial claims, customer data, or merge.
