import { Link } from "@/i18n/navigation";
import type { DbRoute } from "@/lib/data/routes-db";
import { formatDistance, formatElevation } from "@/lib/utils";
import { cardClass, pill } from "@/lib/styles";

interface RouteCardProps {
  route: DbRoute;
}

export default function RouteCard({ route }: RouteCardProps) {
  return (
    <Link
      href={`/routes/${route.slug}`}
      className={`block p-4 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${cardClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-verter-graphite">
          {route.title}
        </h3>
      </div>
      {route.area && (
        <p className="mt-1 text-sm text-verter-muted">{route.area}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {route.distance_km != null && (
          <span className={pill}>{formatDistance(route.distance_km)}</span>
        )}
        {route.ascent_m != null && (
          <span className={pill}>{formatElevation(route.ascent_m)}</span>
        )}
      </div>
    </Link>
  );
}
