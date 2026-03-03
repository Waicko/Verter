"use client";

import { useTranslations } from "next-intl";

interface Item {
  type: string;
  region: string | null;
  country: string | null;
  official_url: string | null;
  external_links?: unknown[] | null;
  short_description: string | null;
  start_date: string | null;
  end_date: string | null;
  recurrence: string | null;
  season: string | null;
  distance_km: number | null;
}

interface Props {
  item: Item;
}

export default function QualityChecklist({ item }: Props) {
  const t = useTranslations("admin");
  const hasOfficial = !!(item.official_url?.trim());
  const hasExternalLinks = Array.isArray(item.external_links) && item.external_links.length > 0;
  const hasAnyLink = hasOfficial || hasExternalLinks;
  const hasRegion = !!(item.region?.trim() || item.country?.trim());
  const hasDesc = !!(item.short_description?.trim());
  const eventHasDate =
    item.type !== "event" ||
    !!(item.start_date?.trim() || (item.recurrence?.trim() && item.recurrence.toLowerCase() !== "none"));
  const campHasSeason =
    item.type !== "camp" ||
    !!(item.season?.trim() || item.start_date?.trim() || item.end_date?.trim());
  const routeHasDistance =
    item.type !== "route" || (item.distance_km != null && item.distance_km > 0);

  const items = [
    { ok: item.type === "route" ? hasAnyLink : hasOfficial, label: t("hasOfficialLink") },
    { ok: hasRegion, label: t("hasRegion") },
    { ok: hasDesc, label: t("hasDescription") },
    { ok: eventHasDate, label: t("eventHasDate") },
    { ok: campHasSeason, label: t("hasSeasonOrDates") },
    { ok: routeHasDistance, label: t("routeHasDistance") },
  ];

  return (
    <div className="mb-8 rounded-card border border-verter-border bg-verter-snow/50 p-4">
      <h3 className="text-sm font-semibold text-verter-graphite">
        {t("qualityChecklist")}
      </h3>
      <ul className="mt-2 space-y-1">
        {items.map(({ ok, label }, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-sm ${
              ok ? "text-verter-forest" : "text-verter-muted"
            }`}
          >
            {ok ? (
              <span className="text-verter-forest" aria-hidden>✓</span>
            ) : (
              <span className="text-verter-muted" aria-hidden>○</span>
            )}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
