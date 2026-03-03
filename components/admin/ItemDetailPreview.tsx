"use client";

import { useTranslations } from "next-intl";
import { formatDistance, formatElevation } from "@/lib/utils";
import RatingDisplay from "@/components/RatingDisplay";
import type { DbItem } from "@/lib/db/types";
import type { RouteRatingAggregate } from "@/lib/types";

interface ItemDetailPreviewProps {
  item: DbItem | Record<string, unknown>;
}

export function RouteDetailPreview({ item }: { item: Record<string, unknown> }) {
  const t = useTranslations("routes");
  const title = String(item.title ?? "");
  const region = String(item.region ?? item.country ?? "");
  const distance = typeof item.distance_km === "number" ? item.distance_km : 0;
  const elevation = typeof item.elevation_gain_m === "number" ? item.elevation_gain_m : 0;
  const density = distance > 0 ? (elevation / distance).toFixed(1) : "0";
  const tech = typeof item.technicality_1_5 === "number" ? item.technicality_1_5 : null;
  const winter = typeof item.winter_score_1_5 === "number" ? item.winter_score_1_5 : null;
  const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];
  const ratingAgg = item.rating_aggregate as RouteRatingAggregate | undefined;

  return (
    <div className="max-w-2xl space-y-6 rounded-card border border-verter-border bg-verter-snow/50 p-6">
      <h1 className="font-heading text-2xl font-bold text-verter-graphite">
        {title}
      </h1>
      <p className="text-verter-muted">{region}</p>
      {ratingAgg && ratingAgg.rating_count > 0 && (
        <RatingDisplay aggregate={ratingAgg} size="md" />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-verter-border bg-white/60 p-4">
          <span className="text-sm font-medium text-verter-muted">{t("distance")}</span>
          <p className="mt-1 text-lg font-semibold">{formatDistance(distance)}</p>
        </div>
        <div className="rounded-card border border-verter-border bg-white/60 p-4">
          <span className="text-sm font-medium text-verter-muted">{t("elevationGain")}</span>
          <p className="mt-1 text-lg font-semibold">{formatElevation(elevation)}</p>
        </div>
        <div className="rounded-card border border-verter-border bg-white/60 p-4">
          <span className="text-sm font-medium text-verter-muted">{t("elevationDensity")}</span>
          <p className="mt-1 text-lg font-semibold">{density} m/km</p>
        </div>
        {tech != null && (
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">{t("technicality")}</span>
            <p className="mt-1 text-lg font-semibold">{tech}/5</p>
          </div>
        )}
        {winter != null && (
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">{t("winterScore")}</span>
            <p className="mt-1 text-lg font-semibold">{winter}/5</p>
          </div>
        )}
      </div>
      {tags.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-verter-muted">{t("trainingTags")}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-pill border border-verter-blue/30 bg-verter-ice px-2 py-1 text-sm text-verter-blue"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      {Boolean(item.short_description || item.summary) && (
        <p className="text-verter-graphite">
          {String(item.short_description ?? item.summary ?? "")}
        </p>
      )}
      {Boolean(item.official_url) && (
        <a
          href={String(item.official_url)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white"
        >
          {t("officialWebsite")}
        </a>
      )}
    </div>
  );
}

export function EventDetailPreview({ item }: { item: Record<string, unknown> }) {
  const t = useTranslations("events");
  const tRoutes = useTranslations("routes");
  const title = String(item.title ?? "");
  const region = String(item.region ?? item.country ?? "");
  const type = String(item.type ?? "event");
  const startDate = item.start_date ? String(item.start_date) : null;
  const recurrence = item.recurrence ? String(item.recurrence) : "";
  const distOpts = Array.isArray(item.distance_options) ? item.distance_options : [];
  const distStr = distOpts
    .map((d) => (typeof d === "object" && d && "label" in d ? String((d as { label?: string }).label) : String(d)))
    .filter(Boolean)
    .join(", ");
  const season = item.season ? String(item.season) : null;
  const focus = item.focus ? String(item.focus) : null;
  const duration = typeof item.duration_days === "number" ? item.duration_days : null;

  const dateStr = startDate
    ? new Date(startDate).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-2xl space-y-6 rounded-card border border-verter-border bg-verter-snow/50 p-6">
      <span
        className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-medium ${
          type === "event" ? "bg-verter-blue/20 text-verter-blue" : "bg-verter-forest/20 text-verter-forest"
        }`}
      >
        {type === "event" ? tRoutes("typeEvent") : tRoutes("typeCamp")}
      </span>
      <h1 className="font-heading text-2xl font-bold text-verter-graphite">{title}</h1>
      <p className="text-verter-muted">
        {region}
        {dateStr && ` · ${dateStr}`}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recurrence && recurrence.toLowerCase() !== "none" && (
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">{t("recurring")}</span>
            <p className="mt-1 font-semibold">✓</p>
          </div>
        )}
        {(distStr || duration) && (
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">{t("distanceFormat")}</span>
            <p className="mt-1 font-semibold">{distStr || (duration ? `${duration} days` : "")}</p>
          </div>
        )}
        {season && (
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">{t("season")}</span>
            <p className="mt-1 font-semibold">{season}</p>
          </div>
        )}
        {focus && (
          <div className="rounded-card border border-verter-border bg-white/60 p-4">
            <span className="text-sm font-medium text-verter-muted">{t("focus")}</span>
            <p className="mt-1 font-semibold">{focus}</p>
          </div>
        )}
      </div>
      {Boolean(item.short_description || item.summary) && (
        <div>
          <h2 className="text-sm font-medium text-verter-muted">{t("about")}</h2>
          <p className="mt-2 text-verter-graphite">
            {String(item.short_description ?? item.summary ?? "")}
          </p>
        </div>
      )}
      {Boolean(item.official_url) && (
        <a
          href={String(item.official_url)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white"
        >
          {t("officialWebsite")}
        </a>
      )}
    </div>
  );
}

export default function ItemDetailPreview({ item }: ItemDetailPreviewProps) {
  const row = item as Record<string, unknown>;
  const type = String(row.type ?? "route");
  if (type === "route") {
    return <RouteDetailPreview item={row} />;
  }
  return <EventDetailPreview item={row} />;
}
