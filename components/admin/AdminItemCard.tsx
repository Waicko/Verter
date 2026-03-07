"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import ItemCard from "@/components/ItemCard";
import type { VerterItem } from "@/lib/types";
import { useTranslations } from "next-intl";

interface AdminItemCardProps {
  item: VerterItem & { id: string; status?: string };
}

export default function AdminItemCard({ item }: AdminItemCardProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const isRoute = item.type === "route";
  const editHref = `/${locale}/admin/items/${item.id}/edit`;

  const statusColors: Record<string, string> = {
    published: "bg-verter-good/20 text-verter-good",
    pending: "bg-verter-risky/20 text-verter-risky",
    draft: "bg-verter-muted/20 text-verter-muted",
    archived: "bg-verter-muted/20 text-verter-muted",
    rejected: "bg-verter-bad/20 text-verter-bad",
  };
  const statusClass = statusColors[item.status ?? ""] ?? "bg-verter-muted/20 text-verter-muted";

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <span
          className={`rounded-pill px-2 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {item.status ?? "—"}
        </span>
        <Link
          href={editHref}
          className="rounded-pill bg-verter-forest px-3 py-1.5 text-xs font-medium text-white hover:bg-verter-forest/90"
          onClick={(e) => e.stopPropagation()}
        >
          {t("edit")}
        </Link>
      </div>
      <ItemCard item={item} href={editHref} />
    </div>
  );
}
