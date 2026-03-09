"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ItemType = "route" | "event" | "camp";

const MAX_DESCRIPTION = 600;

interface FormState {
  type: ItemType;
  title: string;
  region: string;
  country: string;
  location_name: string;
  official_url: string;
  date: string;
  recurring: string;
  short_description: string;
  submitter_email: string;
}

const INITIAL: FormState = {
  type: "route",
  title: "",
  region: "",
  country: "",
  location_name: "",
  official_url: "",
  date: "",
  recurring: "",
  short_description: "",
  submitter_email: "",
};

interface SubmitFormProps {
  locale: string;
  initialType?: "route" | "event" | "camp";
  updateForSlug?: string;
}

export default function SubmitForm({ locale, initialType, updateForSlug }: SubmitFormProps) {
  const t = useTranslations("submit");
  const router = useRouter();
  const [data, setData] = useState<FormState>(() => ({
    ...INITIAL,
    type: initialType ?? "route",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k: keyof FormState, v: string) => {
    setData((prev) => ({ ...prev, [k]: v }));
  };

  const isValidUrl = (s: string) => {
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = data.official_url.trim();
    if (url && !isValidUrl(url)) {
      setError(t("invalidUrl"));
      return;
    }
    setSaving(true);

    const desc = data.short_description.trim().slice(0, MAX_DESCRIPTION);

    try {
      const payload: Record<string, unknown> = {
        type: data.type,
        title: data.title.trim(),
        region: data.region.trim() || null,
        country: data.country.trim() || null,
        location_name: data.location_name.trim() || null,
        official_url: data.official_url.trim() || null,
        start_date: data.type === "event" && data.date ? data.date : null,
        recurrence: data.type === "event" && data.recurring ? data.recurring : null,
        short_description: desc || null,
        submitter_email: data.submitter_email.trim() || null,
      };
      if (updateForSlug) {
        payload.update_for_slug = updateForSlug;
      }

      const res = await fetch("/api/items/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || t("submitFailed"));
        return;
      }

      router.push(`/${locale}/submit/success`);
    } catch {
      setError(t("submitFailed"));
    } finally {
      setSaving(false);
    }
  };

  const descLen = data.short_description.length;
  const descOver = descLen > MAX_DESCRIPTION;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          {t("type")} *
        </label>
        <p className="mt-1 text-xs text-verter-muted">
          {data.type === "route" && t("helperRoute")}
          {data.type === "event" && t("helperEvent")}
          {data.type === "camp" && t("helperCamp")}
        </p>
        <div className="mt-2 flex gap-4">
          {(["route", "event", "camp"] as const).map((tpe) => (
            <label key={tpe} className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                checked={data.type === tpe}
                onChange={() => update("type", tpe)}
                className="text-verter-forest"
              />
              {t(`type${tpe.charAt(0).toUpperCase() + tpe.slice(1)}`)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          {t("titleLabel")} *
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          required
          className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          placeholder={t("titlePlaceholder")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("region")}
          </label>
          <input
            type="text"
            value={data.region}
            onChange={(e) => update("region", e.target.value)}
            className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            placeholder={t("regionPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            {t("country")} ({t("optional")})
          </label>
          <input
            type="text"
            value={data.country}
            onChange={(e) => update("country", e.target.value)}
            className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            placeholder={t("countryPlaceholder")}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          {t("locationName")}
        </label>
        <input
          type="text"
          value={data.location_name}
          onChange={(e) => update("location_name", e.target.value)}
          className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          placeholder={t("locationNamePlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          {t("officialUrl")}
        </label>
        <input
          type="url"
          value={data.official_url}
          onChange={(e) => update("official_url", e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
        />
      </div>

      {data.type === "event" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("date")}
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => update("date", e.target.value)}
              className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-verter-graphite">
              {t("recurring")} ({t("optional")})
            </label>
            <input
              type="text"
              value={data.recurring}
              onChange={(e) => update("recurring", e.target.value)}
              placeholder="e.g. weekly, annually"
              className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          {t("descriptionLabel")}
        </label>
        <textarea
          value={data.short_description}
          onChange={(e) => update("short_description", e.target.value)}
          maxLength={MAX_DESCRIPTION + 50}
          rows={4}
          className={`mt-1 w-full rounded-card border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:outline-none focus:ring-1 focus:ring-verter-blue ${
            descOver ? "border-red-500" : "border-verter-border focus:border-verter-blue"
          }`}
          placeholder={t("descriptionPlaceholder")}
        />
        <p className={`mt-1 text-xs ${descOver ? "text-red-600" : "text-verter-muted"}`}>
          {descLen}/{MAX_DESCRIPTION}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          {t("contactEmail")} ({t("optional")})
        </label>
        <input
          type="email"
          value={data.submitter_email}
          onChange={(e) => update("submitter_email", e.target.value)}
          className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite placeholder:text-verter-muted focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
          placeholder="you@example.com"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || descOver}
        className="w-full rounded-pill bg-verter-forest px-4 py-3 font-medium text-white transition hover:bg-verter-forest/90 disabled:opacity-50"
      >
        {saving ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
