import fixturesJson from "@/tests/fixtures/controls.json";
import { describe, expect, it } from "vitest";
import { verifyAcceptanceSuite } from "@/src/application/control-service";
import { controlFixtureSchema, requirementIds } from "@/src/domain/control-types";
import { detectorRegistry } from "@/src/detectors/registry";
import type { Detector } from "@/src/domain/control-types";

const fixtures = fixturesJson.map((fixture) => controlFixtureSchema.parse(fixture));

describe("detector mutation proof", () => {
  it.each(requirementIds)("fails acceptance when %s evaluator is disabled", (requirementId) => {
    const original = detectorRegistry[requirementId];
    const disabled: Detector = {
      ...original,
      evaluate: () => ({ passed: true, missingEvidence: [] }),
    };
    const mutated = { ...detectorRegistry, [requirementId]: disabled };
    const result = verifyAcceptanceSuite(fixtures, mutated);
    expect(result.passed).toBe(false);
    expect(result.failures.some((failure) => failure.startsWith(requirementId))).toBe(true);
  });

  it.each(requirementIds)("fails closed when %s module is unavailable", (requirementId) => {
    const mutated = { ...detectorRegistry };
    delete (mutated as Partial<typeof detectorRegistry>)[requirementId];
    const result = verifyAcceptanceSuite(fixtures, mutated);
    const receipts = result.receipts.filter((receipt) => receipt.requirementId === requirementId);
    expect(result.passed).toBe(false);
    expect(receipts.every((receipt) => receipt.decision === "INDETERMINATE")).toBe(true);
    expect(receipts.every((receipt) => receipt.issueCode === "DETECTOR_UNAVAILABLE")).toBe(true);
  });
});
