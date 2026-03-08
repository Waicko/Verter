"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import AdminContentItemCard from "@/components/admin/AdminContentItemCard";
import AdminTeamCard from "@/components/admin/AdminTeamCard";
import type { AdminTeamMember } from "@/lib/data/team";
import type { AdminContentItem } from "@/lib/data/content-items";
import type { AdminDomainCounts } from "@/lib/data/admin-dashboard";

type Tab = "published" | "drafts";

interface Props {
  domainCounts: AdminDomainCounts;
  publishedTeam: AdminTeamMember[];
  draftTeam: AdminTeamMember[];
  publishedContent: AdminContentItem[];
  draftContent: AdminContentItem[];
}

export default function AdminDashboardClient({
  domainCounts,
  publishedTeam,
  draftTeam,
  publishedContent,
  draftContent,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<Tab>("published");
  const [search, setSearch] = useState("");

  const contentByTab: Record<Tab, AdminContentItem[]> = {
    published: publishedContent,
    drafts: draftContent,
  };
  const contentItemsTab = contentByTab[activeTab];
  const contentFiltered = useMemo(
    () =>
      contentItemsTab.filter(
        (c) =>
          !search ||
          c.title.toLowerCase().includes(search.toLowerCase())
      ),
    [contentItemsTab, search]
  );

  const teamByTab: Record<Tab, AdminTeamMember[]> = {
    published: publishedTeam,
    drafts: draftTeam,
  };
  const teamMembers = teamByTab[activeTab];
  const teamFiltered = useMemo(
    () =>
      teamMembers.filter(
        (m) =>
          !search ||
          m.name.toLowerCase().includes(search.toLowerCase())
      ),
    [teamMembers, search]
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "published", label: t("tabPublished") },
    { id: "drafts", label: t("tabDrafts") },
  ];

  const sectionCards = [
    { href: `/${locale}/admin/events`, label: t("sectionEvents"), counts: domainCounts.events },
    { href: `/${locale}/admin/routes`, label: t("sectionRoutes"), counts: domainCounts.routes },
    { href: `/${locale}/admin/podcast`, label: t("sectionPodcast"), counts: domainCounts.podcast },
    { href: `/${locale}/admin/content`, label: t("sectionContent"), counts: domainCounts.content },
    { href: `/${locale}/admin/team`, label: t("sectionTeam"), counts: domainCounts.team },
  ];

  const Section = ({
    title,
    children,
    addNewHref,
  }: {
    title: string;
    children: React.ReactNode;
    addNewHref: string;
  }) => (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-verter-graphite">
          {title}
        </h2>
        <Link
          href={addNewHref}
          className="rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:bg-verter-forest/90"
        >
          {t("addNew")}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-verter-graphite">
        {t("dashboardTitle")}
      </h1>
      <p className="mt-2 text-verter-muted">{t("dashboardDescription")}</p>

      {/* Admin section links */}
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-lg font-semibold text-verter-graphite">
          {t("sectionQuickLinks")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sectionCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex flex-col rounded-card border border-verter-border bg-white p-4 transition hover:border-verter-forest hover:bg-verter-snow/30"
            >
              <span className="font-medium text-verter-graphite">{card.label}</span>
              <span className="mt-1 text-sm text-verter-muted">
                {"hidden" in card.counts
                  ? `${card.counts.published} / ${card.counts.hidden}`
                  : `${card.counts.published} / ${card.counts.draft}`}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-4 border-b border-verter-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-pill px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-verter-forest text-white"
                  : "bg-verter-snow text-verter-graphite hover:bg-verter-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto rounded-pill border border-verter-border bg-white px-4 py-2 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          />
        </div>
      </div>

      <div className="mt-8">
        <Section
          title={t("sectionContent")}
          addNewHref={`/${locale}/admin/content/new?type=blog`}
        >
          {contentFiltered.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            contentFiltered.map((item) => (
              <AdminContentItemCard key={item.id} item={item} />
            ))
          )}
        </Section>

        <Section
          title={t("sectionTeam")}
          addNewHref={`/${locale}/admin/team/new`}
        >
          {teamFiltered.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            teamFiltered.map((member) => (
              <AdminTeamCard key={member.id} member={member} />
            ))
          )}
        </Section>
      </div>
    </div>
  );
}
