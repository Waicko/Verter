import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminContentItems } from "@/lib/data/content-items";
import AdminContentItemCard from "@/components/admin/AdminContentItemCard";
type Props = { params: Promise<{ locale: string }> };

export default async function AdminContentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [publishedContent, draftContent, archivedContent] = await Promise.all([
    getAdminContentItems("published"),
    getAdminContentItems("draft"),
    getAdminContentItems("archived"),
  ]);

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("content.sectionTitle")}
      </h1>
      <p className="mt-2 text-verter-muted">{t("content.sectionDescription")}</p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/content/new"
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
          {publishedContent.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            publishedContent.map((item) => (
              <AdminContentItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-verter-graphite">
          {t("tabDrafts")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {draftContent.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            draftContent.map((item) => (
              <AdminContentItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-verter-graphite">
          {t("tabArchived")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archivedContent.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            archivedContent.map((item) => (
              <AdminContentItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
