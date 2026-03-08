"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import RouteFilterBar from "@/components/RouteFilterBar";
import AddListCta from "@/components/AddListCta";
import EmptyState from "@/components/EmptyState";
import type { DistanceRange, ElevationRange } from "@/lib/types/filters";
import type { RoutesData } from "@/lib/data/routes-loader";
import type { DbRoute } from "@/lib/data/routes-db";
import { getGpxDownloadUrl } from "@/lib/data/routes-db";
import {
  parseRoutesParams,
  routesStateToParams,
  filterAndSortRoutes,
  ROUTES_SORT,
  type RoutesFilterState,
} from "@/lib/search/routes-filters";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const MAP_STORAGE_KEY = "routes-map-visible";

function useMapVisible() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mapVisible, setMapVisibleState] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlMap = searchParams.get("map") === "1";
    const stored = localStorage.getItem(MAP_STORAGE_KEY);
    const visible = urlMap || stored === "1";
    setMapVisibleState(visible);
    if (visible) {
      localStorage.setItem(MAP_STORAGE_KEY, "1");
    }
    setInitialized(true);
  }, [searchParams]);

  const setMapVisible = (visible: boolean) => {
    setMapVisibleState(visible);
    if (typeof window !== "undefined") {
      localStorage.setItem(MAP_STORAGE_KEY, visible ? "1" : "0");
    }
    const params = new URLSearchParams(searchParams.toString());
    if (visible) params.set("map", "1");
    else params.delete("map");
    const query = params.toString();
    router.replace(query ? `/routes?${query}` : "/routes");
  };

  return [mapVisible, setMapVisible, initialized] as const;
}

interface RoutesPageClientProps {
  data: RoutesData;
}

export default function RoutesPageClient({ data }: RoutesPageClientProps) {
  const { routes, regions, trainingTags, numericBounds } = data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("routes");
  const tCommon = useTranslations("common");
  const filterState = useMemo(
    () => parseRoutesParams(searchParams),
    [searchParams]
  );
  const selectedRegions = filterState.area;
  const selectedTags: string[] = []; // routes have no training_tags in DB
  const distanceRange = {
    min: filterState.distanceMin,
    max: filterState.distanceMax,
  };
  const elevationRange = {
    min: filterState.ascentMin,
    max: filterState.ascentMax,
  };

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mapVisible, setMapVisible, initialized] = useMapVisible();

  const filteredRoutes = useMemo(
    () => filterAndSortRoutes(routes, filterState),
    [routes, filterState]
  );

  const mapRoutes = useMemo(() => [], []); // DB routes have no start_lat/lng; map shows empty

  const updateUrl = (options: {
    regions?: string[];
    tags?: string[];
    distanceRange?: DistanceRange;
    elevationRange?: ElevationRange;
    hasGpx?: boolean;
    sort?: string;
  }) => {
    const nextState: RoutesFilterState = {
      area: options.regions ?? selectedRegions,
      distanceMin: (options.distanceRange ?? distanceRange).min,
      distanceMax: (options.distanceRange ?? distanceRange).max,
      ascentMin: (options.elevationRange ?? elevationRange).min,
      ascentMax: (options.elevationRange ?? elevationRange).max,
      has_gpx: options.hasGpx ?? filterState.has_gpx,
      sort: options.sort ?? filterState.sort,
    };
    const params = routesStateToParams(nextState);
    const mapParam = searchParams.get("map");
    if (mapParam) params.set("map", mapParam);
    const query = params.toString();
    router.replace(query ? `/routes?${query}` : "/routes");
  };

  const toggleTag = (_tag: string) => {}; // trainingTags empty for DB routes
  const toggleRegion = (region: string) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    updateUrl({ regions: next });
  };

  const clearAll = () =>
    updateUrl({
      regions: [],
      tags: [],
      distanceRange: {},
      elevationRange: {},
      hasGpx: false,
      sort: ROUTES_SORT.default,
    });

  const hasActiveFilters =
    selectedRegions.length > 0 ||
    distanceRange.min != null ||
    distanceRange.max != null ||
    elevationRange.min != null ||
    elevationRange.max != null ||
    filterState.has_gpx ||
    filterState.sort !== ROUTES_SORT.default;

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
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-card border border-verter-border bg-white/70 px-4 py-2 text-sm font-medium text-verter-graphite transition hover:border-verter-muted hover:bg-white"
            >
              {t("addCtaButton")}
            </Link>
            {initialized && (
              <button
                type="button"
                onClick={() => setMapVisible(!mapVisible)}
                className="inline-flex shrink-0 items-center gap-2 rounded-card border border-verter-border bg-white/70 px-4 py-2 text-sm font-medium text-verter-graphite transition hover:border-verter-muted hover:bg-white"
              >
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                {mapVisible ? t("hideMap") : t("showMap")}
              </button>
            )}
          </div>
        </div>

        {routes.length > 0 && (
        <>
        <div className="mt-8">
          <RouteFilterBar
            regions={regions}
            trainingTags={trainingTags}
            selectedRegions={selectedRegions}
            selectedTags={selectedTags}
            distanceRange={distanceRange}
            elevationRange={elevationRange}
            numericBounds={numericBounds}
            onToggleRegion={toggleRegion}
            onToggleTag={toggleTag}
            onDistanceRangeChange={(range) =>
              updateUrl({ distanceRange: range })
            }
            onElevationRangeChange={(range) =>
              updateUrl({ elevationRange: range })
            }
            onClearAll={clearAll}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((r) => (
            <div
              key={r.id}
              onMouseEnter={() => setSelectedSlug(r.slug)}
              onMouseLeave={() => setSelectedSlug(null)}
              className="rounded-card border border-verter-border bg-white/70 p-4"
            >
              <Link
                href={`/routes/${r.slug}`}
                className="font-heading font-semibold text-verter-graphite hover:text-verter-forest"
              >
                {r.title}
              </Link>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-verter-muted">
                {r.area && <span>{r.area}</span>}
                {r.distance_km != null && <span>{r.distance_km} km</span>}
                {r.ascent_m != null && <span>+{r.ascent_m} m</span>}
              </div>
              {r.description && (
                <p className="mt-2 text-sm text-verter-graphite line-clamp-2">
                  {r.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/routes/${r.slug}`}
                  className="text-sm font-medium text-verter-forest hover:underline"
                >
                  {t("viewDetails")}
                </Link>
                {r.gpx_path && (
                  <a
                    href={getGpxDownloadUrl(r.gpx_path)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-verter-forest hover:underline"
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
                )}
              </div>
            </div>
          ))}
        </div>
        </>
        )}

        {routes.length === 0 && (
          <p className="mt-8 text-center text-verter-muted">
            Ei vielä julkaistuja reittejä.
          </p>
        )}

        {routes.length > 0 && filteredRoutes.length === 0 && (
          <EmptyState
            namespace="routes"
            hasActiveFilters={
              selectedRegions.length > 0 ||
              false ||
              distanceRange.min != null ||
              distanceRange.max != null ||
              elevationRange.min != null ||
              elevationRange.max != null
            }
            onClearFilters={clearAll}
          />
        )}

        <div className="mt-12">
          <AddListCta namespace="routes" />
        </div>

        {mapVisible && (
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-verter-border pb-2">
              <span className="text-sm font-medium text-verter-muted">
                {tCommon("mapShowingRoutes")}
              </span>
              <button
                type="button"
                onClick={() => setMapVisible(false)}
                className="text-sm font-medium text-verter-muted hover:text-verter-graphite"
                aria-label={t("hideMap")}
              >
                {t("hideMap")}
              </button>
            </div>
            <MapView
              routes={mapRoutes}
              selectedSlug={selectedSlug}
              className="mt-2 w-full min-h-[280px] sm:min-h-[350px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
