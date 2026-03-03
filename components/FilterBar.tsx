"use client";

import { useTranslations } from "next-intl";
import type { VerterItemType } from "@/lib/types";

const ITEM_TYPES: VerterItemType[] = ["route", "camp", "event"];

export interface DistanceRange {
  min?: number;
  max?: number;
}

export interface ElevationRange {
  min?: number;
  max?: number;
}

interface FilterBarProps {
  regions: string[];
  trainingTags: string[];
  selectedTypes: VerterItemType[];
  selectedRegions: string[];
  selectedTags: string[];
  distanceRange: DistanceRange;
  elevationRange: ElevationRange;
  recurringOnly: boolean;
  numericBounds: { distanceMin: number; distanceMax: number; elevationMin: number; elevationMax: number };
  onToggleType: (type: VerterItemType) => void;
  onToggleRegion: (region: string) => void;
  onToggleTag: (tag: string) => void;
  onDistanceRangeChange: (range: DistanceRange) => void;
  onElevationRangeChange: (range: ElevationRange) => void;
  onRecurringChange: (recurring: boolean) => void;
  onClearAll: () => void;
}

const typeKeys: Record<VerterItemType, string> = {
  route: "typeRoute",
  camp: "typeCamp",
  event: "typeEvent",
};

export default function FilterBar({
  regions,
  trainingTags,
  selectedTypes,
  selectedRegions,
  selectedTags,
  distanceRange,
  elevationRange,
  recurringOnly,
  numericBounds,
  onToggleType,
  onToggleRegion,
  onToggleTag,
  onDistanceRangeChange,
  onElevationRangeChange,
  onRecurringChange,
  onClearAll,
}: FilterBarProps) {
  const t = useTranslations("routes");
  const tCommon = useTranslations("common");
  const showRecurring = selectedTypes.includes("event");
  const hasActiveFilters =
    selectedTypes.length < 3 ||
    selectedRegions.length > 0 ||
    selectedTags.length > 0 ||
    distanceRange.min != null ||
    distanceRange.max != null ||
    elevationRange.min != null ||
    elevationRange.max != null ||
    recurringOnly;

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
          {t("type")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ITEM_TYPES.map((type) => {
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
                {isActive && "✓ "}{t(typeKeys[type])}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
          {t("location")}
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
                {isActive && "✓ "}{region}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
            {t("distanceRange")}
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              min={0}
              max={numericBounds.distanceMax}
              step={0.5}
              placeholder={`${numericBounds.distanceMin}`}
              value={distanceRange.min ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseFloat(e.target.value) : undefined;
                onDistanceRangeChange({ ...distanceRange, min: v });
              }}
              className="w-20 rounded-pill border border-verter-border bg-verter-snow px-3 py-1.5 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              aria-label={t("distance") + " min"}
            />
            <span className="self-center text-verter-muted">–</span>
            <input
              type="number"
              min={0}
              max={numericBounds.distanceMax}
              step={0.5}
              placeholder={`${numericBounds.distanceMax}`}
              value={distanceRange.max ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseFloat(e.target.value) : undefined;
                onDistanceRangeChange({ ...distanceRange, max: v });
              }}
              className="w-20 rounded-pill border border-verter-border bg-verter-snow px-3 py-1.5 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              aria-label={t("distance") + " max"}
            />
            <span className="self-center text-sm text-verter-muted">km</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
            {t("elevationRange")}
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              min={0}
              max={numericBounds.elevationMax}
              step={50}
              placeholder={`${numericBounds.elevationMin}`}
              value={elevationRange.min ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseFloat(e.target.value) : undefined;
                onElevationRangeChange({ ...elevationRange, min: v });
              }}
              className="w-20 rounded-pill border border-verter-border bg-verter-snow px-3 py-1.5 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              aria-label={t("elevation") + " min"}
            />
            <span className="self-center text-verter-muted">–</span>
            <input
              type="number"
              min={0}
              max={numericBounds.elevationMax}
              step={50}
              placeholder={`${numericBounds.elevationMax}`}
              value={elevationRange.max ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseFloat(e.target.value) : undefined;
                onElevationRangeChange({ ...elevationRange, max: v });
              }}
              className="w-20 rounded-pill border border-verter-border bg-verter-snow px-3 py-1.5 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              aria-label={t("elevation") + " max"}
            />
            <span className="self-center text-sm text-verter-muted">m</span>
          </div>
        </div>
      </div>

      {showRecurring && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
            {t("recurringOnly")}
          </p>
          <div className="mt-2">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={recurringOnly}
                onChange={(e) => onRecurringChange(e.target.checked)}
                className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-blue"
              />
              <span className="text-sm font-medium text-verter-graphite">
                {t("recurringOnly")}
              </span>
            </label>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
          {t("training")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {trainingTags.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={`rounded-pill px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${
                  isActive
                    ? "border border-verter-blue bg-verter-blue text-white"
                    : "border border-verter-border bg-verter-snow text-verter-graphite hover:border-verter-muted"
                }`}
              >
                {isActive && "✓ "}{tag}
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-card border border-verter-border bg-white/60 px-4 py-3">
          <span className="text-sm font-medium text-verter-muted">
            {t("activeFilters")}
          </span>
          {ITEM_TYPES.filter((type) => !selectedTypes.includes(type)).map(
            (type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite"
              >
                {t(typeKeys[type])}
                <button
                  type="button"
                  onClick={() => onToggleType(type)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                  aria-label={t("removeFilter", { item: t(typeKeys[type]) })}
                >
                  <span className="sr-only">{tCommon("remove")}</span>
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
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
                aria-label={t("removeFilter", { item: region })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-pill border border-verter-blue/30 bg-verter-ice px-2.5 py-0.5 text-sm font-medium text-verter-blue"
            >
              {tag}
              <button
                type="button"
                onClick={() => onToggleTag(tag)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-verter-blue/20 focus:outline-none focus:ring-2 focus:ring-verter-blue"
                aria-label={t("removeFilter", { item: tag })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
          {(distanceRange.min != null || distanceRange.max != null) && (
            <span className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite">
              {t("distance")}: {distanceRange.min ?? "?"}–{distanceRange.max ?? "?"} km
              <button
                type="button"
                onClick={() => onDistanceRangeChange({})}
                className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                aria-label={t("removeFilter", { item: t("distance") })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
          {(elevationRange.min != null || elevationRange.max != null) && (
            <span className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite">
              {t("elevation")}: {elevationRange.min ?? "?"}–{elevationRange.max ?? "?"} m
              <button
                type="button"
                onClick={() => onElevationRangeChange({})}
                className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                aria-label={t("removeFilter", { item: t("elevation") })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
          {recurringOnly && (
            <span className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-2.5 py-0.5 text-sm font-medium text-verter-graphite">
              {t("recurringOnly")}
              <button
                type="button"
                onClick={() => onRecurringChange(false)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-verter-border focus:outline-none focus:ring-2 focus:ring-verter-blue"
                aria-label={t("removeFilter", { item: t("recurringOnly") })}
              >
                <span className="sr-only">{tCommon("remove")}</span>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
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
            {t("clearAll")}
          </button>
        </div>
      )}
    </div>
  );
}
