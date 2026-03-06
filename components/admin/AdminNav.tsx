"use client";

import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const ADMIN_TOKEN_KEY = "admin_token";

export default function AdminNav() {
  const router = useRouter();
  const t = useTranslations("admin");

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // Continue anyway - cookie may still be cleared client-side isn't possible
    }
    router.refresh();
  };

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-4 border-b border-verter-border pb-4">
      <Link
        href="/admin"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navDashboard")}
      </Link>
      <Link
        href="/admin/items/new"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navNewItem")}
      </Link>
      <Link
        href="/admin/team/new"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navTeam")}
      </Link>
      <Link
        href="/admin/podcast"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navPodcast")}
      </Link>
      <Link
        href="/admin/content"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navContent")}
      </Link>
      <Link
        href="/admin/submissions"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navSubmissions")}
      </Link>
      <Link
        href="/admin/events"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navEvents")}
      </Link>
      <Link
        href="/admin/routes"
        className="text-sm font-medium text-verter-graphite hover:text-verter-forest"
      >
        {t("navRoutes")}
      </Link>
      <Link
        href="/"
        className="ml-auto text-sm font-medium text-verter-muted hover:text-verter-graphite"
      >
        {t("backToSite")}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-verter-muted hover:text-verter-graphite"
      >
        {t("logout")}
      </button>
    </nav>
  );
}
