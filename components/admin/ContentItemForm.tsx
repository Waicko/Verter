"use client";

import { useState } from "react";
import Link from "next/link";
import { getPathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import type { DbContentItem, DbContentItemInsert } from "@/lib/db/content-types";
import { cardClass, primaryBtn, secondaryBtn } from "@/lib/styles";
import SourceRightsMetadataSection, {
  type MetadataFormValues,
} from "./SourceRightsMetadataSection";

type ContentType = "blog" | "review" | "podcast" | "comparison";
type FormData = {
  title: string;
  slug: string;
  content_type: ContentType;
  author: string;
  summary: string;
  body: string;
  hero_image: string;
  related_route_slugs: string[];
  related_event_slugs: string[];
  episode_url: string;
  published_at: string;
  status: "draft" | "published" | "archived";
} & Omit<MetadataFormValues, "route_origin_type" | "route_origin_name" | "route_origin_url">;

export type AvailableRoute = { slug: string; title: string; area: string | null };
export type AvailableEvent = { slug: string; title: string; date: string | null };

interface ContentItemFormProps {
  initial?: Partial<DbContentItem> | null;
  locale: string;
  mode: "create" | "edit";
  /** Route options for content picker (title, area, slug). Loaded via getAdminRoutes. */
  availableRoutes?: AvailableRoute[];
  /** Event options for content picker (title, date, slug). Loaded via getAdminEvents. */
  availableEvents?: AvailableEvent[];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ContentItemForm({
  initial,
  locale,
  mode,
  availableRoutes = [],
  availableEvents = [],
}: ContentItemFormProps) {
  const t = useTranslations("admin");
  const tContent = useTranslations("content");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modeToggle, setModeToggle] = useState<"edit" | "preview">("edit");

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [data, setData] = useState<FormData>(() => ({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    content_type: (initial?.content_type as ContentType) ?? "blog",
    author: initial?.author ?? "",
    summary: initial?.summary ?? "",
    body: initial?.body ?? "",
    hero_image: initial?.hero_image ?? "",
    related_route_slugs: Array.isArray(initial?.related_route_slugs)
      ? (initial.related_route_slugs as string[]).filter(Boolean)
      : [],
    related_event_slugs: Array.isArray((initial as Record<string, unknown>)?.related_event_slugs)
      ? ((initial as Record<string, unknown>).related_event_slugs as string[]).filter(Boolean)
      : [],
    episode_url: initial?.episode_url ?? "",
    published_at: initial?.published_at ?? "",
    status: (initial?.status as FormData["status"]) ?? "draft",
    source_type: String((initial as Record<string, unknown>)?.source_type ?? ""),
    source_name: String((initial as Record<string, unknown>)?.source_name ?? ""),
    source_url: String((initial as Record<string, unknown>)?.source_url ?? ""),
    submitted_by_name: String((initial as Record<string, unknown>)?.submitted_by_name ?? ""),
    submitted_by_email: String((initial as Record<string, unknown>)?.submitted_by_email ?? ""),
    rights_basis: String((initial as Record<string, unknown>)?.rights_basis ?? ""),
    license_name: String((initial as Record<string, unknown>)?.license_name ?? ""),
    license_url: String((initial as Record<string, unknown>)?.license_url ?? ""),
    verification_status: String((initial as Record<string, unknown>)?.verification_status ?? ""),
  }));

  const buildPayload = (status: "draft" | "published"): DbContentItemInsert & Record<string, unknown> => {
    const fromTitle = slugify(data.title);
    const trimmed = data.slug.trim();
    // Use full slug from title when: no slug, or slug looks truncated (1 char) vs title
    const slug = trimmed && (trimmed.length > 1 || !fromTitle)
      ? trimmed
      : fromTitle || trimmed || "";
    return {
      title: data.title.trim(),
      slug,
      content_type: data.content_type,
      author: data.author.trim() || null,
      summary: data.summary.trim() || null,
      body: data.body.trim() || "",
      hero_image: data.hero_image.trim() || null,
      related_route_slugs: data.related_route_slugs,
      related_event_slugs: data.related_event_slugs,
      episode_url: data.content_type === "podcast" ? (data.episode_url.trim() || null) : null,
      published_at: data.published_at.trim() || null,
      status,
      source_type: data.source_type?.trim() || null,
      source_name: data.source_name?.trim() || null,
      source_url: data.source_url?.trim() || null,
      submitted_by_name: data.submitted_by_name?.trim() || null,
      submitted_by_email: data.submitted_by_email?.trim() || null,
      rights_basis: data.rights_basis?.trim() || null,
      license_name: data.license_name?.trim() || null,
      license_url: data.license_url?.trim() || null,
      verification_status: data.verification_status?.trim() || null,
    };
  };

  const handleSubmit = async (publish: boolean) => {
    setLoading(true);
    try {
      const payload = buildPayload(publish ? "published" : "draft");

      if (mode === "edit" && initial?.id) {
        const res = await fetch(`/api/admin/content/${initial.id}`, {
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
        const res = await fetch("/api/admin/content", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.id) {
          const path = getPathname({
            locale: locale as "fi" | "en",
            href: `/admin/content/${json.id}/edit`,
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

  const handleArchive = async () => {
    if (mode !== "edit" || !initial?.id || !confirm(t("archiveConfirm"))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content/${initial.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (res.ok) router.refresh();
      else {
        const err = await res.json();
        alert(err.error ?? "Archive failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<ContentType, string> = {
    blog: tContent("blog"),
    review: tContent("review"),
    podcast: tContent("podcast"),
    comparison: tContent("comparison"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setModeToggle(modeToggle === "edit" ? "preview" : "edit")}
          className="rounded-pill border border-verter-border bg-white px-4 py-2 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
        >
          {modeToggle === "edit" ? t("showPreview") : t("showEdit")}
        </button>
        <Link
          href="/admin/content"
          className="rounded-pill border border-verter-border bg-white px-4 py-2 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
        >
          {t("backToContent")}
        </Link>
      </div>

      {modeToggle === "preview" ? (
        <div className={cardClass}>
          <div className="p-6">
            <Link
              href="/content"
              className="mb-4 inline-flex text-sm font-medium text-verter-muted hover:text-verter-graphite"
            >
              ← {t("backToContent")}
            </Link>
            {data.hero_image && (
              <div className="mb-6 overflow-hidden rounded-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.hero_image}
                  alt=""
                  className="h-48 w-full object-cover sm:h-64"
                />
              </div>
            )}
            <span className="text-xs font-medium uppercase tracking-wider text-verter-muted">
              {typeLabels[data.content_type] || data.content_type}
            </span>
            <h1 className="mt-2 font-heading text-2xl font-bold text-verter-graphite">
              {data.title || t("content.previewTitle")}
            </h1>
            {data.summary && (
              <p className="mt-2 text-lg text-verter-muted">{data.summary}</p>
            )}
            <div className="prose prose-zinc mt-6 max-w-none">
              <ReactMarkdown>{data.body || ""}</ReactMarkdown>
            </div>
            {data.content_type === "podcast" && data.episode_url && (
              <a
                href={data.episode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-card bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:bg-verter-forest/90"
              >
                {tContent("listenEpisode")}
              </a>
            )}
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className={cardClass}>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.title")}
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => ({
                      ...d,
                      title: v,
                      slug: slugManuallyEdited ? d.slug : slugify(v),
                    }));
                  }}
                  required
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.slug")}
                </label>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setData((d) => ({ ...d, slug: e.target.value }));
                  }}
                  placeholder={slugify(data.title) || "my-post"}
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.contentType")}
                </label>
                <select
                  value={data.content_type}
                  onChange={(e) =>
                    setData((d) => ({ ...d, content_type: e.target.value as ContentType }))
                  }
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                >
                  <option value="blog">{tContent("blog")}</option>
                  <option value="review">{tContent("review")}</option>
                  <option value="comparison">{tContent("comparison")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.author")}
                </label>
                <input
                  type="text"
                  value={data.author}
                  onChange={(e) => setData((d) => ({ ...d, author: e.target.value }))}
                  placeholder="Verter"
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.summary")}
                </label>
                <textarea
                  value={data.summary}
                  onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.body")}
                </label>
                <textarea
                  value={data.body}
                  onChange={(e) => setData((d) => ({ ...d, body: e.target.value }))}
                  rows={12}
                  placeholder="Markdown supported"
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 font-mono text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.heroImageUrl")}
                </label>
                <input
                  type="url"
                  value={data.hero_image}
                  onChange={(e) => setData((d) => ({ ...d, hero_image: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {tContent("relatedRoutes")}
                </label>
                <div className="mt-1 space-y-2">
                  {data.related_route_slugs.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data.related_route_slugs.map((slug) => {
                        const route = availableRoutes.find((r) => r.slug === slug);
                        const label = route
                          ? `${route.title} — ${route.area ?? "-"} — ${route.slug}`
                          : slug;
                        return (
                          <span
                            key={slug}
                            className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-3 py-1 text-sm text-verter-graphite"
                          >
                            {label}
                            <button
                              type="button"
                              onClick={() =>
                                setData((d) => ({
                                  ...d,
                                  related_route_slugs: d.related_route_slugs.filter((s) => s !== slug),
                                }))
                              }
                              className="ml-0.5 text-verter-muted hover:text-verter-graphite"
                              aria-label="Remove"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {availableRoutes.length > 0 ? (
                    <select
                      value=""
                      onChange={(e) => {
                        const slug = e.target.value;
                        if (!slug || data.related_route_slugs.includes(slug)) return;
                        setData((d) => ({
                          ...d,
                          related_route_slugs: [...d.related_route_slugs, slug],
                        }));
                      }}
                      className="w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                    >
                      <option value="">
                        {tContent("relatedRoutesAdd") ?? "Add a route..."}
                      </option>
                      {availableRoutes
                        .filter((r) => !data.related_route_slugs.includes(r.slug))
                        .map((r) => (
                          <option key={r.slug} value={r.slug}>
                            {r.title} — {r.area ?? "-"} — {r.slug}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={data.related_route_slugs.join(", ")}
                      onChange={(e) => {
                        const slugs = e.target.value
                          .split(/[,;\s]+/)
                          .map((s) => s.trim().toLowerCase())
                          .filter(Boolean);
                        setData((d) => ({ ...d, related_route_slugs: slugs }));
                      }}
                      placeholder="e.g. nouxtreme, koli-trail"
                      className="w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs text-verter-muted">
                  {tContent("relatedRoutesHint")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {tContent("relatedEvents")}
                </label>
                <div className="mt-1 space-y-2">
                  {data.related_event_slugs.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data.related_event_slugs.map((slug) => {
                        const ev = availableEvents.find((e) => e.slug === slug);
                        const dateStr = ev?.date
                          ? new Date(ev.date).toLocaleDateString(locale, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : null;
                        const label = ev
                          ? `${ev.title} — ${dateStr ?? "-"} — ${ev.slug}`
                          : slug;
                        return (
                          <span
                            key={slug}
                            className="inline-flex items-center gap-1 rounded-pill border border-verter-border bg-verter-snow px-3 py-1 text-sm text-verter-graphite"
                          >
                            {label}
                            <button
                              type="button"
                              onClick={() =>
                                setData((d) => ({
                                  ...d,
                                  related_event_slugs: d.related_event_slugs.filter((s) => s !== slug),
                                }))
                              }
                              className="ml-0.5 text-verter-muted hover:text-verter-graphite"
                              aria-label="Remove"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {availableEvents.length > 0 ? (
                    <select
                      value=""
                      onChange={(e) => {
                        const slug = e.target.value;
                        if (!slug || data.related_event_slugs.includes(slug)) return;
                        setData((d) => ({
                          ...d,
                          related_event_slugs: [...d.related_event_slugs, slug],
                        }));
                      }}
                      className="w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                    >
                      <option value="">
                        {tContent("relatedEventsAdd") ?? "Add an event..."}
                      </option>
                      {availableEvents
                        .filter((e) => !data.related_event_slugs.includes(e.slug))
                        .map((e) => {
                          const dateStr = e.date
                            ? new Date(e.date).toLocaleDateString(locale, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-";
                          return (
                            <option key={e.slug} value={e.slug}>
                              {e.title} — {dateStr} — {e.slug}
                            </option>
                          );
                        })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={data.related_event_slugs.join(", ")}
                      onChange={(e) => {
                        const slugs = e.target.value
                          .split(/[,;\s]+/)
                          .map((s) => s.trim().toLowerCase())
                          .filter(Boolean);
                        setData((d) => ({ ...d, related_event_slugs: slugs }));
                      }}
                      placeholder="e.g. nuuksio-classic, koli-trail-2025"
                      className="w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs text-verter-muted">
                  {tContent("relatedEventsHint")}
                </p>
              </div>
              {data.content_type === "podcast" && (
                <div>
                  <label className="block text-sm font-medium text-verter-graphite">
                    {t("podcast.episodeUrl")}
                  </label>
                  <input
                    type="url"
                    value={data.episode_url}
                    onChange={(e) => setData((d) => ({ ...d, episode_url: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("podcast.publishedAt")}
                </label>
                <input
                  type="date"
                  value={data.published_at}
                  onChange={(e) =>
                    setData((d) => ({ ...d, published_at: e.target.value }))
                  }
                  className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
            </div>
          </div>
          <SourceRightsMetadataSection
            values={{
              source_type: data.source_type ?? "",
              source_name: data.source_name ?? "",
              source_url: data.source_url ?? "",
              submitted_by_name: data.submitted_by_name ?? "",
              submitted_by_email: data.submitted_by_email ?? "",
              rights_basis: data.rights_basis ?? "",
              license_name: data.license_name ?? "",
              license_url: data.license_url ?? "",
              verification_status: data.verification_status ?? "",
            }}
            onChange={(v) =>
              setData((prev) => ({
                ...prev,
                source_type: v.source_type,
                source_name: v.source_name,
                source_url: v.source_url,
                submitted_by_name: v.submitted_by_name,
                submitted_by_email: v.submitted_by_email,
                rights_basis: v.rights_basis,
                license_name: v.license_name,
                license_url: v.license_url,
                verification_status: v.verification_status,
              }))
            }
            includeRouteOrigin={false}
            inputClass="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          />
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className={secondaryBtn}
            >
              {t("content.saveDraft")}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className={primaryBtn}
            >
              {t("content.publish")}
            </button>
            {mode === "edit" && initial?.status !== "archived" && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={loading}
                className="rounded-pill border border-verter-muted px-4 py-2 text-sm font-medium text-verter-muted hover:bg-verter-muted/10"
              >
                {t("archive")}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
