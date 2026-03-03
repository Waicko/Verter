import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEventBySlug } from "@/lib/data/items-queries";
import { formatElevation } from "@/lib/utils";
import EventRequestForm from "@/components/EventRequestForm";
import type { EventItem, CampItem } from "@/lib/types";
import { items as staticItems } from "@/lib/data/items";

interface EventDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function getStaticSlugs(): { slug: string }[] {
  return staticItems
    .filter((i): i is EventItem | CampItem => i.type === "event" || i.type === "camp")
    .map((i) => ({ slug: i.slug }));
}

export function generateStaticParams() {
  const locales = ["fi", "en"];
  const slugs = getStaticSlugs();
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug: slug.slug }))
  );
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { locale, slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) {
    const t = await getTranslations({ locale, namespace: "common" });
    return { title: t("contentNotFound") };
  }
  const desc = item.description ?? `${item.name} - ${item.type} in ${item.region}`;
  return {
    title: item.name,
    description: desc,
    openGraph: {
      title: `${item.name} | Verter`,
      description: desc,
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const tRoutes = await getTranslations("routes");
  const item = await getEventBySlug(slug);

  if (!item) notFound();

  const isEvent = item.type === "event";
  const ev = item as EventItem;
  const camp = item as CampItem;

  const dateStr =
    isEvent && ev.date
      ? new Date(ev.date).toLocaleDateString(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/events"
          className="mb-6 inline-flex items-center text-sm font-medium text-verter-muted hover:text-verter-graphite"
        >
          {t("backToEvents")}
        </Link>

        <span
          className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-medium ${
            isEvent ? "bg-verter-blue/20 text-verter-blue" : "bg-verter-forest/20 text-verter-forest"
          }`}
        >
          {isEvent ? tRoutes("typeEvent") : tRoutes("typeCamp")}
        </span>
        <h1 className="mt-3 font-heading text-3xl font-bold text-verter-graphite">
          {item.name}
        </h1>
        <p className="mt-2 text-verter-muted">
          {item.region}
          {dateStr && ` · ${dateStr}`}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isEvent && ev.recurring && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("recurring")}
              </span>
              <p className="mt-1 font-semibold text-verter-graphite">✓</p>
            </div>
          )}
          {(ev.distance_or_format || camp.duration) && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("distanceFormat")}
              </span>
              <p className="mt-1 font-semibold text-verter-graphite">
                {ev.distance_or_format ?? camp.duration}
              </p>
            </div>
          )}
          {(ev.elevation_gain_m != null || camp.elevation_gain_m != null) && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("elevation")}
              </span>
              <p className="mt-1 font-semibold text-verter-graphite">
                {formatElevation(ev.elevation_gain_m ?? camp.elevation_gain_m ?? 0)}
              </p>
            </div>
          )}
          {camp.focus && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("focus")}
              </span>
              <p className="mt-1 font-semibold text-verter-graphite">
                {camp.focus}
              </p>
            </div>
          )}
          {camp.season && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("season")}
              </span>
              <p className="mt-1 font-semibold text-verter-graphite">
                {camp.season}
              </p>
            </div>
          )}
        </div>

        {item.description && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-verter-muted">
              {t("about")}
            </h2>
            <p className="mt-2 text-verter-graphite">{item.description}</p>
          </div>
        )}

        <div className="mt-8 rounded-card border border-verter-border bg-verter-snow/60 p-4">
          <Link
            href={`/submit?type=${isEvent ? "event" : "camp"}&itemId=${item.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-verter-forest hover:underline"
          >
            {t("improveEventCta")}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <p className="mt-8 text-xs text-verter-muted">{t("organizerNote")}</p>

        {(item.official_url || item.external_links?.length > 0) && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-verter-muted">
              {t("externalSources")}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.official_url && (
                <a
                  href={item.official_url}
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
              {(item.external_links ?? [])
                .filter((l) => l.url !== item.official_url)
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

        <div className="mt-12 border-t border-verter-border pt-12">
          <h2 className="font-heading text-xl font-semibold text-verter-graphite">
            {t("requestMoreInfo")}
          </h2>
          <p className="mt-2 text-sm text-verter-muted">{t("requestPrompt")}</p>
          <EventRequestForm eventSlug={item.slug} eventName={item.name} />
        </div>
      </div>
    </div>
  );
}
