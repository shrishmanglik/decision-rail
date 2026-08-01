import fixturesJson from "@/tests/fixtures/controls.json";
import { describe, expect, it } from "vitest";
import { verifyAcceptanceSuite } from "@/src/application/control-service";
import { controlFixtureSchema } from "@/src/domain/control-types";

describe("deterministic repeatability", () => {
  it("produces byte-identical normalized digests on two complete runs", () => {
    const fixtures = fixturesJson.map((fixture) => controlFixtureSchema.parse(fixture));
    const first = verifyAcceptanceSuite(fixtures);
    const second = verifyAcceptanceSuite(fixtures);
    expect(first.passed).toBe(true);
    expect(second.passed).toBe(true);
    expect(second.normalizedDigest).toBe(first.normalizedDigest);
  });
});
