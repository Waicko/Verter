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
