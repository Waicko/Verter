"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import AdminContentItemCard from "@/components/admin/AdminContentItemCard";
import AdminTeamCard from "@/components/admin/AdminTeamCard";
import type { AdminTeamMember } from "@/lib/data/team";
import type { AdminContentItem } from "@/lib/data/content-items";

type Tab = "published" | "pending" | "drafts";

interface Props {
  publishedTeam: AdminTeamMember[];
  draftTeam: AdminTeamMember[];
  publishedContent: AdminContentItem[];
  draftContent: AdminContentItem[];
}

export default function AdminDashboardClient({
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
    pending: [],
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
    pending: [],
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
    { id: "pending", label: t("tabPending") },
    { id: "drafts", label: t("tabDrafts") },
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
          {activeTab === "pending" ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("contentPublishedOnly")}
            </p>
          ) : contentFiltered.length === 0 ? (
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
          {activeTab === "pending" ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("teamNoPending")}
            </p>
          ) : teamFiltered.length === 0 ? (
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
