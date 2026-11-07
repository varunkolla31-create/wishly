import type { MetadataRoute } from "next";
import { OCCASIONS } from "@/lib/catalog/occasions";
import { publicEnv } from "@/lib/env-public";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.appUrl.replace(/\/$/, "");

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/templates", priority: 0.7 },
    { path: "/studio", priority: 0.7 },
    { path: "/pricing", priority: 0.4 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...OCCASIONS.map((occasion) => ({
      url: `${base}/occasions/${occasion.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
