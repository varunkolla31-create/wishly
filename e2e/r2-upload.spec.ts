import { expect, test } from "@playwright/test";

/**
 * Browser end-to-end against the real R2 bucket. Opt-in only:
 *
 *   R2_TEST_LIVE=1 pnpm exec playwright test e2e/r2-upload.spec.ts
 *
 * The dev server must be started with MEDIA_DRIVER=r2. Everything else (data,
 * auth) can stay on the file driver.
 */
const live = process.env.R2_TEST_LIVE === "1";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl9sAAAAASUVORK5CYII=",
  "base64",
);

test.describe.configure({ mode: "serial", timeout: 240_000 });

test.describe("R2 browser upload", () => {
  test.skip(!live, "Set R2_TEST_LIVE=1 and start the dev server with MEDIA_DRIVER=r2.");

  test("uploads a photo through the wizard and shows it on the reveal", async ({
    page,
    browser,
  }) => {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /welcome back/i }),
  ).toBeVisible();

  // A click can land before hydration in dev, so retry until it navigates.
  await expect(async () => {
    if (!/\/edit/.test(page.url())) {
      await page.getByRole("button", { name: "New wish" }).first().click();
    }
    expect(page.url()).toMatch(/\/dashboard\/wishes\/[A-Za-z0-9_-]+\/edit/);
  }).toPass({ timeout: 60_000 });

  await page.getByRole("button", { name: /^Birthday/i }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Golden Hour template" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Their name").fill("R2 Check");
  await page.getByLabel("Title").fill("A photo from the bucket");
  await page.getByLabel("Your message").fill("Testing the media driver.");

  const uploaded = page.waitForResponse(
    (response) =>
      response.url().includes("/api/upload/confirm") &&
      response.request().method() === "POST",
  );
  await page
    .locator('input[type="file"][accept*="image"]')
    .setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG });

  const confirm = await uploaded;
  expect(confirm.status(), "the confirm endpoint must accept the upload").toBe(201);

  await expect(page.getByText("Added")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Password", { exact: true }).fill("R2-Orchid-42!");
  await page.getByLabel("Once more").fill("R2-Orchid-42!");
  await page.getByLabel(/Hint/).fill("bucket");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByText("Saved. Keep it somewhere safe.")).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Publish wish" }).click();
  await expect(page.getByRole("heading", { name: "It's live." })).toBeVisible();

  const link = await page.locator("#published-link").inputValue();
  const wishId = link.split("/w/")[1] ?? "";
  expect(wishId).not.toBe("");

  const receiverContext = await browser.newContext();
  const receiver = await receiverContext.newPage();

  try {
    await receiver.goto(`/w/${wishId}`);
    await receiver.getByLabel("Password", { exact: true }).fill("R2-Orchid-42!");
    await receiver.getByRole("button", { name: "Unlock" }).click();
    // The first unlock in dev compiles the route; allow for that.
    await expect(receiver).toHaveURL(new RegExp(`/w/${wishId}/reveal`), {
      timeout: 120_000,
    });
    await receiver.getByRole("button", { name: "Unwrap it" }).click();

    const photo = receiver.getByRole("img", { name: "Photo 1" });
    await expect(photo).toBeVisible();

    // The src must be a presigned R2 URL, and the image must actually load.
    const src = await photo.getAttribute("src");
    expect(src).toContain("r2.cloudflarestorage.com");
    expect(src).toContain("X-Amz-Signature");
    await expect
      .poll(
        () =>
          photo.evaluate(
            (element: HTMLImageElement) => element.naturalWidth,
          ),
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0);
  } finally {
    await receiverContext.close();
    // Clean up the wish this test created.
    await page.goto(`/dashboard`);
    await page
      .getByRole("article")
      .filter({ hasText: "A photo from the bucket" })
      .getByRole("button", { name: "Delete wish" })
      .click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete wish" }).click();
  }
  });
});
