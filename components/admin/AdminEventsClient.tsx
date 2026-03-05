"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

const TOKEN_KEY = "admin_events_token";

type EventRow = {
  id: string;
  title?: string;
  date?: string;
  location?: string;
  registration_url?: string;
  description?: string;
  status?: string;
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
  return `/api/admin/events${path}`;
}

export default function AdminEventsClient() {
  const searchParams = useSearchParams();
  const [token, setTokenState] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSuccessMessage(
      searchParams.get("updated") === "1" ? "Tapahtuma päivitetty." : null
    );
  }, [searchParams]);

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  const fetchEvents = async (authToken: string) => {
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
        setError(data.error ?? "Tapahtumien haku epäonnistui.");
        return;
      }
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError("Tapahtumien haku epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = getToken();
    if (t) fetchEvents(t);
    else setLoading(false);
  }, [token]);

  const handleSaveToken = () => {
    const t = tokenInput.trim();
    if (!t) return;
    setToken(t);
    setTokenState(t);
    setTokenInput("");
    fetchEvents(t);
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
      fetchEvents(t);
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
      fetchEvents(t);
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
      fetchEvents(t);
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
          Tapahtumien hallinta
        </h1>
        <p className="text-verter-muted">
          Syötä admin-tunnus (ADMIN_TOKEN) päästäksesi tapahtumiin.
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
            Tapahtumien hallinta
          </h1>
          <p className="mt-1 text-sm text-verter-muted">
            Julkaistut ja luonnokset. Julkaise tai palauta draftiksi.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-card border border-verter-forest bg-verter-forest px-4 py-3 font-medium text-white hover:opacity-95"
        >
          + Lisää tapahtuma
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
      ) : events.length === 0 ? (
        <div className="rounded-card border border-verter-border bg-verter-snow/50 px-8 py-12 text-center text-verter-muted">
          Ei tapahtumia.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => {
            const isPublished = ev.status === "published";
            const cardClass = isPublished
              ? "rounded-card border-2 border-green-200 bg-green-50 p-4"
              : "rounded-card border-2 border-orange-200 bg-orange-50 p-4";
            return (
              <div key={ev.id} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-semibold text-verter-graphite">
                        {ev.title ?? "—"}
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
                      {ev.date && <span>{String(ev.date)}</span>}
                      {ev.location && <span>{ev.location}</span>}
                    </div>
                    {ev.registration_url && (
                      <a
                        href={ev.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-verter-forest hover:underline"
                      >
                        Ilmoittautumislinkki
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/admin/events/edit/${ev.id}`}
                      className="rounded-card border border-verter-border bg-white px-3 py-1.5 text-sm font-medium text-verter-graphite hover:bg-verter-snow"
                    >
                      Muokkaa
                    </Link>
                    {isPublished ? (
                      <button
                        type="button"
                        onClick={() => handleUnpublish(ev.id)}
                        disabled={actionLoading !== null}
                        className="rounded-card border border-verter-border bg-white px-3 py-1.5 text-sm font-medium text-verter-graphite hover:bg-verter-snow disabled:opacity-50"
                      >
                        {actionLoading === ev.id ? "…" : "Palauta draftiksi"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublish(ev.id)}
                        disabled={actionLoading !== null}
                        className="rounded-card border border-verter-forest bg-verter-forest px-3 py-1.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
                      >
                        {actionLoading === ev.id ? "…" : "Julkaise"}
                      </button>
                    )}
                    {deleteConfirmId === ev.id ? (
                      <div className="flex items-center gap-2 rounded-card border border-verter-risky bg-white px-3 py-1.5">
                        <span className="text-sm text-verter-graphite">
                          Poistetaanko tapahtuma?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(ev.id)}
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
                        onClick={() => setDeleteConfirmId(ev.id)}
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
