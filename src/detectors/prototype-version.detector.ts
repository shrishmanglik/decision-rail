import { z } from "zod";
import { createDetector } from "./factory";

const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const prototypeVersionDetector = createDetector("CV-R5", "PROTOTYPE_VERSION_UNBOUND", z.object({
  designDigest: digest,
  buildDigest: digest,
  promptDigest: digest,
  modelDigest: digest,
  dataDigest: digest,
  featureFlags: z.array(z.string().min(1)),
  fixtureDigest: digest,
}).strict());
