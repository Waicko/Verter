import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Space_Grotesk, Inter } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const fontVariables = `${spaceGrotesk.variable} ${inter.variable}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://verter.fi"),
    title: {
      default: t("defaultTitle"),
      template: "%s | Verter",
    },
    description: t("defaultDescription"),
    openGraph: {
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fi" | "en")) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <div
      className={`${fontVariables} flex min-h-screen min-w-0 flex-col overflow-x-hidden font-sans bg-verter-snow text-verter-graphite w-full`}
    >
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
