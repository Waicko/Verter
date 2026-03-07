import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getPublishedEvents } from "@/lib/data/events-db";
import type { EventType } from "@/lib/data/events-db";
import EventsPageClient from "./EventsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
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

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const typeParam = sp?.type ?? "";
  const typeFilter: EventType | undefined =
    typeParam === "race" || typeParam === "camp" || typeParam === "community"
      ? typeParam
      : undefined;

  const events = await getPublishedEvents(typeFilter);

  return <EventsPageClient events={events} />;
}
