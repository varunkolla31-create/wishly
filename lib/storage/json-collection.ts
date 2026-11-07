import "server-only";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type Mutation<T, R> = (items: T[]) => { items: T[]; result: R };

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

async function renameWithRetry(from: string, to: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await rename(from, to);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 40 * (attempt + 1)));
    }
  }
  await unlink(from).catch(() => undefined);
  throw lastError;
}

/**
 * A small JSON-file collection with serialized, atomic writes. One instance per
 * file path is shared through the repo factory so concurrent requests queue.
 */
export class JsonCollection<T> {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async read(): Promise<T[]> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (error) {
      if (isMissingFile(error)) return [];
      throw error;
    }
  }

  async mutate<R>(mutation: Mutation<T, R>): Promise<R> {
    let release!: () => void;
    const previous = this.queue;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    try {
      const current = await this.read();
      const { items, result } = mutation(current);
      await this.write(items);
      return result;
    } finally {
      release();
    }
  }

  private async write(items: T[]): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temp = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temp, JSON.stringify(items, null, 2), "utf8");
    await renameWithRetry(temp, this.filePath);
  }
}
