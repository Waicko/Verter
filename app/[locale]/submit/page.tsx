import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submit" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function SubmitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("submit");

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-verter-muted">{t("pageDescription")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/submit/event"
            className="flex flex-col rounded-card border border-verter-border bg-white p-6 shadow-soft transition hover:border-verter-forest hover:bg-verter-snow/30"
          >
            <span className="text-lg font-semibold text-verter-graphite">
              {t("typeEvent")} / {t("typeCamp")}
            </span>
            <span className="mt-2 text-sm text-verter-muted">
              {t("helperEvent")}
            </span>
            <span className="mt-4 text-sm font-medium text-verter-forest">
              {t("submitEvent")} →
            </span>
          </Link>
          <Link
            href="/submit/route"
            className="flex flex-col rounded-card border border-verter-border bg-white p-6 shadow-soft transition hover:border-verter-forest hover:bg-verter-snow/30"
          >
            <span className="text-lg font-semibold text-verter-graphite">
              {t("typeRoute")}
            </span>
            <span className="mt-2 text-sm text-verter-muted">
              {t("helperRoute")}
            </span>
            <span className="mt-4 text-sm font-medium text-verter-forest">
              {t("submitRoute")} →
            </span>
          </Link>
        </div>

        <section id="principles" className="mt-12 rounded-card border border-verter-border bg-verter-snow/30 p-6">
          <h2 className="font-heading text-lg font-semibold text-verter-graphite">
            {t("approvalPrinciplesTitle")}
          </h2>
          <p className="mt-2 text-sm text-verter-muted">{t("approvalPrinciplesIntro")}</p>
          <ul className="mt-4 space-y-2 text-sm text-verter-graphite">
            <li>• {t("principle1")}</li>
            <li>• {t("principle2")}</li>
            <li>• {t("principle3")}</li>
          </ul>
        </section>

        <p className="mt-8 text-center">
          <Link
            href="/events"
            className="text-sm font-medium text-verter-muted hover:text-verter-graphite"
          >
            ← {t("backToEvents")}
          </Link>
        </p>
      </div>
    </div>
  );
}
