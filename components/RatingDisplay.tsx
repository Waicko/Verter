"use client";

import { useTranslations } from "next-intl";
import type { RouteRatingAggregate } from "@/lib/types";

interface RatingDisplayProps {
  aggregate: RouteRatingAggregate;
  size?: "sm" | "md";
}

function StarIcon({ filled, size = "sm" }: { filled: boolean; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <svg
      className={sizeClass}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

export default function RatingDisplay({ aggregate, size = "sm" }: RatingDisplayProps) {
  const t = useTranslations("rating");
  const { avg_rating, rating_count, winter_count } = aggregate;
  const fullStars = Math.round(avg_rating);
  const emptyStars = Math.max(0, 5 - fullStars);

  const textClass = size === "md" ? "text-base" : "text-sm";

  return (
    <div className="inline-flex items-center gap-1.5" title={t("basedOnCount", { count: rating_count })}>
      <div className="flex text-amber-500" aria-label={t("average")}>
        {Array.from({ length: fullStars }, (_, i) => (
          <StarIcon key={`f-${i}`} filled size={size} />
        ))}
        {Array.from({ length: emptyStars }, (_, i) => (
          <StarIcon key={`e-${i}`} filled={false} size={size} />
        ))}
      </div>
      <span className={`${textClass} font-medium text-verter-graphite`}>
        {avg_rating.toFixed(1)}
      </span>
      <span className={`${textClass} text-verter-muted`}>
        ({rating_count})
      </span>
      {winter_count > 0 && (
        <span className={`${textClass} text-verter-muted`} title={t("winterRun")}>
          · {winter_count} ☃
        </span>
      )}
    </div>
  );
}
