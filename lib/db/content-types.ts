import type { SourceRightsMetadata } from "@/lib/metadata-types";

/** Localized content field names */
export type LocaleCode = "fi" | "en";

/** Supabase content_items table row */
export type DbContentItem = {
  id: string;
  title: string;
  slug: string;
  content_type: "blog" | "review" | "podcast" | "comparison";
  summary: string | null;
  body: string;
  hero_image: string | null;
  /** Localized fields (FI/EN). Preferred over title/slug/summary/body when present. */
  title_fi?: string | null;
  title_en?: string | null;
  slug_fi?: string | null;
  slug_en?: string | null;
  excerpt_fi?: string | null;
  excerpt_en?: string | null;
  body_fi?: string | null;
  body_en?: string | null;
  seo_title_fi?: string | null;
  seo_title_en?: string | null;
  seo_description_fi?: string | null;
  seo_description_en?: string | null;
  /** @deprecated Use related_route_slugs. Legacy IDs; semantics unclear (items vs routes). */
  related_item_ids: string[] | null;
  /** Canonical field for content → route linking. Array of routes.slug values. */
  related_route_slugs: string[] | null;
  /** Canonical field for content → event linking. Array of events.slug values. */
  related_event_slugs: string[] | null;
  episode_url: string | null;
  author: string | null;
  published_at: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
} & Partial<SourceRightsMetadata>;

/** Insert payload: related_item_ids omitted (deprecated; API uses related_route_slugs). */
export type DbContentItemInsert = Omit<
  DbContentItem,
  "id" | "created_at" | "updated_at" | "related_item_ids"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DbContentItemUpdate = Partial<
  Omit<DbContentItem, "id" | "created_at" | "updated_at">
>;
