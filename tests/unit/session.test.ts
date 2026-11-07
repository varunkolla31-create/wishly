import { afterEach, describe, expect, it } from "vitest";
import { getSender, isDevAuthBypassEnabled } from "@/lib/auth/session";

describe("dev auth bypass", () => {
  afterEach(() => {
    delete process.env.AUTH_MODE;
    delete process.env.WISHLY_DEV_AUTH_BYPASS;
  });

  it("returns the demo sender when enabled", async () => {
    process.env.AUTH_MODE = "dev";
    process.env.WISHLY_DEV_AUTH_BYPASS = "true";

    expect(isDevAuthBypassEnabled()).toBe(true);
    const sender = await getSender();
    expect(sender?.userId).toBe("dev_sender");
    expect(sender?.email).toBe("dev@wishly.local");
  });

  it("returns no sender when the bypass is off", async () => {
    process.env.AUTH_MODE = "dev";
    process.env.WISHLY_DEV_AUTH_BYPASS = "false";

    expect(isDevAuthBypassEnabled()).toBe(false);
    await expect(getSender()).resolves.toBeNull();
  });
});
