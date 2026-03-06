/**
 * Parse GPX and extract coordinates + elevation profile data.
 * Uses toGeoJSON for GPX -> GeoJSON conversion.
 * Run only on client (uses DOMParser, toGeoJSON).
 */

export type GpxPoint = {
  lng: number;
  lat: number;
  ele: number;
};

export type ElevationPoint = {
  distanceKm: number;
  elevationM: number;
};

function haversineDistance(
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

export type GpxParseResult = {
  coordinates: [number, number][];
  points: GpxPoint[];
  elevationProfile: ElevationPoint[];
  bounds: [[number, number], [number, number]];
};

export async function parseGpxToGeoJson(
  xmlText: string
): Promise<GpxParseResult | null> {
  if (typeof window === "undefined") return null;

  try {
    const toGeoJSON = (await import("@mapbox/togeojson")).default;
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(xmlText, "text/xml");
    const geojson = toGeoJSON.gpx(gpxDoc);

    if (!geojson?.features?.length) return null;

    const points: GpxPoint[] = [];
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    const collectCoords = (coord: number[]) => {
      const lng = coord[0];
      const lat = coord[1];
      const ele = coord.length >= 3 && typeof coord[2] === "number" ? coord[2] : 0;
      points.push({ lng, lat, ele });
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    };

    for (const feature of geojson.features) {
      const geom = feature.geometry;
      if (!geom) continue;
      if (geom.type === "LineString" && Array.isArray(geom.coordinates)) {
        for (const coord of geom.coordinates) {
          collectCoords(coord);
        }
      } else if (geom.type === "MultiLineString" && Array.isArray(geom.coordinates)) {
        for (const line of geom.coordinates) {
          for (const coord of line) {
            collectCoords(coord);
          }
        }
      }
    }

    if (points.length === 0) return null;

    const coordinates: [number, number][] = points.map((p) => [p.lng, p.lat]);

    // Build elevation profile with cumulative distance
    const elevationProfile: ElevationPoint[] = [];
    let cumulativeKm = 0;
    elevationProfile.push({ distanceKm: 0, elevationM: points[0].ele });

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      cumulativeKm += haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      elevationProfile.push({ distanceKm: cumulativeKm, elevationM: curr.ele });
    }

    const bounds: [[number, number], [number, number]] = [
      [minLng, minLat],
      [maxLng, maxLat],
    ];

    return {
      coordinates,
      points,
      elevationProfile,
      bounds,
    };
  } catch {
    return null;
  }
}
