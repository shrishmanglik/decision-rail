import { createOpportunity } from "@/src/application/sandbox-api-service";
import { apiResponse, requestContext } from "@/src/application/route-response";

export async function POST(request: Request) {
  return apiResponse(createOpportunity(requestContext(request), await request.json()));
}
