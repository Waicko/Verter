"use client";

import { useState, useMemo } from "react";
import type { DbItem, DbItemInsert } from "@/lib/db/types";
import {
  getMissingFieldsForPublish,
  getMissingFieldLabels,
  canPublish,
  type ItemForValidation,
} from "@/lib/admin/quality-rules";

type ItemType = "route" | "event" | "camp";
type FormData = Partial<DbItemInsert> & {
  type: ItemType;
  title: string;
  slug: string;
  status: "draft" | "pending" | "published";
};

const INITIAL: FormData = {
  type: "route",
  status: "draft",
  title: "",
  slug: "",
  region: "",
  country: "",
  location_name: "",
  official_url: "",
  short_description: "",
  reject_reason: "",
  start_lat: null,
  start_lng: null,
  summary: "",
  description: "",
  tags: [],
  external_links: [],
  distance_km: null,
  elevation_gain_m: null,
  technicality_1_5: null,
  winter_score_1_5: null,
  gpx_url: "",
  route_origin: "",
  start_date: null,
  end_date: null,
  recurrence: "",
  distance_options: [],
  organizer_name: "",
  season: "",
  duration_days: null,
  focus: "",
  submitter_name: "",
  submitter_email: "",
  submitter_role: "",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ItemFormProps {
  initial?: Partial<DbItem> | null;
  locale: string;
  mode: "create" | "edit" | "submission";
  onSuccess?: () => void;
  initialType?: ItemType;
}

export default function ItemForm({
  initial,
  locale,
  mode,
  onSuccess,
  initialType,
}: ItemFormProps) {
  const [data, setData] = useState<FormData>(() => {
    if (initial) {
      return {
        type: (initial.type ?? "route") as ItemType,
        status: (initial.status ?? "draft") as "draft" | "pending" | "published",
        title: initial.title ?? "",
        slug: initial.slug ?? "",
        region: initial.region ?? "",
        country: initial.country ?? "",
        location_name: initial.location_name ?? "",
        official_url: initial.official_url ?? "",
        short_description: initial.short_description ?? "",
        reject_reason: initial.reject_reason ?? "",
        start_lat: initial.start_lat,
        start_lng: initial.start_lng,
        summary: initial.summary ?? "",
        description: initial.description ?? "",
        tags: initial.tags ?? [],
        external_links: initial.external_links ?? [],
        distance_km: initial.distance_km,
        elevation_gain_m: initial.elevation_gain_m,
        technicality_1_5: initial.technicality_1_5,
        winter_score_1_5: initial.winter_score_1_5,
        gpx_url: initial.gpx_url ?? "",
        route_origin: initial.route_origin ?? "",
        start_date: initial.start_date,
        end_date: initial.end_date,
        recurrence: initial.recurrence ?? "",
        distance_options: initial.distance_options ?? [],
        organizer_name: initial.organizer_name ?? "",
        season: initial.season ?? "",
        duration_days: initial.duration_days,
        focus: initial.focus ?? "",
        submitter_name: initial.submitter_name ?? "",
        submitter_email: initial.submitter_email ?? "",
        submitter_role: initial.submitter_role ?? "",
      };
    }
    return {
      ...INITIAL,
      type: initialType ?? "route",
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k: keyof FormData, v: unknown) => {
    setData((prev) => ({ ...prev, [k]: v }));
  };

  const handleTitleChange = (title: string) => {
    update("title", title);
    if (mode === "create" || !initial?.slug) {
      update("slug", slugify(title));
    }
  };

  const toPayload = (): DbItemInsert => {
    const clean = (v: unknown) =>
      v === "" || v === null || v === undefined ? null : v;
    return {
      type: data.type,
      status: data.status,
      title: data.title,
      slug: data.slug,
      region: clean(data.region) as string | null,
      country: clean(data.country) as string | null,
      location_name: clean(data.location_name) as string | null,
      official_url: clean(data.official_url) as string | null,
      short_description: clean(data.short_description) as string | null,
      reject_reason: clean(data.reject_reason) as string | null,
      start_lat: typeof data.start_lat === "number" ? data.start_lat : null,
      start_lng: typeof data.start_lng === "number" ? data.start_lng : null,
      summary: clean(data.summary) as string | null,
      description: clean(data.description) as string | null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      external_links: Array.isArray(data.external_links) ? data.external_links : [],
      distance_km: typeof data.distance_km === "number" ? data.distance_km : null,
      elevation_gain_m:
        typeof data.elevation_gain_m === "number" ? data.elevation_gain_m : null,
      technicality_1_5:
        typeof data.technicality_1_5 === "number" ? data.technicality_1_5 : null,
      winter_score_1_5:
        typeof data.winter_score_1_5 === "number" ? data.winter_score_1_5 : null,
      gpx_url: clean(data.gpx_url) as string | null,
      route_origin: clean(data.route_origin) as string | null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      recurrence: clean(data.recurrence) as string | null,
      distance_options: Array.isArray(data.distance_options)
        ? data.distance_options
        : [],
      organizer_name: clean(data.organizer_name) as string | null,
      season: clean(data.season) as string | null,
      duration_days:
        typeof data.duration_days === "number" ? data.duration_days : null,
      focus: clean(data.focus) as string | null,
      submitter_name: clean(data.submitter_name) as string | null,
      submitter_email: clean(data.submitter_email) as string | null,
      submitter_role: clean(data.submitter_role) as string | null,
      update_for_slug: null,
    };
  };

  const handleSubmit = async (action: "draft" | "publish" | "pending") => {
    setSaving(true);
    setError("");
    const payload = toPayload();
    payload.status =
      action === "publish"
        ? "published"
        : action === "pending"
          ? "pending"
          : "draft";

    try {
      const url =
        mode === "edit" && initial
          ? `/api/admin/items/${initial.id}`
          : mode === "submission"
            ? "/api/items/submit"
            : "/api/admin/items";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Save failed");
        return;
      }
      onSuccess?.();
      if (mode === "submission") {
        window.location.href = `/${locale}/routes?submitted=1`;
      } else if (mode === "edit") {
        window.location.href = `/${locale}/admin`;
      } else {
        window.location.href = `/${locale}/admin/items/${json.id}/edit`;
      }
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  };

  const Input = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
  }: {
    label: string;
    name: string;
    value: string | number | null;
    onChange: (v: string | number | null) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-verter-graphite">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            type === "number" ? (e.target.value ? Number(e.target.value) : null) : e.target.value
          )
        }
        placeholder={placeholder}
        className="mt-1 w-full rounded-pill border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
      />
    </div>
  );

  const isRoute = data.type === "route";
  const isEvent = data.type === "event";
  const isCamp = data.type === "camp";

  const validationItem: ItemForValidation = useMemo(
    () => ({
      type: data.type,
      title: data.title?.trim() || null,
      region: data.region?.toString().trim() || null,
      country: data.country?.toString().trim() || null,
      short_description: data.short_description?.toString().trim() || null,
      description: data.description?.toString().trim() || null,
      summary: data.summary?.toString().trim() || null,
      official_url: data.official_url?.toString().trim() || null,
      external_links: Array.isArray(data.external_links) ? data.external_links : [],
      start_date: data.start_date?.toString().trim() || null,
      end_date: data.end_date?.toString().trim() || null,
      recurrence: data.recurrence?.toString().trim() || null,
      season: data.season?.toString().trim() || null,
      distance_km: typeof data.distance_km === "number" ? data.distance_km : null,
    }),
    [data]
  );
  const missingFields = getMissingFieldsForPublish(validationItem);
  const canPublishNow = canPublish(validationItem);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit("draft");
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          Type *
        </label>
        <div className="mt-2 flex gap-4">
          {(["route", "event", "camp"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                checked={data.type === t}
                onChange={() => update("type", t)}
                className="text-verter-forest"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {mode !== "submission" && (
        <div>
          <label className="block text-sm font-medium text-verter-graphite">
            Status
          </label>
          <div className="mt-2 flex gap-4">
            {(["draft", "pending", "published"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={data.status === s}
                  onChange={() => update("status", s)}
                  className="text-verter-forest"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      <Input
        label="Title"
        name="title"
        value={data.title}
        onChange={(v) => handleTitleChange(String(v ?? ""))}
        required
      />
      <Input
        label="Slug"
        name="slug"
        value={data.slug}
        onChange={(v) => update("slug", v)}
        placeholder="url-friendly-slug"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Region"
          name="region"
          value={data.region ?? ""}
          onChange={(v) => update("region", v)}
        />
        <Input
          label="Country"
          name="country"
          value={data.country ?? ""}
          onChange={(v) => update("country", v)}
        />
      </div>
      <Input
        label="Location name"
        name="location_name"
        value={data.location_name ?? ""}
        onChange={(v) => update("location_name", v)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Start lat"
          name="start_lat"
          value={data.start_lat ?? null}
          onChange={(v) => update("start_lat", v)}
          type="number"
          placeholder="60.123"
        />
        <Input
          label="Start lng"
          name="start_lng"
          value={data.start_lng ?? null}
          onChange={(v) => update("start_lng", v)}
          type="number"
          placeholder="24.456"
        />
      </div>
      {mode !== "submission" && missingFields.length > 0 && (
        <div className="rounded-card border border-amber-300 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-800">
            Missing fields for publishing
          </h3>
          <p className="mt-1 text-xs text-amber-700">
            Save as draft is allowed. Publish requires:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
            {getMissingFieldLabels(missingFields).map((label, i) => (
              <li key={i}>{label}</li>
            ))}
          </ul>
        </div>
      )}

      <Input
        label="Summary"
        name="summary"
        value={data.summary ?? ""}
        onChange={(v) => update("summary", v)}
      />
      <div>
        <label className="block text-sm font-medium text-verter-graphite">
          Description
        </label>
        <textarea
          name="description"
          value={data.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-card border border-verter-border bg-verter-snow px-4 py-2 text-verter-graphite focus:border-verter-blue focus:outline-none focus:ring-1 focus:ring-verter-blue"
        />
      </div>

      {isRoute && (
        <>
          <h3 className="font-heading text-lg font-semibold">Route fields</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Distance (km)"
              name="distance_km"
              value={data.distance_km ?? null}
              onChange={(v) => update("distance_km", v)}
              type="number"
            />
            <Input
              label="Elevation gain (m)"
              name="elevation_gain_m"
              value={data.elevation_gain_m ?? null}
              onChange={(v) => update("elevation_gain_m", v)}
              type="number"
            />
            <Input
              label="Technicality 1-5"
              name="technicality_1_5"
              value={data.technicality_1_5 ?? null}
              onChange={(v) => update("technicality_1_5", v)}
              type="number"
            />
            <Input
              label="Winter score 1-5"
              name="winter_score_1_5"
              value={data.winter_score_1_5 ?? null}
              onChange={(v) => update("winter_score_1_5", v)}
              type="number"
            />
          </div>
          <Input
            label="GPX URL"
            name="gpx_url"
            value={data.gpx_url ?? ""}
            onChange={(v) => update("gpx_url", v)}
          />
          <Input
            label="Route origin"
            name="route_origin"
            value={data.route_origin ?? ""}
            onChange={(v) => update("route_origin", v)}
          />
        </>
      )}

      {isEvent && (
        <>
          <h3 className="font-heading text-lg font-semibold">Event fields</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date"
              name="start_date"
              value={data.start_date ?? ""}
              onChange={(v) => update("start_date", v)}
              type="date"
            />
            <Input
              label="End date"
              name="end_date"
              value={data.end_date ?? ""}
              onChange={(v) => update("end_date", v)}
              type="date"
            />
          </div>
          <Input
            label="Distance options"
            name="distance_options"
            value={
              Array.isArray(data.distance_options)
                ? (data.distance_options as string[]).join(", ")
                : ""
            }
            onChange={(v) =>
              update(
                "distance_options",
                typeof v === "string"
                  ? v.split(",").map((s) => s.trim()).filter(Boolean)
                  : []
              )
            }
            placeholder="e.g. 5 km, 10 km, 25 km"
          />
          <Input
            label="Recurrence"
            name="recurrence"
            value={data.recurrence ?? ""}
            onChange={(v) => update("recurrence", v)}
            placeholder="e.g. weekly, annually"
          />
          <Input
            label="Organizer"
            name="organizer_name"
            value={data.organizer_name ?? ""}
            onChange={(v) => update("organizer_name", v)}
          />
        </>
      )}

      {isCamp && (
        <>
          <h3 className="font-heading text-lg font-semibold">Camp fields</h3>
          <Input
            label="Season"
            name="season"
            value={data.season ?? ""}
            onChange={(v) => update("season", v)}
          />
          <Input
            label="Duration (days)"
            name="duration_days"
            value={data.duration_days ?? null}
            onChange={(v) => update("duration_days", v)}
            type="number"
          />
          <Input
            label="Focus"
            name="focus"
            value={data.focus ?? ""}
            onChange={(v) => update("focus", v)}
          />
        </>
      )}

      {mode === "submission" && (
        <>
          <h3 className="font-heading text-lg font-semibold">Your details</h3>
          <Input
            label="Your name"
            name="submitter_name"
            value={data.submitter_name ?? ""}
            onChange={(v) => update("submitter_name", v)}
            required
          />
          <Input
            label="Your email"
            name="submitter_email"
            value={data.submitter_email ?? ""}
            onChange={(v) => update("submitter_email", v)}
            type="email"
            required
          />
          <Input
            label="Your role"
            name="submitter_role"
            value={data.submitter_role ?? ""}
            onChange={(v) => update("submitter_role", v)}
            placeholder="e.g. Runner, organizer"
          />
        </>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        {mode !== "submission" && (
          <>
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="rounded-pill border border-verter-border bg-white px-4 py-2 font-medium text-verter-graphite hover:bg-verter-snow disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("publish")}
              disabled={saving || !canPublishNow}
              title={
                !canPublishNow
                  ? `Missing: ${getMissingFieldLabels(missingFields).join(", ")}`
                  : undefined
              }
              className="rounded-pill bg-verter-forest px-4 py-2 font-medium text-white hover:bg-verter-forest/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Publishing…" : "Publish"}
            </button>
          </>
        )}
        {mode === "submission" && (
          <button
            type="button"
            onClick={() => handleSubmit("pending")}
            disabled={saving}
            className="rounded-pill bg-verter-forest px-4 py-2 font-medium text-white hover:bg-verter-forest/90 disabled:opacity-50"
          >
            {saving ? "Submitting…" : "Submit suggestion"}
          </button>
        )}
      </div>
    </form>
  );
}
