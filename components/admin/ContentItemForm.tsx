"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
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
  content_type: ContentType;
  author: string;
  hero_image: string;
  related_route_slugs: string[];
  related_event_slugs: string[];
  episode_url: string;
  published_at: string;
  status: "draft" | "published" | "archived";
  title_fi: string;
  slug_fi: string;
  excerpt_fi: string;
  body_fi: string;
  seo_title_fi: string;
  seo_description_fi: string;
  title_en: string;
  slug_en: string;
  excerpt_en: string;
  body_en: string;
  seo_title_en: string;
  seo_description_en: string;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const init = initial as Record<string, unknown> | undefined;
  const [slugFiManuallyEdited, setSlugFiManuallyEdited] = useState(false);
  const [slugEnManuallyEdited, setSlugEnManuallyEdited] = useState(false);
  const [data, setData] = useState<FormData>(() => ({
    content_type: (initial?.content_type as ContentType) ?? "blog",
    author: initial?.author ?? "",
    hero_image: initial?.hero_image ?? "",
    related_route_slugs: Array.isArray(initial?.related_route_slugs)
      ? (initial.related_route_slugs as string[]).filter(Boolean)
      : [],
    related_event_slugs: Array.isArray(init?.related_event_slugs)
      ? (init.related_event_slugs as string[]).filter(Boolean)
      : [],
    episode_url: initial?.episode_url ?? "",
    published_at: initial?.published_at ?? "",
    status: (initial?.status as FormData["status"]) ?? "draft",
    title_fi: String(init?.title_fi ?? initial?.title ?? ""),
    slug_fi: String(init?.slug_fi ?? initial?.slug ?? ""),
    excerpt_fi: String(init?.excerpt_fi ?? initial?.summary ?? (init?.excerpt as string | undefined) ?? ""),
    body_fi: String(init?.body_fi ?? initial?.body ?? ""),
    seo_title_fi: String(init?.seo_title_fi ?? ""),
    seo_description_fi: String(init?.seo_description_fi ?? ""),
    title_en: String(init?.title_en ?? ""),
    slug_en: String(init?.slug_en ?? ""),
    excerpt_en: String(init?.excerpt_en ?? ""),
    body_en: String(init?.body_en ?? ""),
    seo_title_en: String(init?.seo_title_en ?? ""),
    seo_description_en: String(init?.seo_description_en ?? ""),
    source_type: String(init?.source_type ?? ""),
    source_name: String(init?.source_name ?? ""),
    source_url: String(init?.source_url ?? ""),
    submitted_by_name: String(init?.submitted_by_name ?? ""),
    submitted_by_email: String(init?.submitted_by_email ?? ""),
    rights_basis: String(init?.rights_basis ?? ""),
    license_name: String(init?.license_name ?? ""),
    license_url: String(init?.license_url ?? ""),
    verification_status: String(init?.verification_status ?? ""),
  }));

  const buildPayload = (status: "draft" | "published"): DbContentItemInsert & Record<string, unknown> => {
    const fromTitleFi = slugify(data.title_fi);
    const trimmedFi = data.slug_fi.trim();
    const slugFi = trimmedFi && (trimmedFi.length > 1 || !fromTitleFi)
      ? trimmedFi
      : fromTitleFi || trimmedFi || "";
    return {
      title: data.title_fi.trim() || data.title_en.trim() || "", // legacy fallback
      slug: slugFi,
      content_type: data.content_type,
      author: data.author.trim() || null,
      summary: data.excerpt_fi.trim() || null,
      body: data.body_fi.trim() || "",
      hero_image: data.hero_image.trim() || null,
      related_route_slugs: data.related_route_slugs,
      related_event_slugs: data.related_event_slugs,
      episode_url: data.content_type === "podcast" ? (data.episode_url.trim() || null) : null,
      published_at: data.published_at.trim() || null,
      status,
      title_fi: data.title_fi.trim() || null,
      title_en: data.title_en.trim() || null,
      slug_fi: slugFi || null,
      slug_en: data.slug_en.trim() || null,
      excerpt_fi: data.excerpt_fi.trim() || null,
      excerpt_en: data.excerpt_en.trim() || null,
      body_fi: data.body_fi.trim() || null,
      body_en: data.body_en.trim() || null,
      seo_title_fi: data.seo_title_fi.trim() || null,
      seo_title_en: data.seo_title_en.trim() || null,
      seo_description_fi: data.seo_description_fi.trim() || null,
      seo_description_en: data.seo_description_en.trim() || null,
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
    if (publish) {
      const titleFi = data.title_fi.trim();
      const slugFi = data.slug_fi.trim();
      const bodyFi = data.body_fi.trim();
      if (!titleFi || !slugFi || !bodyFi) {
        alert(t("content.publishValidationFi"));
        return;
      }
    }
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
        if (res.ok) {
          setSuccessMessage(publish ? t("content.publishedSuccess") : t("content.draftSaved"));
          router.refresh();
        } else {
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
        {successMessage && (
          <div
            role="status"
            className="rounded-card border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {successMessage}
          </div>
        )}
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
            <h1 className="mt-2 break-words font-heading text-2xl font-bold text-verter-graphite">
              {data.title_fi || data.title_en || t("content.previewTitle")}
            </h1>
            {(data.excerpt_fi || data.excerpt_en) && (
              <p className="mt-2 text-lg text-verter-muted">{data.excerpt_fi || data.excerpt_en}</p>
            )}
            <div className="prose prose-zinc mt-6 max-w-none break-words">
              <ReactMarkdown>{data.body_fi || data.body_en || ""}</ReactMarkdown>
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
              <h3 className="text-sm font-semibold uppercase tracking-wider text-verter-muted">
                {t("content.sectionGeneral")}
              </h3>
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
                    <div className="flex min-w-0 flex-wrap gap-2">
                      {data.related_route_slugs.map((slug) => {
                        const route = availableRoutes.find((r) => r.slug === slug);
                        const label = route
                          ? `${route.title} — ${route.area ?? "-"} — ${route.slug}`
                          : slug;
                        return (
                          <span
                            key={slug}
                            className="inline-flex max-w-full min-w-0 items-center gap-1 break-words rounded-pill border border-verter-border bg-verter-snow px-3 py-1 text-sm text-verter-graphite"
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
                    <div className="flex min-w-0 flex-wrap gap-2">
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
                            className="inline-flex max-w-full min-w-0 items-center gap-1 break-words rounded-pill border border-verter-border bg-verter-snow px-3 py-1 text-sm text-verter-graphite"
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

          {/* Finnish section */}
          <div className={cardClass}>
            <div className="space-y-4 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-verter-muted">
                {t("content.sectionFinnish")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.title")} (FI)
                </label>
                <input
                  type="text"
                  value={data.title_fi}
                  onChange={(e) => {
                    setData((d) => ({ ...d, title_fi: e.target.value }));
                    if (!slugFiManuallyEdited) {
                      setData((d) => ({ ...d, slug_fi: slugify(e.target.value) }));
                    }
                  }}
                  placeholder="Otsikko"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.slug")} (FI)
                </label>
                <input
                  type="text"
                  value={data.slug_fi}
                  onChange={(e) => {
                    setData((d) => ({ ...d, slug_fi: e.target.value }));
                    setSlugFiManuallyEdited(true);
                  }}
                  placeholder="url-slug"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 font-mono text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.summary")} (FI)
                </label>
                <textarea
                  value={data.excerpt_fi}
                  onChange={(e) => setData((d) => ({ ...d, excerpt_fi: e.target.value }))}
                  rows={2}
                  placeholder="Lyhyt tiivistelmä"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.body")} (FI)
                </label>
                <textarea
                  value={data.body_fi}
                  onChange={(e) => setData((d) => ({ ...d, body_fi: e.target.value }))}
                  rows={12}
                  placeholder="Markdown supported"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 font-mono text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.seoTitle")} (FI)
                </label>
                <input
                  type="text"
                  value={data.seo_title_fi}
                  onChange={(e) => setData((d) => ({ ...d, seo_title_fi: e.target.value }))}
                  placeholder="SEO otsikko"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.seoDescription")} (FI)
                </label>
                <textarea
                  value={data.seo_description_fi}
                  onChange={(e) => setData((d) => ({ ...d, seo_description_fi: e.target.value }))}
                  rows={2}
                  placeholder="SEO kuvaus"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
            </div>
          </div>

          {/* English section */}
          <div className={cardClass}>
            <div className="space-y-4 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-verter-muted">
                {t("content.sectionEnglish")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.title")} (EN)
                </label>
                <input
                  type="text"
                  value={data.title_en}
                  onChange={(e) => {
                    setData((d) => ({ ...d, title_en: e.target.value }));
                    if (!slugEnManuallyEdited) {
                      setData((d) => ({ ...d, slug_en: slugify(e.target.value) }));
                    }
                  }}
                  placeholder="Title"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.slug")} (EN)
                </label>
                <input
                  type="text"
                  value={data.slug_en}
                  onChange={(e) => {
                    setData((d) => ({ ...d, slug_en: e.target.value }));
                    setSlugEnManuallyEdited(true);
                  }}
                  placeholder="url-slug"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 font-mono text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.summary")} (EN)
                </label>
                <textarea
                  value={data.excerpt_en}
                  onChange={(e) => setData((d) => ({ ...d, excerpt_en: e.target.value }))}
                  rows={2}
                  placeholder="Short excerpt"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.body")} (EN)
                </label>
                <textarea
                  value={data.body_en}
                  onChange={(e) => setData((d) => ({ ...d, body_en: e.target.value }))}
                  rows={12}
                  placeholder="Markdown supported"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 font-mono text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.seoTitle")} (EN)
                </label>
                <input
                  type="text"
                  value={data.seo_title_en}
                  onChange={(e) => setData((d) => ({ ...d, seo_title_en: e.target.value }))}
                  placeholder="SEO title"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-verter-graphite">
                  {t("content.seoDescription")} (EN)
                </label>
                <textarea
                  value={data.seo_description_en}
                  onChange={(e) => setData((d) => ({ ...d, seo_description_en: e.target.value }))}
                  rows={2}
                  placeholder="SEO description"
                  className="mt-1 w-full min-w-0 rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
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
