"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { DbPodcastGuest, DbPodcastGuestInsert } from "@/lib/db/podcast-types";
import { cardClass, primaryBtn, secondaryBtn } from "@/lib/styles";

type FormData = {
  name: string;
  role_fi: string;
  role_en: string;
  tagline_fi: string;
  tagline_en: string;
  image_url: string;
  episode_url: string;
  links_json: string;
  featured: boolean;
  status: "published" | "hidden";
  published_at: string;
};

interface PodcastGuestFormProps {
  initial?: Partial<DbPodcastGuest> | null;
  locale: string;
  mode: "create" | "edit";
}

export default function PodcastGuestForm({
  initial,
  locale,
  mode,
}: PodcastGuestFormProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const parseLinks = (s: string): Record<string, string> | null => {
    if (!s.trim()) return null;
    try {
      const o = JSON.parse(s);
      return typeof o === "object" && o !== null ? o : null;
    } catch {
      return null;
    }
  };

  const [data, setData] = useState<FormData>(() => ({
    name: initial?.name ?? "",
    role_fi: initial?.role_fi ?? "",
    role_en: initial?.role_en ?? "",
    tagline_fi: initial?.tagline_fi ?? "",
    tagline_en: initial?.tagline_en ?? "",
    image_url: initial?.image_url ?? "",
    episode_url: initial?.episode_url ?? "",
    links_json:
      initial?.links && typeof initial.links === "object"
        ? JSON.stringify(initial.links, null, 2)
        : "{}",
    featured: initial?.featured ?? false,
    status: (initial?.status as "published" | "hidden") ?? "hidden",
    published_at: initial?.published_at ?? "",
  }));

  const handleSubmit = async (publish: boolean) => {
    setLoading(true);
    try {
      const links = parseLinks(data.links_json);
      const payload: DbPodcastGuestInsert = {
        name: data.name.trim(),
        role_fi: data.role_fi.trim() || null,
        role_en: data.role_en.trim() || null,
        tagline_fi: data.tagline_fi.trim() || null,
        tagline_en: data.tagline_en.trim() || null,
        image_url: data.image_url.trim() || null,
        episode_url: data.episode_url.trim() || null,
        links: links ?? {},
        featured: data.featured,
        status: publish ? "published" : "hidden",
        published_at: data.published_at.trim() || null,
      };

      if (mode === "edit" && initial?.id) {
        const res = await fetch(`/api/admin/podcast/guests/${initial.id}`, {
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
        const res = await fetch("/api/admin/podcast/guests", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.id) {
          router.push(`/${locale}/admin/podcast/guests/${json.id}/edit`);
        } else {
          alert(json.error ?? "Create failed");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className={cardClass}>
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("podcast.guestName")}
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
              {t("team.imageUrl")}
            </label>
            <input
              type="url"
              value={data.image_url}
              onChange={(e) => setData((d) => ({ ...d, image_url: e.target.value }))}
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("podcast.episodeUrl")}
            </label>
            <input
              type="url"
              value={data.episode_url}
              onChange={(e) => setData((d) => ({ ...d, episode_url: e.target.value }))}
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("podcast.linksJson")}
            </label>
            <textarea
              value={data.links_json}
              onChange={(e) => setData((d) => ({ ...d, links_json: e.target.value }))}
              rows={3}
              placeholder='{"strava":"...","instagram":"..."}'
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 font-mono text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("podcast.publishedAt")}
            </label>
            <input
              type="date"
              value={data.published_at}
              onChange={(e) => setData((d) => ({ ...d, published_at: e.target.value }))}
              className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.featured}
                onChange={(e) => setData((d) => ({ ...d, featured: e.target.checked }))}
                className="rounded border-verter-border"
              />
              <span className="text-sm font-medium text-verter-graphite">
                {t("podcast.featured")}
              </span>
            </label>
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
          {t("podcast.saveHidden")}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className={primaryBtn}
        >
          {t("podcast.publish")}
        </button>
      </div>
    </form>
  );
}
