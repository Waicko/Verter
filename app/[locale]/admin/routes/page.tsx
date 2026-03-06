import { setRequestLocale } from "next-intl/server";
import AdminRoutesClient from "@/components/admin/AdminRoutesClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminRoutesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminRoutesClient />;
}
