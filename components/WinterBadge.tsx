"use client";

import { useTranslations } from "next-intl";
import { badge } from "@/lib/styles";

interface WinterBadgeProps {
  winterScore: number;
}

export default function WinterBadge({ winterScore }: WinterBadgeProps) {
  const t = useTranslations("winter");
  const isGood = winterScore >= 4;
  const variant = isGood ? "good" : "risky";
  const label = isGood ? t("good") : t("risky");

  return (
    <span
      className={`shrink-0 rounded-pill border px-2 py-0.5 text-xs font-medium ${badge[variant]}`}
      title={t("titleFormat", { label })}
    >
      {label}
    </span>
  );
}
