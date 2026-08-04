import { queueExperiment } from "@/src/application/sandbox-api-service";
import { apiResponse, readJson, requestContext } from "@/src/application/route-response";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await readJson(request);
  return body.ok ? apiResponse(queueExperiment(requestContext(request), id, body.value)) : body.response;
}
