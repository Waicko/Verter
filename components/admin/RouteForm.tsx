"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";

export type RouteFormData = {
  title: string;
  area: string;
  distance_km: string;
  ascent_m: string;
  description: string;
  slug: string;
  status: "published" | "draft";
  gpx_path: string;
};

const emptyData: RouteFormData = {
  title: "",
  area: "",
  distance_km: "",
  ascent_m: "",
  description: "",
  slug: "",
  status: "published",
  gpx_path: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface RouteFormProps {
  mode: "create" | "edit";
  initialData?: Partial<RouteFormData>;
  onSubmit: (data: RouteFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitLabel: string;
  cancelHref: string;
}

export default function RouteForm({
  mode,
  initialData,
  onSubmit,
  loading = false,
  error,
  submitLabel,
  cancelHref,
}: RouteFormProps) {
  const data: RouteFormData = {
    ...emptyData,
    ...initialData,
  };

  const [formState, setFormState] = useState<RouteFormData>(data);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [gpxUploading, setGpxUploading] = useState(false);
  const [gpxUploadStatus, setGpxUploadStatus] = useState<
    "idle" | "uploading" | "success" | "failed"
  >("idle");
  const [gpxUploadMessage, setGpxUploadMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormState({ ...emptyData, ...initialData } as RouteFormData);
    setSlugManuallyEdited(false);
    setGpxUploadStatus("idle");
    setGpxUploadMessage("");
  }, [initialData]);

  const update = (k: keyof RouteFormData, v: string) => {
    setFormState((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "title" && !slugManuallyEdited) {
        next.slug = slugify(v);
      }
      return next;
    });
  };

  const updateSlug = (v: string) => {
    setSlugManuallyEdited(true);
    update("slug", v);
  };

  const handleGpxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith(".gpx")) {
      setValidationError("Valitse .gpx-tiedosto.");
      setGpxUploadStatus("idle");
      return;
    }
    setValidationError(null);
    setGpxUploading(true);
    setGpxUploadStatus("uploading");
    setGpxUploadMessage("Uploading...");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_token") ?? ""
          : "";
      if (!token) {
        setGpxUploadStatus("failed");
        setGpxUploadMessage("Upload failed: Admin token missing. Enter token on routes list page.");
        setValidationError("Admin-tunnus puuttuu. Syötä tunnus reittilistalla.");
        return;
      }
      const formData = new FormData();
      formData.append("gpx", file);
      const res = await fetch("/api/admin/routes/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: formData,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = json.error ?? `HTTP ${res.status}`;
        setGpxUploadStatus("failed");
        setGpxUploadMessage(`Upload failed: ${errMsg}`);
        setValidationError(errMsg);
        return;
      }

      const path = json.path;
      if (path && typeof path === "string") {
        const updates: Partial<RouteFormData> = { gpx_path: path };
        if (json.distance_km != null) {
          updates.distance_km = String(json.distance_km);
        }
        if (json.ascent_m !== undefined) {
          updates.ascent_m = json.ascent_m == null ? "" : String(json.ascent_m);
        }
        setFormState((prev) => ({ ...prev, ...updates }));
        setGpxUploadStatus("success");
        setGpxUploadMessage(`Upload succeeded. Path: ${path}`);
      } else {
        setGpxUploadStatus("failed");
        setGpxUploadMessage(`Upload failed: API returned no path. Response: ${JSON.stringify(json)}`);
        setValidationError("Lataus onnistui mutta polku puuttui vastauksesta.");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setGpxUploadStatus("failed");
      setGpxUploadMessage(`Upload failed: ${errMsg}`);
      setValidationError(`GPX-lataus epäonnistui: ${errMsg}`);
    } finally {
      setGpxUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const title = formState.title.trim();
    if (!title) {
      setValidationError("Otsikko on pakollinen.");
      return;
    }
    await onSubmit({
      ...formState,
      title,
      area: formState.area.trim(),
      distance_km: formState.distance_km.trim(),
      ascent_m: formState.ascent_m.trim(),
      description: formState.description.trim(),
      slug: formState.slug.trim() || slugify(title),
      gpx_path: formState.gpx_path.trim(),
    });
  };

  const inputClass =
    "mt-1 w-full rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest";

  const displayError = error ?? validationError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div
          role="alert"
          className="rounded-card border border-verter-risky bg-verter-risky/10 px-4 py-3 text-sm text-verter-risky"
        >
          {displayError}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-verter-graphite"
        >
          Otsikko <span className="text-verter-risky">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formState.title}
          onChange={(e) => update("title", e.target.value)}
          required
          className={inputClass}
          placeholder="esim. Nuuksion lenkki"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-verter-graphite"
        >
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={formState.slug}
          onChange={(e) => updateSlug(e.target.value)}
          className={inputClass}
          placeholder="nuuksio-trail-loop"
        />
      </div>

      <div>
        <label
          htmlFor="area"
          className="block text-sm font-medium text-verter-graphite"
        >
          Alue <span className="text-verter-muted">(valinnainen)</span>
        </label>
        <input
          id="area"
          type="text"
          value={formState.area}
          onChange={(e) => update("area", e.target.value)}
          className={inputClass}
          placeholder="esim. Nuuksio"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-verter-muted">
          Lasketaan automaattisesti GPX-tiedostosta
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="distance_km"
              className="block text-sm font-medium text-verter-graphite"
            >
              Matka (km)
            </label>
            <input
              id="distance_km"
              type="number"
              step="0.01"
              min="0"
              value={formState.distance_km}
              onChange={(e) => update("distance_km", e.target.value)}
              className={inputClass}
              placeholder="10"
            />
          </div>
          <div>
            <label
              htmlFor="ascent_m"
              className="block text-sm font-medium text-verter-graphite"
            >
              Nousu (m)
            </label>
            <input
              id="ascent_m"
              type="number"
              step="1"
              min="0"
              value={formState.ascent_m}
              onChange={(e) => update("ascent_m", e.target.value)}
              className={inputClass}
              placeholder="150"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-verter-graphite"
        >
          Kuvaus <span className="text-verter-muted">(valinnainen)</span>
        </label>
        <textarea
          id="description"
          value={formState.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Lyhyt kuvaus reitistä"
        />
      </div>

      {mode === "create" ? (
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={formState.status === "published"}
              onChange={(e) =>
                update("status", e.target.checked ? "published" : "draft")
              }
              className="h-4 w-4 rounded border-verter-border text-verter-forest focus:ring-verter-forest"
            />
            <span className="text-sm font-medium text-verter-graphite">
              Julkaise heti
            </span>
          </label>
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium text-verter-graphite">
            Tila
          </label>
          <select
            value={formState.status}
            onChange={(e) =>
              update("status", e.target.value as "published" | "draft")
            }
            className={inputClass}
          >
            <option value="draft">Luonnos</option>
            <option value="published">Julkaistu</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          GPX-tiedosto
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".gpx"
            onChange={handleGpxChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={gpxUploading}
            className="rounded-card border border-verter-border bg-white px-3 py-2 text-sm font-medium text-verter-graphite hover:bg-verter-snow disabled:opacity-50"
          >
            {gpxUploading ? "Ladataan…" : "Valitse GPX"}
          </button>
          {gpxUploadStatus === "uploading" && (
            <span className="text-sm text-verter-muted">Uploading...</span>
          )}
          {gpxUploadStatus === "success" && (
            <span className="text-sm font-medium text-green-600">
              Upload succeeded: {formState.gpx_path}
            </span>
          )}
          {gpxUploadStatus === "failed" && (
            <span className="text-sm font-medium text-verter-risky">
              {gpxUploadMessage}
            </span>
          )}
          {formState.gpx_path && (
            <span className="text-sm text-verter-muted">
              ✓ {formState.gpx_path}
            </span>
          )}
        </div>
        <div className="mt-2 rounded-card border border-verter-border bg-verter-snow/50 px-3 py-2 font-mono text-xs text-verter-muted">
          gpx_path (debug): {formState.gpx_path || "(empty)"}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-card border border-verter-forest bg-verter-forest px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="inline-block rounded-card border border-verter-border bg-white px-4 py-3 font-medium text-verter-graphite hover:bg-verter-snow"
        >
          Peruuta
        </Link>
      </div>
    </form>
  );
}
