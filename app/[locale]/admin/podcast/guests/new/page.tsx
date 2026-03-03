import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import PodcastGuestForm from "@/components/admin/PodcastGuestForm";

type Props = { params: Promise<{ locale: string }> };

export default async function NewPodcastGuestPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("podcast.createGuest")}
      </h1>
      <p className="mt-2 text-verter-muted">{t("podcast.createGuestDescription")}</p>
      <div className="mt-8">
        <PodcastGuestForm locale={locale} mode="create" />
      </div>
    </div>
  );
}
