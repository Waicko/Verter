"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getStoredRatingForRoute } from "@/lib/rating-storage";
import RatingModal from "./RatingModal";
import Toast from "./Toast";
import { secondaryBtn } from "@/lib/styles";

const MOCK_AVG = 4.2;
const MOCK_COUNT = 8;

interface RouteRatingSectionProps {
  routeSlug: string;
}

export default function RouteRatingSection({ routeSlug }: RouteRatingSectionProps) {
  const t = useTranslations("rating");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<ReturnType<
    typeof getStoredRatingForRoute
  > | null>(null);

  useEffect(() => {
    setUserRating(getStoredRatingForRoute(routeSlug));
  }, [routeSlug]);

  const handleSubmit = useCallback(() => {
    setUserRating(getStoredRatingForRoute(routeSlug));
    setToastMessage(t("success"));
  }, [routeSlug, t]);

  const stored = userRating ?? getStoredRatingForRoute(routeSlug);
  const hasPendingRating = stored?.status === "pending";

  return (
    <>
      <div className="mt-8 rounded-card border border-verter-border bg-white/60 p-4">
        <h2 className="text-sm font-medium text-verter-muted">
          {t("title")}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-verter-graphite">
              {MOCK_AVG.toFixed(1)}
            </span>
            <span className="text-verter-muted">/ 5</span>
          </div>
          <span className="text-sm text-verter-muted">
            {t("basedOnCount", { count: MOCK_COUNT })}
          </span>
          {hasPendingRating && (
            <span className="rounded-pill border border-verter-risky/50 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-verter-risky">
              {t("pending")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`mt-4 ${secondaryBtn}`}
        >
          {t("rateButton")}
        </button>
      </div>

      {modalOpen && (
        <RatingModal
          routeSlug={routeSlug}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
