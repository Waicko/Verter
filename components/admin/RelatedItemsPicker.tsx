"use client";

import { useTranslations } from "next-intl";

export type ItemPickerOption = { id: string; title: string; type: string };

interface RelatedItemsPickerProps {
  items: ItemPickerOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function RelatedItemsPicker({
  items,
  selectedIds,
  onChange,
}: RelatedItemsPickerProps) {
  const t = useTranslations("admin");

  const toggle = (id: string) => {
    const set = new Set(selectedIds);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    onChange(Array.from(set));
  };

  return (
    <div className="max-h-48 overflow-y-auto rounded-card border border-verter-border p-3">
      {items.length === 0 ? (
        <p className="text-sm text-verter-muted">{t("content.noItemsToLink")}</p>
      ) : (
        <div className="space-y-1">
          {items.map((it) => {
            const checked = selectedIds.includes(it.id);
            return (
              <label
                key={it.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-verter-snow"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(it.id)}
                  className="h-4 w-4 rounded border-verter-border"
                />
                <span className="flex-1 truncate text-sm text-verter-graphite">
                  {it.title}
                </span>
                <span className="text-xs text-verter-muted">
                  {it.type}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
