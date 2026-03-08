import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

/** Legacy submissions page (items table) — redirect to dashboard. */
export default async function SubmissionsPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/admin`);
}
