import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import PodcastGuestForm from "@/components/admin/PodcastGuestForm";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditPodcastGuestPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const supabase = getSupabaseServerClient();

  const { data: guest, error } = await supabase
    .from("podcast_guests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !guest) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("editPrefix")}: {guest.name}
      </h1>
      <p className="mt-2 text-verter-muted">{guest.status}</p>
      <div className="mt-8">
        <PodcastGuestForm initial={guest} locale={locale} mode="edit" />
      </div>
    </div>
  );
}
