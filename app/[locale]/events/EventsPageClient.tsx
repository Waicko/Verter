"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FilterSelect } from "@/components/filters";
import EmptyState from "@/components/EmptyState";
import AddListCta from "@/components/AddListCta";
import type { DbEvent } from "@/lib/data/events-db";

type EventType = "race" | "camp" | "community";

interface Props {
  events: DbEvent[];
}

const TYPE_OPTIONS: { value: string; labelKey: "allTypes" | "typeRace" | "typeCamp" | "typeCommunity" }[] = [
  { value: "", labelKey: "allTypes" },
  { value: "race", labelKey: "typeRace" },
  { value: "camp", labelKey: "typeCamp" },
  { value: "community", labelKey: "typeCommunity" },
];

export default function EventsPageClient({ events }: Props) {
  const t = useTranslations("events");
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get("type") ?? "";
  const validType = ["race", "camp", "community"].includes(typeParam) ? typeParam : "";

  const updateUrl = (type: string) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    const query = params.toString();
    router.replace(query ? `/events?${query}` : "/events");
  };

  const clearAll = () => updateUrl("");

  const hasActiveFilters = validType !== "";

  const typeOptions = TYPE_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }));

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
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

        <div className="mt-8 flex flex-wrap gap-4">
          <FilterSelect
            label={t("filterByType")}
            options={typeOptions}
            selected={validType ? [validType] : []}
            onChange={(v) => updateUrl(v[0] ?? "")}
            multiple={false}
          />
        </div>

        {events.length === 0 ? (
          <EmptyState
            namespace="events"
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAll}
          />
        ) : (
          <div className="mt-8 space-y-3">
            {events.map((ev, i) => {
              const detailHref = ev.slug ? `/events/${ev.slug}` : ev.id ? `/events/${ev.id}` : null;
              return (
                <div
                  key={ev.id ?? i}
                  className="rounded-card border border-verter-border bg-white/70 p-4"
                >
                  {detailHref ? (
                    <Link
                      href={detailHref}
                      className="font-heading font-semibold text-verter-graphite hover:text-verter-forest"
                    >
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
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
