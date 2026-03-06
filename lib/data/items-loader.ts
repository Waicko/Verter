import type { VerterItem, RouteItem, CampItem, EventItem } from "@/lib/types";
import { items as staticItems } from "@/lib/data/items";
import { getPublishedItemsFromSupabase } from "@/lib/data/items-supabase";
import {
  getPublishedRoutes,
  type DbRoute,
} from "@/lib/data/routes-db";

function computeRouteDerivedFromDb(routes: DbRoute[]) {
  const regions = [...new Set(routes.map((r) => r.area).filter(Boolean))].sort() as string[];
  const distances = routes.map((r) => r.distance_km).filter((n): n is number => n != null);
  const elevations = routes.map((r) => r.ascent_m).filter((n): n is number => n != null);
  return {
    regions,
    trainingTags: [] as string[], // DB routes have no training_tags
    numericBounds: {
      distanceMin: distances.length ? Math.min(0, ...distances) : 0,
      distanceMax: distances.length ? Math.max(50, ...distances) : 50,
      elevationMin: 0,
      elevationMax: elevations.length ? Math.max(3000, ...elevations) : 3000,
    },
  };
}

function computeEventsDerived(items: (CampItem | EventItem)[]) {
  const regions = [...new Set(items.map((i) => i.region))].sort();
  const trainingTags = [...new Set(items.flatMap((i) => i.training_tags))].sort();
  return { regions, trainingTags };
}

export type RoutesData = {
  routes: import("@/lib/data/routes-db").DbRoute[];
  regions: string[];
  trainingTags: string[];
  numericBounds: {
    distanceMin: number;
    distanceMax: number;
    elevationMin: number;
    elevationMax: number;
  };
};

export type EventsData = {
  items: (CampItem | EventItem)[];
  regions: string[];
  trainingTags: string[];
  /** Set when Supabase fetch fails */
  error?: string;
};

/** Fetch items from Supabase if available, else use static. Public lists show status=published only. */
async function loadAllItems(): Promise<VerterItem[]> {
  const supabaseItems = await getPublishedItemsFromSupabase();
  return supabaseItems.length > 0 ? supabaseItems : staticItems;
}

/** Load published routes from Supabase for /routes hub. No static/placeholder routes. */
export async function loadRoutesData(): Promise<RoutesData> {
  const routes = await getPublishedRoutes();
  const { regions, trainingTags, numericBounds } =
    computeRouteDerivedFromDb(routes);
  return {
    routes,
    regions,
    trainingTags,
    numericBounds,
  };
}

/** Load only event+camp items for /events hub. Supabase only (no static fallback). */
export async function loadEventsData(): Promise<EventsData> {
  try {
    const supabaseItems = await getPublishedItemsFromSupabase();
    const eventItems = supabaseItems.filter(
      (i): i is CampItem | EventItem => i.type === "event" || i.type === "camp"
    );
    const { regions, trainingTags } = computeEventsDerived(eventItems);
    return { items: eventItems, regions, trainingTags };
  } catch {
    return {
      items: [],
      regions: [],
      trainingTags: [],
      error: "load_error",
    };
  }
}
