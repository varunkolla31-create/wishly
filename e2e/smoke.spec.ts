import { expect, test } from "@playwright/test";

test("marketing shell renders", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /some things deserve more than a message/i,
    }),
  ).toBeVisible();
});
