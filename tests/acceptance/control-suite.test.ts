import fixtures from "@/tests/fixtures/controls.json";
import { describe, expect, it } from "vitest";
import { evaluateControl } from "@/src/application/control-service";
import { controlFixtureSchema } from "@/src/domain/control-types";

describe("DecisionRail P0 acceptance controls", () => {
  const parsed = fixtures.map((fixture) => controlFixtureSchema.parse(fixture));

  it("contains 24 parseable fixtures with one negative and positive control per requirement", () => {
    expect(parsed).toHaveLength(24);
    for (let index = 1; index <= 12; index += 1) {
      const requirementId = `CV-R${index}`;
      expect(parsed.filter((fixture) => fixture.requirementId === requirementId)).toHaveLength(2);
    }
  });

  it.each(fixtures)("$requirementId $controlKind returns its declared decision", (fixture) => {
    const parsedFixture = controlFixtureSchema.parse(fixture);
    const receipt = evaluateControl(parsedFixture);
    expect(receipt.decision).toBe(parsedFixture.controlKind === "NEGATIVE" ? "REJECT" : "PASS");
    expect(receipt.externalMutation).toBe(false);
  });
});
