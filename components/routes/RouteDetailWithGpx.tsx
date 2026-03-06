"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getGpxDownloadUrl } from "@/lib/data/routes-db";
import {
  parseGpxToGeoJson,
  type GpxParseResult,
} from "@/lib/route-gpx";
import RouteMap from "./RouteMap";
import ElevationProfile from "./ElevationProfile";
import type { DbRoute } from "@/lib/data/routes-db";
import { formatDistance, formatElevation } from "@/lib/utils";

interface RouteDetailWithGpxProps {
  route: DbRoute;
}

export default function RouteDetailWithGpx({ route }: RouteDetailWithGpxProps) {
  const t = useTranslations("routes");
  const tCommon = useTranslations("common");
  const [gpxData, setGpxData] = useState<GpxParseResult | null>(null);
  const [gpxError, setGpxError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!route.gpx_path);

  useEffect(() => {
    if (!route.gpx_path) {
      setLoading(false);
      return;
    }

    const url = getGpxDownloadUrl(route.gpx_path);
    if (!url) {
      setGpxError("No GPX available for this route.");
      setLoading(false);
      return;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch GPX");
        return res.text();
      })
      .then(async (xml) => {
        const parsed = await parseGpxToGeoJson(xml);
        if (parsed) {
          setGpxData(parsed);
        } else {
          setGpxError("No GPX available for this route.");
        }
      })
      .catch(() => {
        setGpxError("No GPX available for this route.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [route.gpx_path]);

  return (
    <div className="space-y-8">
      {/* Top section: Title, Area, Distance, Ascent, Download GPX */}
      <div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {route.distance_km != null && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("distance")}
              </span>
              <p className="mt-1 text-lg font-semibold text-verter-graphite">
                {formatDistance(route.distance_km)}
              </p>
            </div>
          )}
          {route.ascent_m != null && (
            <div className="rounded-card border border-verter-border bg-white/60 p-4">
              <span className="text-sm font-medium text-verter-muted">
                {t("elevationGain")}
              </span>
              <p className="mt-1 text-lg font-semibold text-verter-graphite">
                {formatElevation(route.ascent_m)}
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {route.gpx_path ? (
            <a
              href={getGpxDownloadUrl(route.gpx_path)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:opacity-95"
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
          ) : (
            <p className="text-sm text-verter-muted">{t("noGpxAvailable")}</p>
          )}
        </div>
      </div>

      {/* Map section */}
      {loading && (
        <div className="flex min-h-[280px] items-center justify-center rounded-card border border-verter-border bg-verter-snow/50">
          <p className="text-sm text-verter-muted">
            {tCommon("mapLoading")}
          </p>
        </div>
      )}
      {gpxError && !loading && (
        <div className="rounded-card border border-verter-border bg-verter-snow/50 px-4 py-8 text-center text-sm text-verter-muted">
          {t("noGpxAvailable")}
        </div>
      )}
      {gpxData && !loading && gpxData.coordinates.length >= 2 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-verter-muted">
            {t("showMap")}
          </h2>
          <RouteMap
            coordinates={gpxData.coordinates}
            bounds={gpxData.bounds}
            className="mt-1"
          />
        </div>
      )}

      {/* Elevation section */}
      {gpxData && !loading && gpxData.elevationProfile.length >= 2 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-verter-muted">
            {t("elevationProfile")}
          </h2>
          <ElevationProfile data={gpxData.elevationProfile} />
        </div>
      )}

      {route.description && (
        <div>
          <h2 className="text-sm font-medium text-verter-muted">
            {t("notes")}
          </h2>
          <p className="mt-2 text-verter-graphite">{route.description}</p>
        </div>
      )}
    </div>
  );
}
