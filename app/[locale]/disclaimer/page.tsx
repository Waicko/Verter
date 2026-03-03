import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disclaimer" });
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function DisclaimerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("disclaimer");

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-bold text-verter-graphite">
          {t("title")}
        </h1>
        <p className="mt-4 text-verter-muted">{t("intro")}</p>

        <div className="mt-8 space-y-4">
          <section>
            <h2 className="text-sm font-semibold text-verter-graphite">
              {locale === "fi" ? "Reitit" : "Routes"}
            </h2>
            <p className="mt-2 text-sm text-verter-muted">{t("routes")}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-verter-graphite">
              {locale === "fi" ? "Tapahtumat" : "Events"}
            </h2>
            <p className="mt-2 text-sm text-verter-muted">{t("events")}</p>
          </section>
          <section>
            <p className="mt-2 text-sm text-verter-muted">
              {t("responsibility")}
            </p>
          </section>
        </div>

        <p className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-verter-forest hover:underline"
          >
            {locale === "fi" ? "← Etusivu" : "← Home"}
          </Link>
        </p>
      </div>
    </div>
  );
}
