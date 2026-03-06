import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getPublishedEventBySlug,
  getPublishedEventById,
} from "@/lib/data/events-db";
import EventRequestForm from "@/components/EventRequestForm";

interface EventDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { locale, slug } = await params;
  const ev = await getPublishedEventBySlug(slug) ?? await getPublishedEventById(slug);
  if (!ev) {
    const t = await getTranslations({ locale, namespace: "common" });
    return { title: t("contentNotFound") };
  }
  const desc = ev.description ?? `${ev.title} - ${ev.date ?? ""}`;
  return {
    title: ev.title,
    description: desc,
    openGraph: {
      title: `${ev.title} | Verter`,
      description: desc,
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");

  const ev = await getPublishedEventBySlug(slug) ?? await getPublishedEventById(slug);
  if (!ev) notFound();

  const dateStr = ev.date
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
          className="mb-6 inline-flex text-sm font-medium text-verter-muted hover:text-verter-graphite"
        >
          {t("backToEvents")}
        </Link>

        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {ev.title}
        </h1>
        <p className="mt-2 text-verter-muted">
          {ev.location && <span>{ev.location}</span>}
          {dateStr && (ev.location ? ` · ${dateStr}` : dateStr)}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ev.registration_url && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <a
                href={ev.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex gap-2 rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:opacity-95"
              >
                {t("register")}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {ev.description && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-verter-muted">
              {t("about")}
            </h2>
            <p className="mt-2 text-verter-graphite">{ev.description}</p>
          </div>
        )}

        <div className="mt-12 border-t border-verter-border pt-12">
          <h2 className="font-heading text-xl font-semibold text-verter-graphite">
            {t("requestMoreInfo")}
          </h2>
          <p className="mt-2 text-sm text-verter-muted">{t("requestPrompt")}</p>
          <EventRequestForm
            eventSlug={ev.slug ?? ev.id}
            eventName={ev.title}
          />
        </div>
      </div>
    </div>
  );
}
