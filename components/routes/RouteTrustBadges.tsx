"use client";

import { useTranslations } from "next-intl";

export type RouteTrustData = {
  submitted_by_strava_url?: string | null;
  approved_by_verter?: boolean | null;
  tested_by_team?: boolean | null;
  tested_notes?: string | null;
};

interface RouteTrustBadgesProps {
  route: RouteTrustData;
  className?: string;
}

export default function RouteTrustBadges({ route, className = "" }: RouteTrustBadgesProps) {
  const t = useTranslations("routes.trust");

  const hasStrava = !!route.submitted_by_strava_url?.trim();
  const hasApproved = route.approved_by_verter === true;
  const hasTested = route.tested_by_team === true;
  const hasTestedNotes = !!route.tested_notes?.trim();

  if (!hasStrava && !hasApproved && !hasTested && !hasTestedNotes) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {hasStrava && (
        <a
          href={route.submitted_by_strava_url!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-verter-border bg-verter-snow/50 px-3 py-1.5 text-sm font-medium text-verter-graphite no-underline transition hover:bg-verter-snow hover:border-verter-forest"
        >
          <span aria-hidden>🏃</span>
          {t("stravaProfileLinked")}
        </a>
      )}
      {hasApproved && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-verter-forest bg-verter-forest/10 px-3 py-1.5 text-sm font-medium text-verter-forest"
          title={t("approvedByVerterLabel")}
        >
          <span aria-hidden>✓</span>
          {t("approvedByVerter")}
        </span>
      )}
      {hasTested && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-verter-border bg-verter-snow/50 px-3 py-1.5 text-sm font-medium text-verter-graphite">
          <span aria-hidden>✓</span>
          {t("testedByTeamNote")}
        </span>
      )}
      {hasTestedNotes && (
        <div className="w-full text-sm text-verter-muted">
          {route.tested_notes}
        </div>
      )}
    </div>
  );
}
