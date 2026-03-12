"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import PodcastGuestCard from "@/components/PodcastGuestCard";
import { FilterBar, FilterSelect, FilterSort } from "@/components/filters";
import EmptyState from "@/components/EmptyState";
import type { PodcastGuest } from "@/lib/data/podcast";
import {
  parsePodcastParams,
  podcastStateToParams,
  filterAndSortPodcastGuests,
  PODCAST_SORT,
} from "@/lib/search/podcast-filters";

interface Props {
  guests: PodcastGuest[];
}

export default function PodcastPageClient({ guests }: Props) {
  const t = useTranslations("podcast");
  const tFilters = useTranslations("filters");
  const searchParams = useSearchParams();
  const router = useRouter();

  const filterState = useMemo(
    () => parsePodcastParams(searchParams),
    [searchParams]
  );

  const filteredGuests = useMemo(
    () => filterAndSortPodcastGuests(guests, filterState),
    [guests, filterState]
  );

  const updateUrl = (state: typeof filterState) => {
    const params = podcastStateToParams(state);
    const query = params.toString();
    router.replace(query ? `/podcast?${query}` : "/podcast");
  };

  const clearAll = () =>
    updateUrl({
      topic: "",
      guest_type: "",
      sort: PODCAST_SORT.default,
    });

  const hasActiveFilters =
    filterState.guest_type !== "" ||
    filterState.sort !== PODCAST_SORT.default;

  const guestTypeOptions = [
    { value: "", label: tFilters("allGuests") },
    { value: "featured", label: tFilters("featured") },
    { value: "past", label: tFilters("past") },
  ];

  const sortOptions = PODCAST_SORT.options.map((o) => ({
    value: o.value,
    label: tFilters(o.label as "sortEpisode" | "sortPublished"),
  }));

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-verter-muted">{t("description")}</p>

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-4">
            <FilterSelect
              label={t("filterByGuest")}
              options={guestTypeOptions}
              selected={filterState.guest_type ? [filterState.guest_type] : []}
              onChange={(v) =>
                updateUrl({ ...filterState, guest_type: v[0] ?? "" })
              }
              multiple={false}
            />
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
          {filteredGuests.map((guest, index) => (
            <PodcastGuestCard
              key={guest.id}
              guest={guest}
              size={
                index === 0 && guest.featured && !filterState.guest_type
                  ? "large"
                  : "default"
              }
            />
          ))}
        </div>

        {filteredGuests.length === 0 && (
          <EmptyState
            namespace="podcast"
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAll}
          />
        )}
      </div>
    </div>
  );
}
