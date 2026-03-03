import type { RouteRatingAggregate } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Fetch rating aggregates for given item ids. Returns map of item_id -> aggregate. */
export async function getRatingAggregates(
  itemIds: string[]
): Promise<Map<string, RouteRatingAggregate>> {
  if (itemIds.length === 0) return new Map();
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return new Map();

    const { data: rows, error } = await supabase
      .from("rating_aggregates")
      .select("item_id, avg_rating, rating_count, winter_count")
      .in("item_id", itemIds)
      .gt("rating_count", 0);

    if (error || !rows?.length) return new Map();

    const map = new Map<string, RouteRatingAggregate>();
    for (const r of rows as { item_id: string; avg_rating: number; rating_count: number; winter_count: number }[]) {
      const id = String(r.item_id);
      map.set(id, {
        avg_rating: typeof r.avg_rating === "number" ? r.avg_rating : 0,
        rating_count: typeof r.rating_count === "number" ? r.rating_count : 0,
        winter_count: typeof r.winter_count === "number" ? r.winter_count : 0,
      });
    }
    return map;
  } catch {
    return new Map();
  }
}
