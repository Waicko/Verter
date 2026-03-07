import type { DbRoute } from "@/lib/data/routes-db";
import type { FilterConfig, SortConfig } from "./filter-engine";
import {
  parseSelectParam,
  parseRangeParam,
  parseBooleanParam,
  parseSortParam,
  setSelectParam,
  setRangeParam,
  setBooleanParam,
  setSortParam,
  sortBy,
} from "./filter-engine";

export const ROUTES_FILTERS: FilterConfig[] = [
  {
    kind: "select",
    param: "area",
    multi: true,
    options: [], // populated from data
  },
  {
    kind: "range",
    paramMin: "distanceMin",
    paramMax: "distanceMax",
    min: 0,
    max: 100,
    step: 0.5,
    unit: "km",
  },
  {
    kind: "range",
    paramMin: "ascentMin",
    paramMax: "ascentMax",
    min: 0,
    max: 3000,
    step: 50,
    unit: "m",
  },
  {
    kind: "boolean",
    param: "has_gpx",
    label: "filters.hasGpx",
  },
];

export const ROUTES_SORT: SortConfig = {
  param: "sort",
  default: "created_at",
  options: [
    { value: "distance_km", label: "filters.sortDistance" },
    { value: "ascent_m", label: "filters.sortAscent" },
    { value: "created_at", label: "filters.sortNewest" },
  ],
};

export type RoutesFilterState = {
  area: string[];
  distanceMin?: number;
  distanceMax?: number;
  ascentMin?: number;
  ascentMax?: number;
  has_gpx: boolean;
  sort: string;
};

export function parseRoutesParams(params: URLSearchParams): RoutesFilterState {
  const area =
    (parseSelectParam(params, "area", true) as string[]) ||
    (parseSelectParam(params, "region", true) as string[]);
  const distance = parseRangeParam(params, "distanceMin", "distanceMax");
  const ascent =
    parseRangeParam(params, "ascentMin", "ascentMax").min != null
      ? parseRangeParam(params, "ascentMin", "ascentMax")
      : parseRangeParam(params, "elevationMin", "elevationMax");
  const has_gpx = parseBooleanParam(params, "has_gpx");
  const sort = parseSortParam(params, ROUTES_SORT);

  return {
    area: Array.isArray(area) ? area.filter(Boolean) : [],
    distanceMin: distance.min,
    distanceMax: distance.max,
    ascentMin: ascent.min,
    ascentMax: ascent.max,
    has_gpx,
    sort,
  };
}

export function routesStateToParams(state: RoutesFilterState): URLSearchParams {
  const params = new URLSearchParams();
  setSelectParam(params, "area", state.area, true);
  setRangeParam(params, "distanceMin", "distanceMax", {
    min: state.distanceMin,
    max: state.distanceMax,
  });
  setRangeParam(params, "ascentMin", "ascentMax", {
    min: state.ascentMin,
    max: state.ascentMax,
  });
  setBooleanParam(params, "has_gpx", state.has_gpx);
  setSortParam(params, ROUTES_SORT, state.sort);
  return params;
}

export function filterAndSortRoutes(
  routes: DbRoute[],
  state: RoutesFilterState
): DbRoute[] {
  let result = routes.filter((r) => {
    const areaMatch =
      state.area.length === 0 || (r.area != null && state.area.includes(r.area));
    const distanceMatch =
      (state.distanceMin == null && state.distanceMax == null) ||
      (r.distance_km != null &&
        (state.distanceMin == null || r.distance_km >= state.distanceMin) &&
        (state.distanceMax == null || r.distance_km <= state.distanceMax));
    const ascentMatch =
      (state.ascentMin == null && state.ascentMax == null) ||
      ((r.ascent_m ?? 0) >= (state.ascentMin ?? 0) &&
        (state.ascentMax == null || (r.ascent_m ?? 0) <= state.ascentMax));
    const gpxMatch = !state.has_gpx || Boolean(r.gpx_path?.trim());
    return areaMatch && distanceMatch && ascentMatch && gpxMatch;
  });

  const [key, order] =
    state.sort === "distance_km"
      ? ["distance_km", "asc" as const]
      : state.sort === "ascent_m"
        ? ["ascent_m", "desc" as const]
        : ["created_at", "desc" as const];

  result = sortBy(result, key as keyof DbRoute, order === "asc" ? "asc" : "desc");
  return result;
}
