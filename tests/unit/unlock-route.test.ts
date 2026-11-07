import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as unlockWish } from "@/app/api/w/[id]/unlock/route";
import { wishRepo } from "@/lib/repos/index";
import { hashPassword } from "@/lib/security/password";

async function createPublishedWish(password: string) {
  const wish = await wishRepo().create({
    ownerId: "owner_1",
    category: "birthday",
    templateId: "confetti-pop",
    receiverName: "Amma",
  });

  await wishRepo().update(wish.wishId, {
    message: "A private letter",
    passwordHash: await hashPassword(password),
    passwordHint: "A sweet",
    status: "published",
  });

  return wish;
}

function attempt(password: string, id: string, ip: string): Request {
  return new Request(`http://localhost/api/w/${id}/unlock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ password }),
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("unlock route", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-unlock-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("rejects a wrong password generically", async () => {
    const wish = await createPublishedWish("correct horse");

    const response = await unlockWish(
      attempt("wrong password", wish.wishId, "198.51.100.10"),
      params(wish.wishId),
    );
    expect(response.status).toBe(401);

    const payload = (await response.json()) as {
      error: { message: string };
    };
    expect(payload.error.message).toBe("That password didn't match.");
  });

  it("sets a short-lived httpOnly cookie on success", async () => {
    const wish = await createPublishedWish("correct horse");

    const response = await unlockWish(
      attempt("correct horse", wish.wishId, "198.51.100.11"),
      params(wish.wishId),
    );

    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`wishly_unlock_${wish.wishId}=`);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
    expect(cookie).toContain("Max-Age=7200");
  });

  it("hides unknown wishes and spends comparable work", async () => {
    const response = await unlockWish(
      attempt("anything", "doesnotexist123456789", "198.51.100.12"),
      params("doesnotexist123456789"),
    );
    expect(response.status).toBe(404);
  });

  it("allows five wrong tries, then a cooldown", async () => {
    const wish = await createPublishedWish("correct horse");
    const ip = "198.51.100.13";

    for (let attemptIndex = 0; attemptIndex < 5; attemptIndex += 1) {
      const response = await unlockWish(
        attempt("wrong", wish.wishId, ip),
        params(wish.wishId),
      );
      expect(response.status).toBe(401);
    }

    const blocked = await unlockWish(
      attempt("correct horse", wish.wishId, ip),
      params(wish.wishId),
    );
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);

    const payload = (await blocked.json()) as {
      error: { message: string };
    };
    expect(payload.error.message).toMatch(/too many tries/i);
  });

  it("refuses to unlock a draft", async () => {
    const wish = await wishRepo().create({
      ownerId: "owner_1",
      category: "birthday",
      templateId: "confetti-pop",
    });
    await wishRepo().update(wish.wishId, {
      passwordHash: await hashPassword("secret"),
    });

    const response = await unlockWish(
      attempt("secret", wish.wishId, "198.51.100.14"),
      params(wish.wishId),
    );
    expect(response.status).toBe(404);
  });
});
