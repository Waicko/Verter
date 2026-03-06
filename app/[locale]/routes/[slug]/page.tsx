import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublishedRouteBySlug } from "@/lib/data/routes-db";
import RouteDetailWithGpx from "@/components/routes/RouteDetailWithGpx";

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
          <div className="mt-8">
            <RouteDetailWithGpx route={dbRoute} />
          </div>
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
  notFound();
}
