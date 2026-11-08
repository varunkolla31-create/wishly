import { expect, test } from "@playwright/test";

test("AI assistant writes options and inserts the chosen message", async ({
  page,
}) => {
  await page.route("**/api/generate-wish", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          messages: [
            "Amma, your filter coffee and old Tamil songs make every morning feel like home. Happy birthday.",
            "Happy birthday, Amma. May your day be as warm as the coffee you make for us.",
            "Amma, today is yours: extra filter coffee, old Tamil melodies, and all our love.",
          ],
        },
      }),
    }),
  );

  await page.goto("/create");
  await page.getByRole("button", { name: "4. Words" }).click();
  await page.getByRole("button", { name: "Help me write (AI)" }).click();
  await page
    .getByLabel("Tell AI about the wish")
    .fill("Amma loves filter coffee and old Tamil songs.");

  await page.getByRole("button", { name: "Write it for me" }).click();
  await expect(
    page.getByRole("button", { name: "Option 1" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Use this message" }).click();
  const message = page.locator("#guest-message, #message").first();
  await expect(message).toHaveValue(/filter coffee/, { timeout: 10_000 });
});
