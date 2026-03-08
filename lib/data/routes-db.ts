import { createClient } from "@supabase/supabase-js";

import type { SourceRightsMetadata, RouteOriginMetadata } from "@/lib/metadata-types";

export type DbRoute = {
  id: string;
  title: string;
  area: string | null;
  distance_km: number | null;
  ascent_m: number | null;
  description: string | null;
  gpx_path: string | null;
  status: string;
  slug: string;
  created_at: string;
} & Partial<SourceRightsMetadata> &
  Partial<RouteOriginMetadata>;

/**
 * Returns the public URL for a GPX file in the gpx bucket.
 * Uses Supabase's getPublicUrl so the format always matches the actual storage path.
 * gpx_path must be the object path within the bucket (no "gpx/" prefix).
 */
export function getGpxDownloadUrl(gpxPath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !gpxPath?.trim()) return "";
  const path = gpxPath.replace(/^gpx\/+/, "").replace(/^\/+/, "").trim();
  if (!path) return "";
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data } = supabase.storage.from("gpx").getPublicUrl(path);
  return data.publicUrl;
}

export async function getPublishedRoutes(): Promise<DbRoute[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as DbRoute[];
}

export async function getPublishedRouteBySlug(
  slug: string
): Promise<DbRoute | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as DbRoute;
}
