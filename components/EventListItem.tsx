"use client";

import { Link as I18nLink } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { CampItem, EventItem } from "@/lib/types";
import { cardClass } from "@/lib/styles";

interface EventListItemProps {
  item: EventItem | CampItem;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventListItem({ item }: EventListItemProps) {
  const locale = useLocale();
  const t = useTranslations("events");
  const isEvent = item.type === "event";
  const ev = item as EventItem;
  const camp = item as CampItem;

  const dateDisplay = isEvent
    ? ev.recurring
      ? t("recurring")
      : ev.date
        ? formatDate(ev.date, locale)
        : null
    : camp.season ?? camp.duration ?? null;

  const location = item.region || "";

  return (
    <div
      className={`p-4 ${cardClass}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <I18nLink
            href={`/events/${item.slug}`}
            className="font-heading font-semibold text-verter-graphite hover:text-verter-forest hover:underline focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2"
          >
            {item.name}
          </I18nLink>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-verter-muted">
            {dateDisplay && <span>{dateDisplay}</span>}
            {location && <span>{location}</span>}
          </div>
        </div>
        {item.registration_url && (
          <a
            href={item.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-medium text-verter-forest hover:underline"
          >
            {t("register")}
            <svg
              className="ml-1 inline h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
