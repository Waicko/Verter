"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function RouteGpxDisclaimer() {
  const t = useTranslations("routes");
  return (
    <p className="mt-10 text-xs text-verter-muted">
      {t("routeGpxDisclaimer")}{" "}
      <Link href="/disclaimer" className="underline hover:text-verter-graphite">
        {t("safetyDisclaimerMore")}
      </Link>
    </p>
  );
}
