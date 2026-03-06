import { createClient } from "@supabase/supabase-js";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import EmptyState from "@/components/EmptyState";
import AddListCta from "@/components/AddListCta";

type Props = {
  params: Promise<{ locale: string }>;
};

type EventRow = {
  id?: string;
  title?: string;
  slug?: string | null;
  date?: string;
  location?: string;
  registration_url?: string;
  description?: string;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} | Verter`,
      description: t("description"),
    },
  };
}

async function fetchEvents(): Promise<{ error: string | null; rows: EventRow[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY", rows: [] };
  }
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: rows, error } = await supabase
    .from("events")
    .select("id, title, slug, date, location, registration_url, description")
    .eq("status", "published")
    .order("date", { ascending: true });
  if (error) {
    return { error: error.message, rows: [] };
  }
  return { error: null, rows: rows ?? [] };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "events" });

  const { error, rows } = await fetchEvents();
  const events = rows ?? [];

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-card border border-verter-risky bg-verter-risky/10 px-4 py-3 text-sm text-verter-risky"
          >
            {t("loadError")}
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-verter-graphite">
              {t("title")}
            </h1>
            <p className="mt-2 text-verter-muted">{t("description")}</p>
          </div>
          <Link
            href="/submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-card border border-verter-border bg-white/70 px-4 py-2 text-sm font-medium text-verter-graphite transition hover:border-verter-muted hover:bg-white"
          >
            {t("addEvent")}
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState namespace="events" hasActiveFilters={false} />
        ) : (
          <div className="mt-8 space-y-3">
            {events.map((ev, i) => {
              const detailHref = (ev.slug ? `/events/${ev.slug}` : ev.id ? `/events/${ev.id}` : null);
              return (
              <div
                key={ev.id ?? i}
                className="rounded-card border border-verter-border bg-white/70 p-4"
              >
                {detailHref ? (
                  <Link href={detailHref} className="font-heading font-semibold text-verter-graphite hover:text-verter-forest">
                    {ev.title ?? "—"}
                  </Link>
                ) : (
                  <h3 className="font-heading font-semibold text-verter-graphite">
                    {ev.title ?? "—"}
                  </h3>
                )}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-verter-muted">
                  {ev.date && <span>{String(ev.date)}</span>}
                  {ev.location && <span>{ev.location}</span>}
                </div>
                {ev.registration_url && (
                  <a
                    href={ev.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-verter-forest hover:underline"
                  >
                    {t("register")}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            );
            })}
          </div>
        )}

        <div className="mt-12">
          <AddListCta namespace="events" />
        </div>
      </div>
    </div>
  );
}
