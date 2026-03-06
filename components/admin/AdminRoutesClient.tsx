"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getGpxDownloadUrl } from "@/lib/data/routes-db";

const TOKEN_KEY = "admin_routes_token";

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
  created_at?: string;
};

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

function getApiUrl(path: string): string {
  return `/api/admin/routes${path}`;
}

export default function AdminRoutesClient() {
  const searchParams = useSearchParams();
  const [token, setTokenState] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const updated = searchParams.get("updated") === "1";
    const created = searchParams.get("created") === "1";
    setSuccessMessage(
      updated ? "Reitti päivitetty." : created ? "Reitti luotu." : null
    );
  }, [searchParams]);

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  const fetchRoutes = async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(""), {
        headers: { "x-admin-token": authToken },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Virheellinen tunnus. Tarkista ADMIN_TOKEN.");
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Reittien haku epäonnistui.");
        return;
      }
      const data = await res.json();
      setRoutes(Array.isArray(data) ? data : []);
    } catch {
      setError("Reittien haku epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = getToken();
    if (t) fetchRoutes(t);
    else setLoading(false);
  }, [token]);

  const handleSaveToken = () => {
    const t = tokenInput.trim();
    if (!t) return;
    setToken(t);
    setTokenState(t);
    setTokenInput("");
    fetchRoutes(t);
  };

  const handlePublish = async (id: string) => {
    const t = getToken();
    if (!t) return;
    setActionLoading(id);
    try {
      const res = await fetch(getApiUrl("/publish"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": t },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Julkaisu epäonnistui.");
        return;
      }
      setSuccessMessage("Reitti julkaistu.");
      fetchRoutes(t);
    } catch {
      setError("Julkaisu epäonnistui.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    const t = getToken();
    if (!t) return;
    setActionLoading(id);
    try {
      const res = await fetch(getApiUrl("/delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": t },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Poisto epäonnistui.");
        return;
      }
      setDeleteConfirmId(null);
      setSuccessMessage("Reitti poistettu.");
      fetchRoutes(t);
    } catch {
      setError("Poisto epäonnistui.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    const t = getToken();
    if (!t) return;
    setActionLoading(id);
    try {
      const res = await fetch(getApiUrl("/unpublish"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": t },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Palautus epäonnistui.");
        return;
      }
      setSuccessMessage("Reitti palautettu luonnokseksi.");
      fetchRoutes(t);
    } catch {
      setError("Palautus epäonnistui.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-verter-graphite">
          Reittien hallinta
        </h1>
        <p className="text-verter-muted">
          Syötä admin-tunnus (ADMIN_TOKEN) päästäksesi reitteihin.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin-tunnus"
            className="rounded-card border border-verter-border px-3 py-2 text-verter-graphite focus:border-verter-forest focus:outline-none focus:ring-1 focus:ring-verter-forest"
          />
          <button
            type="button"
            onClick={handleSaveToken}
            disabled={!tokenInput.trim()}
            className="rounded-card border border-verter-forest bg-verter-forest px-4 py-2 font-medium text-white hover:opacity-95 disabled:opacity-50"
          >
            Jatka
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-verter-graphite">
            Reittien hallinta
          </h1>
          <p className="mt-1 text-sm text-verter-muted">
            Julkaistut ja luonnokset. Julkaise tai palauta draftiksi.
          </p>
        </div>
        <Link
          href="/admin/routes/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-card border border-verter-forest bg-verter-forest px-4 py-3 font-medium text-white hover:opacity-95"
        >
          + Lisää reitti
        </Link>
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-card border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-card border border-verter-risky bg-verter-risky/10 px-4 py-3 text-sm text-verter-risky"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-verter-muted">Ladataan…</p>
      ) : routes.length === 0 ? (
        <div className="rounded-card border border-verter-border bg-verter-snow/50 px-8 py-12 text-center text-verter-muted">
          Ei reittejä.
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((r) => {
            const isPublished = r.status === "published";
            const cardClass = isPublished
              ? "rounded-card border-2 border-green-200 bg-green-50 p-4"
              : "rounded-card border-2 border-orange-200 bg-orange-50 p-4";
            return (
              <div key={r.id} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-semibold text-verter-graphite">
                        {r.title ?? "—"}
                      </h3>
                      <span
                        className={`rounded-pill px-2.5 py-0.5 text-xs font-medium ${
                          isPublished
                            ? "bg-green-200 text-green-800"
                            : "bg-orange-200 text-orange-800"
                        }`}
                      >
                        {isPublished ? "Julkaistu" : "Luonnos"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-verter-muted">
                      {r.area && <span>{r.area}</span>}
                      {r.distance_km != null && (
                        <span>{r.distance_km} km</span>
                      )}
                      {r.ascent_m != null && (
                        <span>+{r.ascent_m} m</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {r.gpx_path ? (
                        <>
                          <span className="rounded-pill bg-verter-forest/20 px-2.5 py-0.5 text-xs font-medium text-verter-forest">
                            GPX
                          </span>
                          <span className="text-sm text-verter-muted">
                            {r.gpx_path.split("/").pop() ?? r.gpx_path}
                          </span>
                          <a
                            href={getGpxDownloadUrl(r.gpx_path)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-verter-forest hover:underline"
                          >
                            Lataa GPX
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </a>
                        </>
                      ) : (
                        <span className="text-sm text-verter-muted">
                          Ei GPX-tiedostoa
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/admin/routes/edit/${r.id}`}
                      className="rounded-card border border-verter-border bg-white px-3 py-1.5 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
                    >
                      Muokkaa
                    </Link>
                    {isPublished ? (
                      <button
                        type="button"
                        onClick={() => handleUnpublish(r.id)}
                        disabled={actionLoading !== null}
                        className="rounded-card border border-verter-border bg-white px-3 py-1.5 text-sm font-medium text-verter-graphite hover:bg-verter-snow disabled:opacity-50"
                      >
                        {actionLoading === r.id ? "…" : "Palauta draftiksi"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublish(r.id)}
                        disabled={actionLoading !== null}
                        className="rounded-card border border-verter-forest bg-verter-forest px-3 py-1.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
                      >
                        {actionLoading === r.id ? "…" : "Julkaise"}
                      </button>
                    )}
                    {deleteConfirmId === r.id ? (
                      <div className="flex items-center gap-2 rounded-card border border-verter-risky bg-white px-3 py-1.5">
                        <span className="text-sm text-verter-graphite">
                          Poistetaanko reitti?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          disabled={actionLoading !== null}
                          className="text-sm font-medium text-verter-risky hover:underline disabled:opacity-50"
                        >
                          Poista
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-sm font-medium text-verter-graphite hover:underline"
                        >
                          Peruuta
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(r.id)}
                        className="rounded-card border border-verter-border bg-white px-3 py-1.5 text-sm font-medium text-verter-risky hover:bg-red-50"
                      >
                        Poista
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
