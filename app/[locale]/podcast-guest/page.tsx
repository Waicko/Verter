import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import PodcastGuestForm from "./PodcastGuestForm";

type Props = { params: Promise<{ locale: string }> };

export default async function PodcastGuestPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("podcastGuest");

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-verter-muted">{t("description")}</p>
        <PodcastGuestForm />
      </div>
    </div>
  );
}
