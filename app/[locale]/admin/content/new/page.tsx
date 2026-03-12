import { setRequestLocale, getTranslations } from "next-intl/server";
import ContentItemForm from "@/components/admin/ContentItemForm";
import { getAdminRoutes } from "@/lib/data/routes-db";
import { getAdminEvents } from "@/lib/data/events-db";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function NewContentPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams as { type?: string };
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const initialType =
    sp.type === "blog" || sp.type === "review" || sp.type === "podcast" || sp.type === "comparison"
      ? sp.type
      : "blog";

  const [routes, events] = await Promise.all([
    getAdminRoutes(),
    getAdminEvents(),
  ]);
  const availableRoutes = routes
    .filter((r) => r.slug?.trim())
    .map((r) => ({ slug: r.slug, title: r.title, area: r.area ?? null }));
  const availableEvents = events.map((e) => ({
    slug: e.slug!,
    title: e.title,
    date: e.date ?? null,
  }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("createContent")}
      </h1>
      <p className="mt-2 text-verter-muted">{t("createContentDescription")}</p>
      <div className="mt-8">
        <ContentItemForm
          initial={{ content_type: initialType }}
          locale={locale}
          mode="create"
          availableRoutes={availableRoutes}
          availableEvents={availableEvents}
        />
      </div>
    </div>
  );
}
