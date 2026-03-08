import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SubmissionsClient } from "./SubmissionsClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; region?: string }>;
};

export default async function SubmissionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { type: typeFilter, region: regionFilter } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from("items")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }
  if (regionFilter) {
    query = query.eq("region", regionFilter);
  }

  const { data: items, error } = await query;

  const { data: allPending } = await supabase
    .from("items")
    .select("type, region")
    .eq("status", "pending");
  const types = [...new Set((allPending ?? []).map((i) => i.type))].sort();
  const regions = [...new Set((allPending ?? []).flatMap((i) => (i.region ? [i.region] : [])))].sort();

  if (error) {
    return (
      <div>
        <h1 className="font-heading text-3xl font-bold text-verter-graphite">
          {t("submissionsTitle")}
        </h1>
        <p className="mt-4 text-red-600">
          Failed to load: {error.message}. Check Supabase configuration.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("submissionsTitle")}
      </h1>
      <p className="mt-2 text-verter-muted">
        {items?.length ?? 0} — {t("submissionsDescription")}
      </p>

      <SubmissionsClient
        items={items ?? []}
        types={types}
        regions={regions}
        typeFilter={typeFilter ?? null}
        regionFilter={regionFilter ?? null}
        locale={locale}
      />
    </div>
  );
}
