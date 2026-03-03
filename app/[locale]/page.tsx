import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RouteCard from "@/components/RouteCard";
import ContentCard from "@/components/ContentCard";
import TeamMemberCard from "@/components/TeamMemberCard";
import { routesWithDensity } from "@/lib/data/routes";
import { getPublishedContentItems } from "@/lib/data/content-items";
import { getPublishedTeamMembers } from "@/lib/data/team";
import { primaryBtn, secondaryBtn } from "@/lib/styles";


const cardClass =
  "rounded-card border border-verter-border bg-white/60 p-6 transition hover:border-verter-muted";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const [teamMembers, contentItems] = await Promise.all([
    getPublishedTeamMembers(locale as "fi" | "en"),
    getPublishedContentItems(),
  ]);
  const featuredRoutes = routesWithDensity.slice(0, 3);
  const latestContent = contentItems.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-verter-graphite sm:text-5xl md:text-6xl">
            {t("headline")}
          </h1>
          <p className="mt-8 text-lg text-verter-muted sm:text-xl md:text-2xl">
            {t("subheadline")}
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/routes" className={primaryBtn}>
              {t("ctaRoutes")}
            </Link>
            <Link href="/content" className={secondaryBtn}>
              {t("ctaContent")}
            </Link>
            <Link href="/podcast" className={secondaryBtn}>
              {t("ctaPodcast")}
            </Link>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-t border-verter-border px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-8 sm:space-y-12">
            <p className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl md:text-5xl">
              {t("manifesto.line1")}
            </p>
            <p className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl md:text-5xl">
              {t("manifesto.line2")}
            </p>
            <p className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl md:text-5xl">
              {t("manifesto.line3")}
            </p>
            <p className="font-heading text-3xl font-bold tracking-tight text-verter-graphite sm:text-4xl md:text-5xl">
              {t("manifesto.line4")}
            </p>
          </div>
          <p className="mt-16 text-lg text-verter-muted sm:text-xl md:mt-24">
            {t("manifesto.footer")}
          </p>
        </div>
      </section>

      {/* Why Verter */}
      <section className="border-t border-verter-border px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-2xl font-bold text-verter-graphite sm:text-3xl">
            {t("whyTitle")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className={cardClass}>
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-verter-ice">
                <svg
                  className="h-5 w-5 text-verter-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-heading font-semibold text-verter-graphite">
                {t("why1Title")}
              </h3>
              <p className="mt-2 text-sm text-verter-muted">
                {t("why1Text")}
              </p>
            </div>
            <div className={cardClass}>
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-verter-ice">
                <svg
                  className="h-5 w-5 text-verter-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-heading font-semibold text-verter-graphite">
                {t("why2Title")}
              </h3>
              <p className="mt-2 text-sm text-verter-muted">
                {t("why2Text")}
              </p>
            </div>
            <div className={cardClass}>
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-verter-ice">
                <svg
                  className="h-5 w-5 text-verter-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-heading font-semibold text-verter-graphite">
                {t("why3Title")}
              </h3>
              <p className="mt-2 text-sm text-verter-muted">
                {t("why3Text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured routes */}
      <section className="border-t border-verter-border px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-verter-graphite sm:text-3xl">
              {t("featuredRoutes")}
            </h2>
            <Link
              href="/routes"
              className="text-sm font-medium text-verter-blue hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest content */}
      <section className="border-t border-verter-border px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-verter-graphite sm:text-3xl">
              {t("latestContent")}
            </h2>
            <Link
              href="/content"
              className="text-sm font-medium text-verter-blue hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestContent.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Podcast teaser */}
      <section className="border-t border-verter-border px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-heading text-2xl font-bold text-verter-graphite sm:text-3xl">
            {t("podcastTeaserTitle")}
          </h2>
          <p className="mt-4 text-verter-muted">{t("podcastTeaserText")}</p>
          <Link
            href="/podcast"
            className="mt-6 inline-block rounded-card border border-verter-forest px-6 py-3 font-medium text-verter-forest hover:bg-verter-forest/5"
          >
            {t("podcastTeaserCta")}
          </Link>
        </div>
      </section>

      {/* Team mini */}
      {teamMembers.length > 0 && (
        <section className="border-t border-verter-border px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-verter-graphite sm:text-3xl">
                {t("teamTitle")}
              </h2>
              <Link
                href="/about"
                className="text-sm font-medium text-verter-blue hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.slice(0, 6).map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
