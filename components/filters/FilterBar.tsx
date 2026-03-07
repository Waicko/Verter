"use client";

import { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  clearLabel?: string;
  activeFiltersSlot?: ReactNode;
}

export default function FilterBar({
  children,
  hasActiveFilters,
  onClearAll,
  clearLabel = "Clear all",
  activeFiltersSlot,
}: FilterBarProps) {
  return (
    <div className="min-w-0 space-y-4">
      {children}
      {hasActiveFilters && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-card border border-verter-border bg-white/60 px-4 py-3">
          {activeFiltersSlot}
          <button
            type="button"
            onClick={onClearAll}
            className="ml-2 text-sm font-medium text-verter-muted underline hover:text-verter-graphite"
          >
            {clearLabel}
          </button>
        </div>
      )}
    </div>
  );
}
