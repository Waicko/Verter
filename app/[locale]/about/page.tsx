import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublishedTeamMembers } from "@/lib/data/team";
import TeamMemberCard from "@/components/TeamMemberCard";
import { primaryBtn, secondaryBtn } from "@/lib/styles";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const teamMembers = await getPublishedTeamMembers(locale as "fi" | "en");

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl">
          {t("title")}
        </h1>

        <div className="mt-10 space-y-6 text-verter-muted">
          <p>{t("intro1")}</p>
          <p>{t("intro2")}</p>
          <p>{t("body1")}</p>
          <p>{t("body2")}</p>
          <p>{t("body3")}</p>
          <p>{t("body4")}</p>
        </div>

        <h2 className="mt-12 font-heading text-xl font-semibold text-verter-graphite sm:text-2xl">
          {t("section1Title")}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-verter-muted">
          <li>{t("bullet1")}</li>
          <li>{t("bullet2")}</li>
          <li>{t("bullet3")}</li>
        </ul>

        <h2 className="mt-12 font-heading text-xl font-semibold text-verter-graphite sm:text-2xl">
          {t("section2Title")}
        </h2>
        <div className="mt-4 space-y-4 text-verter-muted">
          <p>{t("body5")}</p>
          <p>{t("body6")}</p>
        </div>

        <h2 className="mt-12 font-heading text-xl font-semibold text-verter-graphite sm:text-2xl">
          {t("section3Title")}
        </h2>
        <p className="mt-4 text-verter-muted">{t("body7")}</p>

        {teamMembers.length > 0 && (
          <>
            <h2 className="mt-12 font-heading text-xl font-semibold text-verter-graphite sm:text-2xl">
              {t("teamTitle")}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </>
        )}

        <div className="mt-12">
          <Link
            href="/podcast-guest"
            className="inline-flex items-center gap-2 text-verter-forest font-medium hover:underline"
          >
            {t("podcastGuestCta")} →
          </Link>
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row">
          <Link href="/routes" className={primaryBtn}>
            {t("ctaRoutes")}
          </Link>
          <Link href="/events?type=camp" className={secondaryBtn}>
            {t("ctaCamps")}
          </Link>
        </div>
      </div>
    </div>
  );
}
