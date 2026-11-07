import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env-public";

export default function robots(): MetadataRoute.Robots {
  const base = publicEnv.appUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api", "/w/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
