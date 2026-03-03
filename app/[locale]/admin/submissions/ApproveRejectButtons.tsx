"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
  itemId: string;
  locale: string;
}

export function ApproveRejectButtons({ itemId, locale }: Props) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const router = useRouter();

  async function approve() {
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          reject_reason: rejectReason.trim() || null,
        }),
      });
      if (res.ok) {
        setShowReject(false);
        setRejectReason("");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2 rounded-card border border-verter-border bg-verter-snow/50 p-3">
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t("rejectReasonPlaceholder")}
          rows={2}
          className="w-full rounded-pill border border-verter-border px-3 py-2 text-sm text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reject()}
            disabled={!!loading}
            className="rounded-pill border border-verter-risky bg-white px-3 py-1.5 text-sm font-medium text-verter-risky hover:bg-verter-risky/5 disabled:opacity-50"
          >
            {loading === "reject" ? "…" : t("rejectConfirm")}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReject(false);
              setRejectReason("");
            }}
            disabled={!!loading}
            className="rounded-pill border border-verter-border px-3 py-1.5 text-sm font-medium text-verter-graphite hover:bg-verter-snow disabled:opacity-50"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={approve}
        disabled={!!loading}
        className="rounded-pill bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:bg-verter-forest/90 disabled:opacity-50"
      >
        {loading === "approve" ? "…" : t("approve")}
      </button>
      <button
        type="button"
        onClick={() => setShowReject(true)}
        disabled={!!loading}
        className="rounded-pill border border-verter-border bg-white px-4 py-2 text-sm font-medium text-verter-graphite hover:bg-verter-snow disabled:opacity-50"
      >
        {loading === "reject" ? "…" : t("reject")}
      </button>
    </div>
  );
}
