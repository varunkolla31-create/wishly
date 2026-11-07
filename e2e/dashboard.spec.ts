import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("sender dashboard", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("shows the empty state with a dev seed option", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No wishes yet." }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add demo wishes" }),
    ).toBeVisible();

    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });

  test("seeds demo wishes and renders status, replies and counts", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Add demo wishes" }).click();

    await expect(page.getByRole("article")).toHaveCount(3);
    await expect(
      page.getByRole("heading", { name: "Happy birthday, Amma" }),
    ).toBeVisible();
    await expect(page.getByText("Draft")).toBeVisible();
    await expect(page.getByText("Published")).toHaveCount(2);
    await expect(
      page
        .getByRole("article")
        .filter({ hasText: "Happy birthday, Amma" })
        .getByText(/2 replies/),
    ).toBeVisible();
  });

  test("duplicates and deletes a wish from its card", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("article")).toHaveCount(3);

    await page
      .getByRole("button", { name: "Duplicate wish" })
      .first()
      .click();
    await expect(page.getByRole("article")).toHaveCount(4);

    const firstCard = page.getByRole("article").first();
    await firstCard.getByRole("button", { name: "Delete wish" }).click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Delete this wish?" }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Delete wish" }).click();
    await expect(page.getByRole("article")).toHaveCount(3);
  });

  test("shows a QR code and copies the wish link", async ({ page }) => {
    await page.goto("/dashboard");

    await page
      .getByRole("button", { name: "Show QR code" })
      .first()
      .click();
    await expect(
      page.getByRole("img", { name: "QR code for this wish link" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close dialog" }).click();

    await page
      .getByRole("button", { name: "Copy wish link" })
      .first()
      .click();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/\/w\/[A-Za-z0-9_-]{21}$/);
  });

  test("lists seeded replies in the inbox", async ({ page }) => {
    await page.goto("/dashboard/replies");
    await expect(
      page.getByRole("heading", { name: "What they sent back." }),
    ).toBeVisible();
    await expect(
      page.getByText(/This made my whole week/),
    ).toBeVisible();
    await expect(
      page.getByText(/Thank you for remembering the little things/),
    ).toBeVisible();
  });

  test("sign-in page explains the dev bypass", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(
      page.getByRole("heading", { name: "You're already in." }),
    ).toBeVisible();
  });
});
