import fixturesJson from "@/tests/fixtures/controls.json";
import { describe, expect, it } from "vitest";
import { runSyntheticWorkspace } from "@/src/application/workspace-service";
import { controlFixtureSchema } from "@/src/domain/control-types";

describe("workspace recovery", () => {
  it("blocks a damaged fixture and returns to the exact accepted digest after restore", () => {
    const clean = fixturesJson.map((fixture) => controlFixtureSchema.parse(fixture));
    const accepted = runSyntheticWorkspace(clean);
    const damaged = structuredClone(clean);
    const target = damaged.find((fixture) => fixture.requirementId === "CV-R9" && fixture.controlKind === "POSITIVE");
    if (!target) throw new Error("CV-R9 positive fixture missing");
    target.evidence.eventSchemaVersion = "";
    expect(runSyntheticWorkspace(damaged).state).toBe("BLOCKED");
    const recovered = runSyntheticWorkspace(clean);
    expect(recovered.state).toBe("READY_FOR_HUMAN_DECISION");
    expect(recovered.controlDigest).toBe(accepted.controlDigest);
  });
});
