import fixturesJson from "@/tests/fixtures/controls.json";
import { describe, expect, it } from "vitest";
import { verifyAcceptanceSuite } from "@/src/application/control-service";
import { controlFixtureSchema, requirementIds } from "@/src/domain/control-types";
import { detectorRegistry } from "@/src/detectors/registry";

const fixtures = fixturesJson.map((fixture) => controlFixtureSchema.parse(fixture));

describe("detector mutation proof", () => {
  it.each(requirementIds)("fails acceptance when %s detector is disabled", (requirementId) => {
    const mutated = { ...detectorRegistry };
    delete (mutated as Partial<typeof detectorRegistry>)[requirementId];
    const result = verifyAcceptanceSuite(fixtures, mutated);
    expect(result.passed).toBe(false);
    expect(result.failures.some((failure) => failure.startsWith(requirementId))).toBe(true);
  });
});
