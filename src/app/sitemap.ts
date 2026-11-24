import type { MetadataRoute } from "next";
import { PDF_TOOLS } from "@/data/tools";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kivopdf.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacidad/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...PDF_TOOLS.map((tool) => ({
      url: `${BASE_URL}/es/${tool.slug}/`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
