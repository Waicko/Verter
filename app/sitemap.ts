import type { MetadataRoute } from "next";
import { routesWithDensity } from "@/lib/data/routes";
import { contentItems } from "@/lib/data/content";

const locales = ["fi", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verter.fi";

  const staticPaths = ["", "/routes", "/content", "/leirit", "/camps", "/about"];
  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.9,
    }))
  );

  const routePages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    routesWithDensity.map((route) => ({
      url: `${baseUrl}/${locale}/routes/${route.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  const contentPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    contentItems.map((item) => ({
      url: `${baseUrl}/${locale}/content/${item.slug}`,
      lastModified: item.published_at ? new Date(item.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...routePages, ...contentPages];
}
