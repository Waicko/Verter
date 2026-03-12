import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublishedRouteBySlug } from "@/lib/data/routes-db";
import { getPublishedContentItemsByRouteSlug } from "@/lib/data/content-items";
import RouteDetailWithGpx from "@/components/routes/RouteDetailWithGpx";
import RouteTrustBadges from "@/components/routes/RouteTrustBadges";
import SourceMetadataDisplay from "@/components/SourceMetadataDisplay";
import RouteGpxDisclaimer from "@/components/RouteGpxDisclaimer";

interface RouteDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const { getPublishedRoutes } = await import("@/lib/data/routes-db");
  const routes = await getPublishedRoutes();
  const locales = ["fi", "en"];
  return routes.flatMap((route) =>
    locales.map((locale) => ({ locale, slug: route.slug }))
  );
}

export async function generateMetadata({ params }: RouteDetailPageProps) {
  const { locale, slug } = await params;
  const route = await getPublishedRouteBySlug(slug);
  if (!route) {
    const t = await getTranslations({ locale, namespace: "common" });
    return { title: t("routeNotFound") };
  }
  const desc = route.area
    ? `${route.title} - ${route.area}. ${route.distance_km ?? ""} km, ${route.ascent_m ?? ""} m elevation.`
    : `${route.title} - ${route.distance_km ?? ""} km, ${route.ascent_m ?? ""} m elevation. Finland.`;
  return {
    title: route.title,
    description: desc,
    openGraph: {
      title: `${route.title} | Verter`,
      description: desc,
    },
  };
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("routes");
  const dbRoute = await getPublishedRouteBySlug(slug);
  if (dbRoute) {
    const relatedContent = await getPublishedContentItemsByRouteSlug(slug);
    return (
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto min-w-0 max-w-2xl">
          <Link
            href="/routes"
            className="mb-6 inline-flex text-sm font-medium text-verter-muted hover:text-verter-graphite"
          >
            {t("backToRoutes")}
          </Link>
          <h1 className="break-words font-heading text-3xl font-bold text-verter-graphite">
            {dbRoute.title}
          </h1>
          {dbRoute.area && (
            <p className="mt-2 break-words text-verter-muted">{dbRoute.area}</p>
          )}
          <RouteTrustBadges
            route={{
              submitted_by_strava_url: dbRoute.submitted_by_strava_url,
              approved_by_verter: dbRoute.approved_by_verter,
              tested_by_team: dbRoute.tested_by_team,
              tested_notes: dbRoute.tested_notes,
            }}
            className="mt-4"
          />
          <div className="mt-8">
            <RouteDetailWithGpx route={dbRoute} />
          </div>
          <SourceMetadataDisplay
            metadata={{
              source_name: dbRoute.source_name ?? undefined,
              source_type: dbRoute.source_type ?? undefined,
              verification_status: dbRoute.verification_status ?? undefined,
              route_origin_name: dbRoute.route_origin_name ?? undefined,
              route_origin_type: dbRoute.route_origin_type ?? undefined,
            }}
            includeRouteOrigin
          />
          <RouteGpxDisclaimer />

          {relatedContent.length > 0 && (
            <section className="mt-12 min-w-0 border-t border-verter-border pt-8">
              <h2 className="font-heading text-lg font-semibold text-verter-graphite">
                {t("relatedArticles")}
              </h2>
              <ul className="mt-4 min-w-0 space-y-2 break-words">
                {relatedContent.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/content/${item.slug}`}
                      className="text-verter-forest hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  }
  notFound();
}
