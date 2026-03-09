"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import ContentCard from "@/components/ContentCard";
import type { ContentItem } from "@/lib/types";
import { useTranslations } from "next-intl";

interface AdminContentCardProps {
  item: ContentItem;
}

export default function AdminContentCard({ item }: AdminContentCardProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const previewHref = `/${locale}/content/${item.slug}`;

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <span className="rounded-pill bg-verter-good/20 px-2 py-0.5 text-xs font-medium text-verter-good">
          published
        </span>
        <Link
          href={previewHref}
          className="rounded-pill bg-verter-forest px-3 py-1.5 text-xs font-medium text-white hover:bg-verter-forest/90"
        >
          {t("preview")}
        </Link>
      </div>
      <ContentCard item={item} />
    </div>
  );
}
