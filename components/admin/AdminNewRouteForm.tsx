"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import RouteForm, { type RouteFormData } from "./RouteForm";

const TOKEN_KEY = "admin_routes_token";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export default function AdminNewRouteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RouteFormData) => {
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Admin-tunnus puuttuu. Palaa reittilistalle ja syötä tunnus.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/routes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
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
