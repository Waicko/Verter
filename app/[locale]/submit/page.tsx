import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import SubmitForm from "@/components/SubmitForm";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; itemId?: string }>;
};

export default async function SubmitPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("submit");

  const initialType = (sp.type === "route" || sp.type === "event" || sp.type === "camp") ? sp.type : undefined;
  const updateForSlug = typeof sp.itemId === "string" && sp.itemId.trim() ? sp.itemId.trim() : undefined;

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-verter-muted">{t("pageDescription")}</p>
        <div className="mt-8 rounded-card border border-verter-border bg-white p-6 shadow-soft">
          <SubmitForm
            locale={locale}
            initialType={initialType}
            updateForSlug={updateForSlug}
          />
        </div>

        <section
          id="principles"
          className="mt-10 rounded-card border border-verter-border bg-verter-snow/50 p-6"
        >
          <h2 className="font-heading text-base font-semibold text-verter-graphite">
            {t("approvalPrinciplesTitle")}
          </h2>
          <p className="mt-1 text-sm text-verter-muted">
            {t("approvalPrinciplesIntro")}
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-verter-muted">
            <li>{t("principle1")}</li>
            <li>{t("principle2")}</li>
            <li>{t("principle3")}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
