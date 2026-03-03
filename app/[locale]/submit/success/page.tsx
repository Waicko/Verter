import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SubmitSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("submit");

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-verter-forest/10">
          <svg
            className="h-8 w-8 text-verter-forest"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold text-verter-graphite">
          {t("successTitle")}
        </h1>
        <p className="mt-2 text-verter-muted">{t("successDescription")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/routes"
            className="inline-flex items-center rounded-pill bg-verter-forest px-4 py-2 font-medium text-white hover:bg-verter-forest/90"
          >
            {t("backToRoutes")}
          </Link>
          <Link
            href="/submit"
            className="inline-flex items-center rounded-pill border border-verter-border bg-white px-4 py-2 font-medium text-verter-graphite hover:bg-verter-snow"
          >
            {t("submitAnother")}
          </Link>
        </div>
      </div>
    </div>
  );
}
