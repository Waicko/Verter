import { setRequestLocale } from "next-intl/server";
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
    publishedTeam,
    draftTeam,
    publishedContent,
    draftContent,
  ] = await Promise.all([
    getAdminTeamMembers("published"),
    getAdminTeamMembers("draft"),
    getAdminContentItems("published"),
    getAdminContentItems("draft"),
  ]);

  return (
    <AdminDashboardClient
      publishedTeam={publishedTeam}
      draftTeam={draftTeam}
      publishedContent={publishedContent}
      draftContent={draftContent}
    />
  );
}
