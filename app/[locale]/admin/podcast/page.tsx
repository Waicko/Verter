import { setRequestLocale } from "next-intl/server";
import { getPodcastGuestRequests, getAdminPodcastGuests } from "@/lib/data/podcast";
import AdminPodcastSection from "./AdminPodcastSection";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPodcastPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [requests, publishedGuests, hiddenGuests] = await Promise.all([
    getPodcastGuestRequests(),
    getAdminPodcastGuests("published"),
    getAdminPodcastGuests("hidden"),
  ]);

  return (
    <AdminPodcastSection
      locale={locale}
      requests={requests}
      publishedGuests={publishedGuests}
      hiddenGuests={hiddenGuests}
    />
  );
}
