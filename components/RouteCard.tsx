import { Link } from "@/i18n/navigation";
import type { RouteWithDensity } from "@/lib/types";
import { formatDistance, formatElevation } from "@/lib/utils";
import { cardClass, pill } from "@/lib/styles";
import WinterBadge from "./WinterBadge";

interface RouteCardProps {
  route: RouteWithDensity;
}

export default function RouteCard({ route }: RouteCardProps) {
  return (
    <Link
      href={`/routes/${route.slug}`}
      className={`block p-4 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${cardClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-verter-graphite">
          {route.name}
        </h3>
        <WinterBadge winterScore={route.winter_score_1_5} />
      </div>
      <p className="mt-1 text-sm text-verter-muted">{route.region}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`${pill}`}>
          {formatDistance(route.distance_km)}
        </span>
        <span className={`${pill}`}>
          {formatElevation(route.elevation_gain_m)}
        </span>
        <span className={`${pill}`}>{route.elevation_density} m/km</span>
      </div>
      {route.training_tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {route.training_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-pill border border-verter-blue/30 bg-verter-ice px-2 py-0.5 text-xs font-medium text-verter-blue"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
