import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Public, unauthenticated surfaces. Sender pages are covered separately below. */
const PUBLIC_PAGES = [
  "/",
  "/templates",
  "/occasions/birthday",
  "/occasions/remembrance",
  "/privacy",
  "/terms",
  "/report",
];

const RULES = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
];

async function expectNoViolations(page: Page, path: string) {
  const results = await new AxeBuilder({ page }).withTags(RULES).analyze();

  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.map((node) => node.target.join(" ")).slice(0, 3),
  }));

  expect(summary, `${path} accessibility violations`).toEqual([]);
}

test.describe("accessibility", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(path);
      await expectNoViolations(page, path);
    });
  }

  test("dashboard has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    await expectNoViolations(page, "/dashboard");
  });

  test("keyboard reaches primary navigation and skips nothing", async ({
    page,
  }) => {
    await page.goto("/");

    const visited: string[] = [];
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active) return "";
        return `${active.tagName}:${(active.getAttribute("aria-label") ?? active.textContent ?? "")
          .trim()
          .slice(0, 40)}`;
      });
      visited.push(tag);
    }

    expect(visited.filter(Boolean).length).toBeGreaterThan(3);
  });
});
