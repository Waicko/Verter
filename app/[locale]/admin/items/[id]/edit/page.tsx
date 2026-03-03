import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import EditItemClient from "../EditItemClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditItemPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const supabase = getSupabaseServerClient();

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    notFound();
  }

  return <EditItemClient item={item} locale={locale} />;
}
