import type { ContentItemPublic } from "@/lib/data/content-items";
import type { FilterConfig, SortConfig } from "./filter-engine";
import {
  parseSelectParam,
  parseSortParam,
  setSelectParam,
  setSortParam,
  sortBy,
} from "./filter-engine";

export const CONTENT_FILTERS: FilterConfig[] = [
  {
    kind: "select",
    param: "content_type",
    options: [
      { value: "", label: "filters.allTypes" },
      { value: "blog", label: "content.blog" },
      { value: "review", label: "content.review" },
      { value: "podcast", label: "content.podcast" },
      { value: "comparison", label: "content.comparison" },
    ],
  },
  {
    kind: "select",
    param: "author",
    options: [], // populated from data
  },
];

export const CONTENT_SORT: SortConfig = {
  param: "sort",
  default: "published_at",
  options: [
    { value: "published_at", label: "filters.sortPublished" },
    { value: "title", label: "filters.sortTitle" },
  ],
};

export type ContentFilterState = {
  content_type: string;
  author: string[];
  sort: string;
};

export function parseContentParams(params: URLSearchParams): ContentFilterState {
  const content_type = (parseSelectParam(params, "content_type", false) as string) || "";
  const author = parseSelectParam(params, "author", true) as string[];
  const sort = parseSortParam(params, CONTENT_SORT);

  return {
    content_type,
    author: Array.isArray(author) ? author : [],
    sort,
  };
}

export function contentStateToParams(state: ContentFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.content_type) params.set("content_type", state.content_type);
  setSelectParam(params, "author", state.author, true);
  setSortParam(params, CONTENT_SORT, state.sort);
  return params;
}

export function filterAndSortContent(
  items: ContentItemPublic[],
  state: ContentFilterState
): ContentItemPublic[] {
  let result = items.filter((item) => {
    const typeMatch =
      !state.content_type || item.type === state.content_type;
    const authorMatch =
      state.author.length === 0 ||
      (item.author != null && state.author.includes(item.author));
    return typeMatch && authorMatch;
  });

  const [key, order] =
    state.sort === "published_at"
      ? ["published_at", "desc" as const]
      : ["title", "asc" as const];

  result = sortBy(result, key as keyof ContentItemPublic, order);
  return result;
}
