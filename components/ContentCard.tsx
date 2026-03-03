"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { ContentItem } from "@/lib/types";
import { cardClass } from "@/lib/styles";

interface ContentCardProps {
  item: ContentItem;
}

export default function ContentCard({ item }: ContentCardProps) {
  const t = useTranslations("content");
  const typeLabels: Record<string, string> = {
    blog: t("blog"),
    review: t("review"),
    podcast: t("podcast"),
    comparison: t("comparison"),
  };

  return (
    <Link
      href={`/content/${item.slug}`}
      className={`block p-4 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${cardClass}`}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-verter-muted">
        {typeLabels[item.type] || item.type}
      </span>
      <h3 className="mt-1 font-heading font-semibold text-verter-graphite">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-verter-muted">
        {item.excerpt}
      </p>
      {item.published_at && (
        <time
          dateTime={item.published_at}
          className="mt-2 block text-xs text-verter-muted"
        >
          {new Date(item.published_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      )}
    </Link>
  );
}
