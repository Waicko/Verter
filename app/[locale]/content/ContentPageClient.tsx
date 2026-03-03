"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ContentCard from "@/components/ContentCard";
import type { ContentItemPublic } from "@/lib/data/content-items";

interface Props {
  items: ContentItemPublic[];
}

export default function ContentPageClient({ items }: Props) {
  const t = useTranslations("content");
  const [selectedType, setSelectedType] = useState("");

  const typeOptions = [
    { value: "", label: t("allTypes") },
    { value: "blog", label: t("blog") },
    { value: "review", label: t("review") },
    { value: "podcast", label: t("podcast") },
    { value: "comparison", label: t("comparison") },
  ];

  const filteredContent = useMemo(() => {
    if (!selectedType) return items;
    return items.filter((item) => item.type === selectedType);
  }, [items, selectedType]);

  const cardItems = filteredContent.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    type: item.type,
    published_at: item.published_at,
    image_url: item.image_url,
  }));

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {t("title")}
        </h1>
        <p className="mt-2 text-verter-muted">{t("description")}</p>

        <div className="mt-8">
          <label
            htmlFor="type"
            className="text-sm font-medium text-verter-graphite"
          >
            {t("filterByType")}
          </label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-2 rounded-card border border-verter-border bg-white/70 px-3 py-2 text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cardItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>

        {cardItems.length === 0 && (
          <p className="mt-8 text-center text-verter-muted">
            {t("emptyState")}
          </p>
        )}
      </div>
    </div>
  );
}
