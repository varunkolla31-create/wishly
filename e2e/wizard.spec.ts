import { expect, test } from "@playwright/test";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl9sAAAAASUVORK5CYII=",
  "base64",
);

test.describe.configure({ mode: "serial", timeout: 120_000 });

test.describe("wish wizard", () => {
  test("creates a solo wish end to end and resumes the draft", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "New wish" }).first().click();

    await expect(page).toHaveURL(
      /\/dashboard\/wishes\/[A-Za-z0-9_-]+\/edit/,
      { timeout: 60_000 },
    );

    await expect(
      page.getByRole("heading", { name: "What are we celebrating?" }),
    ).toBeVisible();

    await page.getByRole("button", { name: /^Birthday/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Pick a look." }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Golden Hour template" })
      .click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Give it the words." }),
    ).toBeVisible();

    await page.getByLabel("Their name").fill("Amma");
    await page.getByLabel("Title").fill("Happy birthday, Amma");
    await page.getByLabel("Your message").fill("Thank you for everything.");

    await page.getByLabel("Who is this for?").fill("my mother");
    await page.getByRole("button", { name: "Give me an idea" }).click();
    await expect(
      page.getByRole("button", { name: /Add to message/ }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: /Add to message/ }).first().click();

    const messageValue = await page
      .getByLabel("Your message")
      .inputValue();
    expect(messageValue.length).toBeGreaterThan(
      "Thank you for everything.".length,
    );

    await page
      .locator('input[type="file"][accept*="image"]')
      .setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG });
    await expect(page.getByText("Added")).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Is this just from you?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Lock it with a password." }),
    ).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("Golden-Orchid-42!");
    await page.getByLabel("Once more").fill("Golden-Orchid-42!");
    await page.getByLabel(/Hint/).fill("A flower and a number");
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(
      page.getByText("Saved. Keep it somewhere safe."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Exactly what they'll see." }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Show the whole message/ }).click();
    await expect(
      page.getByText("Thank you for everything.").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Photo 1" }),
    ).toBeVisible();

    const editUrl = page.url().split("?")[0] ?? "";
    await page.goto(`${editUrl}?step=3`);

    await expect(page.getByLabel("Their name")).toHaveValue("Amma");
    await expect(page.getByLabel("Title")).toHaveValue(
      "Happy birthday, Amma",
    );
    await expect(page.getByLabel("Your message")).toHaveValue(
      new RegExp("Thank you for everything."),
    );
  });

  test("shows calm tone language on a calm occasion", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "New wish" }).first().click();
    await expect(page).toHaveURL(/\/edit/);

    await page.getByRole("button", { name: /^Remembrance/i }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("button", { name: "Calm Sky template" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByText("Kept gentle for this occasion."),
    ).toBeVisible();
  });
});
