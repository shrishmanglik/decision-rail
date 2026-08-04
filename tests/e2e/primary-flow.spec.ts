import { expect, test } from "@playwright/test";

test("runs the primary synthetic workflow through a human-gated receipt", async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop-chromium") {
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Make the decision replayable." })).toBeVisible();
  await expect(page.getByText("Customer demand, commercial outcomes, live integrations, and provider state remain UNKNOWN.")).toBeVisible();

  await page.getByRole("button", { name: "Validate local contract" }).click();
  await expect(page.getByText("Local draft", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Run 24 controls" }).click();
  await expect(page.getByTestId("run-receipt")).toContainText("READY_FOR_HUMAN_DECISION");
  await expect(page.getByTestId("control-grid").getByText("2 / 2")).toHaveCount(12);

  await page.getByLabel("Human approver ID").fill("builder-local-demo");
  await page.getByRole("button", { name: "Record demo approval" }).click();
  await expect(page.getByText("Blocked: the approver must be distinct from the builder.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("approval-receipt")).toHaveCount(0);

  await page.getByLabel("Human approver ID").fill("reviewer-local");
  await page.getByRole("button", { name: "Record demo approval" }).click();
  await expect(page.getByTestId("approval-receipt")).toContainText("DEMO-APPROVAL:reviewer-local");
  await page.getByLabel("Receiving operator ID").fill("operator-local");
  await page.getByRole("button", { name: "Accept synthetic handoff" }).click();
  await expect(page.getByTestId("handoff-receipt")).toContainText("DEMO-HANDOFF:ACCEPTED:operator-local");
  await expect(page.getByTestId("handoff-receipt")).toContainText("recovery=PASSED");
  await expect(page.getByTestId("run-receipt")).toContainText("externalMutation=false");
});
