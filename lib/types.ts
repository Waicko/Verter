/** Unified item type for routes, camps, and events */
export type VerterItemType = "route" | "camp" | "event";

/** Base shape for unified items */
export interface VerterItemBase {
  id: string;
  type: VerterItemType;
  name: string;
  slug: string;
  region: string;
  training_tags: string[];
  description?: string;
}

/** Rating aggregates (read-only on web, sourced from app) */
export interface RouteRatingAggregate {
  avg_rating: number;
  rating_count: number;
  winter_count: number;
}

/** Route item (self-guided running route) */
export interface RouteItem extends VerterItemBase {
  type: "route";
  distance_km: number;
  elevation_gain_m: number;
  elevation_density?: number;
  technicality?: number;
  winter_score?: number;
  start_lat?: number;
  start_lng?: number;
  /** App-sourced rating aggregates (read-only on web) */
  rating_aggregate?: RouteRatingAggregate;
}

/** Camp item (multi-day camp/workshop) */
export interface CampItem extends VerterItemBase {
  type: "camp";
  season?: string;
  duration?: string;
  focus?: string;
  elevation_gain_m?: number;
  /** Official or registration URL for list display */
  registration_url?: string;
}

/** Event item (race/competition or recurring run) */
export interface EventItem extends VerterItemBase {
  type: "event";
  date?: string;
  distance_or_format?: string;
  /** Official or registration URL for list display */
  registration_url?: string;
  /** Parsed distance in km for filtering; from distance_or_format */
  distance_km?: number;
  elevation_gain_m?: number;
  /** Recurring events (e.g. parkrun, weekly group runs) */
  recurring?: boolean;
}

export type VerterItem = RouteItem | CampItem | EventItem;

export interface Route {
  id: string;
  name: string;
  slug: string;
  region: string;
  distance_km: number;
  elevation_gain_m: number;
  technicality_1_5: number;
  winter_score_1_5: number;
  training_tags: string[];
  surface_tags: string[];
  hazards: string;
  notes: string;
  start_lat: number;
  start_lng: number;
}

export interface RouteWithDensity extends Route {
  elevation_density: number;
}

export type ContentType = "blog" | "review" | "podcast" | "comparison";

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  type: ContentType;
  published_at?: string;
  image_url?: string;
  related_route_slugs?: string[];
  /** Canonical: slugs of linked events (events.slug). */
  related_event_slugs?: string[];
}
