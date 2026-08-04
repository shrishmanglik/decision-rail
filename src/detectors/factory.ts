import type { ZodType } from "zod";
import type { Detector, RequirementId } from "@/src/domain/control-types";

export function createDetector(
  requirementId: RequirementId,
  issueCode: string,
  schema: ZodType,
): Detector {
  return {
    id: `DET-${requirementId}`,
    requirementId,
    issueCode,
    ruleVersion: "1.0.0",
    evaluate(evidence) {
      const result = schema.safeParse(evidence);
      if (result.success) return { passed: true, missingEvidence: [] };
      const missingEvidence = [...new Set(result.error.issues.map((issue) =>
        issue.path.length > 0 ? issue.path.join(".") : issue.message,
      ))].sort();
      return { passed: false, missingEvidence };
    },
  };
}
