"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ItemForm from "@/components/admin/ItemForm";
import ItemDetailPreview from "@/components/admin/ItemDetailPreview";
import QualityChecklist from "@/components/admin/QualityChecklist";
import type { DbItem } from "@/lib/db/types";

interface Props {
  item: DbItem;
  locale: string;
}

export default function EditItemClient({ item, locale }: Props) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const handleArchive = async () => {
    if (!confirm(t("archiveConfirm"))) return;
    const res = await fetch(`/api/admin/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    if (res.ok) {
      router.push(`/${locale}/admin`);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm(t("unpublishConfirm"))) return;
    const res = await fetch(`/api/admin/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    if (res.ok) {
      router.refresh();
    }
  };

  const isPending = item.status === "pending";
  const isPublished = item.status === "published";
  const isArchived = item.status === "archived";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-verter-graphite">
            {t("editPrefix")}: {item.title}
          </h1>
          <p className="mt-2 text-verter-muted">
            {item.type} • {item.status}
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
                const res = await fetch(`/api/admin/items/${item.id}`, {
                  method: "PATCH",
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

      {isPending && (
        <div className="mb-8">
          <QualityChecklist item={item} />
        </div>
      )}

      {mode === "preview" ? (
        <ItemDetailPreview item={item} />
      ) : (
        <ItemForm initial={item} locale={locale} mode="edit" />
      )}
    </div>
  );
}
