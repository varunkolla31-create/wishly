import "server-only";
import { randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";

// Argon2id is the library default; parameters follow the OWASP minimums.
const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, HASH_OPTIONS);
}

let dummyHash: string | null = null;

async function getDummyHash(): Promise<string> {
  if (!dummyHash) {
    dummyHash = await hash(randomUUID(), HASH_OPTIONS);
  }
  return dummyHash;
}

export async function verifyPassword(
  storedHash: string | null,
  password: string,
): Promise<boolean> {
  if (!storedHash) {
    await verify(await getDummyHash(), password).catch(() => false);
    return false;
  }

  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}
