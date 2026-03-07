"use client";

interface FilterSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  "aria-label"?: string;
}

export default function FilterSelect({
  label,
  options,
  selected,
  onChange,
  multiple = true,
  "aria-label": ariaLabel,
}: FilterSelectProps) {
  const toggle = (value: string) => {
    if (multiple) {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(next);
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-verter-muted">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={ariaLabel ?? label}>
        {options.map((opt) => {
          const isActive = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-pill px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${
                isActive
                  ? "border border-verter-forest bg-verter-forest text-white"
                  : "border border-verter-border bg-verter-snow text-verter-graphite hover:border-verter-muted"
              }`}
            >
              {isActive && "✓ "}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
