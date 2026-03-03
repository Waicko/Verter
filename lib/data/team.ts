import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbTeamMember } from "@/lib/db/team-types";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  tagline: string | null;
  strava_url: string | null;
  image_url: string | null;
  sort_order: number;
};

type TeamStatus = "draft" | "published" | "archived";

function rowToMember(row: DbTeamMember, locale: "fi" | "en"): TeamMember {
  const role = locale === "fi" ? (row.role_fi ?? row.role_en ?? "") : (row.role_en ?? row.role_fi ?? "");
  const tagline = locale === "fi" ? (row.tagline_fi ?? row.tagline_en) : (row.tagline_en ?? row.tagline_fi);
  return {
    id: row.id,
    name: row.name,
    role,
    tagline,
    strava_url: row.strava_url,
    image_url: row.image_url,
    sort_order: row.sort_order ?? 0,
  };
}

/** Fetch published team members for public display, sorted by sort_order */
export async function getPublishedTeamMembers(
  locale: "fi" | "en"
): Promise<TeamMember[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error || !rows?.length) return [];

    return rows.map((r) => rowToMember(r as DbTeamMember, locale));
  } catch {
    return [];
  }
}

export type AdminTeamMember = TeamMember & { status?: string };

/** Fetch team members by status for admin */
export async function getAdminTeamMembers(
  status: TeamStatus
): Promise<AdminTeamMember[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const { data: rows, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("status", status)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error || !rows) return [];

    return (rows || []).map((r) => {
      const member = rowToMember(r as DbTeamMember, "fi");
      return {
        ...member,
        status: (r as DbTeamMember).status ?? status,
      } as AdminTeamMember;
    });
  } catch {
    return [];
  }
}
