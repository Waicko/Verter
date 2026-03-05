import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AdminEditEventForm from "@/components/admin/AdminEditEventForm";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminEditEventPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="text-sm font-medium text-verter-muted hover:text-verter-graphite"
        >
          ← Takaisin tapahtumiin
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-verter-graphite">
          Muokkaa tapahtumaa
        </h1>
        <p className="mt-1 text-sm text-verter-muted">
          Muokkaa tapahtuman tietoja ja tallenna muutokset.
        </p>
      </div>

      <div className="rounded-card border border-verter-border bg-white p-6 shadow-soft">
        <AdminEditEventForm eventId={id} />
      </div>
    </div>
  );
}
