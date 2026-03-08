"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import EventForm, { type EventFormData } from "./EventForm";

type EventRow = {
  id: string;
  title?: string;
  date?: string;
  location?: string;
  registration_url?: string;
  description?: string;
  type?: string | null;
  status?: string;
  source_type?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  submitted_by_name?: string | null;
  submitted_by_email?: string | null;
  rights_basis?: string | null;
  license_name?: string | null;
  license_url?: string | null;
  verification_status?: string | null;
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
    fetch(`/api/admin/events?id=${encodeURIComponent(eventId)}`, {
      credentials: "include",
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
          type:
            ev.type === "race" || ev.type === "camp" || ev.type === "community"
              ? ev.type
              : "race",
          status: ev.status === "published" ? "published" : "draft",
          source_type: ev.source_type ?? "",
          source_name: ev.source_name ?? "",
          source_url: ev.source_url ?? "",
          submitted_by_name: ev.submitted_by_name ?? "",
          submitted_by_email: ev.submitted_by_email ?? "",
          rights_basis: ev.rights_basis ?? "",
          license_name: ev.license_name ?? "",
          license_url: ev.license_url ?? "",
          verification_status: ev.verification_status ?? "",
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
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: eventId,
          title: data.title,
          date: data.date,
          location: data.location || null,
          registration_url: data.registration_url || null,
          description: data.description || null,
          type: data.type || "race",
          status: data.status,
          source_type: data.source_type?.trim() || null,
          source_name: data.source_name?.trim() || null,
          source_url: data.source_url?.trim() || null,
          submitted_by_name: data.submitted_by_name?.trim() || null,
          submitted_by_email: data.submitted_by_email?.trim() || null,
          rights_basis: data.rights_basis?.trim() || null,
          license_name: data.license_name?.trim() || null,
          license_url: data.license_url?.trim() || null,
          verification_status: data.verification_status?.trim() || null,
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
