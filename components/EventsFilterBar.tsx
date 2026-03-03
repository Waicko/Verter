"use client";

import { useTranslations } from "next-intl";
import type { CampItem, EventItem } from "@/lib/types";

const EVENT_TYPES = ["event", "camp"] as const;
type EventTypeFilter = (typeof EVENT_TYPES)[number];

interface EventsFilterBarProps {
  items: (CampItem | EventItem)[];
  selectedTypes: EventTypeFilter[];
  selectedRegions: string[];
  recurringOnly: boolean;
  upcomingOnly: boolean;
  onToggleType: (type: EventTypeFilter) => void;
  onToggleRegion: (region: string) => void;
  onRecurringChange: (recurring: boolean) => void;
  onUpcomingChange: (upcoming: boolean) => void;
  onClearAll: () => void;
}

export default function EventsFilterBar({
  items,
  selectedTypes,
  selectedRegions,
  recurringOnly,
  upcomingOnly,
  onToggleType,
  onToggleRegion,
  onRecurringChange,
  onUpcomingChange,
  onClearAll,
}: EventsFilterBarProps) {
  const t = useTranslations("events");
  const tRoutes = useTranslations("routes");
  const tCommon = useTranslations("common");
  const regions = [...new Set(items.map((i) => i.region))].sort();

  const hasActiveFilters =
    selectedTypes.length < 2 ||
    selectedRegions.length > 0 ||
    recurringOnly ||
    upcomingOnly;

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
          {tRoutes("type")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => {
            const isActive = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => onToggleType(type)}
                className={`rounded-pill px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${
                  isActive
                    ? "border border-verter-forest bg-verter-forest text-white"
                    : "border border-verter-border bg-verter-snow text-verter-graphite hover:border-verter-muted"
                }`}
              >
                {isActive && "✓ "}
                {type === "event" ? tRoutes("typeEvent") : tRoutes("typeCamp")}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
          {tRoutes("location")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {regions.map((region) => {
            const isActive = selectedRegions.includes(region);
            return (
              <button
                key={region}
                type="button"
                onClick={() => onToggleRegion(region)}
                className={`rounded-pill px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${
                  isActive
                    ? "border border-verter-forest bg-verter-forest text-white"
                    : "border border-verter-border bg-verter-snow text-verter-graphite hover:border-verter-muted"
                }`}
              >
                {isActive && "✓ "}
                {region}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => onUpcomingChange(e.target.checked)}
            className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-blue"
          />
          <span className="text-sm font-medium text-verter-graphite">
            {t("upcomingOnly")}
          </span>
        </label>
        <label className="ml-0 inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={recurringOnly}
            onChange={(e) => onRecurringChange(e.target.checked)}
            className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-blue"
          />
          <span className="text-sm font-medium text-verter-graphite">
            {tRoutes("recurringOnly")}
          </span>
        </label>
      </div>

      {hasActiveFilters && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-card border border-verter-border bg-white/60 px-4 py-3">
          <span className="text-sm font-medium text-verter-muted">
            {tRoutes("activeFilters")}
          </span>
          {EVENT_TYPES.filter((type) => !selectedTypes.includes(type)).map(
            (type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite"
              >
                {type === "event" ? tRoutes("typeEvent") : tRoutes("typeCamp")}
                <button
                  type="button"
                  onClick={() => onToggleType(type)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                  aria-label={tRoutes("removeFilter", {
                    item:
                      type === "event"
                        ? tRoutes("typeEvent")
                        : tRoutes("typeCamp"),
                  })}
                >
                  <span className="sr-only">{tCommon("remove")}</span>
                  <svg
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            )
          )}
          {selectedRegions.map((region) => (
            <span
              key={region}
              className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite"
            >
              {region}
              <button
                type="button"
                onClick={() => onToggleRegion(region)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                aria-label={tRoutes("removeFilter", { item: region })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
          {recurringOnly && (
            <span className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite">
              {tRoutes("recurringOnly")}
              <button
                type="button"
                onClick={() => onRecurringChange(false)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                aria-label={tRoutes("removeFilter", {
                  item: tRoutes("recurringOnly"),
                })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
          {upcomingOnly && (
            <span className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite">
              {t("upcomingOnly")}
              <button
                type="button"
                onClick={() => onUpcomingChange(false)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                aria-label={tRoutes("removeFilter", { item: t("upcomingOnly") })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={onClearAll}
            className="ml-2 text-sm font-medium text-verter-muted underline hover:text-verter-graphite"
          >
            {tRoutes("clearAll")}
          </button>
        </div>
      )}
    </div>
  );
}
