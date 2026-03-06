"use client";

import { useEffect, useRef, useState } from "react";

type Bounds = [[number, number], [number, number]];

interface RouteMapProps {
  coordinates: [number, number][];
  bounds: Bounds;
  className?: string;
}

export default function RouteMap({
  coordinates,
  bounds,
  className = "",
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || coordinates.length < 2) return;

    let cancelled = false;
    let map: maplibregl.Map | null = null;

    const initMap = async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !containerRef.current) return;

        map = new maplibregl.Map({
          container: containerRef.current!,
          style: {
            version: 8,
            sources: {
              "osm-tiles": {
                type: "raster",
                tiles: [
                  "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
                ],
                tileSize: 256,
              },
            },
            layers: [
              {
                id: "osm-tiles-layer",
                type: "raster",
                source: "osm-tiles",
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
          center: [
            (bounds[0][0] + bounds[1][0]) / 2,
            (bounds[0][1] + bounds[1][1]) / 2,
          ],
          zoom: 12,
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        map.on("load", () => {
          const m = map!;
          m.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates,
              },
            },
          });
          m.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#228B22",
              "line-width": 4,
            },
          });

          const [[minLng, minLat], [maxLng, maxLat]] = bounds;
          const padding = 40;
          m.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding }
          );
        });

        if (!cancelled) mapRef.current = map;
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load map"
          );
        }
      }
    };

    initMap();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, bounds]);

  if (error) {
    return (
      <div
        className={`flex min-h-[280px] items-center justify-center rounded-card border border-verter-border bg-verter-snow/50 ${className}`}
      >
        <p className="text-sm text-verter-muted">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-[280px] w-full rounded-card border border-verter-border ${className}`}
    />
  );
}
