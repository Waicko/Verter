import type { PodcastGuest } from "@/lib/data/podcast";
import type { FilterConfig, SortConfig } from "./filter-engine";
import {
  parseSelectParam,
  parseSortParam,
  setSelectParam,
  setSortParam,
  sortBy,
} from "./filter-engine";

export const PODCAST_FILTERS: FilterConfig[] = [
  {
    kind: "select",
    param: "topic",
    options: [], // populated when podcast_episodes has topic
  },
  {
    kind: "select",
    param: "guest_type",
    options: [
      { value: "", label: "filters.allGuests" },
      { value: "featured", label: "filters.featured" },
      { value: "past", label: "filters.past" },
    ],
  },
];

export const PODCAST_SORT: SortConfig = {
  param: "sort",
  default: "published_at",
  options: [
    { value: "episode_number", label: "filters.sortEpisode" },
    { value: "published_at", label: "filters.sortPublished" },
  ],
};

export type PodcastFilterState = {
  topic: string;
  guest_type: string;
  sort: string;
};

export function parsePodcastParams(
  params: URLSearchParams,
  topics: string[] = []
): PodcastFilterState {
  const topic = (parseSelectParam(params, "topic", false) as string) || "";
  const guest_type = (parseSelectParam(params, "guest_type", false) as string) || "";
  const sort = parseSortParam(params, PODCAST_SORT);

  return {
    topic,
    guest_type,
    sort,
  };
}

export function podcastStateToParams(state: PodcastFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.topic) params.set("topic", state.topic);
  if (state.guest_type) params.set("guest_type", state.guest_type);
  setSortParam(params, PODCAST_SORT, state.sort);
  return params;
}

export function filterAndSortPodcastGuests(
  guests: PodcastGuest[],
  state: PodcastFilterState
): PodcastGuest[] {
  let result = guests.filter((g) => {
    const guestTypeMatch =
      !state.guest_type ||
      (state.guest_type === "featured" && g.featured) ||
      (state.guest_type === "past" && !g.featured);
    return guestTypeMatch;
  });

  const [key, order] =
    state.sort === "episode_number"
      ? ["published_at", "desc" as const] // guests don't have episode_number, use published_at
      : ["published_at", "desc" as const];

  result = sortBy(result, key as keyof PodcastGuest, order);
  return result;
}
