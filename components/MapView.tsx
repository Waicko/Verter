"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Map as LeafletMap, Marker } from "leaflet";

type MapRoute = {
  slug: string;
  name: string;
  region: string;
  distance_km: number;
  start_lat: number;
  start_lng: number;
};

interface MapViewProps {
  routes: MapRoute[];
  selectedSlug?: string | null;
  className?: string;
}

export default function MapView({
  routes,
  selectedSlug,
  className = "",
}: MapViewProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined" || !mapRef.current)
      return;

    const markersMap = markersRef.current;

    if (routes.length === 0) {
      markersMap.forEach((m) => {
        try {
          m.remove();
        } catch {
          // Ignore
        }
      });
      markersMap.clear();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup errors when DOM is already gone
        }
        mapInstanceRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {
          // Ignore
        }
        mapInstanceRef.current = null;
      }
      markersMap.forEach((m) => {
        try {
          m.remove();
        } catch {
          // Ignore
        }
      });
      markersMap.clear();

      if (cancelled || !mapRef.current) return;

      const centerLat =
        routes.reduce((sum, r) => sum + r.start_lat, 0) / routes.length;
      const centerLng =
        routes.reduce((sum, r) => sum + r.start_lng, 0) / routes.length;

      const map = L.map(mapRef.current).setView([centerLat, centerLng], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      routes.forEach((route) => {
        const marker = L.marker([route.start_lat, route.start_lng], {
          icon: defaultIcon,
        })
          .addTo(map)
          .bindPopup(
            `<a href="/${locale}/routes/${route.slug}" class="font-semibold text-zinc-900 hover:underline">${route.name}</a><br><span class="text-sm text-zinc-600">${route.region} · ${route.distance_km} km</span>`
          );

        markersMap.set(route.slug, marker);
      });

      const bounds = L.latLngBounds(
        routes.map((r) => [r.start_lat, r.start_lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [30, 30] });

      if (!cancelled) {
        mapInstanceRef.current = map;
      } else {
        try {
          map.remove();
        } catch {
          // Ignore
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
      markersMap.forEach((m) => {
        try {
          m.remove();
        } catch {
          // Ignore
        }
      });
      markersMap.clear();
      const map = mapInstanceRef.current;
      if (map) {
        try {
          map.off();
          map.remove();
        } catch {
          // Ignore - DOM may already be unmounted
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isReady, routes, locale]);

  useEffect(() => {
    if (!selectedSlug || !mapInstanceRef.current) return;
    const marker = markersRef.current.get(selectedSlug);
    if (marker) {
      const latlng = marker.getLatLng();
      mapInstanceRef.current.setView(latlng, 12, { animate: true });
      marker.openPopup();
    }
  }, [selectedSlug]);

  if (!isReady) {
    return (
      <div
        className={`h-[300px] w-full animate-pulse overflow-hidden rounded-card border border-verter-border bg-verter-snow shadow-soft sm:h-[400px] ${className}`}
        aria-label={t("mapLoading")}
      />
    );
  }

  return (
    <div
      ref={mapRef}
      className={`h-[300px] w-full overflow-hidden rounded-card border border-verter-border bg-verter-snow shadow-soft sm:h-[400px] ${className}`}
      aria-label={t("mapShowingRoutes")}
    />
  );
}
