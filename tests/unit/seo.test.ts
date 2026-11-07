import { describe, expect, it } from "vitest";
import { pageMetadata } from "@/lib/seo";

describe("pageMetadata", () => {
  it("builds canonical, Open Graph and Twitter metadata", () => {
    const metadata = pageMetadata({
      title: "Birthday wish pages",
      description: "A birthday page they unlock like a gift.",
      path: "/occasions/birthday",
    });

    expect(metadata.title).toBe("Birthday wish pages");
    expect(metadata.description).toBe("A birthday page they unlock like a gift.");
    expect(metadata.alternates?.canonical).toBe("/occasions/birthday");

    const openGraph = metadata.openGraph;
    expect(openGraph).toMatchObject({
      title: "Birthday wish pages · Wishly",
      url: "/occasions/birthday",
      type: "website",
    });
  });
});
