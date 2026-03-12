import type { VerterItem, RouteItem, CampItem, EventItem } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { calculateElevationDensity } from "@/lib/utils";
import { getRatingAggregates } from "@/lib/data/rating-aggregates";

/** Transform Supabase row to VerterItem */
function dbRowToItem(row: Record<string, unknown>): VerterItem {
  const base = {
    id: String(row.id),
    type: row.type as "route" | "event" | "camp",
    name: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    region: String(row.region ?? row.country ?? ""),
    training_tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    description:
      row.short_description
        ? String(row.short_description)
        : row.summary
          ? String(row.summary)
          : undefined,
  };

  if (row.type === "route") {
    const distance = typeof row.distance_km === "number" ? row.distance_km : 0;
    const elevation =
      typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : 0;
    const ratingAggregate = (row as { rating_aggregate?: RouteItem["rating_aggregate"] }).rating_aggregate;
    return {
      ...base,
      type: "route",
      distance_km: distance,
      elevation_gain_m: elevation,
      elevation_density: calculateElevationDensity(elevation, distance),
      technicality: typeof row.technicality_1_5 === "number" ? row.technicality_1_5 : undefined,
      winter_score: typeof row.winter_score_1_5 === "number" ? row.winter_score_1_5 : undefined,
      start_lat: typeof row.start_lat === "number" ? row.start_lat : undefined,
      start_lng: typeof row.start_lng === "number" ? row.start_lng : undefined,
      rating_aggregate: ratingAggregate,
    } satisfies RouteItem;
  }

  if (row.type === "camp") {
    const durationDays =
      typeof row.duration_days === "number" ? row.duration_days : null;
    const duration = durationDays
      ? `${durationDays}-day${durationDays > 1 ? "s" : ""}`
      : (row.season as string) ?? undefined;
    const registrationUrl = row.official_url
      ? String(row.official_url)
      : undefined;
    return {
      ...base,
      type: "camp",
      season: row.season ? String(row.season) : undefined,
      duration: duration || undefined,
      focus: row.focus ? String(row.focus) : undefined,
      elevation_gain_m:
        typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : undefined,
      registration_url: registrationUrl,
    } satisfies CampItem;
  }

  // event
  const distOpts = Array.isArray(row.distance_options)
    ? (row.distance_options as string[] | { label?: string }[])
    : [];
  const distStr =
    distOpts.length > 0
      ? distOpts
          .map((d) => (typeof d === "string" ? d : d?.label ?? ""))
          .filter(Boolean)
          .join(", ")
      : null;
  const recurrence = row.recurrence ? String(row.recurrence) : "";
  const registrationUrl = row.official_url
    ? String(row.official_url)
    : undefined;
  return {
    ...base,
    type: "event",
    date: row.start_date ? String(row.start_date) : undefined,
    distance_or_format: distStr ?? undefined,
    distance_km: parseFirstDistance(distStr),
    elevation_gain_m:
      typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : undefined,
    recurring: !!recurrence && recurrence.toLowerCase() !== "none",
    registration_url: registrationUrl,
  } satisfies EventItem;
}

function parseFirstDistance(s: string | null): number | undefined {
  if (!s) return undefined;
  const m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : undefined;
}

/** Fetch published items from Supabase and merge with static fallback. Joins rating_aggregates for routes. */
export async function getPublishedItemsFromSupabase(): Promise<VerterItem[]> {
  try {
    const supabase = getSupabaseServerClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return [];

    const { data: rows, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", "published");

    if (error || !rows?.length) return [];

    const routeIds = rows
      .filter((r) => r.type === "route")
      .map((r) => String(r.id));
    const aggregatesMap = await getRatingAggregates(routeIds);

    return rows.map((r) => {
      const row = r as Record<string, unknown>;
      const id = String(row.id);
      const agg = row.type === "route" ? aggregatesMap.get(id) : undefined;
      const enriched = { ...row, rating_aggregate: agg };
      return dbRowToItem(enriched);
    });
  } catch {
    return [];
  }
}
