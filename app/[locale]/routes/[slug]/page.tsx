import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRouteBySlug } from "@/lib/data/items-queries";
import { getPublishedRouteBySlug, getGpxDownloadUrl } from "@/lib/data/routes-db";
import { routes } from "@/lib/data/routes";
import {
  formatDistance,
  formatElevation,
} from "@/lib/utils";
import RatingDisplay from "@/components/RatingDisplay";

interface RouteDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const locales = ["fi", "en"];
  return routes.flatMap((route) =>
    locales.map((locale) => ({ locale, slug: route.slug }))
  );
}

export async function generateMetadata({ params }: RouteDetailPageProps) {
  const { locale, slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) {
    const t = await getTranslations({ locale, namespace: "common" });
    return { title: t("routeNotFound") };
  }
  const description = `${route.name} - ${route.distance_km} km, ${route.elevation_gain_m} m elevation. ${route.region}, Finland.`;
  return {
    title: route.name,
    description,
    openGraph: {
      title: `${route.name} | Verter`,
      description,
    },
  };
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("routes");
  const dbRoute = await getPublishedRouteBySlug(slug);
  if (dbRoute) {
    return (
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/routes"
            className="mb-6 inline-flex text-sm font-medium text-verter-muted hover:text-verter-graphite"
          >
            {t("backToRoutes")}
          </Link>
          <h1 className="font-heading text-3xl font-bold text-verter-graphite">
            {dbRoute.title}
          </h1>
          {dbRoute.area && (
            <p className="mt-2 text-verter-muted">{dbRoute.area}</p>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {dbRoute.distance_km != null && (
              <div className="rounded-card border border-verter-border bg-white/60 p-4">
                <span className="text-sm font-medium text-verter-muted">
                  {t("distance")}
                </span>
                <p className="mt-1 text-lg font-semibold text-verter-graphite">
                  {formatDistance(dbRoute.distance_km)}
                </p>
              </div>
            )}
            {dbRoute.ascent_m != null && (
              <div className="rounded-card border border-verter-border bg-white/60 p-4">
                <span className="text-sm font-medium text-verter-muted">
                  {t("elevationGain")}
                </span>
                <p className="mt-1 text-lg font-semibold text-verter-graphite">
                  {formatElevation(dbRoute.ascent_m)}
                </p>
              </div>
            )}
          </div>
          {dbRoute.description && (
            <div className="mt-8">
              <h2 className="text-sm font-medium text-verter-muted">
                {t("notes")}
              </h2>
              <p className="mt-2 text-verter-graphite">{dbRoute.description}</p>
            </div>
          )}
          {dbRoute.gpx_path && (
            <div className="mt-8">
              <a
                href={getGpxDownloadUrl(dbRoute.gpx_path)}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:opacity-95"
              >
                {t("downloadGpx")}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            </div>
          )}
          <p className="mt-10 text-xs text-verter-muted">
            {t("safetyDisclaimer")}{" "}
            <Link
              href="/disclaimer"
              className="underline hover:text-verter-graphite"
            >
              {t("safetyDisclaimerMore")}
            </Link>
          </p>
        </div>
      </div>
    );
  }
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/routes"
          className="mb-6 inline-flex items-center text-sm font-medium text-verter-muted hover:text-verter-graphite"
        >
          {t("backToRoutes")}
        </Link>

        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {route.name}
        </h1>
        <p className="mt-2 text-verter-muted">{route.region}</p>

        {route.rating_aggregate && route.rating_aggregate.rating_count > 0 && (
          <div className="mt-4">
            <RatingDisplay aggregate={route.rating_aggregate} size="md" />
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">
              {t("distance")}
            </span>
            <p className="mt-1 text-lg font-semibold text-verter-graphite">
              {formatDistance(route.distance_km)}
            </p>
          </div>
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">
              {t("elevationGain")}
            </span>
            <p className="mt-1 text-lg font-semibold text-verter-graphite">
              {formatElevation(route.elevation_gain_m)}
            </p>
          </div>
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">
              {t("elevationDensity")}
            </span>
            <p className="mt-1 text-lg font-semibold text-verter-graphite">
              {route.elevation_density} m/km
            </p>
          </div>
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">
              {t("technicality")}
            </span>
            <p className="mt-1 text-lg font-semibold text-verter-graphite">
              {route.technicality_1_5}/5
            </p>
          </div>
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">
              {t("winterScore")}
            </span>
            <p className="mt-1 text-lg font-semibold text-verter-graphite">
              {route.winter_score_1_5}/5
            </p>
          </div>
          {route.start_lat != null && route.start_lng != null && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("startCoords")}
              </span>
              <p className="mt-1 text-sm font-mono text-verter-graphite">
                {route.start_lat.toFixed(4)}, {route.start_lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {route.training_tags.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-verter-muted">
              {t("trainingTags")}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {route.training_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill border border-verter-blue/30 bg-verter-ice px-2 py-1 text-sm text-verter-blue"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {route.surface_tags.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-verter-muted">
              {t("surface")}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {route.surface_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill border border-verter-border bg-verter-snow px-2 py-1 text-sm text-verter-graphite"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {route.hazards && (
          <div className="mt-8 rounded-card border border-verter-risky/30 bg-yellow-50 p-4">
            <h2 className="font-semibold text-verter-risky">
              {t("hazards")}
            </h2>
            <p className="mt-2 text-sm text-verter-graphite">{route.hazards}</p>
          </div>
        )}

        {route.notes && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-verter-muted">
              {t("notes")}
            </h2>
            <p className="mt-2 text-verter-graphite">{route.notes}</p>
          </div>
        )}

        {(route.official_url || route.external_links.length > 0) && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-verter-muted">
              {t("externalSources")}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {route.official_url && (
                <a
                  href={route.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                >
                  {t("officialWebsite")}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {route.external_links
                .filter((l) => l.url !== route.official_url)
                .map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-pill border border-verter-border bg-white px-4 py-2 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
                  >
                    {l.label}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-card border border-verter-border bg-verter-snow/60 p-4">
          <Link
            href={`/submit?type=route&itemId=${route.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-verter-forest hover:underline"
          >
            {t("improveRouteCta")}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <p className="mt-10 text-xs text-verter-muted">
          {t("safetyDisclaimer")}{" "}
          <Link href="/disclaimer" className="underline hover:text-verter-graphite">
            {t("safetyDisclaimerMore")}
          </Link>
        </p>
      </div>
    </div>
  );
}
