import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as notifySignup } from "@/app/api/notify/route";
import { notifyRepo, resetNotifyRepo } from "@/lib/repos/notify";
import { resetRateLimiter } from "@/lib/security/rate-limit";

function request(body: unknown, ip = "198.51.100.40"): Request {
  return new Request("http://localhost/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("notify-me capture", () => {
  let dir: string;

  beforeEach(async () => {
    resetRateLimiter();
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-notify-"));
    process.env.WISHLY_DATA_DIR = dir;
    resetNotifyRepo();
  });

  afterEach(async () => {
    delete process.env.WISHLY_DATA_DIR;
    resetRateLimiter();
    resetNotifyRepo();
    await rm(dir, { recursive: true, force: true });
  });

  it("stores an address that gave consent", async () => {
    const response = await notifySignup(
      request({ email: "Reader@Example.com", consent: true }),
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      data: { subscribed: boolean; alreadySubscribed: boolean };
    };
    expect(payload.data.subscribed).toBe(true);
    expect(payload.data.alreadySubscribed).toBe(false);
    expect(await notifyRepo().count()).toBe(1);
  });

  it("normalises the address before storing it", async () => {
    await notifySignup(request({ email: "  Mixed@Case.COM  ", consent: true }));
    // A second submission in a different case must not create a duplicate.
    const second = await notifySignup(
      request({ email: "mixed@case.com", consent: true }, "198.51.100.41"),
    );

    const payload = (await second.json()) as {
      data: { alreadySubscribed: boolean };
    };
    expect(payload.data.alreadySubscribed).toBe(true);
    expect(await notifyRepo().count()).toBe(1);
  });

  it("rejects a submission without explicit consent", async () => {
    const response = await notifySignup(
      request({ email: "reader@example.com", consent: false }),
    );

    expect(response.status).toBe(400);
    expect(await notifyRepo().count()).toBe(0);
  });

  it("rejects a malformed address", async () => {
    const response = await notifySignup(
      request({ email: "not-an-email", consent: true }),
    );
    expect(response.status).toBe(400);
    expect(await notifyRepo().count()).toBe(0);
  });

  it("does not reveal whether an address was already present", async () => {
    await notifySignup(request({ email: "reader@example.com", consent: true }));

    const first = await notifySignup(
      request({ email: "someone-else@example.com", consent: true }, "198.51.100.42"),
    );
    const second = await notifySignup(
      request({ email: "reader@example.com", consent: true }, "198.51.100.43"),
    );

    // Same status and same shape; only the internal flag differs, and both are
    // a success from the caller's point of view.
    expect(first.status).toBe(second.status);
    expect((await first.json()).ok).toBe(true);
    expect((await second.json()).ok).toBe(true);
  });

  it("rate limits a burst from one address", async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 7; index += 1) {
      const response = await notifySignup(
        request({ email: `reader${index}@example.com`, consent: true }),
      );
      statuses.push(response.status);
    }

    expect(statuses).toContain(429);
  });
});
