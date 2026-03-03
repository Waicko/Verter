export const RATING_STORAGE_KEY = "verter-route-ratings";

export interface StoredRating {
  rating: number;
  comment?: string;
  ranInWinter: boolean;
  status: "pending" | "approved";
  timestamp: number;
}

export type RouteRatings = Record<string, StoredRating>;

export function getStoredRatings(): RouteRatings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RATING_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RouteRatings) : {};
  } catch {
    return {};
  }
}

export function storeRating(routeSlug: string, rating: StoredRating): void {
  const all = getStoredRatings();
  all[routeSlug] = { ...rating, status: "pending", timestamp: Date.now() };
  if (typeof window !== "undefined") {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(all));
  }
}

export function getStoredRatingForRoute(routeSlug: string): StoredRating | null {
  return getStoredRatings()[routeSlug] ?? null;
}
