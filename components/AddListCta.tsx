"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Namespace = "routes" | "camps" | "events";

interface AddListCtaProps {
  namespace: Namespace;
}

const SUBMIT_HREF: Record<Namespace, string> = {
  routes: "/submit/route",
  camps: "/submit/event",
  events: "/submit/event",
};

export default function AddListCta({ namespace }: AddListCtaProps) {
  const t = useTranslations(namespace);

  return (
    <section
      id="add-list-cta"
      className="mt-12 flex flex-col items-center justify-center rounded-card border border-verter-border bg-verter-snow/50 px-8 py-10 text-center"
    >
      <h2 className="font-heading text-lg font-semibold text-verter-graphite">
        {t("addCtaTitle")}
      </h2>
      <p className="mt-2 max-w-lg text-sm text-verter-muted">
        {t("addCtaText")}
      </p>
      <Link
        href={SUBMIT_HREF[namespace]}
        className="mt-6 inline-flex items-center justify-center rounded-card bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:opacity-95 active:opacity-90"
      >
        {t("addCtaButton")}
      </Link>
    </section>
  );
}
