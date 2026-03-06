import { setRequestLocale } from "next-intl/server";
import { loadRoutesData } from "@/lib/data/routes-loader";
import RoutesPageClient from "./RoutesPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RoutesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await loadRoutesData();

  return <RoutesPageClient data={data} />;
}
