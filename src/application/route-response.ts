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

export async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({
        ok: false, status: 400,
        error: { code: "REQUEST_JSON_INVALID", retryable: false, message: "Request body must be valid JSON." },
        externalMutation: false,
      }, { status: 400, headers: { "Cache-Control": "no-store", "X-DecisionRail-Mode": "synthetic-no-external-mutation" } }),
    };
  }
}
