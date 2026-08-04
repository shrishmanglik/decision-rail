import { captureCustomerEvidence } from "@/src/application/sandbox-api-service";
import { apiResponse, readJson, requestContext } from "@/src/application/route-response";

export async function POST(request: Request) {
  const body = await readJson(request);
  return body.ok ? apiResponse(captureCustomerEvidence(requestContext(request), body.value)) : body.response;
}
