import { expect, test, type APIRequestContext } from "@playwright/test";

test.describe.configure({ mode: "serial", timeout: 240_000 });

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl9sAAAAASUVORK5CYII=",
  "base64",
);

const PASSWORD = "Golden-Orchid-42!";
const CONTRIBUTOR_NOTE = "She taught me to cook. Sending love from all of us.";

async function createGroupWish(request: APIRequestContext): Promise<{
  wishId: string;
  token: string;
}> {
  const created = await request.post("/api/wishes", {
    data: { category: "wedding-engagement", templateId: "golden-hour", mode: "group" },
  });
  expect(created.ok()).toBeTruthy();
  const createdPayload = (await created.json()) as {
    data: { wishId: string };
  };
  const wishId = createdPayload.data.wishId;

  const patched = await request.patch(`/api/wishes/${wishId}`, {
    data: {
      receiverName: "Amma",
      title: "Fifty years of you two",
      message: "A small thing from everyone who loves you.",
    },
  });
  expect(patched.ok()).toBeTruthy();

  const password = await request.post(`/api/wishes/${wishId}/password`, {
    data: { password: PASSWORD, hint: "A flower and a number" },
  });
  expect(password.ok()).toBeTruthy();

  const link = await request.post(`/api/wishes/${wishId}/contributor-link`);
  expect(link.ok()).toBeTruthy();
  const linkPayload = (await link.json()) as {
    data: { contributorToken: string | null };
  };

  return { wishId, token: linkPayload.data.contributorToken ?? "" };
}

test("a group wish collects, moderates, publishes, and reveals a memory wall", async ({
  page,
  request,
  browser,
}) => {
  const { wishId, token } = await createGroupWish(request);
  expect(token).not.toBe("");

  // A contributor with no session at all.
  const contributorContext = await browser.newContext();
  const contributor = await contributorContext.newPage();

  try {
    const visit = await contributor.goto(`/c/${token}`);
    expect(visit?.headers()["x-robots-tag"]).toContain("noindex");

    await expect(
      contributor.getByRole("heading", { name: /Add to Amma/i }),
    ).toBeVisible();

    await contributor.getByLabel("Your name").fill("Ravi");
    await contributor.getByRole("button", { name: "A few words" }).click();
    await contributor.getByLabel("Your words").fill(CONTRIBUTOR_NOTE);
    await contributor.getByRole("button", { name: "Send it" }).click();

    await expect(
      contributor.getByRole("heading", { name: "Thank you." }),
    ).toBeVisible();

    await contributor.getByRole("button", { name: "Add another" }).click();
    await contributor.getByLabel("Your name").fill("Meera");
    await contributor.getByRole("button", { name: "A photo" }).click();
    await contributor
      .locator('input[type="file"][accept*="image"]')
      .setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG });
    await contributor.getByRole("button", { name: "Send it" }).click();
    await expect(
      contributor.getByRole("heading", { name: "Thank you." }),
    ).toBeVisible();
  } finally {
    await contributorContext.close();
  }

  // Sender moderates.
  await page.goto(`/dashboard/wishes/${wishId}/collect`);
  await expect(
    page.getByRole("heading", { name: /Gather Amma/i }),
  ).toBeVisible();
  await expect(page.getByText(CONTRIBUTOR_NOTE)).toBeVisible();
  await expect(page.getByText("2 to review")).toBeVisible();

  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("1 to review")).toBeVisible();

  // Publish, then check the receiver side.
  const published = await request.post(`/api/wishes/${wishId}/publish`);
  expect(published.ok()).toBeTruthy();

  const receiverContext = await browser.newContext();
  const receiver = await receiverContext.newPage();

  try {
    await receiver.goto(`/w/${wishId}`);
    await receiver.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await receiver.getByRole("button", { name: "Unlock" }).click();
    await expect(receiver).toHaveURL(new RegExp(`/w/${wishId}/reveal`));

    await receiver.getByRole("button", { name: "Unwrap it" }).click();
    await expect(
      receiver.getByRole("heading", { name: "Their memories, together." }),
    ).toBeVisible();
    await expect(receiver.getByText(CONTRIBUTOR_NOTE)).toBeVisible();
    await expect(receiver.getByText("Ravi")).toBeVisible();

    // The unapproved photo from Meera must not be on the wall.
    await expect(receiver.getByText("Meera")).toHaveCount(0);
  } finally {
    await receiverContext.close();
  }
});

test("a revoked contributor link stops working", async ({ request, browser }) => {
  const { wishId, token } = await createGroupWish(request);

  const revoked = await request.delete(`/api/wishes/${wishId}/contributor-link`);
  expect(revoked.ok()).toBeTruthy();

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const response = await page.goto(`/c/${token}`);
    expect(response?.status()).toBe(404);

    const submit = await request.post(`/api/c/${token}/contribute`, {
      data: { contributorName: "Ravi", type: "text", text: "Too late" },
    });
    expect(submit.status()).toBe(404);
  } finally {
    await context.close();
  }
});

test("published group wishes stop accepting contributions", async ({ request }) => {
  const { wishId, token } = await createGroupWish(request);

  expect((await request.post(`/api/wishes/${wishId}/publish`)).ok()).toBeTruthy();

  const submit = await request.post(`/api/c/${token}/contribute`, {
    data: { contributorName: "Ravi", type: "text", text: "Late" },
  });
  expect(submit.status()).toBe(404);
});
