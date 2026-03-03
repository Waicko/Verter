"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { storeRating } from "@/lib/rating-storage";
import { primaryBtn } from "@/lib/styles";

const MAX_COMMENT_LENGTH = 240;

interface RatingModalProps {
  routeSlug: string;
  onClose: () => void;
  onSubmit: () => void;
}

function StarButton({
  filled,
  onClick,
  onHover,
  ariaLabelFilled,
  ariaLabelEmpty,
}: {
  filled: boolean;
  onClick: () => void;
  onHover: () => void;
  ariaLabelFilled: string;
  ariaLabelEmpty: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-verter-blue focus:ring-offset-2 rounded"
      aria-label={filled ? ariaLabelFilled : ariaLabelEmpty}
    >
      {filled ? (
        <span className="text-verter-forest">★</span>
      ) : (
        <span className="text-verter-border">☆</span>
      )}
    </button>
  );
}

export default function RatingModal({
  routeSlug,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const t = useTranslations("rating");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ranInWinter, setRanInWinter] = useState(false);

  const displayRating = hoverRating || rating;
  const charCount = comment.length;

  const handleSubmit = useCallback(() => {
    if (rating < 1) return;
    storeRating(routeSlug, {
      rating,
      comment: comment.trim() || undefined,
      ranInWinter,
      status: "pending",
      timestamp: Date.now(),
    });
    onSubmit();
    onClose();
  }, [routeSlug, rating, comment, ranInWinter, onSubmit, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-modal-title"
        className="relative w-full max-w-md rounded-card border border-verter-border bg-verter-snow p-6 shadow-xl"
      >
        <h2
          id="rating-modal-title"
          className="font-heading text-xl font-semibold text-verter-graphite"
        >
          {t("title")}
        </h2>

        <div className="mt-6 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <StarButton
              key={value}
              filled={value <= displayRating}
              onClick={() => setRating(value)}
              onHover={() => setHoverRating(value)}
              ariaLabelFilled={t("starFilled")}
              ariaLabelEmpty={t("starEmpty")}
            />
          ))}
        </div>
        <div
          className="mt-2 flex justify-center"
          onMouseLeave={() => setHoverRating(0)}
        >
          <span className="text-sm text-verter-muted">
            {displayRating || rating || "—"} / 5
          </span>
        </div>

        <div className="mt-6">
          <label
            htmlFor="rating-comment"
            className="text-sm font-medium text-verter-graphite"
          >
            {t("comment")}
          </label>
          <textarea
            id="rating-comment"
            value={comment}
            onChange={(e) =>
              setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))
            }
            maxLength={MAX_COMMENT_LENGTH}
            rows={3}
            className="mt-2 w-full rounded-card border border-verter-border bg-white/70 px-3 py-2 text-sm text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            placeholder={t("comment")}
          />
          <p className="mt-1 text-right text-xs text-verter-muted">
            {t("charCount", { current: charCount, max: MAX_COMMENT_LENGTH })}
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={ranInWinter}
            onChange={(e) => setRanInWinter(e.target.checked)}
            className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-blue"
          />
          <span className="text-sm text-verter-graphite">
            {t("winterRun")}
          </span>
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-card border border-verter-border bg-white/60 px-4 py-2 text-sm font-medium text-verter-graphite hover:bg-white"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating < 1}
            className={`flex-1 ${primaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
