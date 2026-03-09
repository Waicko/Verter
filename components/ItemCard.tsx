import { Link as I18nLink } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { VerterItem, RouteItem, CampItem, EventItem } from "@/lib/types";
import { formatDistance, formatElevation } from "@/lib/utils";
import { cardClass, pill } from "@/lib/styles";
import WinterBadge from "./WinterBadge";
import RatingDisplay from "./RatingDisplay";

interface ItemCardProps {
  item: VerterItem;
  /** Override default href (e.g. for admin edit link) */
  href?: string;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ItemCard({ item, href: hrefOverride }: ItemCardProps) {
  const locale = useLocale();
  const t = useTranslations("routes");
  const isRoute = item.type === "route";
  const defaultHref = isRoute ? `/routes/${item.slug}` : `/events/${item.slug}`;
  const href = hrefOverride ?? defaultHref;
  const CardLink = I18nLink;

  return (
    <CardLink
      href={href}
      className={`block p-4 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${cardClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-verter-graphite">
          {item.name}
        </h3>
        {item.type === "route" &&
          item.winter_score != null && (
            <WinterBadge winterScore={item.winter_score} />
          )}
      </div>
      <p className="mt-1 text-sm text-verter-muted">{item.region}</p>

      {/* Route: distance + elevation + rating */}
      {item.type === "route" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.rating_aggregate && item.rating_aggregate.rating_count > 0 && (
            <RatingDisplay aggregate={item.rating_aggregate} size="sm" />
          )}
          <span className={pill}>{formatDistance(item.distance_km)}</span>
          <span className={pill}>{formatElevation(item.elevation_gain_m)}</span>
          {item.elevation_density != null && (
            <span className={pill}>{item.elevation_density} m/km</span>
          )}
        </div>
      )}

      {/* Camp: duration + focus */}
      {item.type === "camp" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.duration && <span className={pill}>{item.duration}</span>}
          {item.focus && <span className={pill}>{item.focus}</span>}
          {item.elevation_gain_m != null && (
            <span className={pill}>{formatElevation(item.elevation_gain_m)}</span>
          )}
        </div>
      )}

      {/* Event: date + distance options (or "Recurring" for recurring events) */}
      {item.type === "event" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.recurring ? (
            <span className={pill}>{t("recurring")}</span>
          ) : (
            item.date && (
              <span className={pill}>{formatDate(item.date, locale)}</span>
            )
          )}
          {item.distance_or_format && (
            <span className={pill}>{item.distance_or_format}</span>
          )}
          {item.elevation_gain_m != null && (
            <span className={pill}>{formatElevation(item.elevation_gain_m)}</span>
          )}
        </div>
      )}

      {item.training_tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.training_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-pill border border-verter-blue/30 bg-verter-ice px-2 py-0.5 text-xs font-medium text-verter-blue"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </CardLink>
  );
}
