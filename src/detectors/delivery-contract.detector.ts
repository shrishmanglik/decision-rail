import { z } from "zod";
import { createDetector } from "./factory";

export const deliveryContractDetector = createDetector("CV-R8", "DELIVERY_CONTRACT_UNRESOLVED", z.object({
  requirementIds: z.array(z.string().min(3)).min(1),
  acceptanceFixtureDigest: z.string().regex(/^[a-f0-9]{64}$/),
  dependencies: z.array(z.string().min(3)),
  releaseAuthorityId: z.string().min(3),
  observabilityPlan: z.string().min(10),
  rollbackPlan: z.string().min(10),
  receivingOwnerId: z.string().min(3),
}).strict());
