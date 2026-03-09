"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import TeamForm from "@/components/admin/TeamForm";
import type { DbTeamMember } from "@/lib/db/team-types";
import { cardClass } from "@/lib/styles";

interface Props {
  member: DbTeamMember;
  locale: string;
}

export default function EditTeamClient({ member, locale }: Props) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const handleArchive = async () => {
    if (!confirm(t("archiveConfirm"))) return;
    const res = await fetch(`/api/admin/team/${member.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    if (res.ok) {
      router.push("/admin/team");
    }
  };

  const handleUnpublish = async () => {
    if (!confirm(t("unpublishConfirm"))) return;
    const res = await fetch(`/api/admin/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    if (res.ok) {
      router.refresh();
    }
  };

  const isPublished = member.status === "published";
  const isArchived = member.status === "archived";

  const role = locale === "fi" ? (member.role_fi ?? member.role_en) : (member.role_en ?? member.role_fi);
  const tagline = locale === "fi" ? (member.tagline_fi ?? member.tagline_en) : (member.tagline_en ?? member.tagline_fi);

  return (
    <div>
      <Link
        href="/admin/team"
        className="mb-4 inline-block text-sm font-medium text-verter-muted hover:text-verter-graphite"
      >
        ← {t("sectionTeam")}
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-verter-graphite">
            {t("editPrefix")}: {member.name}
          </h1>
          <p className="mt-2 text-verter-muted">
            {member.status}
            {role && ` • ${role}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className="rounded-pill border border-verter-border bg-white px-4 py-2 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
          >
            {mode === "edit" ? t("showPreview") : t("showEdit")}
          </button>
          {isPublished && (
            <button
              type="button"
              onClick={handleUnpublish}
              className="rounded-pill border border-verter-risky bg-white px-4 py-2 text-sm font-medium text-verter-risky hover:bg-amber-50"
            >
              {t("unpublish")}
            </button>
          )}
          {isPublished && (
            <button
              type="button"
              onClick={handleArchive}
              className="rounded-pill border border-verter-muted bg-white px-4 py-2 text-sm font-medium text-verter-muted hover:bg-verter-snow"
            >
              {t("archive")}
            </button>
          )}
          {isArchived && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm(t("restoreConfirm"))) return;
                const res = await fetch(`/api/admin/team/${member.id}`, {
                  method: "PATCH",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "draft" }),
                });
                if (res.ok) router.refresh();
              }}
              className="rounded-pill border border-verter-forest bg-white px-4 py-2 text-sm font-medium text-verter-forest hover:bg-verter-ice"
            >
              {t("restore")}
            </button>
          )}
        </div>
      </div>

      {mode === "preview" ? (
        <div className={cardClass}>
          <div className="flex items-start gap-4 p-6">
            {member.image_url ? (
              <img
                src={member.image_url}
                alt={member.name}
                className="h-20 w-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-verter-ice text-verter-blue">
                <span className="text-2xl font-semibold">{member.name.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-xl font-semibold text-verter-graphite">
                {member.name}
              </h2>
              {role && (
                <p className="mt-1 text-sm font-medium text-verter-blue">{role}</p>
              )}
              {tagline && (
                <p className="mt-2 text-verter-muted">{tagline}</p>
              )}
              {member.strava_url && (
                <a
                  href={member.strava_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-sm font-medium text-verter-forest hover:underline"
                >
                  Strava →
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <TeamForm initial={member} locale={locale} mode="edit" />
      )}
    </div>
  );
}
