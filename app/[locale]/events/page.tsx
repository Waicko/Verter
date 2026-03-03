import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { loadEventsData } from "@/lib/data/items-loader";
import { routing } from "@/i18n/routing";
import EventsPageClient from "./EventsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} | Verter`,
      description: t("description"),
    },
  };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await loadEventsData();

  return <EventsPageClient data={data} />;
}
