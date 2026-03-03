/** Supabase podcast_guests table row */
export type DbPodcastGuest = {
  id: string;
  name: string;
  role_fi: string | null;
  role_en: string | null;
  tagline_fi: string | null;
  tagline_en: string | null;
  image_url: string | null;
  links: Record<string, string> | null;
  episode_url: string | null;
  featured: boolean;
  status: "published" | "hidden";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbPodcastGuestInsert = Omit<DbPodcastGuest, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DbPodcastGuestUpdate = Partial<
  Omit<DbPodcastGuest, "id" | "created_at" | "updated_at">
>;
