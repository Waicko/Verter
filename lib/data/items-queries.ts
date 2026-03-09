import type { RouteItem, CampItem, EventItem } from "@/lib/types";
import type { Route } from "@/lib/types";
import { routes } from "@/lib/data/routes";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedItemsFromSupabase } from "@/lib/data/items-supabase";
import { items as staticItems } from "@/lib/data/items";
import { calculateElevationDensity } from "@/lib/utils";

export type ExternalLink = { url: string; label: string };

import type { RouteRatingAggregate } from "@/lib/types";
import { getRatingAggregates } from "@/lib/data/rating-aggregates";

/** Unified route shape for detail page (static Route or RouteItem from Supabase) */
export type RouteDetail = {
  id: string;
  name: string;
  slug: string;
  region: string;
  distance_km: number;
  elevation_gain_m: number;
  elevation_density: number;
  technicality_1_5: number;
  winter_score_1_5: number;
  training_tags: string[];
  surface_tags: string[];
  hazards: string | null;
  notes: string | null;
  start_lat: number | null;
  start_lng: number | null;
  official_url: string | null;
  external_links: ExternalLink[];
  rating_aggregate?: RouteRatingAggregate;
};

/** Event/camp detail with external links for display */
export type EventDetail = (EventItem | CampItem) & {
  official_url: string | null;
  external_links: ExternalLink[];
};

function parseExternalLinks(links: unknown): ExternalLink[] {
  if (!Array.isArray(links)) return [];
  return links
    .filter((x): x is { url?: string; label?: string } => x != null && typeof x === "object")
    .map((x) => ({ url: String(x.url ?? ""), label: String(x.label ?? "Link") }))
    .filter((x) => x.url.startsWith("http"));
}

function routeToDetail(r: Route): RouteDetail {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    region: r.region,
    distance_km: r.distance_km,
    elevation_gain_m: r.elevation_gain_m,
    elevation_density: calculateElevationDensity(r.elevation_gain_m, r.distance_km),
    technicality_1_5: r.technicality_1_5,
    winter_score_1_5: r.winter_score_1_5,
    training_tags: r.training_tags,
    surface_tags: r.surface_tags,
    hazards: r.hazards || null,
    notes: r.notes || null,
    start_lat: r.start_lat,
    start_lng: r.start_lng,
    official_url: null,
    external_links: [],
  };
}

function routeRowToDetail(
  row: Record<string, unknown>,
  r: RouteItem,
  ratingAggregate?: RouteRatingAggregate
): RouteDetail {
  const distance = r.distance_km ?? 0;
  const elevation = r.elevation_gain_m ?? 0;
  const official = row.official_url ? String(row.official_url) : null;
  const extRaw = row.external_links;
  let links = parseExternalLinks(extRaw);
  if (official && !links.some((l) => l.url === official)) {
    links = [{ url: official, label: "Official" }, ...links];
  }
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    region: r.region,
    distance_km: distance,
    elevation_gain_m: elevation,
    elevation_density: r.elevation_density ?? calculateElevationDensity(elevation, distance),
    technicality_1_5: r.technicality ?? 0,
    winter_score_1_5: r.winter_score ?? 0,
    training_tags: r.training_tags ?? [],
    surface_tags: [],
    hazards: null,
    notes: r.description || null,
    start_lat: r.start_lat ?? null,
    start_lng: r.start_lng ?? null,
    official_url: official,
    external_links: links,
    rating_aggregate: ratingAggregate,
  };
}

function eventRowToDetail(row: Record<string, unknown>, item: EventItem | CampItem): EventDetail {
  const official = row.official_url ? String(row.official_url) : null;
  const extRaw = row.external_links;
  let links = parseExternalLinks(extRaw);
  if (official && !links.some((l) => l.url === official)) {
    links = [{ url: official, label: "Official" }, ...links];
  }
  return { ...item, official_url: official, external_links: links };
}

/** Get route by slug: Supabase (published) first, then static fallback. */
export async function getRouteBySlug(slug: string): Promise<RouteDetail | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: row } = await supabase
      .from("items")
      .select("*")
      .eq("type", "route")
      .eq("status", "published")
      .eq("slug", slug)
      .single();
    if (row) {
      const r = {
        type: "route" as const,
        id: String(row.id),
        name: String(row.title ?? ""),
        slug: String(row.slug ?? ""),
        region: String(row.region ?? row.country ?? ""),
        training_tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        distance_km: typeof row.distance_km === "number" ? row.distance_km : 0,
        elevation_gain_m: typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : 0,
        elevation_density: undefined as number | undefined,
        technicality: typeof row.technicality_1_5 === "number" ? row.technicality_1_5 : undefined,
        winter_score: typeof row.winter_score_1_5 === "number" ? row.winter_score_1_5 : undefined,
        start_lat: typeof row.start_lat === "number" ? row.start_lat : undefined,
        start_lng: typeof row.start_lng === "number" ? row.start_lng : undefined,
        description: row.short_description ? String(row.short_description) : undefined,
      };
      r.elevation_density = calculateElevationDensity(r.elevation_gain_m, r.distance_km);
      const [agg] = (await getRatingAggregates([String(row.id)])).values();
      return routeRowToDetail(row as Record<string, unknown>, r, agg);
    }
  } catch {
    // fallback to static
  }
  const staticRoute = routes.find((r) => r.slug === slug);
  return staticRoute ? routeToDetail(staticRoute) : null;
}

/** Get event or camp by slug: Supabase (published) first, then static fallback. */
export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data: row } = await supabase
      .from("items")
      .select("*")
      .in("type", ["event", "camp"])
      .eq("status", "published")
      .eq("slug", slug)
      .single();
    if (row) {
      const base = {
        id: String(row.id),
        type: row.type as "event" | "camp",
        name: String(row.title ?? ""),
        slug: String(row.slug ?? ""),
        region: String(row.region ?? row.country ?? ""),
        training_tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        description: row.short_description ? String(row.short_description) : undefined,
      };
      const item =
        row.type === "camp"
          ? ({ ...base, type: "camp" as const, season: row.season, duration: undefined, focus: row.focus } satisfies CampItem)
          : ({
              ...base,
              type: "event" as const,
              date: row.start_date ? String(row.start_date) : undefined,
              distance_or_format: Array.isArray(row.distance_options)
                ? (row.distance_options as { label?: string }[]).map((d) => d?.label ?? "").filter(Boolean).join(", ")
                : undefined,
              recurring: !!row.recurrence && String(row.recurrence).toLowerCase() !== "none",
              elevation_gain_m: typeof row.elevation_gain_m === "number" ? row.elevation_gain_m : undefined,
            } satisfies EventItem);
      return eventRowToDetail(row as Record<string, unknown>, item);
    }
  } catch {
    // fallback to static
  }
  const fromStatic = staticItems.find(
    (i): i is EventItem | CampItem =>
      (i.type === "event" || i.type === "camp") && i.slug === slug
  );
  return fromStatic ? { ...fromStatic, official_url: null, external_links: [] } : null;
}
