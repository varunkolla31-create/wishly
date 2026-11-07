import { expect, test, type Page } from "@playwright/test";

const THUMB = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

interface Item {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

function makeItem(id: string, title: string): Item {
  return {
    videoId: id.padEnd(11, "x").slice(0, 11),
    title,
    channel: "Mock Channel",
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    durationSeconds: 201,
  };
}

const topItems = Array.from({ length: 10 }, (_, index) =>
  makeItem(`top${index}`, `Top song ${index + 1}`),
);

function searchItem(query: string): Item {
  const title =
    query === "firstquery"
      ? "FirstQueryResult"
      : query === "secondquery"
        ? "SecondQueryResult"
        : `Result for ${query}`;
  return makeItem(`srch${query}`, title);
}

async function openMusicStep(page: Page) {
  await page.route("**/api/music/top", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { source: "youtube", items: topItems },
      }),
    }),
  );
  await page.route("https://i.ytimg.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: THUMB }),
  );
  await page.route("https://www.youtube.com/iframe_api", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: "window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();",
    }),
  );

  await page.route("**/api/music/search?*", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") ?? "";
    if (query === "quota") {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: {
            code: "quota_busy",
            message:
              "Search is busy right now. Pick from the Top 10 or paste a link.",
          },
        }),
      });
      return;
    }
    if (query === "firstquery") await new Promise((r) => setTimeout(r, 900));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { source: "youtube", items: [searchItem(query)] },
      }),
    });
  });

  await page.goto("/create");
  await page.getByRole("button", { name: "3. Words" }).click();
  await expect(page.getByText("Music from YouTube")).toBeVisible();
  await page.getByText("Music from YouTube").scrollIntoViewIfNeeded();
  await expect(page.getByText("Top 10 on YouTube")).toBeVisible();
}

test.describe("YouTube music picker", () => {
  test("shows the Top 10 by default and search replaces the list", async ({
    page,
  }) => {
    await openMusicStep(page);
    await expect(page.getByTestId("music-row")).toHaveCount(10);
    await expect(page.getByText("Top song 1", { exact: true })).toBeVisible();

    const search = page.getByRole("searchbox", {
      name: "Search songs on YouTube",
    });
    await search.fill("golden");
    await expect(page.getByText("Result for golden")).toBeVisible();
    await expect(page.getByTestId("music-row")).toHaveCount(1);
    await expect(
      page.getByText("Top song 1", { exact: true }),
    ).toHaveCount(0);

    await page
      .getByRole("button", { name: "Clear search and return to the Top 10" })
      .click();
    await expect(page.getByText("Top 10 on YouTube")).toBeVisible();
    await expect(page.getByTestId("music-row")).toHaveCount(10);
  });

  test("a slow older query cannot overwrite a newer one", async ({ page }) => {
    await openMusicStep(page);
    const search = page.getByRole("searchbox", {
      name: "Search songs on YouTube",
    });

    await search.fill("firstquery");
    await page.waitForTimeout(500);
    await search.fill("secondquery");

    await expect(page.getByText("SecondQueryResult")).toBeVisible({
      timeout: 5_000,
    });
    await page.waitForTimeout(1_200);
    await expect(page.getByText("FirstQueryResult")).toHaveCount(0);
    await expect(page.getByText("SecondQueryResult")).toBeVisible();
  });

  test("selecting replaces the previous song and Remove clears it", async ({
    page,
  }) => {
    await openMusicStep(page);
    const rows = page.getByTestId("music-row");

    await rows.nth(0).getByRole("button", { name: "Select" }).click();
    const selected = page.getByTestId("now-selected");
    await expect(selected).toContainText("Top song 1");

    await rows.nth(1).getByRole("button", { name: "Select" }).click();
    await expect(selected).toContainText("Top song 2");
    await expect(selected).not.toContainText("Top song 1");

    await selected.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByTestId("now-selected")).toHaveCount(0);
  });

  test("quota busy keeps the Top 10 and paste available", async ({ page }) => {
    await openMusicStep(page);
    const search = page.getByRole("searchbox", {
      name: "Search songs on YouTube",
    });
    await search.fill("quota");
    await expect(
      page.getByText(
        "Search is busy right now. Pick from the Top 10 or paste a link.",
      ),
    ).toBeVisible();
    await expect(page.locator("#music-paste-link")).toBeVisible();

    await page
      .getByRole("button", { name: "Clear search and return to the Top 10" })
      .click();
    await expect(page.getByTestId("music-row")).toHaveCount(10);
  });

  test("only one visible preview player exists at a time", async ({ page }) => {
    await openMusicStep(page);
    const preview = page.getByRole("button", { name: /^Preview / });
    await preview.nth(0).click();
    await preview.nth(1).click();
    await expect(page.locator('[aria-label^="YouTube player"]')).toHaveCount(1);
  });
});
