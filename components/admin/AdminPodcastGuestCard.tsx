"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { cardClass } from "@/lib/styles";
import type { AdminPodcastGuest } from "@/lib/data/podcast";

interface AdminPodcastGuestCardProps {
  guest: AdminPodcastGuest;
}

export default function AdminPodcastGuestCard({ guest }: AdminPodcastGuestCardProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const editHref = `/${locale}/admin/podcast/guests/${guest.id}/edit`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/podcast/guests/${guest.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) router.refresh();
      else alert((await res.json().catch(() => ({}))).error ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const statusClass =
    guest.status === "published"
      ? "bg-verter-good/20 text-verter-good"
      : "bg-verter-muted/20 text-verter-muted";

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <span className={`rounded-pill px-2 py-0.5 text-xs font-medium ${statusClass}`}>
          {guest.status ?? "—"}
        </span>
        {guest.featured && (
          <span className="rounded-pill bg-verter-blue/20 px-2 py-0.5 text-xs font-medium text-verter-blue">
            featured
          </span>
        )}
        <Link
          href={editHref}
          className="rounded-pill bg-verter-forest px-3 py-1.5 text-xs font-medium text-white hover:bg-verter-forest/90"
          onClick={(e) => e.stopPropagation()}
        >
          {t("edit")}
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-pill border border-verter-risky bg-white px-3 py-1.5 text-xs font-medium text-verter-risky hover:bg-verter-risky/5 disabled:opacity-50"
        >
          {deleting ? "…" : t("delete")}
        </button>
      </div>
      <Link href={editHref} className={`block p-4 ${cardClass}`}>
        <div className="flex items-start gap-3">
          {guest.image_url ? (
            <Image
              src={guest.image_url}
              alt={guest.name}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-verter-ice text-verter-blue">
              <span className="font-semibold">{guest.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-semibold text-verter-graphite">
              {guest.name}
            </h3>
            {guest.role && (
              <p className="mt-0.5 text-sm text-verter-muted">{guest.role}</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
