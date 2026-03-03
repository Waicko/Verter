import { setRequestLocale, getTranslations } from "next-intl/server";
import ContentItemForm from "@/components/admin/ContentItemForm";
import { getItemsForContentPicker } from "@/lib/data/items-supabase";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function NewContentPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams as { type?: string };
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const items = await getItemsForContentPicker();

  const initialType =
    sp.type === "blog" || sp.type === "review" || sp.type === "podcast" || sp.type === "comparison"
      ? sp.type
      : "blog";

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
          items={items}
        />
      </div>
    </div>
  );
}
