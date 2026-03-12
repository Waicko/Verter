import type { SourceRightsMetadata } from "@/lib/metadata-types";

/** Supabase content_items table row */
export type DbContentItem = {
  id: string;
  title: string;
  slug: string;
  content_type: "blog" | "review" | "podcast" | "comparison";
  summary: string | null;
  body: string;
  hero_image: string | null;
  /** @deprecated Use related_route_slugs. Legacy IDs; semantics unclear (items vs routes). */
  related_item_ids: string[] | null;
  /** Canonical field for content → route linking. Array of routes.slug values. */
  related_route_slugs: string[] | null;
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
