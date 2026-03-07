import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_auth";

/** Check if the request has valid admin auth (cookie). Use for all admin API routes. */
export async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}
