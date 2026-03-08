"use client";

import { useState, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const ERROR_MESSAGE = "Lähetys epäonnistui. Yritä myöhemmin uudelleen.";

interface FormState {
  title: string;
  area: string;
  description: string;
  company: string;
}

const INITIAL: FormState = {
  title: "",
  area: "",
  description: "",
  company: "",
};

export default function SubmitRouteForm() {
  const t = useTranslations("submit");
  const router = useRouter();
  const [data, setData] = useState<FormState>(INITIAL);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof FormState, v: string) => {
    setData((prev) => ({ ...prev, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (data.company.trim()) return;

    const title = data.title.trim();
    if (!title) {
      setError(t("titleRequired"));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("area", data.area.trim());
      formData.append("description", data.description.trim());
      if (gpxFile) formData.append("gpx", gpxFile);

      const res = await fetch("/api/routes/submit", {
        method: "POST",
        body: formData,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? ERROR_MESSAGE);
        return;
      }

      router.push("/submit/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-card border border-verter-risky bg-verter-risky/10 px-4 py-3 text-sm text-verter-risky"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-verter-graphite">
          {t("titleLabel")} <span className="text-verter-risky">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          required
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          placeholder="esim. Nuuksion lenkki"
        />
      </div>

      <div>
        <label htmlFor="area" className="block text-sm font-medium text-verter-graphite">
          {t("region")} <span className="text-verter-muted">({t("optional")})</span>
        </label>
        <input
          id="area"
          type="text"
          value={data.area}
          onChange={(e) => update("area", e.target.value)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          placeholder={t("regionPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-verter-graphite">
          {t("descriptionLabel")} <span className="text-verter-muted">({t("optional")})</span>
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          placeholder={t("routeDescriptionPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          GPX-tiedosto <span className="text-verter-muted">({t("optional")})</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={(e) => setGpxFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-sm text-verter-graphite file:mr-4 file:rounded-pill file:border-0 file:bg-verter-forest file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:hover:bg-verter-forest/90"
        />
      </div>

      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          value={data.company}
          onChange={(e) => update("company", e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-card border border-verter-forest bg-verter-forest px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
