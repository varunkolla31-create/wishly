import { expect, test } from "@playwright/test";

const MARKETING_PATHS = [
  "/",
  "/templates",
  "/occasions/birthday",
  "/occasions/remembrance",
  "/pricing",
  "/privacy",
  "/terms",
];

test.describe("marketing at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of MARKETING_PATHS) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path);
      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
    });
  }
});

test.describe("marketing content", () => {
  test("occasion page renders its own copy and metadata title", async ({
    page,
  }) => {
    await page.goto("/occasions/birthday");
    await expect(
      page.getByRole("heading", {
        name: /a birthday wish they can unlock/i,
      }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/Birthday wish pages/);
  });

  test("calm occasion page omits confetti language and links the calm template", async ({
    page,
  }) => {
    await page.goto("/occasions/remembrance");
    await expect(page.getByText(/calm motion, soft colors, no confetti/i)).toBeVisible();
  });

  test("template gallery lists all eight templates", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.getByRole("heading", { name: "Clean White" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Festival Lights" })).toBeVisible();
    await expect(page.locator("article h3")).toHaveCount(8);
  });

  test("pricing placeholder is honest about early access", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/no card to add/i)).toBeVisible();
  });

  test("wish routes are excluded from robots and the sitemap links occasions", async ({
    request,
  }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /w/");

    const sitemap = await request.get("/sitemap.xml");
    const body = await sitemap.text();
    expect(body).toContain("/occasions/birthday");
    expect(body).not.toContain("/dashboard");
  });
});
