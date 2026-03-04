import { setRequestLocale } from "next-intl/server";
import AdminEventsClient from "@/components/admin/AdminEventsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminEventsClient />;
}
