import { NextResponse } from "next/server";
import type { ApiResult } from "@/src/contracts/api-contracts";

export function apiResponse<T>(result: ApiResult<T>) {
  return NextResponse.json(result, {
    status: result.status,
    headers: { "Cache-Control": "no-store", "X-DecisionRail-Mode": "synthetic-no-external-mutation" },
  });
}

export function requestContext(request: Request) {
  return {
    tenantId: request.headers.get("x-decisionrail-tenant-id"),
    actorId: request.headers.get("x-decisionrail-actor-id"),
    role: request.headers.get("x-decisionrail-role"),
    operationKey: request.headers.get("idempotency-key") ?? undefined,
  };
}
