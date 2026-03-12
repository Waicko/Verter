import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllPublishedPodcastGuests } from "@/lib/data/podcast";
import PodcastPageClient from "./PodcastPageClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "podcast" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PodcastPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const guests = await getAllPublishedPodcastGuests(locale as "fi" | "en");

  return <PodcastPageClient guests={guests} />;
}
