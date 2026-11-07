import { expect, test } from "@playwright/test";

test("marketing shell renders", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /a wish they can unlock/i }),
  ).toBeVisible();
});
