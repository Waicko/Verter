"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tCommon = useTranslations("common");

  return (
    <footer className="border-t border-verter-border bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link
            href="/"
            className="font-heading text-sm font-semibold text-verter-graphite hover:text-verter-forest"
          >
            {tCommon("brandName")}
          </Link>
          <div className="flex gap-8">
            <Link
              href="/routes"
              className="text-sm text-verter-muted hover:text-verter-graphite"
            >
              {t("routes")}
            </Link>
            <Link
              href="/content"
              className="text-sm text-verter-muted hover:text-verter-graphite"
            >
              {t("content")}
            </Link>
            <Link
              href="/events"
              className="text-sm text-verter-muted hover:text-verter-graphite"
            >
              {t("events")}
            </Link>
            <Link
              href="/about"
              className="text-sm text-verter-muted hover:text-verter-graphite"
            >
              {t("about")}
            </Link>
            <Link
              href="/submit#principles"
              className="text-sm text-verter-muted hover:text-verter-graphite"
            >
              {tFooter("approvalPrinciples")}
            </Link>
            <Link
              href="/disclaimer"
              className="text-sm text-verter-muted hover:text-verter-graphite"
            >
              {tFooter("disclaimer")}
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-verter-muted">
          {tFooter("tagline")}
        </p>
      </div>
    </footer>
  );
}
