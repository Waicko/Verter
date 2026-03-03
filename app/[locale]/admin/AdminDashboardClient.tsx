"use client";

import { useState, useMemo } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import AdminItemCard from "@/components/admin/AdminItemCard";
import AdminContentItemCard from "@/components/admin/AdminContentItemCard";
import AdminTeamCard from "@/components/admin/AdminTeamCard";
import { ApproveRejectButtons } from "./submissions/ApproveRejectButtons";
import type { AdminDbItem } from "@/lib/data/admin-items";
import type { AdminTeamMember } from "@/lib/data/team";
import type { AdminContentItem } from "@/lib/data/content-items";

type Tab = "published" | "pending" | "drafts";

interface Props {
  publishedItems: AdminDbItem[];
  pendingItems: AdminDbItem[];
  draftItems: AdminDbItem[];
  publishedTeam: AdminTeamMember[];
  draftTeam: AdminTeamMember[];
  publishedContent: AdminContentItem[];
  draftContent: AdminContentItem[];
}

export default function AdminDashboardClient({
  publishedItems,
  pendingItems,
  draftItems,
  publishedTeam,
  draftTeam,
  publishedContent,
  draftContent,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<Tab>("published");
  const [search, setSearch] = useState("");

  const itemsByTab: Record<Tab, AdminDbItem[]> = {
    published: publishedItems,
    pending: pendingItems,
    drafts: draftItems,
  };
  const items = itemsByTab[activeTab];

  const routes = useMemo(
    () =>
      items
        .filter((i) => i.type === "route")
        .filter(
          (i) =>
            !search ||
            i.name.toLowerCase().includes(search.toLowerCase())
        ),
    [items, search]
  );
  const events = useMemo(
    () =>
      items
        .filter((i) => i.type === "event")
        .filter(
          (i) =>
            !search ||
            i.name.toLowerCase().includes(search.toLowerCase())
        ),
    [items, search]
  );
  const camps = useMemo(
    () =>
      items
        .filter((i) => i.type === "camp")
        .filter(
          (i) =>
            !search ||
            i.name.toLowerCase().includes(search.toLowerCase())
        ),
    [items, search]
  );
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
    type,
    children,
    addNewHref,
  }: {
    title: string;
    type: "route" | "event" | "camp" | "content";
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

  const ItemRow = ({ item, showApprove }: { item: AdminDbItem; showApprove?: boolean }) => (
    <div key={item.id} className="relative">
      <AdminItemCard item={{ ...item, id: item.id, status: item.status }} />
      {showApprove && activeTab === "pending" && (
        <div className="absolute bottom-2 right-2 z-10">
          <ApproveRejectButtons itemId={item.id} locale={locale} />
        </div>
      )}
    </div>
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
          title={t("sectionRoutes")}
          type="route"
          addNewHref={`/${locale}/admin/items/new?type=route`}
        >
          {routes.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            routes.map((item) => (
              <ItemRow key={item.id} item={item} showApprove />
            ))
          )}
        </Section>

        <Section
          title={t("sectionEvents")}
          type="event"
          addNewHref={`/${locale}/admin/items/new?type=event`}
        >
          {events.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            events.map((item) => (
              <ItemRow key={item.id} item={item} showApprove />
            ))
          )}
        </Section>

        <Section
          title={t("sectionCamps")}
          type="camp"
          addNewHref={`/${locale}/admin/items/new?type=camp`}
        >
          {camps.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-verter-muted">
              {t("noItems")}
            </p>
          ) : (
            camps.map((item) => (
              <ItemRow key={item.id} item={item} showApprove />
            ))
          )}
        </Section>

        <Section
          title={t("sectionContent")}
          type="content"
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
          type="content"
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
