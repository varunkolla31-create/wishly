import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/security/password";

describe("password hashing", () => {
  it("hashes with argon2id and verifies the original password", async () => {
    const password = "correct horse battery staple";
    const hashed = await hashPassword(password);

    expect(hashed.startsWith("$argon2id$")).toBe(true);
    expect(hashed).not.toContain(password);
    await expect(verifyPassword(hashed, password)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hashed = await hashPassword("open sesame");
    await expect(verifyPassword(hashed, "open sesame!")).resolves.toBe(false);
  });

  it("fails closed when no hash is stored", async () => {
    await expect(verifyPassword(null, "anything")).resolves.toBe(false);
  });
});
