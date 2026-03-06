"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import EventForm, { type EventFormData } from "./EventForm";

const TOKEN_KEY = "admin_token";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

type EventRow = {
  id: string;
  title?: string;
  date?: string;
  location?: string;
  registration_url?: string;
  description?: string;
  status?: string;
};

interface AdminEditEventFormProps {
  eventId: string;
}

export default function AdminEditEventForm({ eventId }: AdminEditEventFormProps) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<EventFormData> | undefined>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("Admin-tunnus puuttuu. Palaa tapahtumalistalle ja syötä tunnus.");
      setFetchLoading(false);
      return;
    }

    fetch(`/api/admin/events?id=${encodeURIComponent(eventId)}`, {
      headers: { "x-admin-token": token },
    })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? "Tapahtuman haku epäonnistui.");
        }
        return res.json() as Promise<EventRow>;
      })
      .then((ev) => {
        setInitialData({
          title: ev.title ?? "",
          date: ev.date ?? "",
          location: ev.location ?? "",
          registration_url: ev.registration_url ?? "",
          description: ev.description ?? "",
          status: ev.status === "published" ? "published" : "draft",
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Tapahtuman haku epäonnistui.");
      })
      .finally(() => {
        setFetchLoading(false);
      });
  }, [eventId]);

  const handleSubmit = async (data: EventFormData) => {
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Admin-tunnus puuttuu. Palaa tapahtumalistalle ja syötä tunnus.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/events/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          id: eventId,
          title: data.title,
          date: data.date,
          location: data.location || null,
          registration_url: data.registration_url || null,
          description: data.description || null,
          status: data.status,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Päivitys epäonnistui.");
        return;
      }
      router.push("/admin/events?updated=1");
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
          href="/admin/events"
          className="text-sm font-medium text-verter-forest hover:underline"
        >
          ← Takaisin tapahtumiin
        </Link>
      </div>
    );
  }

  return (
    <EventForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Tallenna muutokset"
      cancelHref="/admin/events"
    />
  );
}
