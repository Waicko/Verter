import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SubmitRouteForm from "@/components/SubmitRouteForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submit" });
  return {
    title: t("routePageTitle"),
    description: t("routePageDescription"),
  };
}

export default async function SubmitRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("submit");

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {t("routePageTitle")}
        </h1>
        <p className="mt-2 text-verter-muted">{t("routePageDescription")}</p>
        <div className="mt-8 rounded-card border border-verter-border bg-white p-6 shadow-soft">
          <SubmitRouteForm />
        </div>
        <p className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link
            href="/submit"
            className="text-sm font-medium text-verter-forest hover:underline"
          >
            ← {t("backToChoice")}
          </Link>
          <Link
            href="/routes"
            className="text-sm font-medium text-verter-muted hover:text-verter-graphite"
          >
            {t("backToRoutes")}
          </Link>
        </p>
      </div>
    </div>
  );
}
