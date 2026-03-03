import { cookies } from "next/headers";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AdminGate from "./AdminGate";

const ADMIN_COOKIE = "admin_auth";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const cookieStore = await cookies();
  const auth = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!auth) {
    return <AdminGate />;
  }

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-8 flex flex-wrap gap-4 border-b border-verter-border pb-4">
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
            href="/"
            className="ml-auto text-sm font-medium text-verter-muted hover:text-verter-graphite"
          >
            {t("backToSite")}
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
