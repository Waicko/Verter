import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ItemForm from "@/components/admin/ItemForm";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function NewItemPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const initialType =
    sp.type === "route" || sp.type === "event" || sp.type === "camp"
      ? sp.type
      : undefined;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("createItem")}
      </h1>
      <p className="mt-2 text-verter-muted">{t("createItemDescription")}</p>
      <div className="mt-8">
        <ItemForm locale={locale} mode="create" initialType={initialType} />
      </div>
    </div>
  );
}
