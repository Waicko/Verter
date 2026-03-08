"use client";

import { useTranslations } from "next-intl";

export type RouteTrustVerificationValues = {
  submitted_by_strava_url: string;
  approved_by_verter: boolean;
  approved_by_name: string;
  approved_at: string;
  tested_by_team: boolean;
  tested_notes: string;
};

interface RouteTrustVerificationSectionProps {
  values: RouteTrustVerificationValues;
  onChange: (values: RouteTrustVerificationValues) => void;
  inputClass?: string;
}

export default function RouteTrustVerificationSection({
  values,
  onChange,
  inputClass = "mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest",
}: RouteTrustVerificationSectionProps) {
  const t = useTranslations("routes.trust");
  const update = (k: keyof RouteTrustVerificationValues, v: string | boolean) => {
    onChange({ ...values, [k]: v });
  };

  return (
    <details className="group mt-4 rounded-card border border-verter-border bg-verter-snow/30">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-verter-graphite hover:bg-verter-snow/50">
        {t("sectionTitle")}
      </summary>
      <div className="space-y-4 border-t border-verter-border px-4 py-4">
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("submittedByStravaUrl")}
          </label>
          <input
            type="url"
            value={values.submitted_by_strava_url || ""}
            onChange={(e) => update("submitted_by_strava_url", e.target.value)}
            className={inputClass}
            placeholder="https://www.strava.com/athletes/..."
          />
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={values.approved_by_verter ?? false}
              onChange={(e) => update("approved_by_verter", e.target.checked)}
              className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-forest"
            />
            <span className="text-sm font-medium text-verter-graphite">
              {t("approvedByVerter")}
            </span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("approvedByName")}
          </label>
          <input
            type="text"
            value={values.approved_by_name || ""}
            onChange={(e) => update("approved_by_name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("approvedAt")}
          </label>
          <input
            type="datetime-local"
            value={values.approved_at || ""}
            onChange={(e) => update("approved_at", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={values.tested_by_team ?? false}
              onChange={(e) => update("tested_by_team", e.target.checked)}
              className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-forest"
            />
            <span className="text-sm font-medium text-verter-graphite">
              {t("testedByTeam")}
            </span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("testedNotes")}
          </label>
          <textarea
            value={values.tested_notes || ""}
            onChange={(e) => update("tested_notes", e.target.value)}
            rows={3}
            className={inputClass}
            placeholder={t("testedNotesPlaceholder")}
          />
        </div>
      </div>
    </details>
  );
}
