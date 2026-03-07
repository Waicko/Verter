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
        setInitialData({
          title: r.title ?? "",
          area: r.area ?? "",
          distance_km: r.distance_km != null ? String(r.distance_km) : "",
          ascent_m: r.ascent_m != null ? String(r.ascent_m) : "",
          description: r.description ?? "",
          slug: r.slug ?? "",
          status: r.status === "published" ? "published" : "draft",
          gpx_path: r.gpx_path ?? "",
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
