import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbTeamMemberUpdate } from "@/lib/db/team-types";

const ADMIN_COOKIE = "admin_auth";

async function checkAdmin() {
  return cookies().then((c) => c.get(ADMIN_COOKIE)?.value === "1");
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await _request.json()) as DbTeamMemberUpdate & { status?: string };
  const supabase = getSupabaseServerClient();

  const raw: Record<string, unknown> = {
    name: body.name,
    role_fi: body.role_fi,
    role_en: body.role_en,
    tagline_fi: body.tagline_fi,
    tagline_en: body.tagline_en,
    strava_url: body.strava_url,
    image_url: body.image_url,
    sort_order: body.sort_order,
    status: body.status,
  };
  const updatePayload = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  );

  const { error } = await supabase
    .from("team_members")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
