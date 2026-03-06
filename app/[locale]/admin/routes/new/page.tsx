import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AdminNewRouteForm from "@/components/admin/AdminNewRouteForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminNewRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/routes"
          className="text-sm font-medium text-verter-muted hover:text-verter-graphite"
        >
          ← Takaisin reitteihin
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-verter-graphite">
          Uusi reitti
        </h1>
        <p className="mt-1 text-sm text-verter-muted">
          Luo uusi reitti. Voit ladata GPX-tiedoston ja julkaista heti tai
          tallentaa luonnokseksi.
        </p>
      </div>

      <div className="rounded-card border border-verter-border bg-white p-6 shadow-soft">
        <AdminNewRouteForm />
      </div>
    </div>
  );
}
