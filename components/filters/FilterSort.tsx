"use client";

interface SortOption {
  value: string;
  label: string;
}

interface FilterSortProps {
  label?: string;
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}

export default function FilterSort({
  label,
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: FilterSortProps) {
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
          {label}
        </p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 rounded-pill border border-verter-border bg-verter-snow px-3 py-1.5 text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
        aria-label={ariaLabel ?? label ?? "Sort by"}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
