import { setRequestLocale } from "next-intl/server";
import { getAdminTeamMembers } from "@/lib/data/team";
import { getAdminContentItems } from "@/lib/data/content-items";
import { getAdminDomainCounts } from "@/lib/data/admin-dashboard";
import AdminDashboardClient from "./AdminDashboardClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    domainCounts,
    publishedTeam,
    draftTeam,
    publishedContent,
    draftContent,
  ] = await Promise.all([
    getAdminDomainCounts(),
    getAdminTeamMembers("published"),
    getAdminTeamMembers("draft"),
    getAdminContentItems("published"),
    getAdminContentItems("draft"),
  ]);

  return (
    <AdminDashboardClient
      domainCounts={domainCounts}
      publishedTeam={publishedTeam}
      draftTeam={draftTeam}
      publishedContent={publishedContent}
      draftContent={draftContent}
    />
  );
}
