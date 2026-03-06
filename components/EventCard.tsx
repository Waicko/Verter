import { Link } from "@/i18n/navigation";
import type { DbEvent } from "@/lib/data/events-db";
import { cardClass } from "@/lib/styles";

interface EventCardProps {
  event: DbEvent;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventCard({ event }: EventCardProps) {
  const slug = event.slug ?? event.id;
  return (
    <Link
      href={`/events/${slug}`}
      className={`block p-5 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${cardClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading font-semibold text-verter-graphite">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-verter-muted">
            {event.location && event.date
              ? `${event.location} · ${formatDate(event.date)}`
              : event.date
                ? formatDate(event.date)
                : event.location ?? ""}
          </p>
        </div>
      </div>
      {event.description && (
        <p className="mt-3 line-clamp-2 text-sm text-verter-graphite">
          {event.description}
        </p>
      )}
    </Link>
  );
}
