import { describe, expect, it } from "vitest";
import {
  signMediaToken,
  verifyMediaToken,
} from "@/lib/security/media-token";
import {
  signUnlockToken,
  unlockCookieName,
  verifyUnlockToken,
} from "@/lib/security/unlock-token";

describe("unlock token", () => {
  const wishId = "wish_abc123";
  const input = { wishId, passwordVersion: 1 };

  it("round-trips a token bound to a wish and password version", async () => {
    const token = await signUnlockToken(input);

    await expect(verifyUnlockToken(token, input)).resolves.toBe(true);
    await expect(
      verifyUnlockToken(token, { wishId: "other_wish", passwordVersion: 1 }),
    ).resolves.toBe(false);
    await expect(
      verifyUnlockToken(token, { wishId, passwordVersion: 2 }),
    ).resolves.toBe(false);
  });

  it("rejects a tampered token", async () => {
    const token = await signUnlockToken(input);
    await expect(
      verifyUnlockToken(`${token}x`, input),
    ).resolves.toBe(false);
  });

  it("scopes the cookie name per wish", () => {
    expect(unlockCookieName(wishId)).toBe(`wishly_unlock_${wishId}`);
    expect(unlockCookieName(wishId)).not.toBe(unlockCookieName("other"));
  });
});

describe("media token", () => {
  const key = "wishes/wish_abc123/photo/object_1.png";

  it("accepts a matching action and rejects others", () => {
    const token = signMediaToken(key, "put");
    expect(verifyMediaToken(key, "put", token)).toBe(true);
    expect(verifyMediaToken(key, "get", token)).toBe(false);
    expect(verifyMediaToken(`${key}-other`, "put", token)).toBe(false);
  });

  it("expires", () => {
    const issuedAt = 1_700_000_000_000;
    const token = signMediaToken(key, "get", issuedAt);
    expect(verifyMediaToken(key, "get", token, issuedAt + 60_000)).toBe(true);
    expect(
      verifyMediaToken(key, "get", token, issuedAt + 61 * 60 * 1000),
    ).toBe(false);
  });
});
