import type { DbEvent } from "@/lib/data/events-db";
import type { FilterConfig, SortConfig } from "./filter-engine";
import {
  parseSelectParam,
  parseRangeParam,
  parseSortParam,
  setSelectParam,
  setRangeParam,
  setSortParam,
  sortBy,
} from "./filter-engine";

export const EVENTS_FILTERS: FilterConfig[] = [
  {
    kind: "select",
    param: "event_type",
    options: [
      { value: "", label: "filters.allTypes" },
      { value: "race", label: "filters.eventTypeRace" },
      { value: "camp", label: "filters.eventTypeCamp" },
      { value: "workshop", label: "filters.eventTypeWorkshop" },
    ],
  },
  {
    kind: "select",
    param: "country",
    options: [], // populated from data
  },
  {
    kind: "select",
    param: "distance",
    options: [
      { value: "", label: "filters.anyDistance" },
      { value: "5", label: "filters.distance5" },
      { value: "10", label: "filters.distance10" },
      { value: "21", label: "filters.distance21" },
      { value: "42", label: "filters.distance42" },
    ],
  },
  {
    kind: "range",
    paramMin: "dateFrom",
    paramMax: "dateTo",
    unit: "",
  },
];

export const EVENTS_SORT: SortConfig = {
  param: "sort",
  default: "date",
  options: [
    { value: "date", label: "filters.sortDate" },
    { value: "title", label: "filters.sortTitle" },
  ],
};

export type EventsFilterState = {
  event_type: string;
  country: string[];
  distance: string;
  dateFrom?: string;
  dateTo?: string;
  sort: string;
};

export function parseEventsParams(
  params: URLSearchParams,
  countries: string[]
): EventsFilterState {
  const event_type = (parseSelectParam(params, "event_type", false) as string) || "";
  const country = parseSelectParam(params, "country", true) as string[];
  const distance = (parseSelectParam(params, "distance", false) as string) || "";
  const dateFrom = params.get("dateFrom") || undefined;
  const dateTo = params.get("dateTo") || undefined;
  const sort = parseSortParam(params, EVENTS_SORT);

  return {
    event_type,
    country: Array.isArray(country) ? country : [],
    distance,
    dateFrom,
    dateTo,
    sort,
  };
}

export function eventsStateToParams(state: EventsFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.event_type) params.set("event_type", state.event_type);
  setSelectParam(params, "country", state.country, true);
  if (state.distance) params.set("distance", state.distance);
  if (state.dateFrom) params.set("dateFrom", state.dateFrom);
  if (state.dateTo) params.set("dateTo", state.dateTo);
  setSortParam(params, EVENTS_SORT, state.sort);
  return params;
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function filterAndSortEvents(
  events: DbEvent[],
  state: EventsFilterState
): DbEvent[] {
  let result = events.filter((ev) => {
    const countryMatch =
      state.country.length === 0 ||
      (ev.location != null && state.country.some((c) => ev.location?.includes(c)));
    const dateFrom = parseDate(state.dateFrom);
    const dateTo = parseDate(state.dateTo);
    const evDate = parseDate(ev.date);
    const dateMatch =
      (!dateFrom && !dateTo) ||
      (evDate &&
        (!dateFrom || evDate >= dateFrom) &&
        (!dateTo || evDate <= dateTo));
    const distanceMatch =
      !state.distance ||
      (ev.description != null && ev.description.includes(state.distance));
    return countryMatch && dateMatch && distanceMatch;
  });

  const [key, order] =
    state.sort === "date"
      ? (["date", "asc"] as const)
      : (["title", "asc"] as const);

  result = sortBy(result, key as keyof DbEvent, order);
  return result;
}
