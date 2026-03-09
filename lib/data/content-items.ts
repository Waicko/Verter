import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbContentItem } from "@/lib/db/content-types";

export type ContentItemPublic = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  type: "blog" | "review" | "podcast" | "comparison";
  published_at?: string;
  image_url?: string;
  related_item_ids?: string[];
  author?: string | null;
};

export type ContentItemDetail = ContentItemPublic & {
  body: string;
  episode_url: string | null;
  source_name?: string | null;
  source_type?: string | null;
  verification_status?: string | null;
};

function rowToPublic(row: DbContentItem): ContentItemPublic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.summary ?? "",
    type: row.content_type,
    published_at: row.published_at ?? undefined,
    image_url: row.hero_image ?? undefined,
    related_item_ids: Array.isArray(row.related_item_ids) ? row.related_item_ids : undefined,
    author: row.author ?? undefined,
  };
}

/** Fetch published content items for public list */
export async function getPublishedContentItems(): Promise<ContentItemPublic[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("status", "published")
      .in("content_type", ["blog", "review", "comparison"])
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error || !rows) return [];
    return rows.map((r) => rowToPublic(r as DbContentItem));
  } catch {
    return [];
  }
}

/** Fetch content by slug for public detail. Excludes podcast-type (podcasts live on /podcast). */
export async function getContentBySlug(
  slug: string
): Promise<ContentItemDetail | null> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

    const { data: row, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("status", "published")
      .in("content_type", ["blog", "review", "comparison"])
      .eq("slug", slug)
      .single();

    if (error || !row) return null;

    const r = row as DbContentItem;
    return {
      ...rowToPublic(r),
      body: r.body ?? "",
      episode_url: r.episode_url,
      source_name: (r as DbContentItem & { source_name?: string | null }).source_name ?? null,
      source_type: (r as DbContentItem & { source_type?: string | null }).source_type ?? null,
      verification_status:
        (r as DbContentItem & { verification_status?: string | null }).verification_status ?? null,
    };
  } catch {
    return null;
  }
}

export type AdminContentItem = ContentItemPublic & {
  body: string;
  episode_url: string | null;
  status?: string;
};

/** Admin: fetch content by status */
export async function getAdminContentItems(
  status: "draft" | "published" | "archived"
): Promise<AdminContentItem[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("status", status)
      .order("updated_at", { ascending: false });

    if (error || !rows) return [];
    return rows.map((r) => {
      const pub = rowToPublic(r as DbContentItem);
      const db = r as DbContentItem;
    return {
      ...pub,
      body: db.body ?? "",
      episode_url: db.episode_url,
      status: db.status,
    };
    });
  } catch {
    return [];
  }
}
