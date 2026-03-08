import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDomainCounts = {
  events: { published: number; draft: number };
  routes: { published: number; draft: number };
  content: { published: number; draft: number };
  team: { published: number; draft: number };
  podcast: { published: number; hidden: number };
};

async function countTable(
  table: string,
  statusCol: string,
  statusVal: string
): Promise<number> {
  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(statusCol, statusVal);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Admin dashboard: counts per domain. Uses server client (admin context). */
export async function getAdminDomainCounts(): Promise<AdminDomainCounts> {
  const [
    eventsPublished,
    eventsDraft,
    routesPublished,
    routesDraft,
    contentPublished,
    contentDraft,
    teamPublished,
    teamDraft,
    podcastPublished,
    podcastHidden,
  ] = await Promise.all([
    countTable("events", "status", "published"),
    countTable("events", "status", "draft"),
    countTable("routes", "status", "published"),
    countTable("routes", "status", "draft"),
    countTable("content_items", "status", "published"),
    countTable("content_items", "status", "draft"),
    countTable("team_members", "status", "published"),
    countTable("team_members", "status", "draft"),
    countTable("podcast_guests", "status", "published"),
    countTable("podcast_guests", "status", "hidden"),
  ]);

  return {
    events: { published: eventsPublished, draft: eventsDraft },
    routes: { published: routesPublished, draft: routesDraft },
    content: { published: contentPublished, draft: contentDraft },
    team: { published: teamPublished, draft: teamDraft },
    podcast: { published: podcastPublished, hidden: podcastHidden },
  };
}
