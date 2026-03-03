import Link from "next/link";
import type { Event } from "@/data/events";
import { cardClass } from "@/lib/styles";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={`block p-5 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${cardClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading font-semibold text-verter-graphite">
            {event.name}
          </h3>
          <p className="mt-1 text-sm text-verter-muted">
            {event.country} · {formatDate(event.date)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-pill border px-2.5 py-0.5 text-xs font-medium ${
            event.type === "race"
              ? "border-verter-blue/30 bg-verter-ice text-verter-blue"
              : "border-verter-risky/30 bg-yellow-50 text-verter-risky"
          }`}
        >
          {event.type}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-verter-graphite">
        {event.distance_or_format}
      </p>
      <div className="mt-3 flex gap-3 text-xs text-verter-muted">
        <span>Difficulty {event.difficulty_1_5}/5</span>
        <span>{event.vert_m} m vert</span>
        <span>Fun {event.fun_factor_1_5}/5</span>
      </div>
    </Link>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
