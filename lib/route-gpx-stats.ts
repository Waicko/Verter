/**
 * Server-side GPX parsing for distance and ascent calculation.
 * Used during admin upload to auto-fill route stats.
 */

import { DOMParser } from "@xmldom/xmldom";
import toGeoJSON from "@mapbox/togeojson";

type GpxPoint = { lat: number; lng: number; ele: number };

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type ExtractResult = { points: GpxPoint[]; hasElevationData: boolean };

function extractPointsFromGeoJson(geojson: unknown): ExtractResult {
  const g = geojson as {
    features?: Array<{ geometry?: { type?: string; coordinates?: unknown } }>;
  };
  const points: GpxPoint[] = [];
  let hasElevationData = false;

  const collect = (coord: number[]) => {
    const lng = coord[0];
    const lat = coord[1];
    const hasEle = coord.length >= 3 && typeof coord[2] === "number";
    if (hasEle) hasElevationData = true;
    const ele = hasEle ? coord[2] : 0;
    points.push({ lat, lng, ele });
  };

  const collectSafe = (coord: unknown) => {
    if (Array.isArray(coord) && coord.length >= 2 && typeof coord[0] === "number" && typeof coord[1] === "number") {
      collect(coord as number[]);
    }
  };

  for (const feature of g.features ?? []) {
    const geom = feature.geometry;
    if (!geom || !Array.isArray(geom.coordinates)) continue;
    if (geom.type === "LineString") {
      for (const coord of geom.coordinates as number[][]) collectSafe(coord);
    } else if (geom.type === "MultiLineString") {
      for (const line of geom.coordinates as number[][][]) {
        for (const coord of line) collectSafe(coord);
      }
    }
  }
  return { points, hasElevationData };
}

export type GpxStats = {
  distance_km: number;
  ascent_m: number | null;
};

/**
 * Parse GPX XML and calculate total distance (Haversine) and ascent (sum of positive elevation deltas).
 * - distance_km: rounded to 1 decimal
 * - ascent_m: rounded to whole meters, or null if no elevation data
 */
export function calculateGpxStats(xmlText: string): GpxStats | null {
  try {
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(xmlText, "text/xml");
    const geojson = toGeoJSON.gpx(gpxDoc);

    const { points, hasElevationData } = extractPointsFromGeoJson(geojson);
    if (points.length < 2) return null;

    let totalDistanceKm = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistanceKm += haversineDistanceKm(
        points[i - 1].lat,
        points[i - 1].lng,
        points[i].lat,
        points[i].lng
      );
    }

    let ascentM: number | null = null;
    if (hasElevationData) {
      let totalAscent = 0;
      for (let i = 1; i < points.length; i++) {
        const delta = points[i].ele - points[i - 1].ele;
        if (delta > 0) totalAscent += delta;
      }
      ascentM = Math.round(totalAscent);
    }

    return {
      distance_km: Math.round(totalDistanceKm * 10) / 10,
      ascent_m: ascentM,
    };
  } catch {
    return null;
  }
}
