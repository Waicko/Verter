import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string; id: string }> };

/** Legacy items edit page — redirect to dashboard. */
export default async function EditItemPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/admin`);
}
