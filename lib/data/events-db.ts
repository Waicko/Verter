import { createClient } from "@supabase/supabase-js";

import type { SourceRightsMetadata } from "@/lib/metadata-types";

export type EventType = "race" | "camp" | "community";

export type DbEvent = {
  id: string;
  title: string;
  slug: string | null;
  date: string | null;
  location: string | null;
  registration_url: string | null;
  description: string | null;
  type: EventType | null;
  status: string;
  created_at: string;
  updated_at: string;
} & Partial<SourceRightsMetadata>;

export async function getPublishedEvents(
  typeFilter?: EventType | null
): Promise<DbEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: true });

  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as DbEvent[];
}

export async function getPublishedEventBySlug(
  slug: string
): Promise<DbEvent | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as DbEvent;
}

/** All events visible in admin (draft + published). Only events with slugs. Used for content event picker. */
export async function getAdminEvents(): Promise<DbEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, date")
    .in("status", ["draft", "published"])
    .order("date", { ascending: true, nullsFirst: false });

  if (error) return [];
  return (data ?? []).filter((e) => e.slug?.trim()) as DbEvent[];
}

/** Fetch published events by slugs. Returns only events that exist; invalid slugs are ignored. */
export async function getPublishedEventsBySlugs(
  slugs: string[]
): Promise<DbEvent[]> {
  const validSlugs = slugs.filter((s) => typeof s === "string" && s.trim().length > 0);
  if (validSlugs.length === 0) return [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .in("slug", validSlugs);

  if (error || !data?.length) return [];
  const events = (data as DbEvent[]).filter((e) => e.slug?.trim());
  return events.sort(
    (a, b) => validSlugs.indexOf(a.slug!) - validSlugs.indexOf(b.slug!)
  );
}

/** Fallback: get by id when slug is used as id (e.g. uuid) */
export async function getPublishedEventById(
  id: string
): Promise<DbEvent | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as DbEvent;
}
