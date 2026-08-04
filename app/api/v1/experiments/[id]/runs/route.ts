import { queueExperiment } from "@/src/application/sandbox-api-service";
import { apiResponse, requestContext } from "@/src/application/route-response";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return apiResponse(queueExperiment(requestContext(request), id, await request.json()));
}
