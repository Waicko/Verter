"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ContentCard from "@/components/ContentCard";
import { FilterBar, FilterSelect, FilterSort } from "@/components/filters";
import EmptyState from "@/components/EmptyState";
import type { ContentItemPublic } from "@/lib/data/content-items";
import {
  parseContentParams,
  contentStateToParams,
  filterAndSortContent,
  CONTENT_SORT,
} from "@/lib/search/content-filters";

interface Props {
  items: ContentItemPublic[];
}

export default function ContentPageClient({ items }: Props) {
  const t = useTranslations("content");
  const tFilters = useTranslations("filters");
  const searchParams = useSearchParams();
  const router = useRouter();

  const authors = useMemo(
    () =>
      [...new Set(items.map((i) => i.author).filter(Boolean))].sort() as string[],
    [items]
  );

  const filterState = useMemo(
    () => parseContentParams(searchParams),
    [searchParams]
  );

  const filteredItems = useMemo(
    () => filterAndSortContent(items, filterState),
    [items, filterState]
  );

  const updateUrl = (state: typeof filterState) => {
    const params = contentStateToParams(state);
    const query = params.toString();
    router.replace(query ? `/content?${query}` : "/content");
  };

  const clearAll = () =>
    updateUrl({
      content_type: "",
      author: [],
      sort: CONTENT_SORT.default,
    });

  const hasActiveFilters =
    filterState.content_type !== "" ||
    filterState.author.length > 0 ||
    filterState.sort !== CONTENT_SORT.default;

  const typeOptions = [
    { value: "", label: t("allTypes") },
    { value: "blog", label: t("blog") },
    { value: "review", label: t("review") },
    { value: "comparison", label: t("comparison") },
  ];

  const authorOptions = authors.map((a) => ({ value: a, label: a }));
  const sortOptions = CONTENT_SORT.options.map((o) => ({
    value: o.value,
    label: tFilters(o.label as "sortPublished" | "sortTitle"),
  }));

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {t("title")}
        </h1>
        <p className="mt-2 text-verter-muted">{t("description")}</p>

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-4">
            <FilterSelect
              label={t("filterByType")}
              options={typeOptions}
              selected={filterState.content_type ? [filterState.content_type] : []}
              onChange={(v) =>
                updateUrl({ ...filterState, content_type: v[0] ?? "" })
              }
              multiple={false}
            />
            {authorOptions.length > 0 && (
              <FilterSelect
                label={tFilters("author")}
                options={authorOptions}
                selected={filterState.author}
                onChange={(v) => updateUrl({ ...filterState, author: v })}
                multiple={true}
              />
            )}
            <FilterSort
              label={tFilters("sortBy")}
              options={sortOptions}
              value={filterState.sort}
              onChange={(v) => updateUrl({ ...filterState, sort: v })}
            />
          </div>
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onClearAll={clearAll}
            clearLabel={t("clearAll")}
          />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <EmptyState
            namespace="content"
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAll}
          />
        )}
      </div>
    </div>
  );
}
