import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

/** Legacy items create page — redirect to dashboard. */
export default async function NewItemPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/admin`);
}
