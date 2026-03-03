/** Supabase items table row */
export type DbItem = {
  id: string;
  type: "route" | "event" | "camp";
  status: "draft" | "pending" | "published" | "archived" | "rejected";

  title: string;
  slug: string;
  region: string | null;
  country: string | null;
  location_name: string | null;
  official_url: string | null;
  short_description: string | null;
  reject_reason: string | null;
  start_lat: number | null;
  start_lng: number | null;
  summary: string | null;
  description: string | null;
  tags: string[];
  external_links: unknown[];

  distance_km: number | null;
  elevation_gain_m: number | null;
  technicality_1_5: number | null;
  winter_score_1_5: number | null;
  gpx_url: string | null;
  route_origin: string | null;

  start_date: string | null;
  end_date: string | null;
  recurrence: string | null;
  distance_options: unknown[];
  organizer_name: string | null;

  season: string | null;
  duration_days: number | null;
  focus: string | null;

  submitter_name: string | null;
  submitter_email: string | null;
  submitter_role: string | null;
  /** Slug of item this pending submission suggests an update for */
  update_for_slug: string | null;

  created_at: string;
  updated_at: string;
};

export type DbItemInsert = Omit<DbItem, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DbItemUpdate = Partial<DbItemInsert>;
