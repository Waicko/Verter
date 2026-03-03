import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getFeaturedPodcastGuest, getPastPodcastGuests } from "@/lib/data/podcast";
import PodcastGuestCard from "@/components/PodcastGuestCard";

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
  const t = await getTranslations("podcast");

  const [featuredGuest, pastGuests] = await Promise.all([
    getFeaturedPodcastGuest(locale as "fi" | "en"),
    getPastPodcastGuests(locale as "fi" | "en"),
  ]);

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-verter-muted">{t("description")}</p>

        {/* Featured guest */}
        <section className="mt-12">
          <h2 className="font-heading text-xl font-semibold text-verter-graphite sm:text-2xl">
            {t("featuredGuest")}
          </h2>
          {featuredGuest ? (
            <div className="mt-6">
              <PodcastGuestCard guest={featuredGuest} featured size="large" />
            </div>
          ) : (
            <p className="mt-6 text-verter-muted">{t("noFeaturedYet")}</p>
          )}
        </section>

        {/* Past guests */}
        <section className="mt-16">
          <h2 className="font-heading text-xl font-semibold text-verter-graphite sm:text-2xl">
            {t("pastGuests")}
          </h2>
          {pastGuests.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastGuests.map((guest) => (
                <PodcastGuestCard key={guest.id} guest={guest} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-verter-muted">{t("noPastGuestsYet")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
