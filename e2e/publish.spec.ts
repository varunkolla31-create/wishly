import { expect, test, type APIRequestContext } from "@playwright/test";

test.describe.configure({ mode: "serial", timeout: 300_000 });

const RECEIVER_MESSAGE =
  "Amma, every good thing I know how to do started with watching you.";

async function createPublishedWish(
  request: APIRequestContext,
  password: string,
): Promise<string> {
  const created = await request.post("/api/wishes", { data: {} });
  expect(created.ok()).toBeTruthy();
  const createdPayload = (await created.json()) as {
    data: { wishId: string };
  };
  const wishId = createdPayload.data.wishId;

  const patched = await request.patch(`/api/wishes/${wishId}`, {
    data: {
      receiverName: "Amma",
      title: "Happy birthday, Amma",
      message: RECEIVER_MESSAGE,
      musicId: "warm-glow",
    },
  });
  expect(patched.ok()).toBeTruthy();

  const passwordResponse = await request.post(
    `/api/wishes/${wishId}/password`,
    { data: { password, hint: "A flower and a number" } },
  );
  expect(passwordResponse.ok()).toBeTruthy();

  const published = await request.post(`/api/wishes/${wishId}/publish`);
  expect(published.ok()).toBeTruthy();

  return wishId;
}

test("publishes from the wizard, unlocks, reveals, and replies", async ({
  page,
  request,
  browser,
}) => {
  const wishId = await createPublishedWish(request, "Golden-Orchid-42!");

  await page.goto(`/dashboard/wishes/${wishId}/edit?step=4`);
  await expect(
    page.getByRole("heading", { name: "Lock it with a password." }),
  ).toBeVisible();

  await page.getByLabel("Password", { exact: true }).fill("Golden-Orchid-42!");
  await page.getByLabel("Once more").fill("Golden-Orchid-42!");
  await page.getByLabel(/Hint/).fill("A flower and a number");
  await page.getByRole("button", { name: "Replace password" }).click();
  await expect(
    page.getByText("Saved. Keep it somewhere safe."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Exactly what they'll see." }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Publish wish" }).click();
  await expect(
    page.getByRole("heading", { name: "It's live." }),
  ).toBeVisible();

  const link = await page.locator("#published-link").inputValue();
  const password = await page.locator("#published-password").inputValue();
  expect(link).toContain(`/w/${wishId}`);
  expect(password).toBe("Golden-Orchid-42!");
  await expect(
    page.getByRole("img", { name: "QR code for the wish link" }),
  ).toBeVisible();

  const receiverContext = await browser.newContext();
  const receiver = await receiverContext.newPage();

  try {
    const lockResponse = await receiver.goto(`/w/${wishId}`);
    expect(lockResponse?.headers()["x-robots-tag"]).toContain("noindex");

    await expect(
      receiver.getByRole("heading", {
        name: "Someone made something for you.",
      }),
    ).toBeVisible();
    await expect(receiver.getByText("Amma", { exact: true })).toBeVisible();
    await expect(receiver.getByText(/Hint: A flower and a number/)).toBeVisible();

    const lockText = await receiver.locator("body").innerText();
    expect(lockText).not.toContain(RECEIVER_MESSAGE);
    expect(lockText).not.toContain("Happy birthday, Amma");

    const metaResponse = await receiverContext.request.get(
      `/api/w/${wishId}/meta`,
    );
    expect(metaResponse.ok()).toBeTruthy();
    const meta = (await metaResponse.json()) as { data: Record<string, unknown> };
    expect(Object.keys(meta.data).sort()).toEqual([
      "category",
      "hint",
      "id",
      "lockState",
      "receiverName",
      "templateId",
      "tone",
      "unlockAt",
    ]);
    expect(JSON.stringify(meta)).not.toContain(RECEIVER_MESSAGE);

    const lockedContent = await receiverContext.request.get(
      `/api/w/${wishId}/content`,
    );
    expect(lockedContent.status()).toBe(401);

    await receiver.getByLabel("Password", { exact: true }).fill("not the password");
    await receiver.getByRole("button", { name: "Unlock" }).click();
    await expect(
      receiver.getByText("That password didn't match. Try again."),
    ).toBeVisible();

    await receiver.getByLabel("Password", { exact: true }).fill("Golden-Orchid-42!");
    await receiver.getByRole("button", { name: "Unlock" }).click();
    await expect(receiver).toHaveURL(new RegExp(`/w/${wishId}/reveal`));

    await expect(
      receiver.getByRole("heading", { name: "For Amma." }),
    ).toBeVisible();
    await receiver.getByRole("button", { name: "Unwrap it" }).click();

    await expect(
      receiver.getByRole("heading", { name: "Happy birthday, Amma" }),
    ).toBeVisible();
    await receiver
      .getByRole("button", { name: "Show the whole message" })
      .click();
    await expect(
      receiver.getByText(RECEIVER_MESSAGE).first(),
    ).toBeVisible();

    const unlockedContent = await receiverContext.request.get(
      `/api/w/${wishId}/content`,
    );
    expect(unlockedContent.ok()).toBeTruthy();
    const content = (await unlockedContent.json()) as {
      data: Record<string, unknown>;
    };
    expect(content.data).not.toHaveProperty("passwordHash");
    expect(content.data).not.toHaveProperty("ownerId");
    expect(JSON.stringify(content)).toContain(RECEIVER_MESSAGE);

    await receiver.getByRole("button", { name: "React with 🎉" }).click();
    await receiver.getByLabel("Your reply").fill("This made my whole week.");
    await receiver.getByRole("button", { name: "Send reply" }).click();
    await expect(receiver.getByRole("heading", { name: "Sent." })).toBeVisible();

    await page.goto("/dashboard/replies");
    await expect(
      page.getByText("This made my whole week.", { exact: true }),
    ).toBeVisible();
  } finally {
    await receiverContext.close();
  }
});

test("rate limits unlock attempts per wish", async ({ request }) => {
  const wishId = await createPublishedWish(request, "correct horse battery");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request.post(`/api/w/${wishId}/unlock`, {
      data: { password: "wrong" },
    });
    expect(response.status()).toBe(401);
  }

  const blocked = await request.post(`/api/w/${wishId}/unlock`, {
    data: { password: "correct horse battery" },
  });
  expect(blocked.status()).toBe(429);
  expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(0);
});

test("unknown wishes are 404 and never render content", async ({ request }) => {
  const meta = await request.get("/api/w/notarealwishid123456/meta");
  expect(meta.status()).toBe(404);

  const content = await request.get("/api/w/notarealwishid123456/content");
  expect(content.status()).toBe(404);
});
