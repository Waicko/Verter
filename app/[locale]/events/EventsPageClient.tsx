"use client";

import { useMemo } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CampItem, EventItem } from "@/lib/types";
import EventListItem from "@/components/EventListItem";
import EventsFilterBar from "@/components/EventsFilterBar";
import AddListCta from "@/components/AddListCta";
import EmptyState from "@/components/EmptyState";
import type { EventsData } from "@/lib/data/items-loader";

const EVENT_TYPES = ["event", "camp"] as const;
type EventTypeFilter = (typeof EVENT_TYPES)[number];

interface EventsPageClientProps {
  data: EventsData;
}

export default function EventsPageClient({ data }: EventsPageClientProps) {
  const { items, regions, trainingTags } = data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("events");
  const tRoutes = useTranslations("routes");

  const typeParam = searchParams.get("type");
  const selectedTypes = useMemo((): EventTypeFilter[] => {
    if (!typeParam) return [...EVENT_TYPES];
    const parsed = typeParam
      .split(",")
      .filter((x): x is EventTypeFilter =>
        (EVENT_TYPES as readonly string[]).includes(x)
      );
    return parsed.length > 0 ? parsed : [...EVENT_TYPES];
  }, [typeParam]);

  const selectedRegions = searchParams.getAll("region");
  const recurringOnly = searchParams.get("recurring") === "1";
  const upcomingOnly = searchParams.get("upcoming") === "1";

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const typeMatch = selectedTypes.includes(
        item.type as EventTypeFilter
      );
      const regionMatch =
        selectedRegions.length === 0 || selectedRegions.includes(item.region);
      const recurringMatch =
        !recurringOnly ||
        (item.type === "event" && (item as EventItem).recurring === true);
      const upcomingMatch =
        !upcomingOnly ||
        item.type === "camp" ||
        (item.type === "event" &&
          (item as EventItem).date != null &&
          (item as EventItem).date! >= today);
      return typeMatch && regionMatch && recurringMatch && upcomingMatch;
    });
  }, [items, selectedTypes, selectedRegions, recurringOnly, upcomingOnly, today]);

  const updateUrl = (options: {
    types?: EventTypeFilter[];
    regions?: string[];
    recurring?: boolean;
    upcoming?: boolean;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const types = options.types ?? selectedTypes;
    const regs = options.regions ?? selectedRegions;
    const recur = options.recurring ?? recurringOnly;
    const upc = options.upcoming ?? upcomingOnly;

    params.delete("type");
    params.delete("region");
    params.delete("recurring");
    params.delete("upcoming");

    if (types.length < 2) params.set("type", types.join(","));
    regs.forEach((r) => params.append("region", r));
    if (recur) params.set("recurring", "1");
    if (upc) params.set("upcoming", "1");

    const query = params.toString();
    router.replace(query ? `/events?${query}` : "/events");
  };

  const toggleType = (type: EventTypeFilter) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type].sort(
          (a, b) => EVENT_TYPES.indexOf(a) - EVENT_TYPES.indexOf(b)
        );
    updateUrl({ types: next });
  };

  const toggleRegion = (region: string) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    updateUrl({ regions: next });
  };

  const clearAll = () =>
    updateUrl({
      types: [...EVENT_TYPES],
      regions: [],
      recurring: false,
      upcoming: false,
    });

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {data.error && (
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
            {t("addCtaButton")}
          </Link>
        </div>

        <div className="mt-8">
          <EventsFilterBar
            items={items}
            selectedTypes={selectedTypes}
            selectedRegions={selectedRegions}
            recurringOnly={recurringOnly}
            upcomingOnly={upcomingOnly}
            onToggleType={toggleType}
            onToggleRegion={toggleRegion}
            onRecurringChange={(r) => updateUrl({ recurring: r })}
            onUpcomingChange={(u) => updateUrl({ upcoming: u })}
            onClearAll={clearAll}
          />
        </div>

        <div className="mt-8 space-y-3">
          {filteredItems.map((item) => (
            <EventListItem key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <EmptyState
            namespace="events"
            hasActiveFilters={
              selectedTypes.length < 2 ||
              selectedRegions.length > 0 ||
              recurringOnly ||
              upcomingOnly
            }
            onClearFilters={clearAll}
          />
        )}

        <div className="mt-12">
          <AddListCta namespace="events" />
        </div>
      </div>
    </div>
  );
}
