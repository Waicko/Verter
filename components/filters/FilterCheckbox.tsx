"use client";

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
}: FilterCheckboxProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center gap-2"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-blue"
        />
        <span className="text-sm font-medium text-verter-graphite">{label}</span>
      </label>
    </div>
  );
}
