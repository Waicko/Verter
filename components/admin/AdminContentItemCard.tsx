"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { cardClass } from "@/lib/styles";
import type { AdminContentItem } from "@/lib/data/content-items";

interface AdminContentItemCardProps {
  item: AdminContentItem;
}

export default function AdminContentItemCard({ item }: AdminContentItemCardProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const editHref = `/${locale}/admin/content/${item.id}/edit`;
  const previewHref = `/${locale}/content/${item.slug}`;

  const statusClass =
    item.status === "published"
      ? "bg-verter-good/20 text-verter-good"
      : item.status === "archived"
        ? "bg-verter-muted/30 text-verter-muted"
        : "bg-verter-muted/20 text-verter-muted";

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <span
          className={`rounded-pill px-2 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {item.status ?? "—"}
        </span>
        <Link
          href={previewHref}
          className="rounded-pill border border-verter-border bg-white px-3 py-1.5 text-xs font-medium text-verter-graphite hover:bg-verter-snow"
          onClick={(e) => e.stopPropagation()}
        >
          {t("preview")}
        </Link>
        <Link
          href={editHref}
          className="rounded-pill bg-verter-forest px-3 py-1.5 text-xs font-medium text-white hover:bg-verter-forest/90"
          onClick={(e) => e.stopPropagation()}
        >
          {t("edit")}
        </Link>
      </div>
      <Link href={editHref} className={`block p-4 ${cardClass}`}>
        <span className="text-xs font-medium uppercase tracking-wider text-verter-muted">
          {item.type}
        </span>
        <h3 className="mt-1 font-heading font-semibold text-verter-graphite">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-verter-muted">
          {item.excerpt}
        </p>
      </Link>
    </div>
  );
}
