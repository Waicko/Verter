/**
 * Data quality rules for publishing items.
 * Used in admin to show missing-field warnings and disable Publish until met.
 */

export type ItemType = "route" | "event" | "camp";

export interface ItemForValidation {
  type: ItemType;
  title?: string | null;
  region?: string | null;
  country?: string | null;
  short_description?: string | null;
  description?: string | null;
  summary?: string | null;
  official_url?: string | null;
  external_links?: unknown[] | null;
  start_date?: string | null;
  end_date?: string | null;
  recurrence?: string | null;
  season?: string | null;
  distance_km?: number | null;
}

export type MissingFieldKey =
  | "title"
  | "region_or_country"
  | "short_description"
  | "at_least_one_link"
  | "official_url"
  | "date_or_recurrence"
  | "season_or_dates";

const FIELD_LABELS: Record<MissingFieldKey, string> = {
  title: "Title",
  region_or_country: "Region or country",
  short_description: "Short description",
  at_least_one_link: "At least one link (official URL or external links)",
  official_url: "Official URL",
  date_or_recurrence: "Start date or recurrence",
  season_or_dates: "Season or dates",
};

export function getMissingFieldsForPublish(item: ItemForValidation): MissingFieldKey[] {
  const missing: MissingFieldKey[] = [];
  const regionOrCountry = !!(item.region?.trim() || item.country?.trim());
  const hasDesc =
    !!(item.short_description?.trim()) ||
    !!(item.description?.trim()) ||
    !!(item.summary?.trim());
  const hasOfficialUrl = !!(item.official_url?.trim());
  const hasExternalLinks =
    Array.isArray(item.external_links) && item.external_links.length > 0;
  const hasAnyLink = hasOfficialUrl || hasExternalLinks;

  switch (item.type) {
    case "route":
      if (!item.title?.trim()) missing.push("title");
      if (!regionOrCountry) missing.push("region_or_country");
      if (!hasDesc) missing.push("short_description");
      if (!hasAnyLink) missing.push("at_least_one_link");
      break;
    case "event":
      if (!item.title?.trim()) missing.push("title");
      if (!regionOrCountry) missing.push("region_or_country");
      if (!hasDesc) missing.push("short_description");
      if (!hasOfficialUrl) missing.push("official_url");
      const hasDate =
        !!(item.start_date?.trim()) ||
        !!(item.recurrence?.trim() && item.recurrence.toLowerCase() !== "none");
      if (!hasDate) missing.push("date_or_recurrence");
      break;
    case "camp":
      if (!item.title?.trim()) missing.push("title");
      if (!regionOrCountry) missing.push("region_or_country");
      if (!hasDesc) missing.push("short_description");
      if (!hasOfficialUrl) missing.push("official_url");
      const hasSeasonOrDates =
        !!(item.season?.trim()) ||
        !!(item.start_date?.trim()) ||
        !!(item.end_date?.trim());
      if (!hasSeasonOrDates) missing.push("season_or_dates");
      break;
  }
  return missing;
}

export function canPublish(item: ItemForValidation): boolean {
  return getMissingFieldsForPublish(item).length === 0;
}

export function getMissingFieldLabels(missing: MissingFieldKey[]): string[] {
  return missing.map((k) => FIELD_LABELS[k]);
}
