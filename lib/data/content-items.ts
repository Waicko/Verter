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
  /** Canonical: slugs of linked routes (routes.slug). */
  related_route_slugs?: string[];
  /** Canonical: slugs of linked events (events.slug). */
  related_event_slugs?: string[];
  /** @deprecated Use related_route_slugs for content → route linking. */
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

/** Pick localized value: prefer locale, fall back to FI */
function pickLocale<T>(
  row: DbContentItem & Record<string, unknown>,
  locale: string,
  fiKey: string,
  enKey: string,
  fallback: T
): T {
  const isEn = locale === "en";
  if (isEn) {
    const en = row[enKey];
    if (en != null && String(en).trim()) return en as T;
  }
  const fi = row[fiKey];
  if (fi != null && String(fi).trim()) return fi as T;
  return fallback;
}

/** Project row to public view for a given locale (localized fields with FI fallback) */
function rowToPublic(row: DbContentItem, locale: string = "fi"): ContentItemPublic {
  const db = row as DbContentItem & {
    related_route_slugs?: string[] | null;
    related_event_slugs?: string[] | null;
  };
  const hasLocalized = db.slug_fi != null || db.title_fi != null;

  const title = hasLocalized
    ? pickLocale(db, locale, "title_fi", "title_en", db.title ?? "")
    : db.title ?? "";
  const slug = hasLocalized
    ? pickLocale(db, locale, "slug_fi", "slug_en", db.slug ?? "")
    : db.slug ?? "";
  const excerpt = hasLocalized
    ? pickLocale(db, locale, "excerpt_fi", "excerpt_en", db.summary ?? "")
    : db.summary ?? "";

  return {
    id: row.id,
    slug,
    title,
    excerpt,
    type: row.content_type,
    published_at: row.published_at ?? undefined,
    image_url: row.hero_image ?? undefined,
    related_route_slugs: Array.isArray(db.related_route_slugs) ? db.related_route_slugs : undefined,
    related_event_slugs: Array.isArray(db.related_event_slugs) ? db.related_event_slugs : undefined,
    related_item_ids: Array.isArray(row.related_item_ids) ? row.related_item_ids : undefined,
    author: row.author ?? undefined,
  };
}

/** Fetch published content items for public list. Pass locale for localized slug/title/excerpt. */
export async function getPublishedContentItems(
  locale: string = "fi"
): Promise<ContentItemPublic[]> {
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
    return rows.map((r) => rowToPublic(r as DbContentItem, locale));
  } catch {
    return [];
  }
}

/** Fetch published content items that reference the given route slug in related_route_slugs. */
export async function getPublishedContentItemsByRouteSlug(
  routeSlug: string,
  locale: string = "fi"
): Promise<ContentItemPublic[]> {
  const slug = typeof routeSlug === "string" ? routeSlug.trim() : "";
  if (!slug) return [];

  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("status", "published")
      .in("content_type", ["blog", "review", "comparison"])
      .contains("related_route_slugs", [slug])
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error || !rows) return [];
    return rows.map((r) => rowToPublic(r as DbContentItem, locale));
  } catch {
    return [];
  }
}

/** Fetch published content items that reference the given event slug in related_event_slugs. */
export async function getPublishedContentItemsByEventSlug(
  eventSlug: string,
  locale: string = "fi"
): Promise<ContentItemPublic[]> {
  const slug = typeof eventSlug === "string" ? eventSlug.trim() : "";
  if (!slug) return [];

  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("status", "published")
      .in("content_type", ["blog", "review", "comparison"])
      .contains("related_event_slugs", [slug])
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error || !rows) return [];
    return rows.map((r) => rowToPublic(r as DbContentItem, locale));
  } catch {
    return [];
  }
}

/** Fetch content by slug for public detail. Looks up by slug_fi, slug_en, or slug (legacy). */
export async function getContentBySlug(
  slug: string,
  locale: string = "fi"
): Promise<ContentItemDetail | null> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

    const baseQuery = supabase
      .from("content_items")
      .select("*")
      .eq("status", "published")
      .in("content_type", ["blog", "review", "comparison"]);

    let row: unknown = null;
    let err: unknown = null;

    const { data: bySlugFi } = await baseQuery.eq("slug_fi", slug).maybeSingle();
    if (bySlugFi) {
      row = bySlugFi;
    } else {
      const { data: bySlugEn } = await supabase
        .from("content_items")
        .select("*")
        .eq("status", "published")
        .in("content_type", ["blog", "review", "comparison"])
        .eq("slug_en", slug)
        .maybeSingle();
      if (bySlugEn) {
        row = bySlugEn;
      } else {
        const { data: bySlug, error } = await supabase
          .from("content_items")
          .select("*")
          .eq("status", "published")
          .in("content_type", ["blog", "review", "comparison"])
          .eq("slug", slug)
          .maybeSingle();
        row = bySlug;
        err = error;
      }
    }

    if (!row) return null;

    const r = row as DbContentItem;
    const hasLocalized = r.slug_fi != null || r.title_fi != null;
    const body = hasLocalized
      ? pickLocale(r, locale, "body_fi", "body_en", r.body ?? "")
      : r.body ?? "";

    return {
      ...rowToPublic(r, locale),
      body: String(body),
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
