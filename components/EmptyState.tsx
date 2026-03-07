"use client";

import { useTranslations } from "next-intl";

interface EmptyStateProps {
  namespace: "routes" | "events" | "content";
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export default function EmptyState({
  namespace,
  hasActiveFilters,
  onClearFilters,
}: EmptyStateProps) {
  const t = useTranslations(namespace);

  return (
    <div className="mt-12 rounded-card border border-verter-border bg-verter-snow/50 px-8 py-12 text-center">
      <svg
        className="mx-auto h-12 w-12 text-verter-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-verter-graphite">
        {t("noResults")}
      </h3>
      <p className="mt-2 text-sm text-verter-muted">
        {hasActiveFilters
          ? namespace === "routes"
            ? t("noResultsFilterHint")
            : t("noResultsFilterHint")
          : t("emptyStateHint")}
      </p>
      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 inline-flex items-center gap-2 rounded-pill border border-verter-border bg-white px-4 py-2 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
        >
          {t("clearAll")}
        </button>
      )}
    </div>
  );
}
