import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ContentItemForm from "@/components/admin/ContentItemForm";
import { getPublishedRoutes } from "@/lib/data/routes-db";

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

  const routes = await getPublishedRoutes();
  const availableRouteSlugs = routes.map((r) => r.slug).filter(Boolean);

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
          availableRouteSlugs={availableRouteSlugs}
        />
      </div>
    </div>
  );
}
