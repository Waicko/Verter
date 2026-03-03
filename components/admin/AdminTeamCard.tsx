"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { cardClass } from "@/lib/styles";
import type { AdminTeamMember } from "@/lib/data/team";

interface AdminTeamCardProps {
  member: AdminTeamMember;
}

export default function AdminTeamCard({ member }: AdminTeamCardProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const editHref = `/${locale}/admin/team/${member.id}/edit`;

  const statusColors: Record<string, string> = {
    published: "bg-verter-good/20 text-verter-good",
    draft: "bg-verter-muted/20 text-verter-muted",
    archived: "bg-verter-muted/20 text-verter-muted",
  };
  const statusClass = statusColors[member.status ?? ""] ?? "bg-verter-muted/20 text-verter-muted";

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <span
          className={`rounded-pill px-2 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {member.status ?? "—"}
        </span>
        <Link
          href={editHref}
          className="rounded-pill bg-verter-forest px-3 py-1.5 text-xs font-medium text-white hover:bg-verter-forest/90"
          onClick={(e) => e.stopPropagation()}
        >
          {t("edit")}
        </Link>
      </div>
      <Link
        href={editHref}
        className={`block p-4 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 ${cardClass}`}
      >
        <div className="flex items-start gap-3">
          {member.image_url ? (
            <img
              src={member.image_url}
              alt={member.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-verter-ice text-verter-blue">
              <span className="text-lg font-semibold">{member.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-semibold text-verter-graphite">
              {member.name}
            </h3>
            {member.role && (
              <p className="mt-0.5 text-sm text-verter-muted">{member.role}</p>
            )}
            {member.tagline && (
              <p className="mt-1 text-xs text-verter-muted line-clamp-2">
                {member.tagline}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
