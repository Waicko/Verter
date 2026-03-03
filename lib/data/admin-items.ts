import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { VerterItem, RouteItem, CampItem, EventItem } from "@/lib/types";
import { calculateElevationDensity } from "@/lib/utils";
import { getRatingAggregates } from "@/lib/data/rating-aggregates";

type ItemStatus = "published" | "pending" | "draft";

function dbRowToItem(row: Record<string, unknown>): VerterItem {
  const base = {
    id: String(row.id),
    type: row.type as "route" | "event" | "camp",
    name: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    region: String(row.region ?? row.country ?? ""),
    training_tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    description:
      row.short_description ? String(row.short_description) : row.summary ? String(row.summary) : undefined,
  };

  if (row.type === "route") {
    const distance = typeof row.distance_km === "number" ? row.distance_km : 0;
    const elevation = typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : 0;
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
      rating_aggregate: (row as { rating_aggregate?: RouteItem["rating_aggregate"] }).rating_aggregate,
    } satisfies RouteItem;
  }

  if (row.type === "camp") {
    const durationDays = typeof row.duration_days === "number" ? row.duration_days : null;
    const duration = durationDays
      ? `${durationDays}-day${durationDays > 1 ? "s" : ""}`
      : (row.season as string) ?? undefined;
    return {
      ...base,
      type: "camp",
      season: row.season ? String(row.season) : undefined,
      duration: duration || undefined,
      focus: row.focus ? String(row.focus) : undefined,
      elevation_gain_m: typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : undefined,
    } satisfies CampItem;
  }

  const distOpts = Array.isArray(row.distance_options)
    ? (row.distance_options as string[] | { label?: string }[])
    : [];
  const distStr =
    distOpts.length > 0
      ? distOpts.map((d) => (typeof d === "string" ? d : (d as { label?: string })?.label ?? "")).filter(Boolean).join(", ")
      : null;
  const recurrence = row.recurrence ? String(row.recurrence) : "";
  return {
    ...base,
    type: "event",
    date: row.start_date ? String(row.start_date) : undefined,
    distance_or_format: distStr ?? undefined,
    distance_km: distStr ? parseFloat((distStr.match(/(\d+(?:\.\d+)?)/) ?? [])[1] || "0") : undefined,
    elevation_gain_m: typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : undefined,
    recurring: !!recurrence && recurrence.toLowerCase() !== "none",
  } satisfies EventItem;
}

export type AdminDbItem = VerterItem & { updated_at?: string; status?: string };

/** Fetch items by status for admin (all statuses allowed) */
export async function getAdminItems(status: ItemStatus): Promise<AdminDbItem[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", status)
      .order("updated_at", { ascending: false });

    if (error || !rows?.length) return [];

    const routeIds = rows.filter((r) => r.type === "route").map((r) => String(r.id));
    const aggregatesMap = await getRatingAggregates(routeIds);

    return rows.map((r) => {
      const row = r as Record<string, unknown>;
      const id = String(row.id);
      const agg = row.type === "route" ? aggregatesMap.get(id) : undefined;
      const enriched = { ...row, rating_aggregate: agg };
      const item = dbRowToItem(enriched);
      return {
        ...item,
        updated_at: row.updated_at ? String(row.updated_at) : undefined,
        status: row.status ? String(row.status) : undefined,
      } as AdminDbItem;
    });
  } catch {
    return [];
  }
}
