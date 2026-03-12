"use client";

import { useState } from "react";
import { getPathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { DbTeamMember, DbTeamMemberInsert } from "@/lib/db/team-types";
import { cardClass, primaryBtn, secondaryBtn } from "@/lib/styles";

type FormData = {
  name: string;
  role_fi: string;
  role_en: string;
  tagline_fi: string;
  tagline_en: string;
  strava_url: string;
  image_url: string;
  sort_order: number;
  status: "draft" | "published";
};

interface TeamFormProps {
  initial?: Partial<DbTeamMember> | null;
  locale: string;
  mode: "create" | "edit";
}

export default function TeamForm({ initial, locale, mode }: TeamFormProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FormData>(() => ({
    name: initial?.name ?? "",
    role_fi: initial?.role_fi ?? "",
    role_en: initial?.role_en ?? "",
    tagline_fi: initial?.tagline_fi ?? "",
    tagline_en: initial?.tagline_en ?? "",
    strava_url: initial?.strava_url ?? "",
    image_url: initial?.image_url ?? "",
    sort_order: initial?.sort_order ?? 0,
    status: (initial?.status as "draft" | "published") ?? "draft",
  }));

  const handleSubmit = async (publish: boolean) => {
    setLoading(true);
    try {
      const payload: DbTeamMemberInsert = {
        name: data.name.trim(),
        role_fi: data.role_fi.trim() || null,
        role_en: data.role_en.trim() || null,
        tagline_fi: data.tagline_fi.trim() || null,
        tagline_en: data.tagline_en.trim() || null,
        strava_url: data.strava_url.trim() || null,
        image_url: data.image_url.trim() || null,
        sort_order: data.sort_order,
        status: publish ? "published" : "draft",
      };

      if (mode === "edit" && initial?.id) {
        const res = await fetch(`/api/admin/team/${initial.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) router.refresh();
        else {
          const err = await res.json();
          alert(err.error ?? "Update failed");
        }
      } else {
        const res = await fetch("/api/admin/team", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.id) {
          const path = getPathname({
            locale: locale as "fi" | "en",
            href: `/admin/team/${json.id}/edit`,
          });
          router.push(path);
        } else {
          alert(json.error ?? "Create failed");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(false);
      }}
    >
      <div className={cardClass}>
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("team.name")}
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              required
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-verter-graphite">
                {t("team.roleFi")}
              </label>
              <input
                type="text"
                value={data.role_fi}
                onChange={(e) => setData((d) => ({ ...d, role_fi: e.target.value }))}
                placeholder="esim. Perustaja"
                className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-verter-graphite">
                {t("team.roleEn")}
              </label>
              <input
                type="text"
                value={data.role_en}
                onChange={(e) => setData((d) => ({ ...d, role_en: e.target.value }))}
                placeholder="e.g. Founder"
                className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-verter-graphite">
                {t("team.taglineFi")}
              </label>
              <textarea
                value={data.tagline_fi}
                onChange={(e) => setData((d) => ({ ...d, tagline_fi: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-verter-graphite">
                {t("team.taglineEn")}
              </label>
              <textarea
                value={data.tagline_en}
                onChange={(e) => setData((d) => ({ ...d, tagline_en: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("team.stravaUrl")}
            </label>
            <input
              type="url"
              value={data.strava_url}
              onChange={(e) => setData((d) => ({ ...d, strava_url: e.target.value }))}
              placeholder="https://www.strava.com/athletes/..."
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("team.imageUrl")}
            </label>
            <input
              type="url"
              value={data.image_url}
              onChange={(e) => setData((d) => ({ ...d, image_url: e.target.value }))}
              placeholder="https://..."
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("team.sortOrder")}
            </label>
            <input
              type="number"
              min={0}
              value={data.sort_order}
              onChange={(e) =>
                setData((d) => ({ ...d, sort_order: parseInt(e.target.value, 10) || 0 }))
              }
              className="mt-1 w-24 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className={secondaryBtn}
        >
          {t("team.saveDraft")}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className={primaryBtn}
        >
          {t("team.publish")}
        </button>
      </div>
    </form>
  );
}
