import { getHandoffBundle } from "@/src/application/sandbox-api-service";
import { apiResponse, requestContext } from "@/src/application/route-response";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const query = new URL(request.url).searchParams;
  const version = Number(query.get("version"));
  return apiResponse(getHandoffBundle(requestContext(request), id, version, query.get("proof")));
}
