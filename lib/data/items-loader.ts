import type { VerterItem, RouteItem, CampItem, EventItem } from "@/lib/types";
import { items as staticItems } from "@/lib/data/items";
import { getPublishedItemsFromSupabase } from "@/lib/data/items-supabase";

function computeRouteDerived(items: RouteItem[]) {
  const regions = [...new Set(items.map((i) => i.region))].sort();
  const trainingTags = [...new Set(items.flatMap((i) => i.training_tags))].sort();
  const distances = items.map((i) => i.distance_km);
  const elevations = items.map((i) => i.elevation_gain_m);
  return {
    regions,
    trainingTags,
    numericBounds: {
      distanceMin: Math.min(0, ...distances),
      distanceMax: Math.max(50, ...distances),
      elevationMin: 0,
      elevationMax: Math.max(3000, ...elevations),
    },
  };
}

function computeEventsDerived(items: (CampItem | EventItem)[]) {
  const regions = [...new Set(items.map((i) => i.region))].sort();
  const trainingTags = [...new Set(items.flatMap((i) => i.training_tags))].sort();
  return { regions, trainingTags };
}

export type RoutesData = {
  items: RouteItem[];
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
};

/** Fetch items from Supabase if available, else use static. Public lists show status=published only. */
async function loadAllItems(): Promise<VerterItem[]> {
  const supabaseItems = await getPublishedItemsFromSupabase();
  return supabaseItems.length > 0 ? supabaseItems : staticItems;
}

/** Load only route-type items for /routes hub. */
export async function loadRoutesData(): Promise<RoutesData> {
  const items = await loadAllItems();
  const routeItems = items.filter((i): i is RouteItem => i.type === "route");
  const { regions, trainingTags, numericBounds } =
    computeRouteDerived(routeItems);
  return { items: routeItems, regions, trainingTags, numericBounds };
}

/** Load only event+camp items for /events hub. */
export async function loadEventsData(): Promise<EventsData> {
  const items = await loadAllItems();
  const eventItems = items.filter(
    (i): i is CampItem | EventItem => i.type === "event" || i.type === "camp"
  );
  const { regions, trainingTags } = computeEventsDerived(eventItems);
  return { items: eventItems, regions, trainingTags };
}
