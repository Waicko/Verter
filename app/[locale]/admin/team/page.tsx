import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminTeamMembers } from "@/lib/data/team";
import AdminTeamCard from "@/components/admin/AdminTeamCard";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminTeamPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [publishedTeam, draftTeam, archivedTeam] = await Promise.all([
    getAdminTeamMembers("published"),
    getAdminTeamMembers("draft"),
    getAdminTeamMembers("archived"),
  ]);

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("sectionTeam")}
      </h1>
      <p className="mt-2 text-verter-muted">
        Manage team members for the about page.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/team/new"
          className="rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:bg-verter-forest/90"
        >
          {t("addNew")}
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-verter-graphite">
          {t("tabPublished")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishedTeam.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            publishedTeam.map((member) => (
              <AdminTeamCard key={member.id} member={member} />
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-verter-graphite">
          {t("tabDrafts")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {draftTeam.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            draftTeam.map((member) => (
              <AdminTeamCard key={member.id} member={member} />
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-verter-graphite">
          {t("tabArchived")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archivedTeam.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            archivedTeam.map((member) => (
              <AdminTeamCard key={member.id} member={member} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
