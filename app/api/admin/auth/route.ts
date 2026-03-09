import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken } from "@/lib/admin-auth";

const ADMIN_COOKIE = "admin_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(request: NextRequest) {
  const { password } = (await request.json()) as { password?: string };
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!expectedPassword || !sessionSecret) {
    return NextResponse.json(
      { ok: false, error: "Admin not configured" },
      { status: 500 }
    );
  }

  if (password === expectedPassword) {
    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Admin not configured" },
        { status: 500 }
      );
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  }

  return NextResponse.json(
    { ok: false, error: "Invalid password" },
    { status: 401 }
  );
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE, { path: "/" });
  return res;
}
