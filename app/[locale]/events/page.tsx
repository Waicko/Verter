import { createClient } from "@supabase/supabase-js";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { loadEventsData } from "@/lib/data/items-loader";
import { routing } from "@/i18n/routing";
import EventsPageClient from "./EventsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} | Verter`,
      description: t("description"),
    },
  };
}

async function fetchEventsDebug() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" };
  }
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: rows, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) {
    return { error: error.message, rows: [], count: 0, titles: [] };
  }
  const count = rows?.length ?? 0;
  const titles = (rows ?? []).map(
    (r: Record<string, unknown>) => String(r.title ?? r.name ?? r.id ?? "—")
  );
  return { error: null, rows: rows ?? [], count, titles };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await loadEventsData();
  const debug = await fetchEventsDebug();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="rounded-card border border-amber-300 bg-amber-50 p-4 font-mono text-sm">
          <p className="font-semibold text-amber-800">
            {debug.error ? `Error: ${debug.error}` : "Supabase ok"}
          </p>
          <p className="mt-1 text-amber-700">Rows: {debug.count}</p>
          {debug.titles && debug.titles.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-amber-800">
              {debug.titles.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <EventsPageClient data={data} />
    </>
  );
}
