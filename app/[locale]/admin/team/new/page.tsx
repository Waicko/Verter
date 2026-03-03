import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import TeamForm from "@/components/admin/TeamForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewTeamPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("team.createTitle")}
      </h1>
      <p className="mt-2 text-verter-muted">{t("team.createDescription")}</p>
      <div className="mt-8">
        <TeamForm locale={locale} mode="create" />
      </div>
    </div>
  );
}
