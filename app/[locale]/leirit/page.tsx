import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

/** Deprecated: redirect to /events?type=camp */
export default async function LegacyLeiritRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/events?type=camp`);
}
