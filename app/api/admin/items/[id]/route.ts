import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DbItemUpdate } from "@/lib/db/types";

const ADMIN_COOKIE = "admin_auth";

function checkAdmin() {
  return cookies().then((c) => c.get(ADMIN_COOKIE)?.value === "1");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await _request.json()) as DbItemUpdate & { status?: string };
  const supabase = getSupabaseServerClient();

  let updatePayload: DbItemUpdate = { ...body };

  if (body.status === "published") {
    const { data: current } = await supabase
      .from("items")
      .select("title, slug")
      .eq("id", id)
      .single();
    if (current) {
      let slug = (current.slug as string)?.trim();
      if (!slug && current.title) {
        const base = slugify(current.title);
        let candidate = base;
        let n = 0;
        while (true) {
          const { data: conflict } = await supabase
            .from("items")
            .select("id")
            .eq("slug", candidate)
            .neq("id", id)
            .maybeSingle();
          if (!conflict) break;
          n++;
          candidate = `${base}-${n}`;
        }
        updatePayload = { ...updatePayload, slug: candidate };
      }
    }
  }

  const { error } = await supabase.from("items").update(updatePayload).eq("id", id);

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

  const { data, error } = await supabase.from("items").select("*").eq("id", id).single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
