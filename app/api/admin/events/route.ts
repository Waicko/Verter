import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  return !!ADMIN_TOKEN && !!token && token === ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rows ?? []);
}
