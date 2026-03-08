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
  related_item_ids: string[] | null;
  episode_url: string | null;
  author: string | null;
  published_at: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
} & Partial<SourceRightsMetadata>;

export type DbContentItemInsert = Omit<DbContentItem, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DbContentItemUpdate = Partial<
  Omit<DbContentItem, "id" | "created_at" | "updated_at">
>;
