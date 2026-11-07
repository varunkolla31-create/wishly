import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JsonCollection } from "@/lib/storage/json-collection";

interface Row {
  id: string;
  value: number;
}

describe("JsonCollection", () => {
  let dir: string;
  let collection: JsonCollection<Row>;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), "wishly-store-"));
    collection = new JsonCollection<Row>(path.join(dir, "rows.json"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("reads an empty collection when the file is missing", async () => {
    await expect(collection.read()).resolves.toEqual([]);
  });

  it("persists mutations and reads them back", async () => {
    await collection.mutate((items) => ({
      items: [...items, { id: "a", value: 1 }],
      result: null,
    }));

    await expect(collection.read()).resolves.toEqual([{ id: "a", value: 1 }]);
  });

  it("serializes concurrent mutations without losing writes", async () => {
    await Promise.all(
      Array.from({ length: 25 }, (_, index) =>
        collection.mutate((items) => ({
          items: [...items, { id: `row-${index}`, value: index }],
          result: null,
        })),
      ),
    );

    const rows = await collection.read();
    expect(rows).toHaveLength(25);
    expect(new Set(rows.map((row) => row.id)).size).toBe(25);
  });
});
