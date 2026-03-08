import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbItemInsert } from "@/lib/db/types";

const ADMIN_COOKIE = "admin_auth";

function checkAdmin() {
  return cookies().then((c) => c.get(ADMIN_COOKIE)?.value === "1");
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as DbItemInsert;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.from("items").insert(body).select("id").single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Insert failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ id: data.id });
}
