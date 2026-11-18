import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as readMedia } from "@/app/api/media/[...key]/route";
import { mediaFilePath } from "@/lib/media/storage";
import { mediaProxyUrl } from "@/lib/media/read-url";
import { wishRepo } from "@/lib/repos/index";
import { hashPassword } from "@/lib/security/password";
import { signUnlockToken, unlockCookieName } from "@/lib/security/unlock-token";

const SEGMENT = "%2F";

/** Builds the URL shape the route receives after Next decodes the segments. */
function context(key: string) {
  return { params: Promise.resolve({ key: key.split("/") }) };
}

function request(url: string, cookie?: string): Request {
  return new Request(url, {
    headers: cookie ? { cookie } : undefined,
  });
}

async function publishWishWithPhoto() {
  const wish = await wishRepo().create({
    ownerId: "owner_1",
    category: "birthday",
    templateId: "confetti-pop",
    receiverName: "Amma",
  });
  const key = `wishes/${wish.wishId}/photo/frame1.jpg`;
  const filePath = mediaFilePath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from("fake-jpeg-bytes"));

  await wishRepo().update(wish.wishId, {
    message: "A private letter",
    passwordHash: await hashPassword("golden88"),
    mediaKeys: [key],
    status: "published",
  });

  const updated = await wishRepo().getById(wish.wishId);
  if (!updated) throw new Error("Expected the wish to exist.");
  return { wish: updated, key };
}

describe("media gating", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-media-"));
    process.env.WISHLY_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it("refuses a media URL when the wish is still locked", async () => {
    const { wish, key } = await publishWishWithPhoto();
    const url = mediaProxyUrl(key, wish.passwordVersion);

    // No unlock cookie: the exact URL the reveal page would hand out must fail.
    const response = await readMedia(request(url), context(key));
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain("fake-jpeg-bytes");
  });

  it("refuses a bare object key with no token at all", async () => {
    const { key } = await publishWishWithPhoto();
    const url = `http://localhost/api/media/${key}`;

    const response = await readMedia(request(url), context(key));
    expect(response.status).toBe(403);
  });

  it("serves the bytes once the unlock cookie is present", async () => {
    const { wish, key } = await publishWishWithPhoto();
    const url = mediaProxyUrl(key, wish.passwordVersion);
    const token = await signUnlockToken({
      wishId: wish.wishId,
      passwordVersion: wish.passwordVersion,
    });
    const cookie = `${unlockCookieName(wish.wishId)}=${token}`;

    const response = await readMedia(request(url, cookie), context(key));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("fake-jpeg-bytes");
  });

  it("retires every outstanding link when the password changes", async () => {
    const { wish, key } = await publishWishWithPhoto();
    const url = mediaProxyUrl(key, wish.passwordVersion);
    const token = await signUnlockToken({
      wishId: wish.wishId,
      passwordVersion: wish.passwordVersion,
    });
    const cookie = `${unlockCookieName(wish.wishId)}=${token}`;

    // Bumping the version is what a password change does.
    await wishRepo().update(wish.wishId, {
      passwordVersion: wish.passwordVersion + 1,
    });

    const response = await readMedia(request(url, cookie), context(key));
    expect(response.status).toBe(403);
  });

  it("rejects a token minted for a different key", async () => {
    const { wish, key } = await publishWishWithPhoto();
    const otherKey = `wishes/${wish.wishId}/photo/frame2.jpg`;
    const forged = mediaProxyUrl(otherKey, wish.passwordVersion).replace(
      otherKey.split("/").map(encodeURIComponent).join("/"),
      key.split("/").map(encodeURIComponent).join("/"),
    );

    const response = await readMedia(request(forged), context(key));
    expect(response.status).toBe(403);
  });

  it("rejects a wish that is not published", async () => {
    const { wish, key } = await publishWishWithPhoto();
    const url = mediaProxyUrl(key, wish.passwordVersion);
    const token = await signUnlockToken({
      wishId: wish.wishId,
      passwordVersion: wish.passwordVersion,
    });
    const cookie = `${unlockCookieName(wish.wishId)}=${token}`;

    await wishRepo().update(wish.wishId, { status: "draft" });

    const response = await readMedia(request(url, cookie), context(key));
    expect(response.status).toBe(404);
  });

  it("never puts a storage host in the URL it hands out", async () => {
    const { wish, key } = await publishWishWithPhoto();
    const url = mediaProxyUrl(key, wish.passwordVersion);
    expect(url).toContain("/api/media/");
    expect(url).not.toContain("r2.cloudflarestorage.com");
    expect(url).not.toContain("amazonaws.com");
    expect(url).not.toContain(SEGMENT);
  });
});
