import { createClient } from "@supabase/supabase-js";

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
};

export function getGpxDownloadUrl(gpxPath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/gpx/${gpxPath}`;
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
