import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkAdmin } from "@/lib/admin-auth";

export async function GET(_request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(_request.url);
  const id = searchParams.get("id");

  const supabase = getSupabaseServerClient();

  if (id) {
    const { data: row, error } = await supabase
      .from("routes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(row);
  }

  const { data: rows, error } = await supabase
    .from("routes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rows ?? []);
}
