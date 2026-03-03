"use client";

import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const PATH_EQUIVALENTS: Record<string, Record<string, string>> = {
  "/leirit": { fi: "/leirit", en: "/camps" },
  "/camps": { fi: "/leirit", en: "/camps" },
};

function getLocalizedPath(pathname: string, targetLocale: string): string {
  const equiv = PATH_EQUIVALENTS[pathname];
  if (equiv) return equiv[targetLocale] ?? pathname;
  return pathname;
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const fiPath = getLocalizedPath(pathname, "fi");
  const enPath = getLocalizedPath(pathname, "en");

  return (
    <div className="flex items-center gap-1">
      <a
        href={`/fi${fiPath}`}
        className={`rounded-pill px-2.5 py-1 text-sm font-medium transition-colors ${
          locale === "fi"
            ? "bg-verter-forest text-white"
            : "text-verter-muted hover:text-verter-graphite"
        }`}
      >
        FI
      </a>
      <a
        href={`/en${enPath}`}
        className={`rounded-pill px-2.5 py-1 text-sm font-medium transition-colors ${
          locale === "en"
            ? "bg-verter-forest text-white"
            : "text-verter-muted hover:text-verter-graphite"
        }`}
      >
        EN
      </a>
    </div>
  );
}
