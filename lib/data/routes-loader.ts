import type { DbRoute } from "@/lib/data/routes-db";
import { getPublishedRoutes } from "@/lib/data/routes-db";

export type RoutesData = {
  routes: DbRoute[];
  regions: string[];
  trainingTags: string[];
  numericBounds: {
    distanceMin: number;
    distanceMax: number;
    elevationMin: number;
    elevationMax: number;
  };
};

function computeRouteDerived(routes: DbRoute[]) {
  const regions = [...new Set(routes.map((r) => r.area).filter(Boolean))].sort() as string[];
  const distances = routes.map((r) => r.distance_km).filter((n): n is number => n != null);
  const elevations = routes.map((r) => r.ascent_m).filter((n): n is number => n != null);
  return {
    regions,
    trainingTags: [] as string[],
    numericBounds: {
      distanceMin: distances.length ? Math.min(0, ...distances) : 0,
      distanceMax: distances.length ? Math.max(50, ...distances) : 50,
      elevationMin: 0,
      elevationMax: elevations.length ? Math.max(3000, ...elevations) : 3000,
    },
  };
}

export async function loadRoutesData(): Promise<RoutesData> {
  const routes = await getPublishedRoutes();
  const { regions, trainingTags, numericBounds } = computeRouteDerived(routes);
  return { routes, regions, trainingTags, numericBounds };
}
