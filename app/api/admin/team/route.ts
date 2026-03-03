import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbTeamMemberInsert } from "@/lib/db/team-types";

const ADMIN_COOKIE = "admin_auth";

async function checkAdmin() {
  return cookies().then((c) => c.get(ADMIN_COOKIE)?.value === "1");
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as DbTeamMemberInsert;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      name: body.name,
      role_fi: body.role_fi ?? null,
      role_en: body.role_en ?? null,
      tagline_fi: body.tagline_fi ?? null,
      tagline_en: body.tagline_en ?? null,
      strava_url: body.strava_url ?? null,
      image_url: body.image_url ?? null,
      sort_order: body.sort_order ?? 0,
      status: body.status ?? "draft",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Insert failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ id: data?.id });
}
