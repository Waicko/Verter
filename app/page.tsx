import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Root path fallback: redirect to default locale.
 * Ensures / always works even if middleware has edge cases (e.g. on Vercel).
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
