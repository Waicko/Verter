import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbPodcastGuest } from "@/lib/db/podcast-types";

export type PodcastGuest = {
  id: string;
  name: string;
  role: string;
  tagline: string | null;
  image_url: string | null;
  links: Record<string, string> | null;
  episode_url: string | null;
  featured: boolean;
  published_at: string | null;
};

function rowToGuest(row: DbPodcastGuest, locale: "fi" | "en"): PodcastGuest {
  const role = locale === "fi" ? (row.role_fi ?? row.role_en ?? "") : (row.role_en ?? row.role_fi ?? "");
  const tagline = locale === "fi" ? (row.tagline_fi ?? row.tagline_en) : (row.tagline_en ?? row.tagline_fi);
  const links = row.links && typeof row.links === "object" ? (row.links as Record<string, string>) : null;
  return {
    id: row.id,
    name: row.name,
    role,
    tagline,
    image_url: row.image_url,
    links,
    episode_url: row.episode_url,
    featured: row.featured ?? false,
    published_at: row.published_at,
  };
}

/** Featured guest = one with featured=true, newest by published_at */
export async function getFeaturedPodcastGuest(
  locale: "fi" | "en"
): Promise<PodcastGuest | null> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

    const { data: row, error } = await supabase
      .from("podcast_guests")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row) return null;
    return rowToGuest(row as DbPodcastGuest, locale);
  } catch {
    return null;
  }
}

/** Past guests = featured=false, ordered by published_at desc */
export async function getPastPodcastGuests(
  locale: "fi" | "en"
): Promise<PodcastGuest[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("podcast_guests")
      .select("*")
      .eq("status", "published")
      .eq("featured", false)
      .order("published_at", { ascending: false });

    if (error || !rows?.length) return [];
    return rows.map((r) => rowToGuest(r as DbPodcastGuest, locale));
  } catch {
    return [];
  }
}

export type AdminPodcastGuest = PodcastGuest & { status?: string };

/** Admin: all guests by status */
export async function getAdminPodcastGuests(
  status: "published" | "hidden"
): Promise<AdminPodcastGuest[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("podcast_guests")
      .select("*")
      .eq("status", status)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error || !rows) return [];
    return rows.map((r) => {
      const g = rowToGuest(r as DbPodcastGuest, "fi");
      return { ...g, status: (r as DbPodcastGuest).status };
    });
  } catch {
    return [];
  }
}

/** Admin: guest requests */
export async function getPodcastGuestRequests(): Promise<
  { id: string; name: string; email: string | null; message: string | null; created_at: string }[]
> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("podcast_guest_requests")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false });

    if (error || !rows) return [];
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      email: r.email ? String(r.email) : null,
      message: r.message ? String(r.message) : null,
      created_at: String(r.created_at ?? ""),
    }));
  } catch {
    return [];
  }
}
