"use client";

export interface NumericRange {
  min?: number;
  max?: number;
}

interface FilterRangeProps {
  label: string;
  value: NumericRange;
  onChange: (range: NumericRange) => void;
  bounds: { min: number; max: number };
  step?: number;
  unit?: string;
  "aria-label-min"?: string;
  "aria-label-max"?: string;
}

export default function FilterRange({
  label,
  value,
  onChange,
  bounds,
  step = 1,
  unit = "",
  "aria-label-min": ariaLabelMin,
  "aria-label-max": ariaLabelMax,
}: FilterRangeProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min={bounds.min}
          max={bounds.max}
          step={step}
          placeholder={String(bounds.min)}
          value={value.min ?? ""}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : undefined;
            onChange({ ...value, min: v });
          }}
          className="w-20 rounded-pill border border-verter-border bg-verter-snow px-3 py-1.5 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          aria-label={ariaLabelMin ?? `${label} min`}
        />
        <span className="text-verter-muted">–</span>
        <input
          type="number"
          min={bounds.min}
          max={bounds.max}
          step={step}
          placeholder={String(bounds.max)}
          value={value.max ?? ""}
          onChange={(e) => {
            const v = e.target.value ? parseFloat(e.target.value) : undefined;
            onChange({ ...value, max: v });
          }}
          className="w-20 rounded-pill border border-verter-border bg-verter-snow px-3 py-1.5 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          aria-label={ariaLabelMax ?? `${label} max`}
        />
        {unit && (
          <span className="text-sm text-verter-muted">{unit}</span>
        )}
      </div>
    </div>
  );
}
