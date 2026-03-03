import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("podcast_guest_requests").insert({
    name,
    email: body.email?.trim() || null,
    message: body.message?.trim() || null,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Insert failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
