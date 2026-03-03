import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Deprecated: redirect /events/[slug] to /[locale]/events/[slug] (default locale) */
export default async function LegacyEventRedirect({ params }: Props) {
  const { slug } = await params;
  const locale = routing.defaultLocale;
  redirect(`/${locale}/events/${slug}`);
}
