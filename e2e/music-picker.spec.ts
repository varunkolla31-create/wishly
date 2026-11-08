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
            message: "Search is busy right now. Try again or paste a link.",
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
        data: { items: [searchItem(query)] },
      }),
    });
  });

  await page.goto("/create");
  await page.getByRole("button", { name: "4. Words" }).click();
  await expect(page.getByTestId("music-section")).toBeVisible();
  await page.getByTestId("music-section").scrollIntoViewIfNeeded();
  await expect(page.getByText("Find a song")).toBeVisible();
}

test.describe("YouTube music picker", () => {
  test("starts empty and searches for a song", async ({ page }) => {
    await openMusicStep(page);
    await expect(page.getByTestId("music-row")).toHaveCount(0);

    const search = page.getByRole("searchbox", {
      name: "Search songs",
    });
    await search.fill("golden");
    await expect(page.getByText("Result for golden")).toBeVisible();
    await expect(page.getByTestId("music-row")).toHaveCount(1);
    await expect(page.getByText(/^Top song/)).toHaveCount(0);

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByTestId("music-row")).toHaveCount(0);
    await expect(page.getByText("Find a song")).toBeVisible();
  });

  test("a slow older query cannot overwrite a newer one", async ({ page }) => {
    await openMusicStep(page);
    const search = page.getByRole("searchbox", {
      name: "Search songs",
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
    const search = page.getByRole("searchbox", {
      name: "Search songs",
    });

    await search.fill("firstquery");
    await expect(page.getByText("FirstQueryResult")).toBeVisible();
    await page
      .getByTestId("music-row")
      .getByRole("button", { name: "Select" })
      .click();
    const selected = page.getByTestId("now-selected");
    await expect(selected).toContainText("FirstQueryResult");

    await search.fill("secondquery");
    await expect(page.getByText("SecondQueryResult")).toBeVisible();
    await page
      .getByTestId("music-row")
      .getByRole("button", { name: "Select" })
      .click();
    await expect(selected).toContainText("SecondQueryResult");
    await expect(selected).not.toContainText("FirstQueryResult");

    await selected.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByTestId("now-selected")).toHaveCount(0);
  });

  test("quota busy keeps paste available and clears to empty", async ({
    page,
  }) => {
    await openMusicStep(page);
    const search = page.getByRole("searchbox", {
      name: "Search songs",
    });
    await search.fill("quota");
    await expect(
      page.getByText("Search is busy right now. Try again or paste a link."),
    ).toBeVisible();
    await expect(page.locator("#music-paste-link")).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByTestId("music-row")).toHaveCount(0);
    await expect(page.getByText("Find a song")).toBeVisible();
  });

  test("only one visible preview player exists at a time", async ({ page }) => {
    await openMusicStep(page);
    const search = page.getByRole("searchbox", {
      name: "Search songs",
    });

    await search.fill("firstquery");
    await page.getByRole("button", { name: "Preview FirstQueryResult" }).click();
    await expect(page.getByTestId("audio-player-preview")).toHaveCount(1);

    await search.fill("secondquery");
    await page
      .getByRole("button", { name: "Preview SecondQueryResult" })
      .click();
    await expect(page.getByTestId("audio-player-preview")).toHaveCount(1);
  });
});
