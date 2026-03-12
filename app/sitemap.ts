import type { MetadataRoute } from "next";
import { getPublishedRoutes } from "@/lib/data/routes-db";
import { getPublishedContentItems } from "@/lib/data/content-items";

const locales = ["fi", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verter.fi";
  const [routes, contentFi, contentEn] = await Promise.all([
    getPublishedRoutes(),
    getPublishedContentItems("fi"),
    getPublishedContentItems("en"),
  ]);

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
    routes.map((route) => ({
      url: `${baseUrl}/${locale}/routes/${route.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  const contentPages: MetadataRoute.Sitemap = [
    ...contentFi.map((item) => ({
      url: `${baseUrl}/fi/content/${item.slug}`,
      lastModified: item.published_at ? new Date(item.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...contentEn.map((item) => ({
      url: `${baseUrl}/en/content/${item.slug}`,
      lastModified: item.published_at ? new Date(item.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...routePages, ...contentPages];
}
