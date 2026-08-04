import { captureCustomerEvidence } from "@/src/application/sandbox-api-service";
import { apiResponse, requestContext } from "@/src/application/route-response";

export async function POST(request: Request) {
  return apiResponse(captureCustomerEvidence(requestContext(request), await request.json()));
}
