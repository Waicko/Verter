import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getPublishedContentItems } from "@/lib/data/content-items";
import ContentPageClient from "./ContentPageClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "content" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const items = await getPublishedContentItems(locale);

  return <ContentPageClient items={items} />;
}
