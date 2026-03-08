"use client";

import { useTranslations } from "next-intl";

export type SourceMetadata = {
  source_name?: string | null;
  source_type?: string | null;
  verification_status?: string | null;
  route_origin_name?: string | null;
  route_origin_type?: string | null;
};

interface SourceMetadataDisplayProps {
  metadata: SourceMetadata;
  includeRouteOrigin?: boolean;
  className?: string;
}

const VALUE_KEYS: Record<string, string> = {
  team: "sourceType_team",
  organizer: "sourceType_organizer",
  community: "sourceType_community",
  third_party: "sourceType_third_party",
  editorial: "sourceType_editorial",
  unverified: "verificationStatus_unverified",
  verified_by_team: "verificationStatus_verified_by_team",
  organizer_confirmed: "verificationStatus_organizer_confirmed",
  team_route: "routeOriginType_team_route",
  race_route: "routeOriginType_race_route",
  organizer_route: "routeOriginType_organizer_route",
  community_route: "routeOriginType_community_route",
  imported: "routeOriginType_imported",
};

function getLabel(t: ReturnType<typeof useTranslations>, key: string, value: string): string {
  const transKey = VALUE_KEYS[value];
  if (transKey) {
    const label = t(transKey as "sourceType_team");
    if (label && label !== transKey) return label;
  }
  return value;
}

export default function SourceMetadataDisplay({
  metadata,
  includeRouteOrigin = false,
  className = "mt-6 rounded-card border border-verter-border bg-verter-snow/30 px-4 py-3 text-sm text-verter-muted",
}: SourceMetadataDisplayProps) {
  const t = useTranslations("metadata");
  const items: { label: string; value: string }[] = [];

  if (metadata.source_name) {
    items.push({ label: t("publicSource"), value: metadata.source_name });
  }
  if (metadata.source_type) {
    items.push({
      label: t("publicSourceType"),
      value: getLabel(t, "source_type", metadata.source_type),
    });
  }
  if (metadata.verification_status) {
    items.push({
      label: t("publicVerification"),
      value: getLabel(t, "verification_status", metadata.verification_status),
    });
  }
  if (includeRouteOrigin && metadata.route_origin_name) {
    items.push({ label: t("publicRouteOrigin"), value: metadata.route_origin_name });
  }
  if (includeRouteOrigin && metadata.route_origin_type) {
    items.push({
      label: t("publicRouteOriginType"),
      value: getLabel(t, "route_origin_type", metadata.route_origin_type),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <dl className="space-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex gap-2">
            <dt className="shrink-0 font-medium text-verter-graphite">{label}:</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
