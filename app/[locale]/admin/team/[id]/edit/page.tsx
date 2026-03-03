import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import EditTeamClient from "../EditTeamClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditTeamPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const supabase = getSupabaseServerClient();

  const { data: member, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !member) {
    notFound();
  }

  return <EditTeamClient member={member} locale={locale} />;
}
