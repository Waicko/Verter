"use client";

import { useTranslations } from "next-intl";
import {
  SOURCE_TYPES,
  RIGHTS_BASIS_VALUES,
  VERIFICATION_STATUSES,
  ROUTE_ORIGIN_TYPES,
} from "@/lib/metadata-types";

export type MetadataFormValues = {
  source_type: string;
  source_name: string;
  source_url: string;
  submitted_by_name: string;
  submitted_by_email: string;
  rights_basis: string;
  license_name: string;
  license_url: string;
  verification_status: string;
  route_origin_type?: string;
  route_origin_name?: string;
  route_origin_url?: string;
};

interface SourceRightsMetadataSectionProps {
  values: MetadataFormValues;
  onChange: (values: MetadataFormValues) => void;
  includeRouteOrigin?: boolean;
  inputClass?: string;
}

export default function SourceRightsMetadataSection({
  values,
  onChange,
  includeRouteOrigin = false,
  inputClass = "mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest",
}: SourceRightsMetadataSectionProps) {
  const t = useTranslations("metadata");
  const update = (k: keyof MetadataFormValues, v: string) => {
    onChange({ ...values, [k]: v });
  };

  return (
    <details className="group rounded-card border border-verter-border bg-verter-snow/30">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-verter-graphite hover:bg-verter-snow/50">
        {t("sectionTitle")}
      </summary>
      <div className="space-y-4 border-t border-verter-border px-4 py-4">
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("sourceType")}
          </label>
          <select
            value={values.source_type || ""}
            onChange={(e) => update("source_type", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {SOURCE_TYPES.map((v) => (
              <option key={v} value={v}>
                {t(`sourceType_${v}` as "sourceType_team")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("sourceName")}
          </label>
          <input
            type="text"
            value={values.source_name || ""}
            onChange={(e) => update("source_name", e.target.value)}
            className={inputClass}
            placeholder="esim. Nuuksion Trail"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("sourceUrl")}
          </label>
          <input
            type="url"
            value={values.source_url || ""}
            onChange={(e) => update("source_url", e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("submittedByName")}
          </label>
          <input
            type="text"
            value={values.submitted_by_name || ""}
            onChange={(e) => update("submitted_by_name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("submittedByEmail")}
          </label>
          <input
            type="email"
            value={values.submitted_by_email || ""}
            onChange={(e) => update("submitted_by_email", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("rightsBasis")}
          </label>
          <select
            value={values.rights_basis || ""}
            onChange={(e) => update("rights_basis", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {RIGHTS_BASIS_VALUES.map((v) => (
              <option key={v} value={v}>
                {t(`rightsBasis_${v}` as "rightsBasis_own")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("licenseName")}
          </label>
          <input
            type="text"
            value={values.license_name || ""}
            onChange={(e) => update("license_name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("licenseUrl")}
          </label>
          <input
            type="url"
            value={values.license_url || ""}
            onChange={(e) => update("license_url", e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("verificationStatus")}
          </label>
          <select
            value={values.verification_status || ""}
            onChange={(e) => update("verification_status", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {VERIFICATION_STATUSES.map((v) => (
              <option key={v} value={v}>
                {t(`verificationStatus_${v}` as "verificationStatus_unverified")}
              </option>
            ))}
          </select>
        </div>

        {includeRouteOrigin && (
          <>
            <div className="border-t border-verter-border pt-4">
              <h4 className="text-sm font-medium text-verter-graphite">
                Reitin alkuperä (GPX)
              </h4>
            </div>
            <div>
              <label className="block text-sm font-medium text-verter-graphite">
                {t("routeOriginType")}
              </label>
              <select
                value={values.route_origin_type || ""}
                onChange={(e) => update("route_origin_type", e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {ROUTE_ORIGIN_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {t(`routeOriginType_${v}` as "routeOriginType_team_route")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-verter-graphite">
                {t("routeOriginName")}
              </label>
              <input
                type="text"
                value={values.route_origin_name || ""}
                onChange={(e) => update("route_origin_name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-verter-graphite">
                {t("routeOriginUrl")}
              </label>
              <input
                type="url"
                value={values.route_origin_url || ""}
                onChange={(e) => update("route_origin_url", e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
          </>
        )}
      </div>
    </details>
  );
}
