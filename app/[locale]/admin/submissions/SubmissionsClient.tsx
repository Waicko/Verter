"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ApproveRejectButtons } from "./ApproveRejectButtons";

interface Item {
  id: string;
  title: string;
  type: string;
  region: string | null;
  country: string | null;
  submitter_email: string | null;
  submitter_name: string | null;
  short_description: string | null;
  official_url: string | null;
  start_date: string | null;
  created_at: string;
}

interface Props {
  items: Item[];
  types: string[];
  regions: string[];
  typeFilter: string | null;
  regionFilter: string | null;
  locale: string;
}

export function SubmissionsClient({
  items,
  types,
  regions,
  typeFilter,
  regionFilter,
  locale,
}: Props) {
  const router = useRouter();
  const t = useTranslations("admin");

  const applyFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    if (key === "type" && value) params.set("type", value);
    else if (typeFilter) params.set("type", typeFilter);
    if (key === "region" && value) params.set("region", value);
    else if (regionFilter) params.set("region", regionFilter);
    router.push(`/${locale}/admin/submissions?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/${locale}/admin/submissions`);
  };

  const hasFilters = typeFilter || regionFilter;

  if (!items.length && !hasFilters) {
    return <p className="mt-8 text-verter-muted">{t("noPending")}</p>;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-verter-muted">Filter:</span>
        <select
          value={typeFilter ?? ""}
          onChange={(e) => applyFilter("type", e.target.value || null)}
          className="rounded-pill border border-verter-border bg-white px-3 py-1.5 text-sm text-verter-graphite"
        >
          <option value="">{t("filterAllTypes")}</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={regionFilter ?? ""}
          onChange={(e) => applyFilter("region", e.target.value || null)}
          className="rounded-pill border border-verter-border bg-white px-3 py-1.5 text-sm text-verter-graphite"
        >
          <option value="">{t("filterAllRegions")}</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-verter-muted underline hover:text-verter-graphite"
          >
            Clear
          </button>
        )}
      </div>

      {!items.length && hasFilters ? (
        <p className="text-verter-muted">{t("noMatch")}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-verter-border bg-white p-4 shadow-soft"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/${locale}/admin/items/${item.id}/edit`}
                    className="font-medium text-verter-graphite hover:text-verter-forest"
                  >
                    {item.title}
                  </Link>
                  <span className="rounded-pill bg-verter-snow px-2 py-0.5 text-xs font-medium text-verter-muted">
                    {item.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-verter-muted">
                  {[item.region, item.country].filter(Boolean).join(" · ") || "—"} ·{" "}
                  {item.submitter_email ?? item.submitter_name ?? "—"}
                </p>
                {item.short_description && (
                  <p className="mt-1 line-clamp-2 text-sm text-verter-muted">
                    {item.short_description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/${locale}/admin/items/${item.id}/edit`}
                  className="rounded-pill border border-verter-border px-3 py-1.5 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
                >
                  {t("preview")}
                </Link>
                <ApproveRejectButtons itemId={item.id} locale={locale} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
