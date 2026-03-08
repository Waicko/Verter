"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import RouteForm, { type RouteFormData } from "./RouteForm";

type RouteRow = {
  id: string;
  title?: string;
  area?: string;
  distance_km?: number;
  ascent_m?: number;
  description?: string;
  gpx_path?: string;
  status?: string;
  slug?: string;
  source_type?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  submitted_by_name?: string | null;
  submitted_by_email?: string | null;
  rights_basis?: string | null;
  license_name?: string | null;
  license_url?: string | null;
  verification_status?: string | null;
  route_origin_type?: string | null;
  route_origin_name?: string | null;
  route_origin_url?: string | null;
  submitted_by_strava_url?: string | null;
  approved_by_verter?: boolean | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  tested_by_team?: boolean | null;
  tested_notes?: string | null;
};

interface AdminEditRouteFormProps {
  routeId: string;
}

export default function AdminEditRouteForm({ routeId }: AdminEditRouteFormProps) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<RouteFormData> | undefined>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/routes?id=${encodeURIComponent(routeId)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? "Reitin haku epäonnistui.");
        }
        return res.json() as Promise<RouteRow>;
      })
      .then((r) => {
        const approvedAt = r.approved_at
          ? new Date(r.approved_at).toISOString().slice(0, 16)
          : "";
        setInitialData({
          title: r.title ?? "",
          area: r.area ?? "",
          distance_km: r.distance_km != null ? String(r.distance_km) : "",
          ascent_m: r.ascent_m != null ? String(r.ascent_m) : "",
          description: r.description ?? "",
          slug: r.slug ?? "",
          status: r.status === "published" ? "published" : "draft",
          gpx_path: r.gpx_path ?? "",
          submitted_by_strava_url: r.submitted_by_strava_url ?? "",
          approved_by_verter: r.approved_by_verter ?? false,
          approved_by_name: r.approved_by_name ?? "",
          approved_at: approvedAt,
          tested_by_team: r.tested_by_team ?? false,
          tested_notes: r.tested_notes ?? "",
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Reitin haku epäonnistui.");
      })
      .finally(() => {
        setFetchLoading(false);
      });
  }, [routeId]);

  const handleSubmit = async (data: RouteFormData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/routes/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: routeId,
          title: data.title,
          area: data.area || null,
          distance_km: data.distance_km ? parseFloat(data.distance_km) : null,
          ascent_m: data.ascent_m ? parseFloat(data.ascent_m) : null,
          description: data.description || null,
          slug: data.slug || null,
          status: data.status,
          gpx_path: data.gpx_path || null,
          source_type: data.source_type?.trim() || null,
          source_name: data.source_name?.trim() || null,
          source_url: data.source_url?.trim() || null,
          submitted_by_name: data.submitted_by_name?.trim() || null,
          submitted_by_email: data.submitted_by_email?.trim() || null,
          rights_basis: data.rights_basis?.trim() || null,
          license_name: data.license_name?.trim() || null,
          license_url: data.license_url?.trim() || null,
          verification_status: data.verification_status?.trim() || null,
          route_origin_type: data.route_origin_type?.trim() || null,
          route_origin_name: data.route_origin_name?.trim() || null,
          route_origin_url: data.route_origin_url?.trim() || null,
          submitted_by_strava_url: data.submitted_by_strava_url?.trim() || null,
          approved_by_verter: data.approved_by_verter ?? false,
          approved_by_name: data.approved_by_name?.trim() || null,
          approved_at: data.approved_at ? new Date(data.approved_at).toISOString() : null,
          tested_by_team: data.tested_by_team ?? false,
          tested_notes: data.tested_notes?.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Päivitys epäonnistui.");
        return;
      }
      router.push("/admin/routes?updated=1");
    } catch {
      setError("Päivitys epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <p className="text-verter-muted">Ladataan…</p>;
  }

  if (!initialData) {
    return (
      <div>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-card border border-verter-risky bg-verter-risky/10 px-4 py-3 text-sm text-verter-risky"
          >
            {error}
          </div>
        )}
        <Link
          href="/admin/routes"
          className="text-sm font-medium text-verter-forest hover:underline"
        >
          ← Takaisin reitteihin
        </Link>
      </div>
    );
  }

  return (
    <RouteForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Tallenna muutokset"
      cancelHref="/admin/routes"
    />
  );
}
