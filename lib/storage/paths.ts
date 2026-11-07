import "server-only";
import path from "node:path";
import { env } from "@/lib/env";

export function dataDir(): string {
  return path.resolve(process.cwd(), env().DATA_DIR);
}

export function collectionPath(name: string): string {
  return path.join(dataDir(), `${name}.json`);
}
