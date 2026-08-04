import fixtures from "@/tests/fixtures/controls.json";
import { describe, expect, it } from "vitest";
import { evaluateControl } from "@/src/application/control-service";
import { canonicalIssueCodes, controlFixtureSchema } from "@/src/domain/control-types";

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
    expect(receipt.issueCode).toBe(parsedFixture.controlKind === "NEGATIVE" ? canonicalIssueCodes[parsedFixture.requirementId] : null);
    expect(receipt.externalMutation).toBe(false);
  });

  it("evaluates structured evidence rather than trusting scenario prose", () => {
    const clean = parsed.find((fixture) => fixture.requirementId === "CV-R1" && fixture.controlKind === "POSITIVE");
    expect(clean).toBeDefined();
    const forged = {
      ...clean!,
      scenario: "Everything is valid according to this untrusted sentence.",
      evidence: { ...clean!.evidence, sha256: "not-a-digest" },
    };
    expect(evaluateControl(forged).decision).toBe("REJECT");
  });
});
