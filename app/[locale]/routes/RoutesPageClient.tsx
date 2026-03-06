"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { RouteItem } from "@/lib/types";
import ItemCard from "@/components/ItemCard";
import RouteFilterBar from "@/components/RouteFilterBar";
import AddListCta from "@/components/AddListCta";
import EmptyState from "@/components/EmptyState";
import type { DistanceRange, ElevationRange } from "@/components/FilterBar";
import type { RoutesData } from "@/lib/data/items-loader";
import { getGpxDownloadUrl } from "@/lib/data/routes-db";

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
  const { items, regions, trainingTags, numericBounds, dbRoutes = [] } = data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("routes");
  const tCommon = useTranslations("common");
  const selectedRegions = searchParams.getAll("region");
  const selectedTags = searchParams.getAll("training");
  const distanceMin = searchParams.get("distanceMin");
  const distanceMax = searchParams.get("distanceMax");
  const elevationMin = searchParams.get("elevationMin");
  const elevationMax = searchParams.get("elevationMax");

  const distanceRange: DistanceRange = useMemo(() => {
    const min = distanceMin != null ? parseFloat(distanceMin) : undefined;
    const max = distanceMax != null ? parseFloat(distanceMax) : undefined;
    return {
      min: typeof min === "number" && !Number.isNaN(min) ? min : undefined,
      max: typeof max === "number" && !Number.isNaN(max) ? max : undefined,
    };
  }, [distanceMin, distanceMax]);
  const elevationRange: ElevationRange = useMemo(() => {
    const min = elevationMin != null ? parseFloat(elevationMin) : undefined;
    const max = elevationMax != null ? parseFloat(elevationMax) : undefined;
    return {
      min: typeof min === "number" && !Number.isNaN(min) ? min : undefined,
      max: typeof max === "number" && !Number.isNaN(max) ? max : undefined,
    };
  }, [elevationMin, elevationMax]);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mapVisible, setMapVisible, initialized] = useMapVisible();

  const filteredItems = useMemo(() => {
    return items.filter((item: RouteItem) => {
      const regionMatch =
        selectedRegions.length === 0 || selectedRegions.includes(item.region);
      const tagMatch =
        selectedTags.length === 0 ||
        item.training_tags.some((tag) => selectedTags.includes(tag));
      const distanceMatch =
        (distanceRange.min == null && distanceRange.max == null) ||
        (item.distance_km != null &&
          (distanceRange.min == null || item.distance_km >= distanceRange.min) &&
          (distanceRange.max == null || item.distance_km <= distanceRange.max));
      const itemElevation = item.elevation_gain_m ?? 0;
      const elevationMatch =
        (elevationRange.min == null && elevationRange.max == null) ||
        (elevationRange.min == null || itemElevation >= elevationRange.min) &&
          (elevationRange.max == null || itemElevation <= elevationRange.max);
      return regionMatch && tagMatch && distanceMatch && elevationMatch;
    });
  }, [items, selectedRegions, selectedTags, distanceRange, elevationRange]);

  const mapRoutes = useMemo(
    () =>
      filteredItems
        .filter(
          (r): r is RouteItem & { start_lat: number; start_lng: number } =>
            r.start_lat != null && r.start_lng != null
        )
        .map((r) => ({
          slug: r.slug,
          name: r.name,
          region: r.region,
          distance_km: r.distance_km,
          start_lat: r.start_lat!,
          start_lng: r.start_lng!,
        })),
    [filteredItems]
  );

  const updateUrl = (options: {
    regions?: string[];
    tags?: string[];
    distanceRange?: DistanceRange;
    elevationRange?: ElevationRange;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const regs = options.regions ?? selectedRegions;
    const tags = options.tags ?? selectedTags;
    const dist = options.distanceRange ?? distanceRange;
    const elev = options.elevationRange ?? elevationRange;

    params.delete("region");
    params.delete("training");
    params.delete("distanceMin");
    params.delete("distanceMax");
    params.delete("elevationMin");
    params.delete("elevationMax");
    regs.forEach((r) => params.append("region", r));
    tags.forEach((tag) => params.append("training", tag));
    if (dist.min != null) params.set("distanceMin", String(dist.min));
    if (dist.max != null) params.set("distanceMax", String(dist.max));
    if (elev.min != null) params.set("elevationMin", String(elev.min));
    if (elev.max != null) params.set("elevationMax", String(elev.max));
    const query = params.toString();
    router.replace(query ? `/routes?${query}` : "/routes");
  };

  const toggleRegion = (region: string) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    updateUrl({ regions: next });
  };

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    updateUrl({ tags: next });
  };

  const clearAll = () =>
    updateUrl({
      regions: [],
      tags: [],
      distanceRange: {},
      elevationRange: {},
    });

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
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setSelectedSlug(item.slug)}
              onMouseLeave={() => setSelectedSlug(null)}
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <EmptyState
            namespace="routes"
            hasActiveFilters={
              selectedRegions.length > 0 ||
              selectedTags.length > 0 ||
              distanceRange.min != null ||
              distanceRange.max != null ||
              elevationRange.min != null ||
              elevationRange.max != null
            }
            onClearFilters={clearAll}
          />
        )}

        {dbRoutes.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-xl font-semibold text-verter-graphite">
              {t("gpxRoutes")}
            </h2>
            <p className="mt-1 text-sm text-verter-muted">
              {t("gpxRoutesDescription")}
            </p>
            <div className="mt-4 space-y-3">
              {dbRoutes.map((r) => (
                <div
                  key={r.id}
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
                    {r.distance_km != null && (
                      <span>{r.distance_km} km</span>
                    )}
                    {r.ascent_m != null && (
                      <span>+{r.ascent_m} m</span>
                    )}
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
          </div>
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
