import fixturesJson from "@/tests/fixtures/controls.json";
import { NextResponse } from "next/server";
import { runSyntheticWorkspace } from "@/src/application/workspace-service";
import { controlFixtureSchema } from "@/src/domain/control-types";

export const dynamic = "force-static";

export async function POST() {
  const fixtures = fixturesJson.map((fixture) => controlFixtureSchema.parse(fixture));
  return NextResponse.json(runSyntheticWorkspace(fixtures), {
    headers: {
      "Cache-Control": "no-store",
      "X-DecisionRail-Mode": "synthetic-no-external-mutation",
    },
  });
}
