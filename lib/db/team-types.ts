/** Supabase team_members table row */
export type DbTeamMember = {
  id: string;
  name: string;
  role_fi: string | null;
  role_en: string | null;
  tagline_fi: string | null;
  tagline_en: string | null;
  strava_url: string | null;
  image_url: string | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export type DbTeamMemberInsert = Omit<DbTeamMember, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DbTeamMemberUpdate = Partial<
  Omit<DbTeamMember, "id" | "created_at" | "updated_at">
>;
