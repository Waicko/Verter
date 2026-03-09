import type { VerterItem, RouteItem, CampItem, EventItem } from "@/lib/types";
import { routes } from "@/lib/data/routes";
import { calculateElevationDensity } from "@/lib/utils";
import { events } from "@/data/events";

/** Parse first numeric distance from "25 km", "10–15 km", "5 km" etc. */
function parseDistanceKm(s: string): number | undefined {
  const match = s.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : undefined;
}

function getSeasonFromDate(dateStr: string): string {
  const month = new Date(dateStr).getMonth() + 1;
  if (month >= 12 || month <= 2) return "Winter";
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  return "Fall";
}

const routeItems: RouteItem[] = routes.map((r) => ({
  type: "route",
  id: r.id,
  name: r.name,
  slug: r.slug,
  region: r.region,
  training_tags: r.training_tags,
  distance_km: r.distance_km,
  elevation_gain_m: r.elevation_gain_m,
  elevation_density: calculateElevationDensity(r.elevation_gain_m, r.distance_km),
  technicality: r.technicality_1_5,
  winter_score: r.winter_score_1_5,
  start_lat: r.start_lat,
  start_lng: r.start_lng,
}));

const campAndEventItems: (CampItem | EventItem)[] = events.map((e) => {
  const base = {
    id: e.id,
    name: e.name,
    slug: e.slug,
    region: e.country,
    training_tags: [] as string[],
    description: e.description,
    elevation_gain_m: e.vert_m,
  };
  if (e.type === "camp") {
    return {
      ...base,
      type: "camp" as const,
      season: e.date ? getSeasonFromDate(e.date) : undefined,
      duration: e.distance_or_format,
      focus: e.focus,
    } satisfies CampItem;
  }
  return {
    ...base,
    type: "event" as const,
    date: e.date || undefined,
    distance_or_format: e.distance_or_format,
    distance_km: parseDistanceKm(e.distance_or_format),
    recurring: e.recurring,
  } satisfies EventItem;
});

export const items: VerterItem[] = [...routeItems, ...campAndEventItems];

export const routeItemsOnly = items.filter((i): i is RouteItem => i.type === "route");

export const regions = [...new Set(items.map((i) => i.region))].sort();

export const trainingTags = [
  ...new Set(items.flatMap((i) => i.training_tags)),
].sort();

/** Min/max distance (km) and elevation (m) across filterable items */
function getNumericBounds() {
  const distances: number[] = [];
  const elevations: number[] = [];
  for (const i of items) {
    if (i.type === "route") {
      distances.push(i.distance_km);
      elevations.push(i.elevation_gain_m);
    } else if (i.type === "event" && i.distance_km != null) {
      distances.push(i.distance_km);
    }
    if ("elevation_gain_m" in i && typeof i.elevation_gain_m === "number") {
      elevations.push(i.elevation_gain_m);
    }
  }
  return {
    distanceMin: Math.min(0, ...distances),
    distanceMax: Math.max(50, ...distances),
    elevationMin: 0,
    elevationMax: Math.max(3000, ...elevations),
  };
}

export const numericBounds = getNumericBounds();
