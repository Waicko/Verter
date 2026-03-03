"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import AdminPodcastGuestCard from "@/components/admin/AdminPodcastGuestCard";
import type { AdminPodcastGuest } from "@/lib/data/podcast";
import { cardClass } from "@/lib/styles";

type RequestRow = {
  id: string;
  name: string;
  email: string | null;
  message: string | null;
  created_at: string;
};

interface Props {
  locale: string;
  requests: RequestRow[];
  publishedGuests: AdminPodcastGuest[];
  hiddenGuests: AdminPodcastGuest[];
}

export default function AdminPodcastSection({
  locale,
  requests,
  publishedGuests,
  hiddenGuests,
}: Props) {
  const t = useTranslations("admin");
  const [guestFilter, setGuestFilter] = useState<"all" | "published" | "hidden">("all");

  const guests =
    guestFilter === "published"
      ? publishedGuests
      : guestFilter === "hidden"
        ? hiddenGuests
        : [...publishedGuests, ...hiddenGuests];

  return (
    <div className="mt-8 space-y-12">
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("podcast.sectionTitle")}
      </h1>
      <p className="mt-2 text-verter-muted">{t("podcast.sectionDescription")}</p>
      {/* Guest Requests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-verter-graphite">
            {t("podcast.guestRequests")}
          </h2>
        </div>
        {requests.length === 0 ? (
          <p className="py-6 text-center text-sm text-verter-muted">
            {t("podcast.noRequests")}
          </p>
        ) : (
          <div className={`space-y-2 ${cardClass}`}>
            {requests.slice(0, 10).map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-verter-border py-3 last:border-0"
              >
                <div>
                  <span className="font-medium text-verter-graphite">{r.name}</span>
                  {r.email && (
                    <span className="ml-2 text-sm text-verter-muted">{r.email}</span>
                  )}
                </div>
                <span className="text-xs text-verter-muted">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                {r.message && (
                  <p className="w-full text-sm text-verter-muted">{r.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Guests */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold text-verter-graphite">
            {t("podcast.guests")}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={guestFilter}
              onChange={(e) =>
                setGuestFilter(e.target.value as "all" | "published" | "hidden")
              }
              className="rounded-pill border border-verter-border bg-white px-3 py-1.5 text-sm text-verter-graphite"
            >
              <option value="all">{t("podcast.filterAll")}</option>
              <option value="published">{t("podcast.filterPublished")}</option>
              <option value="hidden">{t("podcast.filterHidden")}</option>
            </select>
            <Link
              href="/admin/podcast/guests/new"
              className="rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:bg-verter-forest/90"
            >
              {t("addNew")}
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guests.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            guests.map((guest) => (
              <AdminPodcastGuestCard key={guest.id} guest={guest} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
