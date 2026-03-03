import { setRequestLocale } from "next-intl/server";
import { getAdminItems } from "@/lib/data/admin-items";
import { getAdminTeamMembers } from "@/lib/data/team";
import { getAdminContentItems } from "@/lib/data/content-items";
import AdminDashboardClient from "./AdminDashboardClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    publishedItems,
    pendingItems,
    draftItems,
    publishedTeam,
    draftTeam,
    publishedContent,
    draftContent,
  ] = await Promise.all([
    getAdminItems("published"),
    getAdminItems("pending"),
    getAdminItems("draft"),
    getAdminTeamMembers("published"),
    getAdminTeamMembers("draft"),
    getAdminContentItems("published"),
    getAdminContentItems("draft"),
  ]);

  return (
    <AdminDashboardClient
      publishedItems={publishedItems}
      pendingItems={pendingItems}
      draftItems={draftItems}
      publishedTeam={publishedTeam}
      draftTeam={draftTeam}
      publishedContent={publishedContent}
      draftContent={draftContent}
    />
  );
}
