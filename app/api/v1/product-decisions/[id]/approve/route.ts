import { approveProductDecision } from "@/src/application/sandbox-api-service";
import { apiResponse, requestContext } from "@/src/application/route-response";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return apiResponse(approveProductDecision(requestContext(request), id, await request.json()));
}
