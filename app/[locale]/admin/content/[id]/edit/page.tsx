import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ContentItemForm from "@/components/admin/ContentItemForm";
import { getAdminRoutes } from "@/lib/data/routes-db";
import { getAdminEvents } from "@/lib/data/events-db";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditContentPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const supabase = getSupabaseServerClient();
  const { data: item, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    notFound();
  }

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
        {t("editPrefix")}: {item.title}
      </h1>
      <p className="mt-2 text-verter-muted">{item.status}</p>
      <div className="mt-8">
        <ContentItemForm
          initial={item}
          locale={locale}
          mode="edit"
          availableRoutes={availableRoutes}
          availableEvents={availableEvents}
        />
      </div>
    </div>
  );
}
