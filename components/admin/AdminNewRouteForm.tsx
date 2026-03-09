"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import RouteForm, { type RouteFormData } from "./RouteForm";

export default function AdminNewRouteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RouteFormData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/routes/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          area: data.area || null,
          distance_km: data.distance_km ? parseFloat(data.distance_km) : null,
          ascent_m: data.ascent_m ? parseFloat(data.ascent_m) : null,
          description: data.description || null,
          slug: data.slug || null,
          status: data.status,
          gpx_path: data.gpx_path || null,
          start_lat: data.start_lat ? parseFloat(data.start_lat) : null,
          start_lng: data.start_lng ? parseFloat(data.start_lng) : null,
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
        setError(json.error ?? "Lähetys epäonnistui.");
        return;
      }
      router.push("/admin/routes?created=1");
    } catch {
      setError("Lähetys epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Luo reitti"
      cancelHref="/admin/routes"
    />
  );
}
