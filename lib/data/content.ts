/**
 * @deprecated Use getPublishedContentItems() from lib/data/content-items.ts instead.
 * Static content has been replaced with database-driven content_items table.
 */
import type { ContentItem } from "@/lib/types";

/** Deprecated: empty fallback. Use getPublishedContentItems() for DB content. */
export const contentItems: ContentItem[] = [];
